const TYPE_PREFIXES = {
  'Patient Support': 'Patient requires assistance',
  'Volunteer Registration': 'Volunteer registration request',
  Contact: 'General inquiry',
};

function cleanMessage(message) {
  return message
    .trim()
    .replace(/^i\s+(need|want|am looking for|require)\s+/i, '')
    .replace(/^need\s+/i, '')
    .replace(/^(medical\s+)?help\s+for\s+/i, '')
    .replace(/^assistance\s+(with|for)\s+/i, '')
    .replace(/^support\s+(with|for)\s+/i, '')
    .replace(/\.$/, '');
}

function generateSummary(type, message) {
  const prefix = TYPE_PREFIXES[type] || 'Request';
  const cleaned = cleanMessage(message);

  if (!cleaned) {
    return `${prefix}.`;
  }

  const lower = cleaned.toLowerCase();
  if (lower.startsWith('for ') || lower.startsWith('with ') || lower.startsWith('regarding ')) {
    return `${prefix} ${cleaned}.`;
  }

  return `${prefix} for ${cleaned}.`;
}

module.exports = { generateSummary };
