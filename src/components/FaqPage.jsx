import React, { useState, useEffect, useMemo } from 'react';
import {
  HelpCircle,
  Search,
  X,
  ChevronDown,
  Gamepad2,
  Zap,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Rocket,
  Cpu,
  Layers,
  ArrowLeft,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  LifeBuoy,
  RefreshCw,
  Award
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { updatePageSeo } from '../utils/seo';
import './FaqPage.css';

const FAQ_CATEGORIES = [
  { id: 'all', label: 'All Questions', icon: Layers },
  { id: 'general', label: 'General & Play', icon: Gamepad2 },
  { id: 'controls', label: 'Controls & Gamepad', icon: Zap },
  { id: 'troubleshooting', label: 'Performance & Lag', icon: Cpu },
  { id: 'account', label: 'XP & Save Progress', icon: ShieldCheck },
  { id: 'developers', label: 'Indie Developers', icon: Rocket }
];

const FAQ_ITEMS = [
  // 1. General & Platform
  {
    id: 'free-to-play',
    category: 'general',
    question: 'Is NextGenn completely free to play?',
    answer: 'Yes, 100% free! There are zero hidden fees, subscriptions, or locked paywalls. You can explore our catalog of 5,000+ games and play immediately without ever entering any credit card or payment information.',
    highlights: ['Zero paywalls', '100% free games catalog', 'No subscription or credit card needed']
  },
  {
    id: 'no-download-needed',
    category: 'general',
    question: 'Do I need to download or install any software or extensions?',
    answer: 'No downloads, installation, or extensions are needed. Every game runs directly inside your web browser using modern WebGL, WebAssembly (Wasm), and HTML5 canvas engines. Click any game card and start playing in less than 2 seconds.',
    highlights: ['Zero downloads or setup', 'Runs natively in modern browsers', 'Instant 2-second startup']
  },
  {
    id: 'supported-devices',
    category: 'general',
    question: 'Which devices and browsers are supported?',
    answer: 'NextGenn is engineered for seamless cross-platform performance. Supported devices include Desktop PCs (Windows, macOS, Linux), Laptops, Chromebooks, iPhones, iPads, and Android smartphones. We recommend Google Chrome, Microsoft Edge, Safari, Mozilla Firefox, or Opera.',
    highlights: ['Cross-platform synchronization', 'Full mobile & desktop responsiveness', 'Optimized for Chromebooks']
  },
  {
    id: 'safety-and-security',
    category: 'general',
    question: 'Is NextGenn safe for school, work, and younger gamers?',
    answer: 'Yes! All titles on NextGenn run inside sandboxed, isolated browser iframes, meaning they cannot access your files, hardware sensors, or install malicious scripts. We curate every submission to ensure family-friendly, malware-free entertainment.',
    highlights: ['Strict sandbox isolation', 'No malware or file risks', 'Safe for school & home']
  },

  // 2. Controls & Gamepad
  {
    id: 'gamepad-support',
    category: 'controls',
    question: 'Can I play games using an external controller or gamepad?',
    answer: 'Yes! NextGenn supports standard HTML5 Gamepad APIs. You can connect Xbox Wireless Controllers, PlayStation DualShock/DualSense controllers, Nintendo Switch Pro controllers, or USB joypads. Connect via Bluetooth or USB cable, press any button on the gamepad, and it is automatically mapped.',
    highlights: ['Xbox & PlayStation controller ready', 'Instant Bluetooth & USB detection', 'Zero extra drivers needed']
  },
  {
    id: 'mobile-touch-controls',
    category: 'controls',
    question: 'How do touch controls work on mobile devices and tablets?',
    answer: 'Games with mobile support feature built-in virtual on-screen joypads, intuitive swipe gestures, and responsive tap buttons. When you rotate your phone to landscape mode, touch controls automatically calibrate to your screen aspect ratio.',
    highlights: ['Virtual touch D-pad & action buttons', 'Auto-scaling for all mobile screens', 'Landscape & portrait support']
  },
  {
    id: 'custom-keybindings',
    category: 'controls',
    question: 'Can I customize or rebind keyboard controls?',
    answer: 'Most action, shooting, and racing titles feature an in-game settings menu (gear icon) where you can remap keyboard bindings. The standard universal layout across the platform is W-A-S-D or Arrow Keys for steering/movement, Spacebar for jump/action, and Left Mouse Click to aim or attack.',
    highlights: ['Standard WASD / Arrow keys movement', 'In-game remapping menus', 'High-precision mouse aiming']
  },

  // 3. Performance & Troubleshooting
  {
    id: 'lag-fps-drops',
    category: 'troubleshooting',
    question: 'Why is a game lagging or dropping frames, and how can I fix it?',
    answer: 'Performance hiccups are typically caused by browser graphics acceleration settings or heavy background tabs. To ensure 60+ FPS: 1) Turn on "Use Hardware Acceleration" in your browser settings; 2) Close demanding background video streams or downloads; 3) Disable battery saver mode on laptops and mobile devices.',
    highlights: ['Enable hardware acceleration', 'Close resource-heavy tabs', 'Turn off battery saver mode']
  },
  {
    id: 'black-screen-loading-issue',
    category: 'troubleshooting',
    question: 'What should I do if a game gets stuck on a black screen or loading loop?',
    answer: 'If game assets stall during loading: 1) Perform a hard cache refresh using Ctrl + F5 (Windows) or Cmd + Shift + R (Mac); 2) If you are using a strict third-party ad-blocker or script filter, temporarily whitelist NextGenn as some filters inadvertently block legitimate WebGL game script frames; 3) Clear browser cached files.',
    highlights: ['Hard refresh (Ctrl + F5)', 'Whitelist from strict script blockers', 'Clear browser temporary cache']
  },
  {
    id: 'offline-mode',
    category: 'troubleshooting',
    question: 'Can I play NextGenn games without an active internet connection?',
    answer: 'NextGenn provides Progressive Web App (PWA) caching for UI menus, icons, and platform assets. However, because high-fidelity games stream WebGL assets, audio libraries, and physics data, an active internet connection is recommended for optimal gameplay and live XP synchronization.',
    highlights: ['Ultra-fast PWA caching', 'Best experienced with live connection', 'Instant reconnect on drop']
  },

  // 4. XP, Progress & Safety
  {
    id: 'xp-leveling-system',
    category: 'account',
    question: 'How does the XP, leveling, and quest system work?',
    answer: 'Every game session you launch awards you +25 XP. Discovering new titles, favoriting games, and playing consistently earns you bonus XP towards higher gamer ranks (Rookie, Adept, Veteran, Master). Your rank, level, and unlocked achievement badges are proudly shown on your profile card!',
    highlights: ['+25 XP per game play session', 'Unlockable gamer ranks & titles', 'Achievement milestone badges']
  },
  {
    id: 'save-progress-cloud',
    category: 'account',
    question: 'How is my game progress, high scores, and favorites saved?',
    answer: 'NextGenn automatically saves your favorites, recently played history, high scores, and XP progress directly in your browser local storage. When you sign in to your NextGenn account, your achievements are seamlessly synchronized to our secure cloud database across all your devices.',
    highlights: ['Instant local auto-save', 'Cross-device cloud synchronization', 'Favorites & recent history backup']
  },
  {
    id: 'account-privacy',
    category: 'account',
    question: 'What personal data do you collect, and can I delete my account?',
    answer: 'We believe in strict, honest data privacy. We only collect basic profile details (username, email) necessary to authenticate you and sync your game saves. We never sell your personal information to third parties. You can request complete deletion of your account and data at any time.',
    highlights: ['Zero personal data selling', 'Strict GDPR & CCPA compliance', 'One-click account deletion available']
  },

  // 5. Developers & Submissions
  {
    id: 'developer-submissions',
    category: 'developers',
    question: 'How can indie game developers publish their games on NextGenn?',
    answer: 'We actively welcome indie developers and gaming studios! You can submit your HTML5 or WebGL game link for free via our Developer Portal. Our curation team will review the game for stability and content guidelines within 48 to 72 hours, connecting you with thousands of active players.',
    highlights: ['100% free submission', 'Reach thousands of daily players', 'Fast 48-72h editorial review turnaround']
  },
  {
    id: 'supported-game-engines',
    category: 'developers',
    question: 'What game engines and export formats are accepted?',
    answer: 'We accept games built with Unity (WebGL HTML5 export), Godot (HTML5), Construct 3, Phaser, PlayCanvas, Defold, GameMaker, or custom vanilla JavaScript and HTML5 canvas engines. Games must be hosted on an HTTPS-compliant server.',
    highlights: ['Unity & Godot WebGL', 'Construct 3, Phaser & Canvas', 'HTTPS secure hosting required']
  }
];

export default function FaqPage({ onBackToHome, onNavigate }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState({ 'free-to-play': true, 'lag-fps-drops': false });
  const [helpfulFeedback, setHelpfulFeedback] = useState({});

  // Dynamic SEO with FAQPage Schema.org structured data
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nextgenn.com';
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.slice(0, 10).map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
    };

    updatePageSeo({
      title: 'Frequently Asked Questions & Help Center - NextGenn',
      description: 'Find answers about NextGenn free browser games, controller setup, lag troubleshooting, cloud save progress, and indie developer submissions.',
      canonicalUrl: `${origin}/faq`,
      type: 'website',
      jsonLd: faqSchema
    });
  }, []);

  const handleNav = (page) => {
    sounds.playClick();
    if (onNavigate) {
      onNavigate(page);
    } else if (onBackToHome) {
      onBackToHome();
    }
  };

  // Filter items based on Category and Search Query
  const filteredFaqs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      if (!matchesCategory) return false;

      if (!q) return true;

      const questionMatch = item.question.toLowerCase().includes(q);
      const answerMatch = item.answer.toLowerCase().includes(q);
      const highlightsMatch = item.highlights?.some((h) => h.toLowerCase().includes(q));

      return questionMatch || answerMatch || highlightsMatch;
    });
  }, [activeCategory, searchQuery]);

  // Toggle single FAQ item
  const toggleItem = (id) => {
    sounds.playClick();
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Expand all / collapse all
  const handleToggleAll = (expand) => {
    sounds.playClick();
    if (expand) {
      const allOpen = {};
      filteredFaqs.forEach((f) => {
        allOpen[f.id] = true;
      });
      setOpenItems(allOpen);
    } else {
      setOpenItems({});
    }
  };

  // Feedback on FAQ answer
  const handleFeedback = (id, isHelpful) => {
    sounds.playClick();
    setHelpfulFeedback((prev) => ({
      ...prev,
      [id]: isHelpful ? 'helpful' : 'not-helpful'
    }));
  };

  return (
    <div className="faq-pro-container">
      {/* Top Breadcrumb & Back Action */}
      <div className="faq-top-bar">
        <button className="faq-back-btn" onClick={() => handleNav('home')}>
          <ArrowLeft size={16} />
          <span>Back to Games</span>
        </button>
        <div className="faq-breadcrumb">
          <span onClick={() => handleNav('home')} className="faq-crumb-link">Home</span>
          <span className="faq-crumb-sep">/</span>
          <span className="faq-crumb-current">Frequently Asked Questions</span>
        </div>
      </div>

      {/* Hero Showcase Header */}
      <section className="faq-hero-section">
        <div className="faq-hero-orb-1" />
        <div className="faq-hero-orb-2" />
        <div className="faq-hero-inner">
          <div className="faq-status-badge">
            <span className="faq-status-dot" />
            <span>NextGenn Support &amp; Knowledge Base</span>
          </div>

          <h1 className="faq-hero-title">
            Frequently Asked <span className="faq-hero-title-highlight">Questions</span>
          </h1>

          <p className="faq-hero-subtitle">
            Find immediate answers regarding gameplay, gamepads, performance optimization, cloud saves, and developer publishing.
          </p>

          {/* Interactive Search Bar */}
          <div className="faq-search-box">
            <Search size={18} className="faq-search-icon" />
            <input
              type="text"
              className="faq-search-input"
              placeholder="Search answers (e.g. controller, lag, free, cloud save, mobile, submit)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="faq-search-clear"
                onClick={() => {
                  sounds.playClick();
                  setSearchQuery('');
                }}
                aria-label="Clear search query"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Keyword Topics */}
          <div className="faq-quick-topics">
            <span className="faq-quick-label">Popular topics:</span>
            {['Controller', 'Lag & FPS', 'Mobile Touch', 'Cloud Save', 'Free Play', 'Developers'].map((tag) => (
              <button
                key={tag}
                className="faq-topic-chip"
                onClick={() => {
                  sounds.playClick();
                  setSearchQuery(tag.split(' ')[0].toLowerCase());
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Category Tabs & Controls Row */}
      <div className="faq-controls-bar">
        <div className="faq-category-nav">
          {FAQ_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count = cat.id === 'all'
              ? FAQ_ITEMS.length
              : FAQ_ITEMS.filter((f) => f.category === cat.id).length;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                className={`faq-nav-pill ${isActive ? 'active' : ''}`}
                onClick={() => {
                  sounds.playClick();
                  setActiveCategory(cat.id);
                }}
              >
                <Icon size={15} />
                <span>{cat.label}</span>
                <span className="faq-pill-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Expand / Collapse Actions */}
        <div className="faq-toggle-actions">
          <button
            className="faq-text-action-btn"
            onClick={() => handleToggleAll(true)}
            title="Expand all questions"
          >
            <ChevronDown size={14} />
            <span>Expand All</span>
          </button>
          <span className="faq-action-sep">|</span>
          <button
            className="faq-text-action-btn"
            onClick={() => handleToggleAll(false)}
            title="Collapse all questions"
          >
            <span>Collapse All</span>
          </button>
        </div>
      </div>

      {/* Main FAQ Accordion List */}
      <section>
        {filteredFaqs.length === 0 ? (
          <div className="faq-empty-box">
            <div className="faq-empty-icon">
              <HelpCircle size={32} />
            </div>
            <h3 className="faq-empty-title">No matching questions found</h3>
            <p className="faq-empty-desc">
              We couldn't find any questions matching "{searchQuery}". Try using different keywords or browse our categories.
            </p>
            <button
              className="faq-reset-btn"
              onClick={() => {
                sounds.playClick();
                setSearchQuery('');
                setActiveCategory('all');
              }}
            >
              <RefreshCw size={15} />
              <span>Reset Search Filters</span>
            </button>
          </div>
        ) : (
          <div className="faq-cards-list">
            {filteredFaqs.map((item, idx) => {
              const isOpen = Boolean(openItems[item.id]);
              const feedback = helpfulFeedback[item.id];
              const matchedCat = FAQ_CATEGORIES.find((c) => c.id === item.category);

              return (
                <article
                  key={item.id}
                  className={`faq-card ${isOpen ? 'open' : ''}`}
                >
                  {/* Card Header / Trigger */}
                  <button
                    type="button"
                    className="faq-card-header"
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={isOpen}
                  >
                    <div className="faq-card-header-left">
                      <span className="faq-index-number">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="faq-question-wrap">
                        {matchedCat && (
                          <span className="faq-cat-tag">
                            {matchedCat.label}
                          </span>
                        )}
                        <h2 className="faq-question-text">{item.question}</h2>
                      </div>
                    </div>

                    <div className={`faq-chevron-wrap ${isOpen ? 'rotated' : ''}`}>
                      <ChevronDown size={17} />
                    </div>
                  </button>

                  {/* Card Expanded Content */}
                  {isOpen && (
                    <div className="faq-card-body">
                      <p className="faq-answer-text">{item.answer}</p>

                      {/* Key Highlight Badges */}
                      {item.highlights && item.highlights.length > 0 && (
                        <div className="faq-highlights-list">
                          {item.highlights.map((hl, hIdx) => (
                            <div key={hIdx} className="faq-highlight-pill">
                              <CheckCircle2 size={13} />
                              <span>{hl}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Helpful Feedback Bar */}
                      <div className="faq-feedback-widget">
                        <span className="faq-feedback-prompt">Was this answer helpful?</span>
                        {feedback ? (
                          <span className="faq-vote-thanks">
                            <CheckCircle2 size={14} />
                            <span>Thank you for your feedback!</span>
                          </span>
                        ) : (
                          <div className="faq-feedback-buttons">
                            <button
                              type="button"
                              className="faq-vote-btn"
                              onClick={() => handleFeedback(item.id, true)}
                              title="Yes, this helped me"
                            >
                              <ThumbsUp size={12} />
                              <span>Yes</span>
                            </button>
                            <button
                              type="button"
                              className="faq-vote-btn"
                              onClick={() => handleFeedback(item.id, false)}
                              title="No, I need more help"
                            >
                              <ThumbsDown size={12} />
                              <span>No</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Still Need Assistance CTA Banner */}
      <section className="faq-support-cta">
        <div className="faq-cta-content">
          <div className="faq-cta-icon-wrap">
            <LifeBuoy size={26} />
          </div>
          <div>
            <h3 className="faq-cta-heading">Still have questions or facing an issue?</h3>
            <p className="faq-cta-desc">
              Our support team and developer community are ready to assist you anytime.
            </p>
          </div>
        </div>

        <div className="faq-cta-buttons">
          <button
            className="faq-cta-primary-btn"
            onClick={() => handleNav('contact')}
          >
            <MessageSquare size={16} />
            <span>Contact Support</span>
          </button>
          <button
            className="faq-cta-secondary-btn"
            onClick={() => handleNav('developers')}
          >
            <Rocket size={16} />
            <span>Developer Portal</span>
          </button>
        </div>
      </section>
    </div>
  );
}
