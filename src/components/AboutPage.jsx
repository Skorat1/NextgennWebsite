import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Users,
  ShieldCheck,
  Zap,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Rocket,
  ArrowRight,
  Star,
  Lock,
  Flame,
  Code2
} from 'lucide-react';
import { STATS } from '../data/games';
import { sounds } from '../utils/audio';

const FEATURES = [
  {
    icon: Zap,
    color: 'cyan',
    badge: 'Speed',
    title: 'Instant Play',
    desc: 'Launch games in under 2 seconds. Zero downloads, zero updates.'
  },
  {
    icon: Smartphone,
    color: 'purple',
    badge: 'Cross-Platform',
    title: 'Any Screen',
    desc: 'Play on mobile, PC, or Chromebook with touch and gamepad support.'
  },
  {
    icon: Lock,
    color: 'emerald',
    badge: 'Security',
    title: '100% Sandbox Safe',
    desc: 'Quarantined browser runtime. Zero access to personal files or data.'
  },
  {
    icon: Star,
    color: 'gold',
    badge: 'Cloud Sync',
    title: 'Auto Save',
    desc: 'Scores, favorites, and settings persist safely on your device.'
  }
];

const FAQS = [
  {
    q: 'Is NextGenn completely free?',
    a: 'Yes, 100% free. No subscriptions, paywalls, or hidden fees.'
  },
  {
    q: 'Do I need to install anything?',
    a: 'No. Every title runs instantly in Chrome, Safari, Edge, or Firefox.'
  },
  {
    q: 'Can I use a controller?',
    a: 'Yes. Xbox, PlayStation, and touchscreen controls work automatically.'
  },
  {
    q: 'Can indie developers submit games?',
    a: 'Yes! Creators can submit HTML5/WebGL games via our Developer Portal.'
  }
];

export default function AboutPage({ onBackToHome, onNavigate }) {
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleNav = (page) => {
    sounds.playClick();
    if (onNavigate) {
      onNavigate(page);
    } else if (onBackToHome) {
      onBackToHome();
    }
  };

  const toggleFaq = (idx) => {
    sounds.playClick();
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="custom-static-page-container about-clean-page">
      {/* Hero Showcase Card */}
      <section className="about-hero-box">
        <div className="about-hero-glow"></div>
        <div className="about-hero-inner">
          <div className="about-status-chip">
            <span className="live-dot"></span>
            <span>NEXTGENN CLOUD GAMING</span>
          </div>

          <h1 className="about-hero-headline">
            Play Instantly. <span className="neon-text-gradient">Zero Downloads.</span>
          </h1>

          <p className="about-hero-subtitle">
            500+ free browser games with locked 60 FPS performance on any device.
          </p>

          <div className="about-chip-strip">
            <span className="about-chip"><Zap size={14} className="text-cyan" /> 0 MB Storage</span>
            <span className="about-chip"><ShieldCheck size={14} className="text-emerald" /> Sandbox Safe</span>
            <span className="about-chip"><Smartphone size={14} className="text-purple" /> Touch & Gamepad</span>
            <span className="about-chip"><Sparkles size={14} className="text-gold" /> Locked 60 FPS</span>
          </div>

          <div className="about-btn-row">
            <button
              className="about-primary-btn"
              onClick={() => {
                sounds.playScore();
                handleNav('home');
              }}
            >
              <Gamepad2 size={18} />
              <span>Explore 500+ Games</span>
              <ArrowRight size={16} />
            </button>
            <button
              className="about-secondary-btn"
              onClick={() => {
                sounds.playClick();
                handleNav('developers');
              }}
            >
              <Rocket size={17} />
              <span>Developer Portal</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4 Minimal Stat Counters */}
      <section className="about-stats-strip">
        <div className="about-stat-item stat-cyan">
          <div className="stat-icon-wrap"><Gamepad2 size={20} className="text-cyan" /></div>
          <div className="stat-num">{STATS.totalGames || '500+'}</div>
          <div className="stat-name">Games</div>
        </div>
        <div className="about-stat-item stat-purple">
          <div className="stat-icon-wrap"><Users size={20} className="text-purple" /></div>
          <div className="stat-num">{STATS.activePlayers || '2.5M+'}</div>
          <div className="stat-name">Players</div>
        </div>
        <div className="about-stat-item stat-emerald">
          <div className="stat-icon-wrap"><Zap size={20} className="text-emerald" /></div>
          <div className="stat-num">60 FPS</div>
          <div className="stat-name">Engine</div>
        </div>
        <div className="about-stat-item stat-gold">
          <div className="stat-icon-wrap"><Star size={20} className="text-gold" /></div>
          <div className="stat-num">4.9 / 5</div>
          <div className="stat-name">Rating</div>
        </div>
      </section>

      {/* Core Features Bento Grid (Only 4 sleek cards) */}
      <section className="about-bento-section">
        <div className="about-section-heading">
          <h2>Why Choose <span className="neon-text-gradient">NextGenn</span></h2>
          <p>Instant gaming designed for speed, safety, and pure fun.</p>
        </div>

        <div className="about-bento-grid">
          {FEATURES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className={`about-bento-card bento-${item.color}`}>
                <div className="bento-top-row">
                  <div className={`bento-icon-circle icon-bg-${item.color}`}>
                    <Icon size={20} className={`text-${item.color}`} />
                  </div>
                  <span className={`bento-pill pill-${item.color}`}>{item.badge}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Compact Developer Banner */}
      <section className="about-dev-banner">
        <div className="dev-banner-left">
          <div className="dev-banner-tag">
            <Code2 size={13} className="text-cyan" />
            <span>FOR CREATORS</span>
          </div>
          <h3>Are you a Game Developer?</h3>
          <p>Publish your HTML5, WebGL, or Godot 4 games to millions of players with free hosting.</p>
        </div>
        <div className="dev-banner-right">
          <button
            className="dev-submit-btn"
            onClick={() => {
              sounds.playLaser();
              handleNav('developers');
            }}
          >
            <Rocket size={16} />
            <span>Submit Game</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* Short FAQ Section */}
      <section className="about-faq-section">
        <div className="about-section-heading">
          <h2>Quick <span className="neon-text-gradient">Questions</span></h2>
          <p>Everything you need to know in a glance.</p>
        </div>

        <div className="about-faq-cards">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className={`about-faq-item ${isOpen ? 'active' : ''}`}
                onClick={() => toggleFaq(idx)}
              >
                <div className="faq-q-bar">
                  <div className="faq-q-left">
                    <HelpCircle size={18} className="text-cyan" />
                    <h4>{faq.q}</h4>
                  </div>
                  <div className="faq-q-arrow">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
                {isOpen && (
                  <div className="faq-a-content">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="about-cta-banner">
        <div className="cta-banner-glow"></div>
        <div className="cta-banner-content">
          <div className="cta-badge">
            <Flame size={15} className="text-gold" />
            <span>INSTANT ARCADE</span>
          </div>
          <h2>Ready to Play?</h2>
          <p>Jump straight into 500+ top-rated games. No account needed.</p>
          <button
            className="about-primary-btn large"
            onClick={() => {
              sounds.playPowerup();
              handleNav('home');
            }}
          >
            <Gamepad2 size={20} />
            <span>Play Now</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </section>
    </div>
  );
}
