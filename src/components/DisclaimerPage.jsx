import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Scale,
  CheckCircle2,
  HelpCircle,
  Mail,
  Gamepad2,
  ExternalLink,
  Copy,
  Check,
  ArrowLeft,
  FileText,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';
import { sounds } from '../utils/audio';

export default function DisclaimerPage({ onBackToHome, onNavigate }) {
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCopyEmail = () => {
    sounds.playClick();
    navigator.clipboard.writeText('nextgenn.ca@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleBack = () => {
    sounds.playClick();
    if (onBackToHome) onBackToHome();
  };

  return (
    <div className="custom-static-page-container">

      {/* Hero Showcase Card */}
      <div className="static-hero-card">
        <div className="static-hero-glow glow-amber"></div>
        <div className="static-hero-content">
          <div className="static-badge badge-amber">
            <AlertTriangle size={15} className="text-amber" />
            <span>LEGAL DISCLAIMER & FAIR USE NOTICE</span>
          </div>

          <div className="static-hero-icon-box amber-border">
            <ShieldAlert size={38} className="text-amber" />
          </div>
          <h1>Platform <span className="neon-text-gradient">Disclaimer</span></h1>
          <p className="static-hero-lead">
            NextGenn is committed to transparent and responsible operation. Please review this disclaimer carefully before accessing any games or services on this platform. All content is provided solely for free recreational and entertainment use.
          </p>
        </div>
      </div>

      {/* Quick Core Rules Highlights */}
      <div className="privacy-highlight-row">
        <div className="privacy-pill-box">
          <CheckCircle2 size={18} className="text-emerald" />
          <div>
            <strong>Third-Party Intellectual Property</strong>
            <span>All games, characters, and trademarks remain the property of their respective creators.</span>
          </div>
        </div>
        <div className="privacy-pill-box">
          <CheckCircle2 size={18} className="text-emerald" />
          <div>
            <strong>"As-Is" Service Guarantee</strong>
            <span>Games run inside your browser without warranties of fitness for particular devices.</span>
          </div>
        </div>
        <div className="privacy-pill-box">
          <CheckCircle2 size={18} className="text-emerald" />
          <div>
            <strong>Rapid 24–48h DMCA Response</strong>
            <span>We respect copyright and take down infringing titles promptly upon notice.</span>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="data-matrix-card">
        <div className="matrix-card-header">
          <Scale size={20} className="text-cyan" />
          <h3>At a Glance: Ownership & Responsibility Matrix</h3>
        </div>
        <div className="matrix-table-wrapper">
          <table className="matrix-table">
            <thead>
              <tr>
                <th>Area / Subject</th>
                <th>Disclaimer Stance</th>
                <th>Details & Policies</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Third-Party Games & Trademarks</strong></td>
                <td><span className="status-tag tag-review" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.3)' }}>ORIGINAL CREATORS</span></td>
                <td>NextGenn does not claim ownership of games, titles, character art, or audio assets created by third-party studios.</td>
              </tr>
              <tr>
                <td><strong>Platform Availability & Uptime</strong></td>
                <td><span className="status-tag tag-yes">AS-IS BASIS</span></td>
                <td>We provide free instant access but do not warrant 100% uninterrupted service, network uptime, or compatibility across all browsers.</td>
              </tr>
              <tr>
                <td><strong>External Links & Iframes</strong></td>
                <td><span className="status-tag tag-review" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.3)' }}>EXTERNAL SITES</span></td>
                <td>Games may load resources from external publisher CDNs. NextGenn is not responsible for external content or third-party cookies.</td>
              </tr>
              <tr>
                <td><strong>Real-Money Gambling & Bets</strong></td>
                <td><span className="status-tag tag-no">NONE / NOT OFFERED</span></td>
                <td>No games on NextGenn offer real-money gambling, cash prizes, or financial wagers. All gameplay is purely recreational.</td>
              </tr>
              <tr>
                <td><strong>DMCA Copyright Inquiries</strong></td>
                <td><span className="status-tag tag-yes">24-48H SLA</span></td>
                <td>Verified copyright owners can request immediate takedown of content via nextgenn.ca@gmail.com.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Policy Sections List */}
      <div className="policy-sections-list">
        <div className="policy-section-card">
          <div className="policy-card-header">
            <div className="policy-num">01</div>
            <div>
              <h3>1. General Information & Purpose of Platform</h3>
              <p className="policy-subtitle">Free online entertainment portal</p>
            </div>
          </div>
          <div className="policy-card-body">
            <p>
              The information and games provided on NextGenn (the "Website") are for general entertainment, educational, and recreational purposes only. All games are accessible free of charge directly via standard web browsers.
            </p>
            <p style={{ marginTop: '10px' }}>
              While we make every effort to curate and maintain a safe, high-speed, family-friendly gaming library, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the website or the games contained herein.
            </p>
          </div>
        </div>

        <div className="policy-section-card">
          <div className="policy-card-header">
            <div className="policy-num">02</div>
            <div>
              <h3>2. Intellectual Property & Fair Use Statement</h3>
              <p className="policy-subtitle">Respect for developers and copyright holders</p>
            </div>
          </div>
          <div className="policy-card-body">
            <p>
              All trademarks, service marks, logos, brand names, game titles, character assets, audio, and game artwork appearing on the Website are the property of their respective owners, developers, and licensors.
            </p>
            <p style={{ marginTop: '10px' }}>
              NextGenn hosts, embeds, and displays web games that are:
            </p>
            <ul style={{ marginTop: '8px', paddingLeft: '20px', color: '#475569', lineHeight: '1.7' }}>
              <li>Directly submitted by indie developers and studios via our Developer Portal;</li>
              <li>Distributed freely for embedding across the web under standard developer publishing agreements; or</li>
              <li>Provided under creative commons or open-distribution permissions.</li>
            </ul>
            <p style={{ marginTop: '10px' }}>
              Use of these names, trademarks, and brands does not imply endorsement, affiliation, or sponsorship unless explicitly stated.
            </p>
          </div>
        </div>

        <div className="policy-section-card">
          <div className="policy-card-header">
            <div className="policy-num">03</div>
            <div>
              <h3>3. External Links, Embedded Content & Advertisements</h3>
              <p className="policy-subtitle">Third-party content and publisher networks</p>
            </div>
          </div>
          <div className="policy-card-body">
            <p>
              Certain games hosted on our platform utilize secure sandboxed iframes connected to game publisher servers, CDNs, or distribution networks. Through these games, you may be exposed to third-party links or advertisements displayed by the original game developers.
            </p>
            <p style={{ marginTop: '10px' }}>
              We have no control over the nature, content, privacy practices, or availability of those third-party sites or server networks. The inclusion of any external links or embedded games does not necessarily imply a recommendation or endorsement of the views expressed within them.
            </p>
          </div>
        </div>

        <div className="policy-section-card">
          <div className="policy-card-header">
            <div className="policy-num">04</div>
            <div>
              <h3>4. "As-Is" Service & No Guarantees</h3>
              <p className="policy-subtitle">Hardware, software, and browser compatibility</p>
            </div>
          </div>
          <div className="policy-card-body">
            <p>
              NextGenn is provided on an "AS IS" and "AS AVAILABLE" basis. We do not guarantee that:
            </p>
            <ul style={{ marginTop: '8px', paddingLeft: '20px', color: '#475569', lineHeight: '1.7' }}>
              <li>The website will be constantly available or completely free of errors, bugs, or downtime;</li>
              <li>Games will perform identically on all graphics cards, hardware configurations, or operating systems;</li>
              <li>Your local progress, high scores, or browser cache data will be permanently preserved if you clear browser cookies or LocalStorage.</li>
            </ul>
          </div>
        </div>

        <div className="policy-section-card">
          <div className="policy-card-header">
            <div className="policy-num">05</div>
            <div>
              <h3>5. Limitation of Liability</h3>
              <p className="policy-subtitle">User discretion and browser safety</p>
            </div>
          </div>
          <div className="policy-card-body">
            <p>
              In no event shall NextGenn, its founders, operators, or affiliates be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of your access to, or use of, this website or any game featured on it.
            </p>
            <p style={{ marginTop: '10px' }}>
              Users are responsible for ensuring that their own devices have appropriate antivirus and browser software, and for taking regular breaks during gaming sessions.
            </p>
          </div>
        </div>

        <div className="policy-section-card">
          <div className="policy-card-header">
            <div className="policy-num">06</div>
            <div>
              <h3>6. DMCA Copyright Notice & Content Takedown</h3>
              <p className="policy-subtitle">Direct line for copyright inquiries and removal requests</p>
            </div>
          </div>
          <div className="policy-card-body">
            <p>
              NextGenn takes copyright claims seriously. It is our strict policy to respond promptly to clear, documented notices of alleged copyright infringement in accordance with the Digital Millennium Copyright Act (DMCA).
            </p>
            <p style={{ marginTop: '10px' }}>
              If you are a copyright owner, or authorized to act on behalf of one, and believe in good faith that any game or material on NextGenn infringes upon your copyright, please submit an official written notice containing:
            </p>
            <ul style={{ marginTop: '8px', paddingLeft: '20px', color: '#475569', lineHeight: '1.7' }}>
              <li>Identification of the copyrighted work claimed to have been infringed;</li>
              <li>The exact URL or title of the game/material on NextGenn;</li>
              <li>Your contact information (name, email address, physical address, and telephone number);</li>
              <li>A statement of good faith belief that the use is not authorized by the copyright owner, its agent, or the law;</li>
              <li>A statement that the information provided is accurate under penalty of perjury.</li>
            </ul>

            <div className="email-copy-bar" style={{ marginTop: '16px' }}>
              <span className="email-text">nextgenn.ca@gmail.com</span>
              <button
                type="button"
                className="copy-btn"
                onClick={handleCopyEmail}
              >
                {copiedEmail ? <Check size={16} className="text-emerald" /> : <Copy size={16} />}
                <span>{copiedEmail ? 'Copied!' : 'Copy Email'}</span>
              </button>
              <a
                href="mailto:nextgenn.ca@gmail.com?subject=DMCA%20Takedown%20Notice%20-%20NextGenn"
                className="copy-btn copy-btn-primary"
              >
                <Mail size={16} />
                <span>Send Notice</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}