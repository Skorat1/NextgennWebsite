import React, { useEffect } from 'react';
import {
  FileText,
  Scale,
  CheckCircle2,
  Mail
} from 'lucide-react';

export default function TermsPage({ onBackToHome }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="custom-static-page-container">
      {/* Hero Showcase Card */}
      <div className="static-hero-card">
        <div className="static-hero-glow glow-blue"></div>
        <div className="static-hero-content">
          <div className="static-badge badge-blue">
            <Scale size={15} className="text-blue" />
            <span>TERMS OF SERVICE & USER AGREEMENT</span>
          </div>

          <div className="static-hero-icon-box blue-border">
            <FileText size={38} className="text-blue" />
          </div>
          <h1>Terms of <span className="neon-text-gradient">Service</span></h1>
          <p className="static-hero-lead">
            Welcome to NextGenn! By accessing or playing games on our platform, you agree to these transparent terms designed to keep gaming fun, secure, and fair for everyone.
          </p>
          <div className="policy-meta-date">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Scale size={16} className="text-blue" /> Effective Date: 2026 • Governs all games, features, and platform services
            </span>
          </div>
        </div>
      </div>

      {/* Quick Core Rules Highlights */}
      <div className="privacy-highlight-row">
        <div className="privacy-pill-box">
          <CheckCircle2 size={18} className="text-emerald" />
          <div>
            <strong>100% Free Access</strong>
            <span>All games are freely accessible without mandatory subscriptions or credit cards.</span>
          </div>
        </div>
        <div className="privacy-pill-box">
          <CheckCircle2 size={18} className="text-emerald" />
          <div>
            <strong>Fair Play & Respect</strong>
            <span>No cheating, botting, or harassing other players.</span>
          </div>
        </div>
        <div className="privacy-pill-box">
          <CheckCircle2 size={18} className="text-emerald" />
          <div>
            <strong>Creator Copyright</strong>
            <span>Game assets and code remain the intellectual property of their rightful developers.</span>
          </div>
        </div>
      </div>

      {/* Terms Matrix Table */}
      <div className="data-matrix-card">
        <div className="matrix-card-header">
          <Scale size={20} className="text-cyan" />
          <h3>At a Glance: What You Can & Cannot Do</h3>
        </div>
        <div className="matrix-table-wrapper">
          <table className="matrix-table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Permitted?</th>
                <th>Guidelines / Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Playing Games & Sharing Scores</strong></td>
                <td><span className="status-tag tag-yes">✅ ALLOWED</span></td>
                <td>Enjoy unlimited gameplay and share high scores with friends and social channels.</td>
              </tr>
              <tr>
                <td><strong>Streaming & Recording Gameplay</strong></td>
                <td><span className="status-tag tag-yes">✅ ALLOWED</span></td>
                <td>Content creators and YouTubers/Twitch streamers are welcome to stream and monetize gameplay videos.</td>
              </tr>
              <tr>
                <td><strong>Submitting Indie Games</strong></td>
                <td><span className="status-tag tag-yes">✅ ALLOWED</span></td>
                <td>Developers can submit original HTML5/WebGL games via our Developer Portal.</td>
              </tr>
              <tr>
                <td><strong>Exploiting, Botting & Hacking</strong></td>
                <td><span className="status-tag tag-no">❌ PROHIBITED</span></td>
                <td>Automated scripts, reverse engineering, and DDoS attacks on our infrastructure are strictly banned.</td>
              </tr>
              <tr>
                <td><strong>Commercial Reselling of Games</strong></td>
                <td><span className="status-tag tag-no">❌ PROHIBITED</span></td>
                <td>You may not repackage or sell any game assets hosted on NextGenn without express written consent.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Terms Sections List */}
      <div className="policy-sections-list">
        <div className="policy-section-card">
          <div className="policy-card-header">
            <div className="policy-num">01</div>
            <div>
              <h3>1. Acceptance of Terms</h3>
              <p className="policy-subtitle">Agreement between you and NextGenn Platform</p>
            </div>
          </div>
          <div className="policy-card-body">
            <p>
              By accessing, browsing, or playing on NextGenn (including on desktop, tablet, and mobile devices), you agree to comply with and be legally bound by these Terms of Service. If you do not agree to these terms, please discontinue using our website.
            </p>
          </div>
        </div>

        <div className="policy-section-card">
          <div className="policy-card-header">
            <div className="policy-num">02</div>
            <div>
              <h3>2. Permitted Use & Code of Conduct</h3>
              <p className="policy-subtitle">Ensuring a safe and enjoyable environment for all gamers</p>
            </div>
          </div>
          <div className="policy-card-body">
            <p>
              NextGenn is provided for personal, non-commercial entertainment. You agree not to:
            </p>
            <ul style={{ marginTop: '10px', paddingLeft: '20px', color: '#475569', lineHeight: '1.7' }}>
              <li>Attempt to bypass, disable, or tamper with security measures or game sandboxing.</li>
              <li>Use automated crawlers, bots, or scrapers that overload our servers or bandwidth.</li>
              <li>Upload malicious code, viruses, or inappropriate content through our community portals.</li>
              <li>Impersonate other users, staff, or moderators.</li>
            </ul>
          </div>
        </div>

        <div className="policy-section-card">
          <div className="policy-card-header">
            <div className="policy-num">03</div>
            <div>
              <h3>3. Intellectual Property & Developer Rights</h3>
              <p className="policy-subtitle">Protection of games, trademarks, and community creations</p>
            </div>
          </div>
          <div className="policy-card-body">
            <p>
              All games, graphics, audio, trademarks, and source codes featured on NextGenn are owned by NextGenn or their respective third-party licensors and game developers. Submitting a game via our Developer Portal grants NextGenn a non-exclusive license to host, display, and promote your title while you retain full intellectual ownership.
            </p>
          </div>
        </div>

        <div className="policy-section-card">
          <div className="policy-card-header">
            <div className="policy-num">04</div>
            <div>
              <h3>4. Disclaimers & Limitation of Liability</h3>
              <p className="policy-subtitle">Platform availability and third-party game execution</p>
            </div>
          </div>
          <div className="policy-card-body">
            <p>
              NextGenn is provided on an "AS IS" and "AS AVAILABLE" basis. While we strive for 99.9% uptime and curate high-quality games, we do not guarantee uninterrupted availability. NextGenn shall not be held liable for any loss of game progress, local browser storage data, or temporary network interruptions.
            </p>
          </div>
        </div>

        <div className="policy-section-card">
          <div className="policy-card-header">
            <div className="policy-num">05</div>
            <div>
              <h3>5. Governing Law & Dispute Resolution</h3>
              <p className="policy-subtitle">Legal jurisdiction and fair resolution policy</p>
            </div>
          </div>
          <div className="policy-card-body">
            <p>
              These Terms shall be governed by and construed in accordance with applicable standard digital media laws. Any disputes shall first be resolved through friendly informal negotiation with our support team.
            </p>
          </div>
        </div>

        <div className="policy-section-card">
          <div className="policy-card-header">
            <div className="policy-num">06</div>
            <div>
              <h3>6. Contact Legal & Terms Support</h3>
              <p className="policy-subtitle">Questions regarding terms, licenses, or partnerships</p>
            </div>
          </div>
          <div className="policy-card-body">
            <p>
              If you have any questions or feedback regarding our Terms of Service, reach out to our legal and support team:
            </p>
            <div className="email-copy-bar" style={{ marginTop: '12px' }}>
              <span className="email-text">nextgenn.ca@gmail.com</span>
              <a
                href="mailto:nextgenn.ca@gmail.com"
                className="copy-btn copy-btn-primary"
              >
                <Mail size={16} />
                <span>Contact Legal Team</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
