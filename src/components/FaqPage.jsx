import React, { useState, useEffect, useMemo } from 'react';
import {
  HelpCircle,
  Search,
  X,
  ChevronDown,
  ChevronUp,
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
  ExternalLink,
  RefreshCw,
  FolderOpen,
  Award
} from 'lucide-react';
import { sounds } from '../utils/audio';

const FAQ_CATEGORIES = [
  { id: 'all', label: 'All Questions', icon: Layers },
  { id: 'general', label: 'General & Play', icon: Gamepad2 },
  { id: 'controls', label: 'Controls & Gamepad', icon: Zap },
  { id: 'troubleshooting', label: 'Performance & Lag', icon: Cpu },
  { id: 'account', label: 'XP, Progress & Safety', icon: ShieldCheck },
  { id: 'developers', label: 'Developers & Submissions', icon: Rocket }
];

const FAQ_ITEMS = [
  // 1. General & Platform
  {
    id: 'free-to-play',
    category: 'general',
    question: 'Is NextGenn completely free to play?',
    answer: 'Yes, 100% free! There are no hidden fees, mandatory subscriptions, or locked paywalls. You can browse our entire library of games and start playing immediately without ever entering payment information.',
    highlights: ['Zero paywalls', '100% free catalog', 'No subscription required']
  },
  {
    id: 'no-download-needed',
    category: 'general',
    question: 'Do I need to download or install any software or plugins?',
    answer: 'No installation or downloads are required. Every game runs natively in your browser using modern WebGL, WebAssembly (Wasm), and HTML5 canvas engines. Simply click any game thumbnail and play within seconds.',
    highlights: ['Zero downloads', 'Runs in any modern browser', 'Instant startup']
  },
  {
    id: 'supported-devices',
    category: 'general',
    question: 'Which devices and browsers are supported?',
    answer: 'NextGenn is designed to run everywhere. Supported devices include Desktop PCs (Windows, macOS, Linux), Laptops, Chromebooks, iPhones, iPads, Android phones, and tablets. Compatible browsers include Google Chrome, Microsoft Edge, Safari, Mozilla Firefox, and Opera.',
    highlights: ['Cross-platform', 'Full mobile & desktop responsiveness', 'Chromebook friendly']
  },
  {
    id: 'safety-and-security',
    category: 'general',
    question: 'Is NextGenn safe for school, work, and younger players?',
    answer: 'Yes. All titles on NextGenn are sandboxed inside isolated browser iframes, meaning they cannot access your personal files, camera, or install unwanted software. We continuously review game content to ensure safe, malware-free entertainment.',
    highlights: ['Isolated sandbox runtime', 'No malware risks', 'Family & school friendly']
  },

  // 2. Controls & Gamepad
  {
    id: 'gamepad-support',
    category: 'controls',
    question: 'Can I play games using an external gamepad or controller?',
    answer: 'Yes! NextGenn supports the standard HTML5 Gamepad API. You can connect Xbox Wireless Controllers, PlayStation DualShock/DualSense controllers, Nintendo Switch Pro controllers, or USB gamepads. Plug in or pair your controller via Bluetooth and press any button to begin.',
    highlights: ['Xbox & PlayStation controller support', 'Automatic detection', 'USB & Bluetooth']
  },
  {
    id: 'mobile-touch-controls',
    category: 'controls',
    question: 'How do touch controls work on mobile devices and tablets?',
    answer: 'Games with mobile support feature built-in virtual on-screen joypads, intuitive swipe gestures, and responsive tap buttons. When you rotate your phone to landscape mode, touch controls automatically calibrate to your screen aspect ratio.',
    highlights: ['Virtual touch D-pad & buttons', 'Auto-scaling for all screens', 'Landscape & portrait support']
  },
  {
    id: 'custom-keybindings',
    category: 'controls',
    question: 'Can I change or customize keyboard keybindings?',
    answer: 'Most action, shooting, and racing games feature their own in-game settings menu (gear icon) where you can remap keys. Standard controls across the platform include W-A-S-D or Arrow Keys for movement, Spacebar for jump/action, and Left Mouse Button to interact.',
    highlights: ['Standard WASD / Arrow keys', 'In-game settings remapping', 'Mouse & keyboard precision']
  },

  // 3. Performance & Troubleshooting
  {
    id: 'lag-fps-drops',
    category: 'troubleshooting',
    question: 'Why is a game lagging or dropping frames, and how can I fix it?',
    answer: 'Sluggish performance is usually caused by browser hardware acceleration or background applications. To fix it: 1) Enable "Hardware Acceleration" in your browser settings; 2) Close heavy browser tabs like video streams; 3) Update your graphics card drivers; 4) Ensure your device is not in battery saver mode.',
    highlights: ['Enable hardware acceleration', 'Close background tabs', 'Switch off battery saver']
  },
  {
    id: 'black-screen-loading-issue',
    category: 'troubleshooting',
    question: 'What should I do if a game gets stuck on a black screen or loading loop?',
    answer: 'If a game stalls while loading assets: 1) Perform a hard refresh using Ctrl + F5 (Windows) or Cmd + Shift + R (Mac); 2) If you use an aggressive ad-blocker or script blocker, try temporarily whitelisting NextGenn as some ad blockers block legitimate WebGL game script frames; 3) Clear your browser cache for the site.',
    highlights: ['Hard refresh (Ctrl + F5)', 'Whitelist from strict script blockers', 'Clear cached game files']
  },
  {
    id: 'offline-mode',
    category: 'troubleshooting',
    question: 'Can I play NextGenn games without an internet connection?',
    answer: 'NextGenn provides Progressive Web App (PWA) caching for UI menus and static assets. However, because games stream rich WebGL assets, audio, and physics libraries, an active internet connection is recommended for optimal gameplay and cloud save synchronization.',
    highlights: ['Fast PWA caching', 'Best experienced online', 'Instant reconnect']
  },

  // 4. XP, Progress & Safety
  {
    id: 'xp-leveling-system',
    category: 'account',
    question: 'How does the XP, leveling, and quest system work?',
    answer: 'Every game session you launch awards you +25 XP. Discovering new games, favoriting titles, and playing consistently earns you bonus XP towards higher gamer levels (Rookie, Adept, Veteran, Master). Your level and badge titles appear in your gamer card!',
    highlights: ['+25 XP per game play', 'Gamer ranks and levels', 'Achievement badges']
  },
  {
    id: 'save-progress-cloud',
    category: 'account',
    question: 'How is my game progress, high scores, and favorites saved?',
    answer: 'NextGenn automatically saves your favorites, recently played games, high scores, and XP progress directly in your browser local storage. When you sign in to your NextGenn account, your progress is seamlessly synchronized to our secure cloud database.',
    highlights: ['Instant local auto-save', 'Cross-device cloud synchronization', 'Favorites & recent history']
  },
  {
    id: 'account-privacy',
    category: 'account',
    question: 'What personal data do you collect, and can I delete my account?',
    answer: 'We believe in strict data privacy. We only collect basic profile details (username, email) necessary to authenticate you and sync your game saves. We never sell your data to third parties. You can request complete deletion of your account and saves at any time.',
    highlights: ['Zero data selling', 'Strict GDPR compliance', 'One-click account deletion']
  },

  // 5. Developers & Submissions
  {
    id: 'developer-submissions',
    category: 'developers',
    question: 'How can game developers submit and publish their games on NextGenn?',
    answer: 'We actively partner with indie developers and game studios! You can submit your HTML5 or WebGL game link via our Developer Portal. Our curation team will review the game for stability and content guidelines within 48 to 72 hours.',
    highlights: ['Free submission', 'Direct audience reach', 'Fast 48-72h editorial review']
  },
  {
    id: 'supported-game-engines',
    category: 'developers',
    question: 'What game engines and export formats are accepted?',
    answer: 'We accept games built in Unity (WebGL HTML5 export), Godot (HTML5), Construct 3, Phaser, PlayCanvas, Defold, GameMaker, or custom vanilla JavaScript and HTML5 canvas engines. Games must be hosted on an HTTPS-compliant server.',
    highlights: ['Unity & Godot WebGL', 'Construct 3 & Phaser', 'HTTPS requirements']
  }
];

export default function FaqPage({ onBackToHome, onNavigate }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState({ 'free-to-play': true });
  const [helpfulFeedback, setHelpfulFeedback] = useState({});

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
    <div className="custom-static-page-container faq-pro-page">
      {/* Top Breadcrumb & Back Action */}
      <div className="faq-top-bar">
        <button className="faq-back-btn" onClick={() => handleNav('home')}>
          <ArrowLeft size={16} />
          <span>Back to Games</span>
        </button>
        <div className="faq-breadcrumb">
          <span onClick={() => handleNav('home')} className="crumb-link">Home</span>
          <span className="crumb-sep">/</span>
          <span className="crumb-current">Frequently Asked Questions</span>
        </div>
      </div>

      {/* Hero Showcase Header */}
      <section className="about-hero-box faq-hero-card">
        <div className="about-hero-glow"></div>
        <div className="about-hero-inner">
          <div className="about-status-chip">
            <span className="live-dot"></span>
            <span>NEXTGENN SUPPORT &amp; HELP CENTER</span>
          </div>

          <h1 className="about-hero-headline">
            Frequently Asked Questions
          </h1>

          <p className="about-hero-subtitle">
            Find fast answers to common questions about controls, controllers, performance, account saves, and game submissions.
          </p>

          {/* Interactive Search Bar */}
          <div className="faq-search-wrapper">
            <Search size={20} className="faq-search-icon" />
            <input
              type="text"
              className="faq-search-input"
              placeholder="Search for answers (e.g. controller, lag, free, save, mobile, submit)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="faq-search-clear-btn"
                onClick={() => {
                  sounds.playClick();
                  setSearchQuery('');
                }}
                aria-label="Clear search query"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Quick Keyword Pills */}
          <div className="faq-quick-tags">
            <span className="quick-tags-label">Quick topics:</span>
            {['Controller', 'Lag', 'Mobile', 'Save Progress', 'Free', 'Developer'].map((tag) => (
              <button
                key={tag}
                className="faq-quick-tag-chip"
                onClick={() => {
                  sounds.playClick();
                  setSearchQuery(tag.toLowerCase());
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Category Tabs & Controls Row */}
      <div className="faq-filter-controls-row">
        <div className="faq-category-pills custom-scrollbar">
          {FAQ_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count = cat.id === 'all'
              ? FAQ_ITEMS.length
              : FAQ_ITEMS.filter((f) => f.category === cat.id).length;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                className={`faq-cat-pill ${isActive ? 'active' : ''}`}
                onClick={() => {
                  sounds.playClick();
                  setActiveCategory(cat.id);
                }}
              >
                <Icon size={16} />
                <span>{cat.label}</span>
                <span className="faq-cat-pill-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Expand / Collapse All */}
        <div className="faq-view-actions">
          <button
            className="faq-action-text-btn"
            onClick={() => handleToggleAll(true)}
            title="Expand all questions"
          >
            <ChevronDown size={14} />
            <span>Expand All</span>
          </button>
          <span className="faq-action-divider">|</span>
          <button
            className="faq-action-text-btn"
            onClick={() => handleToggleAll(false)}
            title="Collapse all questions"
          >
            <ChevronUp size={14} />
            <span>Collapse All</span>
          </button>
        </div>
      </div>

      {/* Main FAQ Accordion List */}
      <section className="faq-accordion-section">
        {filteredFaqs.length === 0 ? (
          <div className="faq-empty-state">
            <div className="faq-empty-icon-wrap">
              <HelpCircle size={36} />
            </div>
            <h3>No matching questions found</h3>
            <p>We couldn't find any questions matching "{searchQuery}". Try using different keywords or browse all categories.</p>
            <button
              className="about-primary-btn"
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
          <div className="faq-cards-grid">
            {filteredFaqs.map((item, idx) => {
              const isOpen = Boolean(openItems[item.id]);
              const feedback = helpfulFeedback[item.id];
              const matchedCat = FAQ_CATEGORIES.find((c) => c.id === item.category);

              return (
                <article
                  key={item.id}
                  className={`faq-pro-card ${isOpen ? 'open' : ''}`}
                >
                  {/* Card Header / Trigger */}
                  <button
                    type="button"
                    className="faq-pro-card-header"
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={isOpen}
                  >
                    <div className="faq-pro-card-header-left">
                      <span className="faq-item-num">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="faq-item-title-wrap">
                        {matchedCat && (
                          <span className={`faq-category-badge badge-${item.category}`}>
                            {matchedCat.label}
                          </span>
                        )}
                        <h2 className="faq-item-question">{item.question}</h2>
                      </div>
                    </div>

                    <div className={`faq-expand-circle ${isOpen ? 'rotated' : ''}`}>
                      <ChevronDown size={18} />
                    </div>
                  </button>

                  {/* Card Expanded Content */}
                  {isOpen && (
                    <div className="faq-pro-card-body">
                      <p className="faq-item-answer">{item.answer}</p>

                      {/* Key Highlight Badges */}
                      {item.highlights && item.highlights.length > 0 && (
                        <div className="faq-highlights-row">
                          {item.highlights.map((hl, hIdx) => (
                            <div key={hIdx} className="faq-highlight-chip">
                              <CheckCircle2 size={13} className="text-emerald" />
                              <span>{hl}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Helpful Feedback Bar */}
                      <div className="faq-feedback-bar">
                        <span className="feedback-prompt">Was this helpful?</span>
                        {feedback ? (
                          <span className="feedback-thank-you">
                            <CheckCircle2 size={14} className="text-emerald" />
                            <span>Thank you for your feedback!</span>
                          </span>
                        ) : (
                          <div className="feedback-btn-group">
                            <button
                              type="button"
                              className="feedback-btn"
                              onClick={() => handleFeedback(item.id, true)}
                              title="Yes, this helped me"
                            >
                              <ThumbsUp size={13} />
                              <span>Yes</span>
                            </button>
                            <button
                              type="button"
                              className="feedback-btn"
                              onClick={() => handleFeedback(item.id, false)}
                              title="No, I need more help"
                            >
                              <ThumbsDown size={13} />
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
      <section className="faq-help-cta-box">
        <div className="faq-cta-left">
          <div className="faq-cta-icon-box">
            <LifeBuoy size={28} />
          </div>
          <div>
            <h3>Still have questions or facing an issue?</h3>
            <p>Our support team and developer community are ready to assist you anytime.</p>
          </div>
        </div>

        <div className="faq-cta-actions">
          <button
            className="about-primary-btn"
            onClick={() => handleNav('contact')}
          >
            <MessageSquare size={16} />
            <span>Contact Support</span>
          </button>
          <button
            className="about-secondary-btn"
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
