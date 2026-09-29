import React, { useState, useEffect, useMemo, useRef, memo } from 'react';
import { Search, X, Menu, ArrowLeft } from 'lucide-react';
import { sounds } from '../utils/audio';

const NextGennNavbar = memo(function NextGennNavbar({
  searchQuery,
  setSearchQuery,
  activeCategory,
  onSelectCategory,
  searchInputRef,
  games = [],
  onSelectGame,
  onOpenAuth,
  user,
  onToggleSidebar,
  onOpenSidebar,
  onCloseSidebar,
  level = 1,
  activePage
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const mobileSearchInputRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const searchResults = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return [];
    return games.filter(g =>
      (g.title || '').toLowerCase().includes(q) ||
      (g.category && g.category.toLowerCase().includes(q)) ||
      (g.tags && g.tags.some(t => t.toLowerCase().includes(q)))
    ).slice(0, 6);
  }, [searchQuery, games]);

  return (
    <header className={`sky-advanced-navbar${isScrolled ? ' scrolled' : ''}`}>
      <div className="sky-navbar-wrapper">
        {/* Mobile Full-Width Search Bar Mode (When search icon is tapped on mobile) */}
        {isMobileSearchOpen ? (
          <div className="sky-mobile-search-full-bar">
            <button
              className="sky-mobile-search-back-btn"
              onClick={() => {
                sounds.playClick();
                setIsMobileSearchOpen(false);
                setSearchQuery('');
              }}
              title="Close search"
              aria-label="Close search"
            >
              <ArrowLeft size={20} />
            </button>

            <input
              ref={mobileSearchInputRef}
              type="text"
              className="sky-mobile-search-input"
              placeholder="Search 500+ games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search games"
            />

            {searchQuery && (
              <button
                className="sky-mobile-search-clear-btn"
                onClick={() => {
                  sounds.playClick();
                  setSearchQuery('');
                  if (mobileSearchInputRef?.current) mobileSearchInputRef.current.focus();
                }}
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}

            {/* Mobile Dropdown Auto-complete */}
            {searchResults.length > 0 && (
              <div className="sky-search-dropdown mobile-dropdown">
                <div className="sky-dropdown-header">
                  <span>Quick Results ({searchResults.length})</span>
                </div>
                {searchResults.map((game) => (
                  <div
                    key={game.id || game._id}
                    className="sky-dropdown-item"
                    onMouseDown={() => {
                      sounds.playClick();
                      if (onSelectGame) onSelectGame(game);
                      setSearchQuery('');
                      setIsMobileSearchOpen(false);
                    }}
                  >
                    <img
                      src={game.thumbnail || game.thumbnailUrl || game.thumb || game.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80'}
                      alt={game.title}
                      className="sky-dropdown-thumb"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="sky-dropdown-info">
                      <span className="sky-dropdown-title">{game.title}</span>
                      <span className="sky-dropdown-cat">{game.category || 'Arcade'}</span>
                    </div>
                    <span className="sky-dropdown-play">PLAY ▶</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Main Standard Navbar Row */
          <div className="sky-navbar-main-row">

            <div className="sky-navbar-left-group">
              <div className="sky-brand-wrapper">
                {/* 1. GamePix Sidebar Menu Toggle Button */}
                {!['about', 'privacy', 'terms', 'contact', 'disclaimer', 'developers'].includes(activePage) && (
                  <button
                    className="gamepix-menu-toggle-btn"
                    onClick={() => {
                      sounds.playClick();
                      if (onToggleSidebar) onToggleSidebar();
                    }}
                      title="Toggle sidebar menu"
                      aria-label="Toggle sidebar menu"
                    >
                      <Menu size={22} />
                    </button>
                  )}

                  {/* 2. Standalone Advanced Brand Logo */}
                  <div
                    className="sky-standalone-logo"
                    onClick={() => {
                      sounds.playClick();
                      onSelectCategory('');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    title="NextGenn Arcade - Home"
                  >
                    <img
                      src="/nextgenn-full.png"
                      alt="NextGenn"
                      className="sky-navbar-brand-full-img"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Desktop Advanced Search Input Bar (Visible only on Desktop/Tablet > 768px) */}
              <div className={`sky-advanced-search-box desktop-only-search ${isFocused ? 'focused' : ''}`}>
                <div className="sky-search-lens-wrapper">
                  <Search size={20} className="sky-search-lens-icon" />
                </div>

                <input
                  ref={searchInputRef}
                  type="text"
                  className="sky-advanced-search-input"
                  placeholder="Search 500+ games, action, racing, 2-player..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 250)}
                  aria-label="Search games"
                />

                {searchQuery ? (
                <button
                  className="sky-search-clear-btn"
                  onClick={() => {
                    setSearchQuery('');
                    if (searchInputRef?.current) searchInputRef.current.focus();
                  }}
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              ) : (
                <span className="sky-search-shortcut-tag" title="Search shortcut">/</span>
              )}

              {/* Predictive Autocomplete Search Dropdown */}
              {isFocused && searchResults.length > 0 && (
                <div className="sky-search-dropdown">
                  <div className="sky-dropdown-header">
                    <span>Quick Results ({searchResults.length})</span>
                  </div>
                  {searchResults.map((game) => (
                    <div
                      key={game.id || game._id}
                      className="sky-dropdown-item"
                      onMouseDown={() => {
                        sounds.playClick();
                        if (onSelectGame) onSelectGame(game);
                        setSearchQuery('');
                      }}
                    >
                      <img
                        src={game.thumbnail || game.thumbnailUrl || game.thumb || game.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80'}
                        alt={game.title}
                        className="sky-dropdown-thumb"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="sky-dropdown-info">
                        <span className="sky-dropdown-title">{game.title}</span>
                        <span className="sky-dropdown-cat">{game.category || 'Arcade'}</span>
                      </div>
                      <span className="sky-dropdown-play">PLAY ▶</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Mobile-Only Search Icon Button (Visible only on Mobile <= 768px) */}
            <button
              className="sky-mobile-search-icon-btn"
              onClick={() => {
                sounds.playClick();
                setIsMobileSearchOpen(true);
                setTimeout(() => {
                  if (mobileSearchInputRef.current) mobileSearchInputRef.current.focus();
                }, 80);
              }}
              title="Search games"
              aria-label="Search games"
            >
              <Search size={19} />
            </button>

          </div>
        )}
      </div>
    </header>
  );
});

export default NextGennNavbar;

