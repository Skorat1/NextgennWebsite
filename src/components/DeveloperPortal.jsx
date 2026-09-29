import React, { useState } from 'react';
import {
  Code2,
  DollarSign,
  Globe2,
  Rocket,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Upload,
  ArrowRight,
  Zap,
  RefreshCw,
  Layers,
  Gamepad2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { submissionsApi } from '../services/api';

export default function DeveloperPortal({ onBackToHome, categories = [] }) {
  const availableCategories = (categories && categories.length > 0 ? categories : [
    { id: 'action', name: 'Action' },
    { id: 'arcade', name: 'Arcade' },
    { id: 'puzzle', name: 'Puzzle' },
    { id: 'classic', name: 'Classic' },
    { id: 'sports', name: 'Sports' },
    { id: 'cyber', name: 'Cyberpunk' }
  ]).filter(c => c.id !== 'all');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gameTitle: '',
    gameUrl: '',
    category: availableCategories[0]?.id || 'action',
    description: '',
    engine: 'HTML5 / WebGL'
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [extractedNotice, setExtractedNotice] = useState('');
  const [ticketId, setTicketId] = useState('');

  const handleGameUrlChange = (val) => {
    let clean = val;
    const iframeMatch = clean.match(/src=["']([^"']+)["']/i);
    if (iframeMatch) {
      clean = iframeMatch[1];
      setExtractedNotice(`✅ Iframe Code Detected: Game URL auto-extracted!`);
    } else {
      setExtractedNotice('');
    }
    setFormData(prev => ({ ...prev, gameUrl: clean }));
  };

  const handleGameUrlPaste = (e) => {
    const pasted = e.clipboardData?.getData('text') || '';
    const iframeMatch = pasted.match(/src=["']([^"']+)["']/i);
    if (iframeMatch) {
      e.preventDefault();
      const extracted = iframeMatch[1];
      setFormData(prev => ({ ...prev, gameUrl: extracted }));
      setExtractedNotice(`✅ Iframe Code Detected: Game URL auto-extracted!`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalUrl = formData.gameUrl.trim();
    const iframeMatch = finalUrl.match(/src=["']([^"']+)["']/i);
    if (iframeMatch) {
      finalUrl = iframeMatch[1];
    }
    finalUrl = finalUrl.replace(/^https?:\/\/"https?:\/\//i, 'https://');
    finalUrl = finalUrl.replace(/^"|"$/g, '').trim();
    finalUrl = finalUrl.replace(/&amp;/g, '&');
    if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://') && !finalUrl.startsWith('//') && !finalUrl.startsWith('/')) {
      finalUrl = 'https://' + finalUrl;
    }

    if (!finalUrl) {
      alert('Please provide a valid game URL or iframe embed code.');
      return;
    }

    setSubmitting(true);
    sounds.playPowerup();
    const randomId = `NEXT-${Math.floor(10000 + Math.random() * 90000)}`;
    setTicketId(randomId);

    try {
      await submissionsApi.submitGame({
        developerName: formData.name,
        email: formData.email,
        gameTitle: formData.gameTitle,
        gameUrl: finalUrl,
        category: formData.category,
        description: formData.description,
        thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80'
      });
    } catch (err) {
      console.warn('API submission offline:', err);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 }
      });
    }
  };



  return (
    <div className="dev-portal-page">
      {/* Dev Hero */}
      <div className="dev-hero-section">
        <div className="dev-hero-badge">
          <Code2 size={15} />
          <span>FOR GAME DEVELOPERS & STUDIOS</span>
        </div>
        <h1 className="dev-hero-title">
          Publish Your Games to <span className="gradient-highlight">Millions of Players</span>
        </h1>
        <p className="dev-hero-subtitle">
          NextGenn helps HTML5, WebGL, and Unity Web developers monetize, distribute, and grow their player base globally with 70/30 revenue share and instant SDK integration.
        </p>

        <div className="dev-stats-grid">
          <div className="dev-stat-card">
            <Globe2 size={24} className="text-cyan" />
            <h3>10M+</h3>
            <p>Monthly Active Plays</p>
          </div>
          <div className="dev-stat-card">
            <DollarSign size={24} className="text-yellow" />
            <h3>70%</h3>
            <p>Revenue Share</p>
          </div>
          <div className="dev-stat-card">
            <Rocket size={24} className="text-crimson" />
            <h3>24h</h3>
            <p>Average Review Time</p>
          </div>
          <div className="dev-stat-card">
            <ShieldCheck size={24} className="text-purple" />
            <h3>100%</h3>
            <p>Transparent Analytics</p>
          </div>
        </div>
      </div>

      {/* Submission Form & Benefits */}
      <div className="dev-form-grid">
        {/* Left Container */}
        <div className="dev-form-container">
          <div className="form-card-header">
            <div className="form-card-icon-box">
              <Rocket size={20} color="#f52d3a" />
            </div>
            <div>
              <h2>Submit Your Game</h2>
              <p className="form-card-sub">Direct developer publishing pipeline with 24-hour review SLA</p>
            </div>
          </div>

          {submitted ? (
            <div className="dev-success-box">
              <div className="dev-success-icon-wrap">
                <CheckCircle2 size={46} strokeWidth={2.5} />
              </div>

              <div className="dev-ticket-badge">
                <Sparkles size={13} />
                <span>Ticket #{ticketId || 'NEXT-84920'} • Received</span>
              </div>

              <h2 className="dev-success-heading">Submission Received!</h2>
              <p className="dev-success-subtext">
                Thank you for submitting <strong className="dev-highlight-text">{formData.gameTitle || 'your game'}</strong>! Our publishing team will review your game build within 24 hours and contact you at <strong className="dev-highlight-text">{formData.email}</strong>.
              </p>

              {/* Review Timeline */}
              <div className="dev-review-pipeline">
                <div className="pipeline-step active">
                  <div className="pipeline-dot">1</div>
                  <div className="pipeline-info">
                    <strong>Build Audit</strong>
                    <span>Security & sandbox check</span>
                  </div>
                </div>
                <div className="pipeline-step">
                  <div className="pipeline-dot">2</div>
                  <div className="pipeline-info">
                    <strong>Catalog Indexing</strong>
                    <span>Thumbnails & tags</span>
                  </div>
                </div>
                <div className="pipeline-step">
                  <div className="pipeline-dot">3</div>
                  <div className="pipeline-info">
                    <strong>Global Launch</strong>
                    <span>Instant player access</span>
                  </div>
                </div>
              </div>

              <div className="dev-success-actions">
                <button
                  type="button"
                  className="pro-btn-primary"
                  onClick={() => {
                    sounds.playClick();
                    setSubmitted(false);
                    setFormData({
                      name: '',
                      email: '',
                      gameTitle: '',
                      gameUrl: '',
                      category: availableCategories[0]?.id || 'action',
                      description: '',
                      engine: 'HTML5 / WebGL'
                    });
                  }}
                >
                  <RefreshCw size={16} />
                  <span>Submit Another Game</span>
                </button>

                {onBackToHome && (
                  <button
                    type="button"
                    className="pro-btn-secondary"
                    onClick={() => {
                      sounds.playClick();
                      onBackToHome();
                    }}
                  >
                    <Gamepad2 size={16} />
                    <span>Explore Game Catalog</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="game-submit-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Your Name / Studio *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Byte Studio"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Business Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="developer@studio.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Game Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cyber Rush 2099"
                    value={formData.gameTitle}
                    onChange={(e) => setFormData({ ...formData, gameTitle: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Primary Genre *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {availableCategories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Playable Demo URL / Iframe Embed Code *</label>
                <input
                  type="text"
                  required
                  placeholder="Paste game link or <iframe src='...'></iframe> embed code"
                  value={formData.gameUrl}
                  onChange={(e) => handleGameUrlChange(e.target.value)}
                  onPaste={handleGameUrlPaste}
                />
                {extractedNotice && (
                  <span className="extracted-notice-pill">
                    {extractedNotice}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Game Description & Controls</label>
                <textarea
                  rows={4}
                  placeholder="Briefly describe gameplay mechanics, controls, and unique features..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <button type="submit" className="dev-submit-btn" disabled={submitting}>
                <Upload size={18} />
                <span>{submitting ? 'Submitting Build...' : 'SUBMIT GAME FOR PUBLISHING'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Developer Benefits Checklist */}
        <div className="dev-benefits-card">
          <div className="benefits-card-header">
            <span className="benefits-pill-tag">DEVELOPER BENEFITS</span>
            <h3>Why Partner with NextGenn?</h3>
            <p className="benefits-card-desc">
              Scale your game globally with frictionless distribution, high-speed edge hosting, and creator-first monetization.
            </p>
          </div>

          <div className="benefits-items-list">
            <div className="benefit-item-row">
              <div className="benefit-icon-badge cyan">
                <Globe2 size={18} />
              </div>
              <div className="benefit-text">
                <strong>Zero Hosting Fees</strong>
                <p>We host and distribute your game across worldwide high-speed CDNs with 99.99% uptime.</p>
              </div>
            </div>

            <div className="benefit-item-row">
              <div className="benefit-icon-badge amber">
                <Zap size={18} />
              </div>
              <div className="benefit-text">
                <strong>Lightweight SDK</strong>
                <p>Integrate rewarded ads, interstitials, and scoreboards in under 10 lines of clean JavaScript.</p>
              </div>
            </div>

            

            <div className="benefit-item-row">
              <div className="benefit-icon-badge purple">
                <Rocket size={18} />
              </div>
              <div className="benefit-text">
                <strong>Featured Spotlight</strong>
                <p>High-performing games get guaranteed placement on our homepage hero marquee and social streams.</p>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
