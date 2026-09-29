import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  MessageSquare,
  HelpCircle,
  Bug,
  Lightbulb,
  Briefcase,
  Zap,
  ChevronDown,
  ChevronUp,
  Headphones,
  Lock,
  ArrowRight,
  RefreshCw,
  Clock,
  Users,
  Gamepad2,
  Star,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { messagesApi } from '../services/api';

const TOPIC_PRESETS = [
  { id: 'suggestion', label: 'Game Suggestion', icon: Lightbulb },
  { id: 'bug', label: 'Bug Report', icon: Bug },
  { id: 'partner', label: 'Business & Partnership', icon: Briefcase },
  { id: 'speed', label: 'Performance & Latency', icon: Zap },
  { id: 'general', label: 'General Inquiry', icon: MessageSquare }
];

const CONTACT_FAQS = [
  {
    q: "How quickly does the NextGenn support team respond?",
    a: "Our global engineering and support team reviews inquiries 24/7. Most player support requests and bug tickets are answered within 2 hours. Business partnerships and publisher inquiries are typically reviewed within 1 business day."
  },
  {
    q: "Where should I report a game glitch, broken controls, or black screen?",
    a: "Select the 'Bug Report' category in the contact form above and include the game title along with your device or browser. Our QA team will reproduce and roll out a hotfix promptly."
  },
  {
    q: "How can indie game developers publish their games on NextGenn?",
    a: "You can submit directly via our Developer Portal or select 'Business & Partnership' above. We offer generous revenue sharing, featured placement, and instant global distribution for high-quality HTML5/WebGL games."
  },
  {
    q: "Is my personal data and email address kept private?",
    a: "100% yes. We strictly adhere to GDPR, CCPA, and COPPA privacy standards. We never sell, rent, or share your contact details with any third parties or advertisers."
  }
];

export default function ContactPage({ onBackToHome }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    priority: 'Normal',
    message: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [selectedTopic, setSelectedTopic] = useState('Game Suggestion');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const handleTopicClick = (topic) => {
    sounds.playClick();
    setSelectedTopic(topic.label);
    setFormData(prev => ({
      ...prev,
      subject: `[${topic.label}] ${prev.subject ? prev.subject.replace(/^\[.*?\]\s*/, '') : ''}`
    }));
  };

  const toggleFaq = (index) => {
    sounds.playClick();
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    sounds.playPowerup();
    const genTicket = `NEXTGENN-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(genTicket);
    const subjectLine = formData.subject || `[${selectedTopic}] Support Request`;
    try {
      await messagesApi.sendMessage({
        name: formData.name,
        email: formData.email,
        type: selectedTopic.includes('Bug') ? 'Bug Report' : selectedTopic.includes('Business') ? 'Partnership' : 'Inquiry',
        subject: `${subjectLine} (${formData.priority} Priority - Ref: ${genTicket})`,
        message: formData.message
      });
    } catch (err) {
      console.warn('Message sync fallback:', err);
    }
    setSubmitting(false);
    setSent(true);
    confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
  };

  return (
    <div className="custom-static-page-container">

      {/* ── Hero Card ── */}
      <div className="static-hero-card">
        <div className="static-hero-glow glow-blue"></div>
        <div className="static-hero-content">
          <div className="static-badge badge-blue">
            <Mail size={15} className="text-blue" />
            <span>OFFICIAL SUPPORT & OPERATIONS DESK</span>
          </div>
          <div className="static-hero-icon-box blue-border">
            <Headphones size={38} className="text-blue" />
          </div>
          <h1>Get in <span className="neon-text-gradient">Touch</span></h1>
          <p className="static-hero-lead">
            Have a question, feedback, bug report, or business partnership proposal? Connect directly with our engineering and community support team — we respond fast.
          </p>
          <div className="policy-meta-date">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} className="text-blue" /> Available 24/7 • &lt; 2 Hour Response SLA
            </span>
          </div>
        </div>
      </div>

      {/* ── Quick Stats Row ── */}
      <div className="privacy-highlight-row">
        <div className="privacy-pill-box">
          <Users size={18} className="text-cyan" />
          <div>
            <strong>2M+ Active Players</strong>
            <span>Trusted by millions of gamers worldwide.</span>
          </div>
        </div>
        <div className="privacy-pill-box">
          <Gamepad2 size={18} className="text-blue" />
          <div>
            <strong>5000+ Games Available</strong>
            <span>Instant access, no downloads or signups.</span>
          </div>
        </div>
        <div className="privacy-pill-box">
          <Clock size={18} className="text-emerald" />
          <div>
            <strong>&lt; 2hr Response Time</strong>
            <span>Human support team available 24/7 worldwide.</span>
          </div>
        </div>
      </div>

      {/* ── Contact Form Card ── */}
      <div className="data-matrix-card">
        <div className="matrix-card-header">
          <Send size={20} className="text-cyan" />
          <h3>Send a Direct Message</h3>
        </div>

        {sent ? (
          /* Success State */
          <div className="contact-success-state">
            <div className="contact-success-icon">
              <CheckCircle2 size={50} />
            </div>
            <span className="contact-ticket-pill">Ticket #{ticketId}</span>
            <h3>Inquiry Dispatched Successfully</h3>
            <p>
              Thank you, <strong>{formData.name}</strong>! Your message has been routed to the appropriate department. We'll follow up at <strong>{formData.email}</strong> shortly.
            </p>
            <div className="contact-success-btns">
              <button className="static-cta-btn" onClick={() => {
                setSent(false);
                setFormData({ name: '', email: '', subject: '', priority: 'Normal', message: '' });
              }}>
                <RefreshCw size={16} />
                <span>Send Another</span>
              </button>
              <button className="contact-back-btn" onClick={() => { sounds.playClick(); onBackToHome(); }}>
                <span>Back to Arcade</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="contact-form-body">

            {/* Topic Chips */}
            <div className="contact-field-group">
              <label className="contact-field-label">Department / Category *</label>
              <div className="contact-topic-chips">
                {TOPIC_PRESETS.map((t) => {
                  const isActive = selectedTopic === t.label;
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`contact-chip ${isActive ? 'active' : ''}`}
                      onClick={() => handleTopicClick(t)}
                    >
                      <Icon size={14} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name + Email */}
            <div className="contact-form-row">
              <div className="contact-field-group">
                <label className="contact-field-label">Full Name *</label>
                <input
                  type="text" required
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="contact-input"
                />
              </div>
              <div className="contact-field-group">
                <label className="contact-field-label">Email Address *</label>
                <input
                  type="email" required
                  placeholder="alex@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="contact-input"
                />
              </div>
            </div>

            {/* Subject + Priority */}
            <div className="contact-form-row">
              <div className="contact-field-group">
                <label className="contact-field-label">Subject Line *</label>
                <input
                  type="text" required
                  placeholder="e.g. Bug in Space Invaders / Partnership Proposal"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="contact-input"
                />
              </div>
              <div className="contact-field-group">
                <label className="contact-field-label">Priority Level</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="contact-input contact-select"
                >
                  <option value="Normal">Normal — Standard Support</option>
                  <option value="High">High — Game Breaking Issue</option>
                  <option value="Urgent">Urgent — Publisher / Security</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div className="contact-field-group">
              <div className="contact-label-row">
                <label className="contact-field-label">Message Details *</label>
                <span className="contact-char-count">{formData.message.length} characters</span>
              </div>
              <textarea
                rows={5} required
                placeholder="Please provide comprehensive details, steps to reproduce (if a bug), or your business scope..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="contact-input contact-textarea"
              />
            </div>

            {/* Privacy note */}
            <div className="contact-privacy-note">
              <Lock size={13} className="text-emerald" style={{ flexShrink: 0 }} />
              <span>Encrypted transmission. Your email is protected under our Privacy Policy and never shared with third parties.</span>
            </div>

            <button type="submit" disabled={submitting} className="contact-submit-btn">
              <Send size={17} />
              <span>{submitting ? 'Dispatching Inquiry...' : 'Send Message'}</span>
            </button>
          </form>
        )}
      </div>

      {/* ── FAQ Section ── */}
      <div className="static-section-heading">
        <div className="static-badge badge-indigo" style={{ width: 'fit-content' }}>
          <HelpCircle size={14} />
          <span>QUICK ANSWERS</span>
        </div>
        <h2>Frequently Asked Questions</h2>
        <p>Quick resolutions to common inquiries before opening a ticket.</p>
      </div>

      <div className="static-faq-container">
        {CONTACT_FAQS.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div
              key={idx}
              className={`faq-accordion-card ${isOpen ? 'expanded' : ''}`}
              onClick={() => toggleFaq(idx)}
            >
              <div className="faq-question-row">
                <div className="faq-q-left">
                  <span className="pro-faq-num">0{idx + 1}</span>
                  <h3>{faq.q}</h3>
                </div>
                <span className="faq-toggle-icon">
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
              </div>
              {isOpen && (
                <div className="faq-answer-row">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
