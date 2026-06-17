const express = require('express');
const Request = require('../models/Request');
const { generateSummary } = require('../utils/summarize');
const { generateAiResponse } = require('../utils/aiResponse');
const authStaff = require('../middleware/authStaff');

const router = express.Router();
const STATUSES = ['Pending', 'In Progress', 'Resolved'];

router.get('/mine', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const requests = await Request.findAll({
      where: {
        email: email.trim().toLowerCase(),
      },
      order: [['createdAt', 'DESC']],
    });

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch your requests' });
  }
});

router.get('/', authStaff, async (req, res) => {
  try {
    const requests = await Request.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { fullName, email, phone, type, message } = req.body;

    if (!fullName || !email || !phone || !type || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const summary = generateSummary(type, message);
    const aiResponse = generateAiResponse(type);

    const request = await Request.create({
      fullName,
      email,
      phone,
      type,
      message,
      summary,
      aiResponse,
    });

    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create request' });
  }
});

router.patch('/:id', authStaff, async (req, res) => {
  try {
    const { status, staffReply } = req.body;
    const updates = {};

    if (status !== undefined) {
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
      updates.status = status;
    }

    if (staffReply !== undefined) {
      updates.staffReply = staffReply.trim();
      updates.repliedAt = new Date();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    const [updatedCount] = await Request.update(updates, {
      where: { _id: req.params.id },
    });

    if (updatedCount === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const updatedRequest = await Request.findByPk(req.params.id);
    res.json(updatedRequest);
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update request' });
  }
});

module.exports = router;
