import React, { useState, useMemo, memo, useEffect, useRef, useCallback } from 'react';
import { Gamepad2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import GameCard from './GameCard';
import { sounds } from '../utils/audio';
import { renderCategorySvgIcon, getDimmedCategoryColor } from '../utils/categoryIcons';

const DEFAULT_QUICK_CATEGORIES = [
  { id: 'all', name: 'All Games', icon: 'gamepad' },
  { id: 'arcade', name: 'Arcade', icon: 'arcade' },
  { id: 'action', name: 'Action', icon: 'action' },
  { id: 'puzzle', name: 'Puzzle', icon: 'puzzle' },
  { id: 'classic', name: 'Classic', icon: 'classic' },
  { id: 'sports', name: 'Sports', icon: 'sports' },
  { id: 'cyber', name: 'Cyberpunk', icon: 'cyber' }
];

const BATCH_SIZE = 28;

const GameGrid = memo(function GameGrid({
  title,
  games = [],
  allGames = [],
  onPlayGame,
  favorites = [],
  onToggleFavorite,
  activeCategory = '',
  onSelectCategory,
  activePage = 'home',
  searchQuery = '',
  onOpenAuth,
  onFocusSearch,
  user,
  categories = [],
  activeGameCounts = {}
}) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  // Reset visible count when games list changes (category / search change)
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeCategory, searchQuery]);

  const displayedGames = useMemo(() => {
    if (!games || games.length === 0) return [];
    return games.slice(0, visibleCount);
  }, [games, visibleCount]);

  const hasMore = visibleCount < games.length;

  // Load next batch
  const loadMore = useCallback(() => {
    if (isLoading || visibleCount >= games.length) return;
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + BATCH_SIZE, games.length));
      setIsLoading(false);
    }, 350);
  }, [isLoading, visibleCount, games.length]);

  // Setup IntersectionObserver on sentinel div
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '200px', threshold: 0 }
    );

    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);

    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, [loadMore]);

  const quickCatList = useMemo(() => {
    if (categories && categories.length > 0) return categories;
    return DEFAULT_QUICK_CATEGORIES;
  }, [categories]);

  // Horizontal Category Scroll State & Handlers
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const hasDragged = useRef(false);

  const checkScrollButtons = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const tolerance = 6;
    setCanScrollLeft(el.scrollLeft > tolerance);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - tolerance);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScrollButtons();

    const handleResize = () => checkScrollButtons();
    window.addEventListener('resize', handleResize);
    el.addEventListener('scroll', checkScrollButtons, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      el.removeEventListener('scroll', checkScrollButtons);
    };
  }, [checkScrollButtons, quickCatList]);

  // Mouse wheel horizontal scroll conversion
  const handleWheel = (e) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      if ((e.deltaY > 0 && canScrollRight) || (e.deltaY < 0 && canScrollLeft)) {
        e.preventDefault();
        el.scrollBy({ left: e.deltaY * 1.6, behavior: 'smooth' });
      }
    }
  };

  // Step scroll via Left/Right Arrow buttons
  const handleScrollStep = (direction) => {
    sounds.playClick();
    const el = scrollContainerRef.current;
    if (!el) return;
    const step = 320;
    el.scrollBy({ left: direction === 'left' ? -step : step, behavior: 'smooth' });
  };

  // Mouse drag-to-scroll handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    setIsDragging(true);
    hasDragged.current = false;
    dragStartX.current = e.pageX - el.offsetLeft;
    dragScrollLeft.current = el.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragStartX.current) * 1.5;
    if (Math.abs(walk) > 6) {
      hasDragged.current = true;
    }
    el.scrollLeft = dragScrollLeft.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Auto-scroll active category pill into center view
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const timer = setTimeout(() => {
      const activeBtn = el.querySelector('.category-quick-pill.active');
      if (activeBtn) {
        const btnLeft = activeBtn.offsetLeft;
        const btnWidth = activeBtn.offsetWidth;
        const containerWidth = el.clientWidth;
        const targetScroll = btnLeft - (containerWidth / 2) + (btnWidth / 2);
        el.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [activeCategory]);

  return (
    <section className="gamepix-category-grid-section">
      {/* Quick Category Chips Bar with Smooth Scrolling & Left/Right Arrows */}
      <div className={`quick-cat-scroll-wrapper ${canScrollLeft ? 'has-left-overflow' : ''} ${canScrollRight ? 'has-right-overflow' : ''}`}>
        {canScrollLeft && (
          <button
            type="button"
            className="quick-cat-arrow-btn left"
            onClick={() => handleScrollStep('left')}
            aria-label="Scroll categories left"
          >
            <ChevronLeft size={20} strokeWidth={2.4} />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className={`quick-cat-scroll-bar ${isDragging ? 'is-dragging' : ''}`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        >
          {quickCatList.map(cat => {
            const catIdNorm = (cat.id || cat._id || '').toLowerCase().trim();
            const activeCatNorm = (activeCategory || '').toLowerCase().trim();
            const isAllCat = catIdNorm === 'all' || catIdNorm === '';
            const isActive = isAllCat
              ? (!activeCatNorm || activeCatNorm === 'all')
              : (activeCatNorm === catIdNorm || (cat.name && activeCatNorm === cat.name.toLowerCase().trim()));

            const rawColor = cat.color || (isAllCat ? '#10b981' : '#3b82f6');
            const catColor = getDimmedCategoryColor(rawColor);
            const rawName = cat.name || 'Category';
            const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

            return (
              <button
                key={cat.id || cat._id || 'all'}
                className={`category-quick-pill ${isActive ? 'active' : ''}`}
                style={{
                  '--cat-color': catColor,
                  ...(isActive ? {
                    background: `linear-gradient(135deg, ${catColor}, ${catColor}e6)`,
                    borderColor: catColor,
                    boxShadow: `0 4px 14px -1px ${catColor}55`,
                    color: '#ffffff'
                  } : {
                    borderColor: `${catColor}38`,
                    background: '#ffffff'
                  })
                }}
                onClick={(e) => {
                  if (hasDragged.current) {
                    e.preventDefault();
                    return;
                  }
                  sounds.playClick();
                  if (onSelectCategory) onSelectCategory(isAllCat ? '' : (cat.id || cat._id));
                }}
              >
                <span
                  className="pill-icon-container"
                  style={{
                    background: isActive ? 'rgba(255, 255, 255, 0.24)' : `${catColor}14`,
                    color: isActive ? '#ffffff' : catColor
                  }}
                >
                  {renderCategorySvgIcon(cat, 18)}
                </span>
                <span className="pill-name-text">
                  {displayName}
                </span>
              </button>
            );
          })}
        </div>

        {canScrollRight && (
          <button
            type="button"
            className="quick-cat-arrow-btn right"
            onClick={() => handleScrollStep('right')}
            aria-label="Scroll categories right"
          >
            <ChevronRight size={20} strokeWidth={2.4} />
          </button>
        )}
      </div>

      {/* Grid Header */}
      <div className={`grid-header-row ${searchQuery ? 'is-search-result' : ''}`}>
        <div className="grid-title-group">
          <h2 className="grid-main-title sky-brand-heading">
            {searchQuery ? (
              <>Search Results for: <span className="highlight-text">"{searchQuery}"</span></>
            ) : (
              title || (activeCategory ? `${activeCategory.toUpperCase()} GAMES` : 'All Games')
            )}
          </h2>
          {games.length > 0 && (
            <span style={{
              fontSize: '0.78rem', color: '#64748b', fontWeight: '600',
              marginLeft: '10px', background: '#f1f5f9',
              padding: '2px 10px', borderRadius: '20px', letterSpacing: '0.02em'
            }}>
              {displayedGames.length} / {games.length}
            </span>
          )}
        </div>
      </div>

      {/* Main Game Cards Grid */}
      <div className="game-cards-masonry-grid poki-masonry-grid">
        {displayedGames.map((game, index) => {
          // Automatic Masonry Gallery Sizing:
          // Games never need manual width/height configuration!
          // 1. If explicit '2x2' or '2x1' is set by admin, honor it.
          // 2. If game is featured, it automatically gets prominent '2x2' hero spotlight.
          // 3. Automated visual masonry rhythm: periodic hero cards (index 0, index % 14 === 7)
          // 4. All other games automatically format into clean '1x1' squircle tiles.
          let sizeVariant = '1x1';
          const explicitSize = game.tileSize && game.tileSize !== 'auto' ? String(game.tileSize).toLowerCase().trim() : null;

          if (explicitSize === '2x2' || explicitSize === '2x1') {
            sizeVariant = explicitSize;
          } else if (game.featured) {
            sizeVariant = '2x2';
          } else if (!searchQuery && (index === 0 || (index > 0 && index % 14 === 7))) {
            sizeVariant = '2x2';
          } else {
            sizeVariant = '1x1';
          }

          const gameId = game.id || game._id;
          const liveCount = (activeGameCounts && (activeGameCounts[gameId] || activeGameCounts[game.id] || activeGameCounts[game._id])) || 0;

          return (
            <GameCard
              key={game.id || game._id || index}
              game={game}
              onPlay={onPlayGame}
              isFavorite={(favorites || []).includes(game.id || game._id)}
              onToggleFavorite={onToggleFavorite}
              sizeVariant={sizeVariant}
              priority={index < 12}
              livePlayersCount={liveCount}
            />
          );
        })}
      </div>

      {/* Infinite Scroll Sentinel — invisible trigger div */}
      {hasMore && <div ref={sentinelRef} style={{ height: '1px' }} />}

      {/* Loading Spinner */}
      {isLoading && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '10px', padding: '28px 0 16px',
          color: '#4facfe', fontWeight: '700', fontSize: '0.95rem'
        }}>
          <Loader2 size={26} color="#4facfe" style={{ animation: 'spin 0.8s linear infinite' }} />
          Loading more games…
        </div>
      )}

      {/* All Loaded Footer */}
      {!hasMore && games.length > BATCH_SIZE && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '10px', padding: '22px 0 10px',
          color: '#94a3b8', fontSize: '0.82rem', fontWeight: '600', letterSpacing: '0.04em'
        }}>
          <span style={{ display: 'inline-block', width: 40, height: 1, background: '#e2e8f0' }} />
          All {games.length} games loaded
          <span style={{ display: 'inline-block', width: 40, height: 1, background: '#e2e8f0' }} />
        </div>
      )}

      {/* Empty State */}
      {games.length === 0 && (
        <div className="empty-grid-state" style={{
          padding: '50px 24px', textAlign: 'center', background: '#ffffff',
          borderRadius: '24px', border: '1.5px dashed #cbd5e1',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)', margin: '10px 0 30px'
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(37,99,235,0.2)'
          }}>
            <Gamepad2 size={38} color="#2563eb" />
          </div>
          <h3 style={{ fontSize: '1.35rem', color: '#0f172a', marginBottom: '8px', fontWeight: '800' }}>
            {searchQuery
              ? `No games found for "${searchQuery}"`
              : activeCategory
              ? `No games in "${activeCategory.toUpperCase()}" yet`
              : 'No games available'}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: '420px', margin: '0 auto 20px', lineHeight: '1.5' }}>
            {searchQuery
              ? 'Try searching with another keyword or click any category pill above to explore more games.'
              : 'Games under this category will be available soon. Select another category above or view all games.'}
          </p>
          <button
            onClick={() => { sounds.playClick(); if (onSelectCategory) onSelectCategory(''); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
              border: 'none', borderRadius: '50px', color: '#0a1024',
              fontSize: '0.88rem', fontWeight: '800', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,242,254,0.3)', transition: 'all 0.2s ease'
            }}
          >
            <Gamepad2 size={16} />
            <span>View All Games</span>
          </button>
        </div>
      )}
    </section>
  );
});

export default GameGrid;
