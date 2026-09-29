import React, { useState, useMemo } from 'react';
import { getGameCountForCategory, getDimmedCategoryColor } from '../utils/categoryIcons';
import {
  Gamepad2,
  Flame,
  Star,
  Sparkles,
  Info,
  HelpCircle,
  Rocket,
  Mail,
  Shield,
  Zap,
  Globe,
  Smile,
  Smartphone,
  ChevronUp,
  Swords,
  Car,
  Users,
  Puzzle,
  Dices,
  FileText,
  CheckCircle2,
  Ghost,
  Trophy,
  Target,
  Gem,
  Layers,
  Crown,
  Tv,
  Palette,
  Music,
  Joystick,
  Crosshair,
  Award,
  ExternalLink,
  Tag,
  Check,
  Send,
  Lock,
  Cpu,
  HeartHandshake,
  AlertCircle,
  Newspaper
} from 'lucide-react';
import { sounds } from '../utils/audio';
import NextGennLogo from './NextGennLogo';

// Map Category Names/Emojis/Icons directly to vector SVG components
const CATEGORY_ICON_MAP = {
  'action': Swords,
  'racing': Car,
  'car': Car,
  'multiplayer': Users,
  '2-player': Users,
  '2 player': Users,
  'puzzle': Puzzle,
  'arcade': Gamepad2,
  'shooting': Crosshair,
  'sports': Trophy,
  'casual': Sparkles,
  'adventure': Flame,
  'strategy': Target,
  'board': Dices,
  'card': Layers,
  'girls': Gem,
  'dress-up': Palette,
  'io': Globe,
  'horror': Ghost
};

const CATEGORY_COLORS = [
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#3b82f6',
  '#6366f1'
];

// Custom Social SVG Icons
const SocialIcons = {
  discord: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  ),
  youtube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  twitter: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
};

export default function Footer({ 
  categories = [], 
  games = [], 
  onNavigate, 
  onSelectCategory, 
  onRandomPlay, 
  onSearch,
  activePage = 'home',
  activeCategory = ''
}) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const scrollToTop = () => {
    sounds.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navPage = (page) => {
    sounds.playClick();
    if (onNavigate) onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navCategory = (catId) => {
    sounds.playClick();
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
  };

  const handleSurprise = () => {
    sounds.playPowerup();
    if (onRandomPlay) onRandomPlay();
  };

  const handleTagClick = (tagQuery) => {
    sounds.playClick();
    if (onSearch) {
      onSearch(tagQuery);
    } else if (onSelectCategory) {
      onSelectCategory(tagQuery);
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    sounds.playPowerup();
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setNewsletterEmail('');
    }, 4000);
  };

  // Auto-detect popular searches dynamically from most-played and trending games (NO default/hardcoding)
  const popularSearchTags = useMemo(() => {
    if (!Array.isArray(games) || games.length === 0) {
      return [];
    }

    // 1. Sort games by popularity: trending / featured first, then highest plays
    const sortedGames = [...games].sort((a, b) => {
      const aTrend = (a?.featured || a?.badge === 'HOT' || a?.badge === 'TRENDING' || a?.badge === 'POPULAR') ? 1 : 0;
      const bTrend = (b?.featured || b?.badge === 'HOT' || b?.badge === 'TRENDING' || b?.badge === 'POPULAR') ? 1 : 0;
      if (bTrend !== aTrend) return bTrend - aTrend;
      return (Number(b?.plays) || 0) - (Number(a?.plays) || 0);
    });

    const tagScores = new Map();

    sortedGames.forEach((game, gameIdx) => {
      if (!game) return;
      const weight = Math.max(1, 20 - gameIdx) + (Number(game.plays) > 50 ? 6 : 0) + (game.featured ? 6 : 0);

      // Collect raw tags
      let rawTags = [];
      if (Array.isArray(game.tags)) {
        rawTags = [...game.tags];
      } else if (typeof game.tags === 'string' && game.tags.trim()) {
        try {
          const parsed = JSON.parse(game.tags);
          if (Array.isArray(parsed)) rawTags = [...parsed];
          else rawTags = game.tags.split(',');
        } catch {
          rawTags = game.tags.split(',');
        }
      }

      // Add game's category as well
      if (game.category) {
        rawTags.push(game.category);
      }

      rawTags.forEach(raw => {
        if (!raw || typeof raw !== 'string') return;
        const clean = raw.replace(/^[^\w\s]+/, '').replace(/[^\w\s-]/g, '').trim();
        if (!clean || clean.length < 2) return;

        const key = clean.toLowerCase();
        // Ignore generic filler words
        if (['game', 'games', 'play', 'free', 'online', 'html5', 'webgl', 'new'].includes(key)) return;

        const label = clean
          .split(/[\s-]+/)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');

        const item = tagScores.get(key);
        if (item) {
          item.score += weight;
          item.count += 1;
        } else {
          tagScores.set(key, { label, query: key, score: weight, count: 1 });
        }
      });

      // Also include popular/trending game titles as top search tags
      if ((game.featured || Number(game.plays) > 0 || gameIdx < 8) && game.title) {
        const cleanTitle = game.title
          .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '')
          .replace(/[^\w\s&-]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        const titleKey = cleanTitle.toLowerCase();
        if (cleanTitle.length >= 3 && cleanTitle.length <= 26 && !tagScores.has(titleKey)) {
          tagScores.set(titleKey, {
            label: cleanTitle,
            query: cleanTitle,
            score: weight + 15,
            count: 1
          });
        }
      }
    });

    return Array.from(tagScores.values())
      .sort((a, b) => b.score - a.score || b.count - a.count)
      .slice(0, 10);
  }, [games]);

  // Filter and prepare display categories (exclude 'all', only show categories with active games, max 6)
  const displayCategories = useMemo(() => {
    if (!categories || categories.length === 0) {
      return [
        { id: 'action', name: 'Action Games' },
        { id: 'racing', name: 'Car & Racing' },
        { id: 'multiplayer', name: '2 Player & 1v1' },
        { id: 'puzzle', name: 'Puzzle & Logic' },
        { id: 'arcade', name: 'Arcade Classics' },
        { id: 'shooting', name: 'Shooting & FPS' }
      ];
    }

    return categories
      .filter(c => {
        const id = (c.id || c.name || '').toLowerCase();
        return id !== 'all' && id !== 'all games';
      })
      .slice(0, 6)
      .map((cat, idx) => {
        const catId = cat.id || cat.name.toLowerCase();
        const cleanName = (cat.name || cat.id || '').replace(/^[^\w\s]+/, '').trim();
        return {
          id: cat.id || catId,
          name: cleanName || cat.name || cat.id,
          color: getDimmedCategoryColor(cat.color || CATEGORY_COLORS[idx % CATEGORY_COLORS.length])
        };
      });
  }, [categories, games]);

  return (
    <footer className="pro-footer">

      {/* Main 4-Column Footer Body */}
      <div className="pro-footer-body">

        {/* Column 1: Brand & Community */}
        <div className="pro-footer-brand-col">
          <div className="pro-footer-logo-row" onClick={() => navPage('home')} style={{ cursor: 'pointer' }}>
            <NextGennLogo variant="full" size={38} />
          </div>

          <p className="pro-footer-tagline">
            NextGenn is a curated browser-based gaming platform offering 500+ free-to-play HTML5 and WebGL titles across action, racing, multiplayer, puzzle, and more — accessible instantly on any device, with no downloads required.
          </p>


          {/* Social Media Community Links */}
          <div className="pro-footer-social-section">
            {/* <span className="pro-footer-social-label">CONNECT WITH US:</span>
            <div className="pro-footer-social-links">
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="pro-social-btn discord"
                title="Join our Discord Community"
              >
                {SocialIcons.discord}
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="pro-social-btn youtube"
                title="Watch Trailers on YouTube"
              >
                {SocialIcons.youtube}
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="pro-social-btn twitter"
                title="Follow on X / Twitter"
              >
                {SocialIcons.twitter}
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="pro-social-btn instagram"
                title="Follow on Instagram"
              >
                {SocialIcons.instagram}
              </a>
            </div>*/}
          </div>
        </div>

        {/* Column 2: Top Categories (Connected Dynamically to Website Categories) */}
        <div className="pro-footer-nav-col">
          <h4 className="pro-footer-nav-title">Top Categories</h4>
          <ul className="pro-footer-nav-list">
            {displayCategories.map((cat, idx) => {
              const matchedKey = Object.keys(CATEGORY_ICON_MAP).find(k => cat.id.toLowerCase().includes(k) || cat.name.toLowerCase().includes(k));
              const CatIcon = matchedKey ? CATEGORY_ICON_MAP[matchedKey] : Gamepad2;
              const iconColor = cat.color || CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

              const isCatActive = (activeCategory || '').toLowerCase().trim() === (cat.id || '').toLowerCase().trim();

              return (
                <li key={cat.id || idx}>
                  <button className={`pro-footer-nav-link ${isCatActive ? 'active' : ''}`} onClick={() => navCategory(cat.id)}>
                    <span className="pro-footer-nav-icon-box" style={{ color: iconColor }}>
                      <CatIcon size={15} strokeWidth={2.2} />
                    </span>
                    <span>{cat.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Column 3: Discover */}
        <div className="pro-footer-nav-col">
          <h4 className="pro-footer-nav-title">Discover</h4>
          <ul className="pro-footer-nav-list">
            <li>
              <button 
                className={`pro-footer-nav-link ${activePage === 'trending' && !activeCategory ? 'active' : ''}`} 
                onClick={() => navPage('trending')}
              >
                <span className="pro-footer-nav-icon-box" style={{ color: '#ef4444' }}>
                  <Flame size={15} strokeWidth={2.2} />
                </span>
                <span>Trending Now</span>
              </button>
            </li>
            <li>
              <button 
                className={`pro-footer-nav-link ${(activePage === 'top-rated' || activePage === 'most-played') && !activeCategory ? 'active' : ''}`} 
                onClick={() => navPage('top-rated')}
              >
                <span className="pro-footer-nav-icon-box" style={{ color: '#f59e0b' }}>
                  <Star size={15} strokeWidth={2.2} />
                </span>
                <span>Top Rated Games</span>
              </button>
            </li>
            <li>
              <button 
                className={`pro-footer-nav-link ${activePage === 'new' && !activeCategory ? 'active' : ''}`} 
                onClick={() => navPage('new')}
              >
                <span className="pro-footer-nav-icon-box" style={{ color: '#10b981' }}>
                  <Sparkles size={15} strokeWidth={2.2} />
                </span>
                <span>New Additions</span>
              </button>
            </li>
            <li>
              <button className="pro-footer-nav-link" onClick={handleSurprise}>
                <span className="pro-footer-nav-icon-box" style={{ color: '#ec4899' }}>
                  <Dices size={15} strokeWidth={2.2} />
                </span>
                <span>Random Discovery</span>
              </button>
            </li>
            <li>
              <button 
                className={`pro-footer-nav-link ${(activePage === 'home' || !activePage) && !activeCategory ? 'active' : ''}`} 
                onClick={() => navPage('home')}
              >
                <span className="pro-footer-nav-icon-box" style={{ color: '#3b82f6' }}>
                  <Gamepad2 size={15} strokeWidth={2.2} />
                </span>
                <span>Browse All Games</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: Company & Legal (Opens in Same Tab) */}
        <div className="pro-footer-nav-col">
          <h4 className="pro-footer-nav-title">Company & Legal</h4>
          <ul className="pro-footer-nav-list">
            <li>
              <button
                type="button"
                className="pro-footer-nav-link"
                onClick={() => navPage('about')}
              >
                <span className="pro-footer-nav-icon-box" style={{ color: '#6366f1' }}>
                  <Info size={15} strokeWidth={2.2} />
                </span>
                <span>About Us</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="pro-footer-nav-link"
                onClick={() => navPage('developers')}
              >
                <span className="pro-footer-nav-icon-box" style={{ color: '#ec4899' }}>
                  <Rocket size={15} strokeWidth={2.2} />
                </span>
                <span>Developer Submissions</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="pro-footer-nav-link"
                onClick={() => navPage('privacy')}
              >
                <span className="pro-footer-nav-icon-box" style={{ color: '#84cc16' }}>
                  <Shield size={15} strokeWidth={2.2} />
                </span>
                <span>Privacy Policy</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="pro-footer-nav-link"
                onClick={() => navPage('terms')}
              >
                <span className="pro-footer-nav-icon-box" style={{ color: '#14b8a6' }}>
                  <FileText size={15} strokeWidth={2.2} />
                </span>
                <span>Terms of Service</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="pro-footer-nav-link"
                onClick={() => navPage('disclaimer')}
              >
                <span className="pro-footer-nav-icon-box" style={{ color: '#f59e0b' }}>
                  <AlertCircle size={15} strokeWidth={2.2} />
                </span>
                <span>Disclaimer</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="pro-footer-nav-link"
                onClick={() => navPage('contact')}
              >
                <span className="pro-footer-nav-icon-box" style={{ color: '#06b6d4' }}>
                  <Mail size={15} strokeWidth={2.2} />
                </span>
                <span>Contact &amp; Support</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="pro-footer-nav-link"
                onClick={() => navPage('blog')}
              >
                <span className="pro-footer-nav-icon-box" style={{ color: '#8b5cf6' }}>
                  <Newspaper size={15} strokeWidth={2.2} />
                </span>
                <span>Blog &amp; Guides</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`pro-footer-nav-link ${activePage === 'faq' && !activeCategory ? 'active' : ''}`}
                onClick={() => navPage('faq')}
              >
                <span className="pro-footer-nav-icon-box" style={{ color: '#0ea5e9' }}>
                  <HelpCircle size={15} strokeWidth={2.2} />
                </span>
                <span>FAQ &amp; Help</span>
              </button>
            </li>
          </ul>
        </div>

      </div>

      {/* Trust & Safety Certifications Strip */}
      <div className="pro-footer-trust-strip">
        <div className="pro-footer-trust-inner">
          <div className="trust-card trust-ssl">
            <div className="trust-icon-box trust-icon-ssl">
              <Lock size={15} strokeWidth={2.4} />
            </div>
            <div className="trust-text-group">
              <span className="trust-title">256-Bit SSL Encryption</span>
              <span className="trust-subtitle">Secure & Encrypted Connection</span>
            </div>
          </div>

          <div className="trust-card trust-coppa">
            <div className="trust-icon-box trust-icon-coppa">
              <Shield size={15} strokeWidth={2.4} />
            </div>
            <div className="trust-text-group">
              <span className="trust-title">Family & Child Safe</span>
              <span className="trust-subtitle">COPPA Compliant Content</span>
            </div>
          </div>

          <div className="trust-card trust-webgl">
            <div className="trust-icon-box trust-icon-webgl">
              <Cpu size={15} strokeWidth={2.4} />
            </div>
            <div className="trust-text-group">
              <span className="trust-title">WebGL & WebAssembly</span>
              <span className="trust-subtitle">High-Performance Rendering</span>
            </div>
          </div>

          <div className="trust-card trust-creators">
            <div className="trust-icon-box trust-icon-creators">
              <HeartHandshake size={15} strokeWidth={2.4} />
            </div>
            <div className="trust-text-group">
              <span className="trust-title">Independent Developers</span>
              <span className="trust-subtitle">Supported & Showcased</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar with Live Status and Back to Top */}
      <div className="pro-footer-bottom">
        <div className="pro-footer-bottom-inner">
          <div className="pro-footer-bottom-left">
            <p className="pro-footer-copy">
              &copy; {new Date().getFullYear()} <strong>NextGenn</strong>. All rights reserved.
            </p>
          </div>
          <div className="pro-footer-bottom-right">
            <button className="pro-footer-top-btn" onClick={scrollToTop} title="Scroll to Top">
              <span>Back to Top</span>
              <span className="top-btn-arrow">
                <ChevronUp size={15} strokeWidth={3} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
