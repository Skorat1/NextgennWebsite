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
import { updatePageSeo, buildGameSchema, toGameSlug } from './utils/seo';

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

function buildNavUrl(gameOrSlug, category, page, search) {
  try {
    if (gameOrSlug) {
      const slug = typeof gameOrSlug === 'object'
        ? toGameSlug(gameOrSlug)
        : (toGameSlug(gameOrSlug) || encodeURIComponent(gameOrSlug));
      return `/game/${slug}`;
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
      } else if (prefix === 'blog') {
        page = 'blog';
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
        if (hPrefix === 'blog') {
          page = 'blog';
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

  // Real-time games state loaded directly from MySQL database
  const [games, setGames] = useState(DEFAULT_STATIC_GAMES);

  // Dynamic live categories loaded directly from MySQL database
  const [categories, setCategories] = useState(DEFAULT_STATIC_CATEGORIES);

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

  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [favoritesDrawerOpen, setFavoritesDrawerOpen] = useState(false);

  // Gamification & XP State (Synced with MySQL)
  const [totalXp, setTotalXp] = useState(150);
  const [level, setLevel] = useState(1);
  const [completedQuests, setCompletedQuests] = useState({});
  const [unlockedBadges, setUnlockedBadges] = useState(['first_play']);

  // Cloud Save Hydration from MySQL on User Login or Identification
  useEffect(() => {
    if (user?.id) {
      cloudSyncApi.getProgress(user.id).then(res => {
        if (res?.cloudSave) {
          const { favorites: cloudFavs, recent: cloudRecent, totalXp: cloudXp, level: cloudLvl, unlockedBadges: cloudBadges, questProgress } = res.cloudSave;
          if (Array.isArray(cloudFavs)) setFavorites(cloudFavs);
          if (Array.isArray(cloudRecent)) setRecentlyPlayed(cloudRecent);
          if (typeof cloudXp === 'number') setTotalXp(cloudXp);
          if (typeof cloudLvl === 'number') setLevel(cloudLvl);
          if (Array.isArray(cloudBadges) && cloudBadges.length > 0) setUnlockedBadges(cloudBadges);
          if (questProgress) setCompletedQuests(questProgress);
        }
      }).catch(() => { });
    }
  }, [user]);

  const handleAwardXp = useCallback((newXp, newLvl, questId = null) => {
    setTotalXp(newXp);
    setLevel(newLvl);

    let updatedQuests = completedQuests;
    if (questId) {
      updatedQuests = { ...completedQuests, [questId]: true };
      setCompletedQuests(updatedQuests);
    }

    // Persist directly to MySQL database
    if (user?.id) {
      cloudSyncApi.syncProgress({
        userId: user.id,
        favorites,
        recent: recentlyPlayed,
        totalXp: newXp,
        level: newLvl,
        questProgress: updatedQuests,
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
      }

      if (Array.isArray(liveCats) && liveCats.length > 0) {
        setCategories(liveCats);
      }
    } catch (err) {
      // Silently keep default games without disrupting UI
    } finally {
      setIsLoadingGames(false);
    }
  }, []);

  useEffect(() => {
    fetchLivePlatformData();

    // Auto-sync games from MySQL in background
    const interval = setInterval(() => {
      gamesApi.getLiveGames()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setGames(data);
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
      const pSlug = toGameSlug(pendingGameId);

      const found = activeGames.find(g =>
        (g.title && toGameSlug(g.title) === pSlug) ||
        (g.id && String(g.id).toLowerCase() === pIdStr) ||
        (g._id && String(g._id).toLowerCase() === pIdStr) ||
        (g.title && g.title.toLowerCase() === pIdStr)
      );

      const applyGameAndNormalizeUrl = (game) => {
        if (!game) return;
        setSelectedGame(game);
        const cleanSlug = toGameSlug(game);
        const expectedUrl = `/game/${cleanSlug}`;
        if (window.location.pathname !== expectedUrl) {
          window.history.replaceState(
            { ...(window.history.state || {}), gameId: cleanSlug },
            '',
            expectedUrl
          );
        }
      };

      if (found) {
        applyGameAndNormalizeUrl(found);
      } else if (activeGames.length > 0) {
        // Fallback: Fetch directly from API in case of single game direct link or unlisted active game
        gamesApi.getById(pendingGameId)
          .then(data => {
            if (!isCancelled && data && (data.game || data.id)) {
              applyGameAndNormalizeUrl(data.game || data);
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

  // Sync favorites with MySQL
  useEffect(() => {
    if (user?.id) {
      cloudSyncApi.syncProgress({
        userId: user.id,
        favorites
      }).catch(() => { });
    }
  }, [favorites, user]);

  // Sync recently played with MySQL
  useEffect(() => {
    if (user?.id && recentlyPlayed.length > 0) {
      cloudSyncApi.syncProgress({
        userId: user.id,
        recent: recentlyPlayed
      }).catch(() => { });
    }
  }, [recentlyPlayed, user]);

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

  // Real-time SEO Dynamic Sync (Title, Meta Descriptions, Canonical, OG, Twitter & JSON-LD)
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nextgenn.com';

    if (selectedGame) {
      const canonical = `${origin}/game/${encodeURIComponent(toGameSlug(selectedGame))}`;
      const gameDesc = selectedGame.description
        ? (selectedGame.description.length > 160 ? `${selectedGame.description.slice(0, 157)}...` : selectedGame.description)
        : `Play ${selectedGame.title} free online in your browser on NextGenn. Fast, responsive ${selectedGame.category || 'Arcade'} game. No downloads needed.`;

      updatePageSeo({
        title: `Play ${selectedGame.title} Free Online`,
        description: gameDesc,
        keywords: `${selectedGame.title}, play ${selectedGame.title}, ${selectedGame.category || 'arcade'} games, free online games, browser games, nextgenn`,
        canonicalUrl: canonical,
        image: selectedGame.thumbnail,
        type: 'game',
        jsonLd: buildGameSchema(selectedGame)
      });
      return;
    }

    if (activeCategory && activeCategory !== 'all') {
      const catName = activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1);
      const canonical = `${origin}/category/${encodeURIComponent(activeCategory.toLowerCase())}`;
      updatePageSeo({
        title: `${catName} Games - Play Free Online`,
        description: `Explore and play the top free online ${catName} games on NextGenn. Instant gameplay on mobile, desktop, and tablets with zero downloads.`,
        keywords: `${catName} games, play ${catName} games, free online ${catName} games, browser games, nextgenn`,
        canonicalUrl: canonical,
        type: 'website',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${catName} Games`,
          description: `Top rated free online ${catName} games on NextGenn.`,
          url: canonical
        }
      });
      return;
    }

    if (activePage && activePage !== 'home') {
      const pageTitles = {
        trending: 'Trending Games - Play Popular Online Games',
        'most-played': 'Most Played Games - Top Browser Games',
        'top-rated': 'Top Rated Games - Highest Rated Online Games',
        new: 'New Games - Latest Free Online Games',
        about: 'About NextGenn - Instant Browser Gaming Platform',
        faq: 'Frequently Asked Questions (FAQ) - NextGenn',
        blog: 'Gaming News & Articles - NextGenn Blog',
        developers: 'Developer Portal - Submit Your HTML5 Game to NextGenn',
        privacy: 'Privacy Policy - NextGenn',
        terms: 'Terms of Service - NextGenn',
        contact: 'Contact Us - NextGenn',
        disclaimer: 'Disclaimer - NextGenn'
      };

      const title = pageTitles[activePage] || `${activePage.charAt(0).toUpperCase() + activePage.slice(1)} - NextGenn`;
      const canonical = `${origin}/${encodeURIComponent(activePage)}`;
      updatePageSeo({
        title,
        description: `Explore ${title} on NextGenn - the leading instant browser gaming platform.`,
        canonicalUrl: canonical,
        type: 'website'
      });
      return;
    }

    if (searchQuery) {
      updatePageSeo({
        title: `Search: "${searchQuery}" Games`,
        description: `Search results for "${searchQuery}" games on NextGenn. Play free instant games online.`,
        canonicalUrl: `${origin}/?q=${encodeURIComponent(searchQuery)}`,
        type: 'website'
      });
      return;
    }

    // Default Home SEO
    updatePageSeo({
      title: null,
      description: null,
      canonicalUrl: `${origin}/`,
      type: 'website'
    });
  }, [selectedGame, activeCategory, activePage, searchQuery]);

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
    const slug = toGameSlug(game);
    setSelectedGame(game);
    setPendingGameId(slug);

    const targetUrl = buildNavUrl(game, activeCategory, activePage, searchQuery);
    window.history.pushState({ gameId: slug, category: activeCategory, page: activePage }, '', targetUrl);

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
    const toClean = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const qClean = toClean(query);

    const matched = availableCategories.find(c => {
      const cId = toClean(c.id || c._id);
      const cName = toClean(c.name);
      return (cId && cId === qClean) || (cName && cName === qClean);
    });

    if (matched) {
      const targetCat = matched.id || matched._id || matched.name;
      setActiveCategory(targetCat);
      setSearchQuery('');
      setActivePage('home');
      const targetUrl = buildNavUrl(null, targetCat, 'home', '');
      window.history.pushState({ gameId: null, category: targetCat, page: 'home' }, '', targetUrl);
    } else {
      setActiveCategory('');
      setSearchQuery(query);
      setActivePage('home');
      const targetUrl = buildNavUrl(null, '', 'home', query);
      window.history.pushState({ gameId: null, category: '', page: 'home' }, '', targetUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [availableCategories]);

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
      const toClean = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanKey = toClean(activeCategory);
      const is2p = cleanKey === 'multiplayer' || cleanKey === '2player' || cleanKey === '2p' || cleanKey === 'twoplayer';

      const matchedCat = availableCategories.find(cat => {
        const cId = toClean(cat.id || cat._id);
        const cName = toClean(cat.name);
        return (cId && cId === cleanKey) || (cName && cName === cleanKey);
      });
      const matchedCleanName = matchedCat ? toClean(matchedCat.name) : '';

      list = list.filter(g => {
        if (!g) return false;
        const rawCat = g.category || '';
        const gCatClean = toClean(rawCat);
        const gCatSplits = rawCat.split(/[,/|]+/).map(s => toClean(s)).filter(Boolean);

        const gTags = Array.isArray(g.tags)
          ? g.tags.map(t => (typeof t === 'string' ? toClean(t) : ''))
          : (typeof g.tags === 'string' ? g.tags.split(/[,/|]+/).map(t => toClean(t)) : []);

        const matches2p = is2p && (
          gCatClean.includes('2') || gCatClean.includes('multiplayer') || gCatClean.includes('two') ||
          gTags.some(t => t.includes('2') || t.includes('multiplayer') || t.includes('two'))
        );

        const matchesCat = (
          gCatClean === cleanKey ||
          (matchedCleanName && gCatClean === matchedCleanName) ||
          gCatSplits.includes(cleanKey) ||
          (matchedCleanName && gCatSplits.includes(matchedCleanName)) ||
          (cleanKey.length >= 3 && gCatClean.includes(cleanKey)) ||
          (cleanKey.length >= 3 && cleanKey.includes(gCatClean))
        );

        const matchesTag = gTags.some(t => {
          return (
            t === cleanKey ||
            (matchedCleanName && t === matchedCleanName) ||
            (cleanKey.length >= 3 && t.includes(cleanKey)) ||
            (cleanKey.length >= 3 && cleanKey.includes(t))
          );
        });

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
  }, [activeGames, activePage, activeCategory, searchQuery, recentlyPlayed, availableCategories]);

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
                  onPlayGame={handlePlayGame}
                  allGames={activeGames}
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
                            activeCategory ? `${(availableCategories.find(c => {
                              const toClean = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                              const acClean = toClean(activeCategory);
                              return toClean(c.id || c._id) === acClean || toClean(c.name) === acClean;
                            })?.name || activeCategory).toUpperCase()} GAMES` :
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

