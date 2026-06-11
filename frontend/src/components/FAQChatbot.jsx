import { useState } from 'react';

const FAQ_DATA = [
  {
    question: 'How can I get support?',
    answer:
      'Submit a support form with type "Patient Support" and describe your medical needs. Our care coordinators will review your request within 24–48 hours and connect you with appropriate services, clinics, or financial aid programs.',
  },
  {
    question: 'How can I volunteer?',
    answer:
      'Select "Volunteer Registration" in the support form and tell us about your skills and availability. We welcome medical professionals, community organizers, and general volunteers for outreach, events, and patient assistance.',
  },
  {
    question: 'What services are available?',
    answer:
      'CareBridge NGO offers free health screenings, chronic disease management support, medication assistance referrals, mental health counseling connections, community health education, and emergency medical aid coordination for eligible patients.',
  },
];

function FAQChatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Hello! I\'m the CareBridge FAQ assistant. Choose a question below or type your own.',
    },
  ]);
  const [input, setInput] = useState('');

  const addBotReply = (question) => {
    const match = FAQ_DATA.find(
      (faq) => faq.question.toLowerCase() === question.toLowerCase()
    );

    const answer = match
      ? match.answer
      : 'I can help with: getting support, volunteering, and available services. Please select one of the suggested questions below.';

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: question },
      { role: 'bot', text: answer },
    ]);
  };

  const handleQuickQuestion = (question) => {
    addBotReply(question);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    addBotReply(input.trim());
    setInput('');
  };

  return (
    <div className="card chatbot-card">
      <h2>FAQ Chatbot</h2>
      <p className="card-subtitle">Get quick answers to common questions.</p>

      <div className="quick-questions">
        {FAQ_DATA.map((faq) => (
          <button
            key={faq.question}
            type="button"
            className="quick-btn"
            onClick={() => handleQuickQuestion(faq.question)}
          >
            {faq.question}
          </button>
        ))}
      </div>

      <div className="chat-window" aria-live="polite">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role}`}>
            {msg.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a question..."
          aria-label="Chat message"
        />
        <button type="submit" className="btn btn-primary btn-sm">
          Send
        </button>
      </form>
    </div>
  );
}

export default FAQChatbot;
