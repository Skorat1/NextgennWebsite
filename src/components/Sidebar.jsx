import React, { useMemo } from 'react';
import { renderCategorySvgIcon, getGameCountForCategory, getDimmedCategoryColor } from '../utils/categoryIcons';
import {
  Home,
  Clock,
  Flame,
  Zap,
  Sparkles,
  Dices,
  Heart,
  Users,
  Car,
  Swords,
  Crosshair,
  Puzzle,
  Trophy,
  Gamepad2,
  Code2,
  ChevronRight,
  Info,
  Shield,
  FileText,
  Mail,
  Rocket,
  User,
  LogIn,
  Compass,
  Crown,
  Activity,
  Target,
  Layers,
  Ghost,
  Palette,
  Music,
  Radio,
  Joystick,
  Cpu,
  Tv,
  HelpCircle,
  Gem,
  Award,
  AlertTriangle
} from 'lucide-react';
import { sounds } from '../utils/audio';

// Map emojis and icon names directly to vector SVG components
const EMOJI_TO_SVG = {
  '🎮': Gamepad2,
  '🕹️': Joystick,
  '🕹': Joystick,
  '⚔️': Swords,
  '⚔': Swords,
  '🗡️': Swords,
  '🏎️': Car,
  '🏎': Car,
  '🚗': Car,
  '🚙': Car,
  '🧩': Puzzle,
  '👾': Ghost,
  '⚽': Trophy,
  '🏀': Trophy,
  '🏆': Trophy,
  '⚡': Zap,
  '✨': Sparkles,
  '🔥': Flame,
  '🎯': Target,
  '🚀': Rocket,
  '🔮': Gem,
  '🃏': Layers,
  '👑': Crown,
  '📱': Tv,
  '🎨': Palette,
  '🎵': Music,
  '📻': Radio,
  '💡': Sparkles,
  '🎲': Dices
};

const CATEGORY_ID_TO_SVG = {
  action: Swords,
  adventure: Compass,
  racing: Car,
  car: Car,
  multiplayer: Users,
  '2-player': Users,
  shooting: Crosshair,
  shooter: Crosshair,
  puzzle: Puzzle,
  sports: Trophy,
  sport: Trophy,
  arcade: Gamepad2,
  casual: Zap,
  trending: Flame,
  cyber: Cpu,
  cyberpunk: Cpu,
  classic: Sparkles,
  idel: Activity,
  idle: Activity,
  cards: Layers,
  girls: Heart,
  music: Music,
  retro: Joystick,
  strategy: Crown
};

function renderCategoryIcon(cat, size = 19) {
  if (!cat) return <Gamepad2 size={size} />;

  // 1. Direct React component function
  if (typeof cat.icon === 'function') {
    const IconComp = cat.icon;
    return <IconComp size={size} />;
  }

  // 2. Direct emoji mapping to SVG
  if (typeof cat.icon === 'string' && cat.icon.trim().length > 0) {
    const trimmed = cat.icon.trim();
    if (EMOJI_TO_SVG[trimmed]) {
      const SvgComp = EMOJI_TO_SVG[trimmed];
      return <SvgComp size={size} />;
    }
  }

  // 3. Category ID or Name mapping to SVG
  const normId = (cat.id || '').toLowerCase().trim();
  const normName = (cat.name || '').toLowerCase().trim();

  if (CATEGORY_ID_TO_SVG[normId]) {
    const SvgComp = CATEGORY_ID_TO_SVG[normId];
    return <SvgComp size={size} />;
  }

  if (CATEGORY_ID_TO_SVG[normName]) {
    const SvgComp = CATEGORY_ID_TO_SVG[normName];
    return <SvgComp size={size} />;
  }

  // 4. Default clean vector SVG
  return <Gamepad2 size={size} />;
}

export default function Sidebar({
  isOpen,
  setIsOpen,
  isExpanded = false,
  onMouseEnter,
  onMouseLeave,
  activePage = 'home',
  activeCategory = '',
  onNavigate,
  onSelectCategory,
  favoritesCount = 0,
  recentlyPlayedCount = 0,
  onOpenFavorites,
  onRandomPlay,
  user,
  onOpenAuth,
  categories = [],
  allGames = []
}) {
  const mainNavItems = [
    { id: 'home', label: 'Home', icon: Home, color: '#2563eb' },
    { id: 'most-played', label: 'Most played', icon: Trophy, color: '#f59e0b' },
    { id: 'trending', label: 'Trending', icon: Flame, color: '#ef4444', badge: 'HOT' },
    {
      id: 'new', label: 'New', icon: Sparkles, color: '#10b981'
    },
    {
      id: 'random',
      label: 'Surprise me',
      icon: Dices,
      color: '#ec4899',
      isAction: true,
      action: () => {
        sounds.playPowerup();
        if (onRandomPlay) onRandomPlay();
      }
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: Heart,
      color: '#f43f5e',
      badge: favoritesCount > 0 ? favoritesCount : null,
      isAction: true,
      action: () => {
        sounds.playClick();
        if (onOpenFavorites) onOpenFavorites();
      }
    }
  ];

  const handleNavClick = (item) => {
    sounds.playClick();
    if (setIsOpen) setIsOpen(false);
    if (item.isAction && item.action) {
      item.action();
    } else {
      onNavigate(item.id);
    }
  };

  const handleCategoryClick = (catId) => {
    sounds.playClick();
    if (setIsOpen) setIsOpen(false);
    onSelectCategory(catId);
  };

  const handleFooterLinkClick = (pageId) => {
    sounds.playClick();
    if (setIsOpen) setIsOpen(false);
    if (onNavigate) onNavigate(pageId);
  };

  // Filter out 'all' for sidebar categories section (since Home represents All)
  const displayCategories = useMemo(() => {
    return (categories && categories.length > 0 ? categories : [])
      .filter(c => c.id !== 'all' && (c.name || '').toLowerCase() !== 'all games');
  }, [categories]);

  return (
    <>
      {/* Backdrop when sidebar is open */}
      {isOpen && (
        <div
          className="gamepix-sidebar-backdrop"
          onClick={() => {
            sounds.playClick();
            if (setIsOpen) setIsOpen(false);
            if (onMouseLeave) onMouseLeave();
          }}
        />
      )}

      {/* GamePix Sticky Left Sidebar */}
      <aside
        className={`gamepix-sidebar ${isOpen ? 'open' : 'closed'} ${isExpanded ? 'expanded' : ''}`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="gamepix-sidebar-inner custom-scrollbar">

          {/* Main Navigation Section */}
          <div className="gamepix-side-section">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id && !activeCategory && !item.isAction;

              return (
                <button
                  key={item.id}
                  className={`gamepix-side-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleNavClick(item)}
                  title={item.label}
                >
                  <div className="gamepix-side-icon-box" style={{ color: item.color }}>
                    <Icon size={20} className={item.id === 'favorites' && favoritesCount > 0 ? 'fill-fav' : ''} />
                  </div>
                  <span className="gamepix-side-label">{item.label}</span>
                  {item.badge && (
                    <span className={`gamepix-side-badge ${item.id === 'trending' ? 'badge-hot' : ''}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="gamepix-side-divider" />

          {/* Categories & Tags Section */}
          <div className="gamepix-side-section">
            <div className="gamepix-section-title">
              <span>CATEGORIES</span>
            </div>

            {displayCategories.map((cat) => {
              const catIdNorm = (cat.id || cat._id || '').toLowerCase().trim();
              const activeCatNorm = (activeCategory || '').toLowerCase().trim();
              const isActive = activeCatNorm === catIdNorm || (cat.name && activeCatNorm === cat.name.toLowerCase().trim());
              const catColor = getDimmedCategoryColor(cat.color || '#2563eb');

              return (
                <button
                  key={cat.id || cat._id}
                  className={`gamepix-side-item category-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(cat.id || cat._id)}
                  title={cat.name}
                >
                  <div className="gamepix-side-icon-box" style={{ color: catColor }}>
                    {renderCategorySvgIcon(cat, 19)}
                  </div>
                  <span className="gamepix-side-label" style={{ textTransform: 'capitalize' }}>{cat.name}</span>
                  <ChevronRight size={14} className="gamepix-side-chevron" />
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="gamepix-side-divider" />

          {/* Integrated Sidebar Footer Section (Developer + Legal + Live Status) */}
          <div className="sidebar-footer-block">
            {/* Developer Button */}
            <button
              className={`sidebar-dev-action-btn ${activePage === 'developers' ? 'active' : ''}`}
              onClick={() => handleFooterLinkClick('developers')}
              title="Publish Your Game"
            >
              <Rocket size={17} className="text-cyan" />
              <span>Submit Game</span>
            </button>

            {/* Quick Links Group */}
            <div className="sidebar-links-group">
              <button onClick={() => handleFooterLinkClick('about')} className="sidebar-mini-link" title="About NextGenn">
                <Info size={13} />
                <span>About</span>
              </button>
              <button onClick={() => handleFooterLinkClick('privacy')} className="sidebar-mini-link" title="Privacy Policy">
                <Shield size={13} />
                <span>Privacy</span>
              </button>
              <button onClick={() => handleFooterLinkClick('terms')} className="sidebar-mini-link" title="Terms of Service">
                <FileText size={13} />
                <span>Terms</span>
              </button>
              <button onClick={() => handleFooterLinkClick('disclaimer')} className="sidebar-mini-link" title="Legal Disclaimer">
                <AlertTriangle size={13} />
                <span>Disclaimer</span>
              </button>
              <button onClick={() => handleFooterLinkClick('faq')} className={`sidebar-mini-link ${activePage === 'faq' ? 'active' : ''}`} title="Frequently Asked Questions">
                <HelpCircle size={13} />
                <span>FAQ</span>
              </button>
              <button onClick={() => handleFooterLinkClick('contact')} className="sidebar-mini-link" title="Contact Us">
                <Mail size={13} />
                <span>Contact</span>
              </button>
            </div>

            {/* Mini Copyright */}
            <div className="sidebar-copyright-text">
              © {new Date().getFullYear()} NextGenn Platform
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}
