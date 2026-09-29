import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense, lazy, Component } from 'react';
import NextGennNavbar from './components/NextGennNavbar';
import Sidebar from './components/Sidebar';
import GameGrid from './components/GameGrid';
import GamePlayerView from './components/GamePlayerView';
import Footer from './components/Footer';

import AuthModal from './components/AuthModal';

// Code-split other non-critical pages & drawers
const FavoritesDrawer = lazy(() => import('./components/FavoritesDrawer'));
const DeveloperPortal = lazy(() => import('./components/DeveloperPortal'));
const AboutPage = lazy(() => import('./components/AboutPage'));
const ContactPage = lazy(() => import('./components/ContactPage'));
const PrivacyPage = lazy(() => import('./components/PrivacyPage'));
const TermsPage = lazy(() => import('./components/TermsPage'));
const DisclaimerPage = lazy(() => import('./components/DisclaimerPage'));
const BlogPage = lazy(() => import('./components/BlogPage'));
const FaqPage = lazy(() => import('./components/FaqPage'));

import { GAMES as DEFAULT_STATIC_GAMES, CATEGORIES as DEFAULT_STATIC_CATEGORIES } from './data/games';
import { filterCategoriesWithGames } from './utils/categoryIcons';
import { sounds } from './utils/audio';
import { CONFIG } from './config';
import { gamesApi, categoriesApi, cloudSyncApi } from './services/api';

const { STORAGE_KEYS } = CONFIG;

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f4f6fb',
          color: '#0f172a',
          padding: 24,
          textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>NextGenn Ready</h2>
          <p style={{ color: '#94a3b8', maxWidth: 460, marginBottom: 16 }}>
            An unexpected glitch was caught and safely recovered.
          </p>
          {this.state.error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#991b1b',
              padding: '10px 16px',
              borderRadius: 8,
              fontSize: '0.85rem',
              maxWidth: 520,
              marginBottom: 20,
              wordBreak: 'break-word',
              fontFamily: 'monospace',
              textAlign: 'left'
            }}>
              <strong>Error:</strong> {this.state.error?.message || String(this.state.error)}
            </div>
          )}
          <button
            style={{
              background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
              color: '#070a13',
              fontWeight: 800,
              padding: '12px 28px',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={() => {
              this.setState({ hasError: false, error: null });
              try {
                localStorage.removeItem(STORAGE_KEYS.CACHED_GAMES);
                localStorage.removeItem(STORAGE_KEYS.CACHED_CATEGORIES);
              } catch { }
              window.location.href = window.location.origin + window.location.pathname;
            }}
          >
            Reload Nextgenn
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const KNOWN_STATIC_PAGES = [
  'home',
  'trending',
  'most-played',
  'top-rated',
  'new',
  'recently-played',
  'developers',
  'about',
  'privacy',
  'terms',
  'contact',
  'disclaimer',
  'blog',
  'faq'
];

function buildNavUrl(gameId, category, page, search) {
  try {
    if (gameId) {
      return `/game/${encodeURIComponent(gameId)}`;
    }
    if (search && search.trim()) {
      return `/?q=${encodeURIComponent(search.trim())}`;
    }
    if (category) {
      return `/category/${encodeURIComponent(category)}`;
    }
    if (page && page !== 'home' && KNOWN_STATIC_PAGES.includes(page)) {
      return `/${encodeURIComponent(page)}`;
    }
    return '/';
  } catch {
    return '/';
  }
}

function parseUrlNavState() {
  try {
    const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash.replace(/^#\/?/, '');
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

    // Check query params as backward-compatible fallback (e.g. ?page=privacy, ?game=123, ?category=action)
    let gameId = urlParams.get('game') || hashParams.get('game') || null;
    let category = urlParams.get('category') || hashParams.get('category') || '';
    let page = urlParams.get('page') || hashParams.get('page') || '';
    let search = urlParams.get('q') || '';

    // Clean Path Routing (e.g. /privacy, /about, /terms, /category/action, /game/subway-surfers)
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length === 1) {
      const seg = decodeURIComponent(segments[0]).toLowerCase();
      if (KNOWN_STATIC_PAGES.includes(seg)) {
        page = seg;
      }
    } else if (segments.length >= 2) {
      const prefix = segments[0].toLowerCase();
      const val = decodeURIComponent(segments.slice(1).join('/'));
      if (prefix === 'game') {
        gameId = val;
      } else if (prefix === 'category') {
        category = val;
        page = 'home';
      } else if (prefix === 'search') {
        search = val || search;
        page = 'home';
      }
    }

    // Check Hash Routing (e.g. #/privacy or #privacy)
    if (!page && hash) {
      const hashSegs = hash.split('/').filter(Boolean);
      if (hashSegs.length === 1 && KNOWN_STATIC_PAGES.includes(hashSegs[0].toLowerCase())) {
        page = hashSegs[0].toLowerCase();
      } else if (hashSegs.length >= 2) {
        const hPrefix = hashSegs[0].toLowerCase();
        const hVal = decodeURIComponent(hashSegs.slice(1).join('/'));
        if (hPrefix === 'game') gameId = hVal;
        if (hPrefix === 'category') {
          category = hVal;
          page = 'home';
        }
      }
    }

    if (!page) {
      page = 'home';
    }

    return { gameId, category, page, search };
  } catch {
    return { gameId: null, category: '', page: 'home', search: '' };
  }
}

function App() {
  const initialNav = useMemo(() => parseUrlNavState(), []);

  // Real-time games state with seamless static fallback for offline / fresh browsers
  const [games, setGames] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.CACHED_GAMES);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    return DEFAULT_STATIC_GAMES;
  });

  // Dynamic live categories from backend/admin with static fallback
  const [categories, setCategories] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.CACHED_CATEGORIES);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    return DEFAULT_STATIC_CATEGORIES;
  });

  const [isLoadingGames, setIsLoadingGames] = useState(false);

  // Available active games for website players (Draft and Maintenance games are strictly hidden from website)
  const activeGames = useMemo(() => {
    return Array.isArray(games) ? games.filter(g => g && g.status === 'active' && g.status !== 'draft') : [];
  }, [games]);

  // Available categories on the website:
  // Dynamically controlled by Admin, only showing categories with active games in the full library (plus All Games)
  const availableCategories = useMemo(() => {
    return filterCategoriesWithGames(categories, activeGames);
  }, [categories, activeGames]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const sidebarCloseTimeoutRef = useRef(null);

  const handleSidebarMouseEnter = useCallback(() => {
    if (sidebarCloseTimeoutRef.current) {
      clearTimeout(sidebarCloseTimeoutRef.current);
      sidebarCloseTimeoutRef.current = null;
    }
    setIsSidebarExpanded(true);
  }, []);

  const handleSidebarMouseLeave = useCallback(() => {
    if (sidebarCloseTimeoutRef.current) {
      clearTimeout(sidebarCloseTimeoutRef.current);
    }
    sidebarCloseTimeoutRef.current = setTimeout(() => {
      setIsSidebarExpanded(false);
    }, 250); // Smooth grace delay before collapsing back to icons
  }, []);

  const [activePage, setActivePage] = useState(initialNav.page);
  const [activeCategory, setActiveCategory] = useState(initialNav.category);
  const [searchQuery, setSearchQuery] = useState(initialNav.search);

  const searchInputRef = useRef(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER) || localStorage.getItem('sky_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [pendingGameId, setPendingGameId] = useState(initialNav.gameId);
  const [selectedGame, setSelectedGame] = useState(null);
  const [activeGameCounts, setActiveGameCounts] = useState({});

  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECENT) || localStorage.getItem('sky_recent');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES) || localStorage.getItem('sky_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [favoritesDrawerOpen, setFavoritesDrawerOpen] = useState(false);

  // Gamification & XP State
  const [totalXp, setTotalXp] = useState(() => {
    try {
      return parseInt(localStorage.getItem('sky_total_xp') || '150', 10);
    } catch {
      return 150;
    }
  });

  const [level, setLevel] = useState(() => {
    try {
      const savedLvl = parseInt(localStorage.getItem('sky_user_level') || '1', 10);
      return Math.max(savedLvl, Math.floor(Math.sqrt(totalXp / 100)) + 1);
    } catch {
      return 1;
    }
  });

  const [completedQuests, setCompletedQuests] = useState(() => {
    try {
      const saved = localStorage.getItem('sky_completed_quests');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [unlockedBadges, setUnlockedBadges] = useState(() => {
    try {
      const saved = localStorage.getItem('sky_unlocked_badges');
      return saved ? JSON.parse(saved) : ['first_play'];
    } catch {
      return ['first_play'];
    }
  });

  // Cloud Save Hydration on Login
  useEffect(() => {
    if (user?.id) {
      cloudSyncApi.getProgress(user.id).then(res => {
        if (res?.cloudSave) {
          const { favorites: cloudFavs, totalXp: cloudXp, level: cloudLvl, unlockedBadges: cloudBadges, questProgress } = res.cloudSave;
          if (Array.isArray(cloudFavs) && cloudFavs.length > 0) setFavorites(cloudFavs);
          if (cloudXp > totalXp) setTotalXp(cloudXp);
          if (cloudLvl > level) setLevel(cloudLvl);
          if (Array.isArray(cloudBadges)) setUnlockedBadges(prev => Array.from(new Set([...prev, ...cloudBadges])));
          if (questProgress) setCompletedQuests(prev => ({ ...prev, ...questProgress }));
        }
      }).catch(() => { });
    }
  }, [user]);

  const handleAwardXp = useCallback((newXp, newLvl, questId = null) => {
    setTotalXp(newXp);
    setLevel(newLvl);
    try {
      localStorage.setItem('sky_total_xp', String(newXp));
      localStorage.setItem('sky_user_level', String(newLvl));
    } catch { }

    if (questId) {
      setCompletedQuests(prev => {
        const updated = { ...prev, [questId]: true };
        try {
          localStorage.setItem('sky_completed_quests', JSON.stringify(updated));
        } catch { }
        return updated;
      });
    }

    // Debounced Cloud Sync
    if (user?.id) {
      cloudSyncApi.syncProgress({
        userId: user.id,
        favorites,
        recent: recentlyPlayed,
        totalXp: newXp,
        level: newLvl,
        questProgress: completedQuests,
        unlockedBadges
      }).catch(() => { });
    }
  }, [user, favorites, recentlyPlayed, completedQuests, unlockedBadges]);

  const fetchLivePlatformData = useCallback(async () => {
    try {
      const [liveGames, liveCats] = await Promise.all([
        gamesApi.getLiveGames().catch(() => null),
        categoriesApi.getLiveCategories().catch(() => null)
      ]);

      if (Array.isArray(liveGames) && liveGames.length > 0) {
        setGames(liveGames);
        try {
          localStorage.setItem(STORAGE_KEYS.CACHED_GAMES, JSON.stringify(liveGames));
        } catch { }
      }

      if (Array.isArray(liveCats) && liveCats.length > 0) {
        setCategories(liveCats);
        try {
          localStorage.setItem(STORAGE_KEYS.CACHED_CATEGORIES, JSON.stringify(liveCats));
        } catch { }
      }
    } catch (err) {
      // Silently keep default or cached games without disrupting UI
    } finally {
      setIsLoadingGames(false);
    }
  }, []);

  useEffect(() => {
    fetchLivePlatformData();

    // Auto-sync in background if backend server is available
    const interval = setInterval(() => {
      gamesApi.getLiveGames()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setGames(data);
            try {
              localStorage.setItem(STORAGE_KEYS.CACHED_GAMES, JSON.stringify(data));
            } catch { }
          }
        })
        .catch(() => { });
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchLivePlatformData]);

  useEffect(() => {
    let isCancelled = false;
    if (pendingGameId) {
      const pIdStr = String(pendingGameId).toLowerCase();
      const found = activeGames.find(g =>
        (g.id && String(g.id).toLowerCase() === pIdStr) ||
        (g._id && String(g._id).toLowerCase() === pIdStr) ||
        (g.title && g.title.toLowerCase() === pIdStr)
      );
      if (found) {
        setSelectedGame(found);
      } else if (activeGames.length > 0) {
        // Fallback: Fetch directly from API in case of single game direct link or unlisted active game
        gamesApi.getById(pendingGameId)
          .then(data => {
            if (!isCancelled && data && (data.game || data.id)) {
              setSelectedGame(data.game || data);
            } else if (!isCancelled) {
              setSelectedGame(null);
            }
          })
          .catch(() => {
            if (!isCancelled) setSelectedGame(null);
          });
      }
    } else {
      setSelectedGame(null);
    }
    return () => { isCancelled = true; };
  }, [pendingGameId, activeGames]);

  useEffect(() => {
    const handlePopState = () => {
      const state = parseUrlNavState();
      setActivePage(state.page || 'home');
      setActiveCategory(state.category || '');
      setSearchQuery(state.search || '');
      setPendingGameId(state.gameId);
      if (!state.gameId) {
        setSelectedGame(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user]);

  useEffect(() => {
    if (activeGames.length > 0) {
      setRecentlyPlayed(prev => {
        const filtered = prev.filter(r => activeGames.some(g => String(g.id || g._id) === String(r.id || r._id)));
        localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(filtered));
        return filtered;
      });
    }
  }, [activeGames]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const cleanUrl = buildNavUrl(initialNav.gameId, initialNav.category, initialNav.page, initialNav.search);
    const currentLoc = window.location.pathname + window.location.search + window.location.hash;
    if (!window.history.state || currentLoc !== cleanUrl) {
      window.history.replaceState(
        { root: true, gameId: initialNav.gameId, category: initialNav.category, page: initialNav.page },
        '',
        cleanUrl
      );
    }
  }, [initialNav]);

  const handleToggleFavorite = useCallback((gameId) => {
    setFavorites(prev => {
      const exists = prev.some(id => String(id) === String(gameId));
      if (exists) {
        return prev.filter(id => String(id) !== String(gameId));
      } else {
        return [...prev, gameId];
      }
    });
  }, []);

  const handlePlayGame = useCallback((game) => {
    const gKey = game.id || game._id || game.title;
    setSelectedGame(game);
    setPendingGameId(gKey);

    const targetUrl = buildNavUrl(gKey, activeCategory, activePage, searchQuery);
    window.history.pushState({ gameId: gKey, category: activeCategory, page: activePage }, '', targetUrl);

    setRecentlyPlayed(prev => {
      const filtered = prev.filter(g => String(g.id || g._id) !== String(game.id || game._id));
      return [game, ...filtered].slice(0, 10);
    });

    // Award +25 XP on game play session
    const nextXp = totalXp + 25;
    const nextLvl = Math.floor(Math.sqrt(nextXp / 100)) + 1;
    handleAwardXp(nextXp, nextLvl);
  }, [activeCategory, activePage, searchQuery, totalXp, handleAwardXp]);

  const handleCloseGame = useCallback(() => {
    setSelectedGame(null);
    setPendingGameId(null);
    if (window.history.state && window.history.state.gameId) {
      window.history.back();
    } else {
      const targetUrl = buildNavUrl(null, activeCategory, activePage, searchQuery);
      window.history.pushState({ gameId: null, category: activeCategory, page: activePage }, '', targetUrl);
    }
  }, [activeCategory, activePage, searchQuery]);

  const handleCategorySelect = useCallback((catId) => {
    setSelectedGame(null);
    setPendingGameId(null);
    const targetCat = (!catId || catId === 'all') ? '' : catId;
    setActiveCategory(targetCat);
    setActivePage('home');
    setSearchQuery('');
    const targetUrl = buildNavUrl(null, targetCat, 'home', '');
    window.history.pushState({ gameId: null, category: targetCat, page: 'home' }, '', targetUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRandomPlay = useCallback(() => {
    if (activeGames.length > 0) {
      const randomIndex = Math.floor(Math.random() * activeGames.length);
      handlePlayGame(activeGames[randomIndex]);
    }
  }, [activeGames, handlePlayGame]);

  const handleNavigation = useCallback((pageId) => {
    setSelectedGame(null);
    setPendingGameId(null);
    setActivePage(pageId);
    setActiveCategory('');
    setSearchQuery('');
    const targetUrl = buildNavUrl(null, '', pageId, '');
    window.history.pushState({ gameId: null, category: '', page: pageId }, '', targetUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleTagSearch = useCallback((query) => {
    setSelectedGame(null);
    setPendingGameId(null);
    const q = (query || '').toLowerCase().trim();
    const matched = categories.find(c => {
      const cId = (c.id || c._id || '').toLowerCase().trim();
      const cName = (c.name || '').toLowerCase().trim();
      return cId === q || cName === q;
    });

    if (matched) {
      setActiveCategory(matched.id || matched._id);
      setSearchQuery('');
      setActivePage('home');
      const targetUrl = buildNavUrl(null, matched.id || matched._id, 'home', '');
      window.history.pushState({ gameId: null, category: matched.id || matched._id, page: 'home' }, '', targetUrl);
    } else {
      setActiveCategory('');
      setSearchQuery(query);
      setActivePage('home');
      const targetUrl = buildNavUrl(null, '', 'home', query);
      window.history.pushState({ gameId: null, category: '', page: 'home' }, '', targetUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categories]);

  const displayedGames = useMemo(() => {
    let list = Array.isArray(activeGames) ? [...activeGames] : [];

    if (activePage === 'trending') {
      const hotGames = list.filter(g => g && (g.badge === 'HOT' || g.badge === 'TRENDING' || g.badge === 'POPULAR' || g.featured));
      list = hotGames.length > 0 ? hotGames : [...list].sort((a, b) => ((b && b.plays) || 0) - ((a && a.plays) || 0));
    } else if (activePage === 'top-rated' || activePage === 'most-played') {
      list = list.sort((a, b) => ((b && b.plays) || 0) - ((a && a.plays) || 0));
    } else if (activePage === 'new') {
      list = list.sort((a, b) => new Date((b && b.createdAt) || '2026-01-01') - new Date((a && a.createdAt) || '2026-01-01'));
    } else if (activePage === 'recently-played') {
      return Array.isArray(recentlyPlayed) ? recentlyPlayed.filter(g => g && g.status === 'active' && g.status !== 'draft') : [];
    }

    if (activeCategory && activeCategory !== 'all') {
      const catKey = activeCategory.toLowerCase().trim();
      const is2p = catKey === 'multiplayer' || catKey === '2-player' || catKey === '2player';
      const matchedCat = categories.find(cat => {
        const cId = (cat.id || cat._id || '').toLowerCase().trim();
        const cName = (cat.name || '').toLowerCase().trim();
        return cId === catKey || cName === catKey;
      });
      const catName = (matchedCat?.name || '').toLowerCase().trim();

      list = list.filter(g => {
        if (!g) return false;
        const c = (g.category || '').toLowerCase().trim();
        const gTags = Array.isArray(g.tags)
          ? g.tags.map(t => (typeof t === 'string' ? t.toLowerCase().trim() : ''))
          : (typeof g.tags === 'string' ? g.tags.toLowerCase().split(',').map(t => t.trim()) : []);

        const matches2p = is2p && (
          c.includes('2') || c.includes('multiplayer') || c.includes('two') ||
          gTags.some(t => t.includes('2') || t.includes('multiplayer') || t.includes('two'))
        );

        const matchesCat = c === catKey || (catName && c === catName) || (catKey.length > 3 && c.includes(catKey));
        const matchesTag = gTags.some(t => t === catKey || (catName && t === catName) || (catKey.length > 3 && t.includes(catKey)));

        return matchesCat || matchesTag || matches2p;
      });
    }

    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(g => {
        if (!g) return false;
        const titleMatch = g.title && typeof g.title === 'string' && g.title.toLowerCase().includes(q);
        const tagsMatch = Array.isArray(g.tags) && g.tags.some(t => typeof t === 'string' && t.toLowerCase().includes(q));
        const catMatch = g.category && typeof g.category === 'string' && g.category.toLowerCase().includes(q);
        const descMatch = g.description && typeof g.description === 'string' && g.description.toLowerCase().includes(q);
        return titleMatch || tagsMatch || catMatch || descMatch;
      });
    }

    return list;
  }, [activeGames, activePage, activeCategory, searchQuery, recentlyPlayed, categories]);

  return (
    <div className="sky-app-root sky-theme-root gamepix-app-layout">
      {/* NextGenn Modern Sticky Navbar */}
      <NextGennNavbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        onSelectCategory={handleCategorySelect}
        searchInputRef={searchInputRef}
        games={activeGames}
        onSelectGame={handlePlayGame}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={() => {
          try {
            localStorage.removeItem('nextgenn_token');
            localStorage.removeItem('nextgenn_user');
            localStorage.removeItem('sky_token');
            localStorage.removeItem('sky_user');
          } catch { }
          setUser(null);
        }}
        user={user}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        favoritesCount={favorites.length}
        onOpenFavorites={() => setFavoritesDrawerOpen(true)}
        onNavigate={handleNavigation}
        level={level}
        activePage={activePage}
      />

      <div className="gamepix-body-layout">

        {/* Hide sidebar on static info pages */}
        {!['about', 'privacy', 'terms', 'contact', 'disclaimer', 'developers', 'blog', 'faq'].includes(activePage) && (
          <Sidebar
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
            isExpanded={isSidebarExpanded}
            onMouseEnter={handleSidebarMouseEnter}
            onMouseLeave={handleSidebarMouseLeave}
            activePage={activePage}
            activeCategory={activeCategory}
            onNavigate={handleNavigation}
            onSelectCategory={handleCategorySelect}
            favoritesCount={favorites.length}
            recentlyPlayedCount={recentlyPlayed.length}
            onOpenFavorites={() => setFavoritesDrawerOpen(true)}
            onRandomPlay={handleRandomPlay}
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
            categories={availableCategories}
            allGames={activeGames}
          />
        )}

        {/* Right Main Content Area */}
        <div className={`gamepix-main-wrapper ${['about', 'privacy', 'terms', 'contact', 'disclaimer', 'developers', 'blog', 'faq'].includes(activePage)
            ? 'sidebar-hidden'
            : isSidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'
          }`}>
          <main className="gamepix-main-content">
            {selectedGame ? (
              <GamePlayerView
                game={selectedGame}
                onClose={handleCloseGame}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                allGames={activeGames}
                onSelectRelatedGame={handlePlayGame}
                onSelectCategory={handleCategorySelect}
                user={user}
              />
            ) : activePage === 'developers' ? (
              <Suspense fallback={<div className="loading-spinner" />}>
                <DeveloperPortal
                  onBackToHome={() => handleNavigation('home')}
                  categories={categories}
                />
              </Suspense>
            ) : activePage === 'about' ? (
              <Suspense fallback={<div className="loading-spinner" />}>
                <AboutPage
                  onBackToHome={() => handleNavigation('home')}
                  onNavigate={handleNavigation}
                />
              </Suspense>
            ) : activePage === 'privacy' ? (
              <Suspense fallback={<div className="loading-spinner" />}>
                <PrivacyPage
                  onBackToHome={() => handleNavigation('home')}
                  onNavigate={handleNavigation}
                />
              </Suspense>
            ) : activePage === 'terms' ? (
              <Suspense fallback={<div className="loading-spinner" />}>
                <TermsPage
                  onBackToHome={() => handleNavigation('home')}
                  onNavigate={handleNavigation}
                />
              </Suspense>
            ) : activePage === 'contact' ? (
              <Suspense fallback={<div className="loading-spinner" />}>
                <ContactPage
                  onBackToHome={() => handleNavigation('home')}
                  onNavigate={handleNavigation}
                />
              </Suspense>
            ) : activePage === 'disclaimer' ? (
              <Suspense fallback={<div className="loading-spinner" />}>
                <DisclaimerPage
                  onBackToHome={() => handleNavigation('home')}
                  onNavigate={handleNavigation}
                />
              </Suspense>
            ) : activePage === 'blog' ? (
              <Suspense fallback={<div className="loading-spinner" />}>
                <BlogPage
                  onBackToHome={() => handleNavigation('home')}
                  onNavigate={handleNavigation}
                />
              </Suspense>
            ) : activePage === 'faq' ? (
              <Suspense fallback={<div className="loading-spinner" />}>
                <FaqPage
                  onBackToHome={() => handleNavigation('home')}
                  onNavigate={handleNavigation}
                />
              </Suspense>
            ) : isLoadingGames && activeGames.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '100px 20px', color: '#64748b' }}>
                <div className="loading-spinner" style={{ margin: '0 auto 16px', width: 36, height: 36 }} />
                <p style={{ fontWeight: 600 }}>Loading Games...</p>
              </div>
            ) : (
              <GameGrid
                title={
                  activePage === 'trending' ? 'Trending Now' :
                    activePage === 'most-played' ? 'Most Played Games' :
                      activePage === 'top-rated' ? 'Top Rated Games' :
                        activePage === 'new' ? 'New Additions' :
                          activePage === 'recently-played' ? 'Recently Played' :
                            activeCategory ? `${activeCategory.toUpperCase()} GAMES` :
                              ''
                }
                games={displayedGames}
                allGames={activeGames}
                activeGameCounts={activeGameCounts}
                onPlayGame={handlePlayGame}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                activeCategory={activeCategory}
                onSelectCategory={handleCategorySelect}
                activePage={activePage}
                searchQuery={searchQuery}
                recentlyPlayed={recentlyPlayed}
                onOpenAuth={() => setAuthModalOpen(true)}
                onFocusSearch={() => {
                  if (searchInputRef.current) {
                    searchInputRef.current.focus();
                  }
                }}
                user={user}
                categories={availableCategories}
              />
            )}
          </main>
          <Footer
            categories={availableCategories}
            games={activeGames}
            onNavigate={handleNavigation}
            onSelectCategory={handleCategorySelect}
            onRandomPlay={handleRandomPlay}
            onSearch={handleTagSearch}
            activePage={activePage}
            activeCategory={activeCategory}
          />
        </div>

      </div>

      {/* Critical Auth & Profile Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        user={user}
        onLogin={(loggedInUser) => setUser(loggedInUser)}
        onLogout={() => {
          try {
            localStorage.removeItem('sky_token');
            localStorage.removeItem('sky_user');
          } catch { }
          setUser(null);
        }}
      />





      <Suspense fallback={null}>
        {/* Saved Favorites Sliding Drawer */}
        <FavoritesDrawer
          isOpen={favoritesDrawerOpen}
          onClose={() => setFavoritesDrawerOpen(false)}
          favorites={favorites}
          games={activeGames}
          onPlayGame={handlePlayGame}
          onRemoveFavorite={handleToggleFavorite}
          onClearAll={() => setFavorites([])}
        />
      </Suspense>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

