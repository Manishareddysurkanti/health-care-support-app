const TYPE_RESPONSES = {
  'Patient Support':
    'Your healthcare support request has been received. Our team will review your case and contact you soon.',
  'Volunteer Registration':
    'Thank you for registering as a volunteer. Your application has been received and is under review.',
  Contact:
    'Thank you for contacting us. We have received your message and will get back to you shortly.',
};

function generateAiResponse(type) {
  return TYPE_RESPONSES[type] || TYPE_RESPONSES.Contact;
}

module.exports = { generateAiResponse };
