import React, { useState, useMemo, useEffect } from 'react';
import { CONFIG } from '../config';
import {
  ArrowLeft, BookOpen, Flame, Sparkles, Trophy, Zap, Gamepad2,
  Clock, Tag, User, ChevronRight, Search, Star, TrendingUp,
  Monitor, Smartphone, Globe2, Shield, Calendar, Eye, MessageSquare,
  Share2, Heart, ArrowUpRight, Newspaper, Users
} from 'lucide-react';
import { sounds } from '../utils/audio';

function formatPostDate(post) {
  if (!post) return '';
  if (post.date) return post.date;
  if (post.createdAt) {
    try {
      const d = new Date(post.createdAt);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch {}
  }
  return 'Recent';
}

function getBlogImageUrl(img) {
  if (!img) return '';
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
    return img;
  }
  const base = (CONFIG?.API_BASE || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
  return `${base}${img.startsWith('/') ? '' : '/'}${img}`;
}

function formatInlineMarkdown(text) {
  if (!text) return '';
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((p, pi) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={pi} style={{ color: '#0f172a', fontWeight: 800 }}>{p.slice(2, -2)}</strong>;
    }
    if (p.startsWith('*') && p.endsWith('*')) {
      return <em key={pi}>{p.slice(1, -1)}</em>;
    }
    return p;
  });
}

function renderContent(md) {
  if (!md) return null;
  const lines = md.split('\n');
  const elements = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for Markdown image: ![alt](url)
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      const alt = imgMatch[1];
      const src = getBlogImageUrl(imgMatch[2]);
      elements.push(
        <figure key={i} style={{ margin: '28px 0', textAlign: 'center' }}>
          <img
            src={src}
            alt={alt || 'Article visual'}
            style={{
              maxWidth: '100%',
              maxHeight: '520px',
              borderRadius: 14,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              display: 'block',
              margin: '0 auto',
              objectFit: 'cover'
            }}
            loading="lazy"
          />
          {alt && (
            <figcaption style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 8, fontStyle: 'italic' }}>
              {alt}
            </figcaption>
          )}
        </figure>
      );
    } else if (trimmed.startsWith('### ')) {
      elements.push(<h3 key={i} style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '26px 0 10px' }}>{formatInlineMarkdown(trimmed.slice(4))}</h3>);
    } else if (trimmed.startsWith('## ')) {
      elements.push(<h2 key={i} style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '32px 0 12px', borderBottom: '2px solid #e2e8f0', paddingBottom: 8 }}>{formatInlineMarkdown(trimmed.slice(3))}</h2>);
    } else if (trimmed.startsWith('# ')) {
      elements.push(<h2 key={i} style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', margin: '34px 0 14px' }}>{formatInlineMarkdown(trimmed.slice(2))}</h2>);
    } else if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={i} style={{ borderLeft: '4px solid #3b82f6', margin: '18px 0', padding: '10px 18px', background: '#f8fafc', color: '#1e293b', fontStyle: 'italic', borderRadius: '0 10px 10px 0' }}>
          {formatInlineMarkdown(trimmed.slice(2))}
        </blockquote>
      );
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      elements.push(<p key={i} style={{ fontWeight: 800, color: '#0f172a', margin: '10px 0 4px' }}>{trimmed.slice(2, -2)}</p>);
    } else if (/^\d+\. /.test(trimmed)) {
      elements.push(<li key={i} style={{ color: '#334155', lineHeight: 1.8, marginBottom: 6, marginLeft: 20 }}>{formatInlineMarkdown(trimmed.replace(/^\d+\. /, ''))}</li>);
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(<li key={i} style={{ color: '#334155', lineHeight: 1.8, marginBottom: 6, marginLeft: 20, listStyle: 'disc' }}>{formatInlineMarkdown(trimmed.slice(2))}</li>);
    } else if (trimmed.startsWith('| ')) {
      const cells = trimmed.split('|').filter(c => c.trim() && !c.match(/^[-:| ]+$/));
      if (cells.length > 0) {
        elements.push(
          <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
            {cells.map((c, ci) => (
              <td key={ci} style={{ padding: '8px 14px', color: '#334155', fontSize: '0.9rem' }}>{formatInlineMarkdown(c.trim())}</td>
            ))}
          </tr>
        );
      }
    } else if (trimmed) {
      // Check if line contains inline image
      if (/!\[.*?\]\(.*?\)/.test(trimmed)) {
        const parts = trimmed.split(/(!\[.*?\]\(.*?\))/g);
        elements.push(
          <div key={i} style={{ margin: '18px 0', textAlign: 'center' }}>
            {parts.map((p, pi) => {
              const m = p.match(/^!\[(.*?)\]\((.*?)\)$/);
              if (m) {
                return (
                  <img
                    key={pi}
                    src={getBlogImageUrl(m[2])}
                    alt={m[1] || ''}
                    style={{ maxWidth: '100%', maxHeight: '480px', borderRadius: 12, margin: '8px auto', display: 'block' }}
                  />
                );
              }
              return <span key={pi}>{formatInlineMarkdown(p)}</span>;
            })}
          </div>
        );
      } else {
        elements.push(<p key={i} style={{ color: '#475569', lineHeight: 1.85, margin: '14px 0', fontSize: '1.02rem' }}>{formatInlineMarkdown(trimmed)}</p>);
      }
    } else {
      elements.push(<div key={i} style={{ height: 8 }} />);
    }
    i++;
  }
  return elements;
}

// ─── Article Detail View ──────────────────────────────────────────────────────
function ArticleDetail({ post, onBack }) {
  const displayDate = formatPostDate(post);

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 0 60px' }}>
      {/* Back Button */}
      <button
        onClick={() => { sounds.playClick(); onBack(); }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#f1f5f9', border: '1.5px solid #e2e8f0',
          borderRadius: 50, padding: '8px 20px', cursor: 'pointer',
          color: '#475569', fontWeight: 700, fontSize: '0.85rem',
          marginBottom: 24, transition: 'all 0.2s'
        }}
      >
        <ArrowLeft size={16} /> Back to Blog
      </button>

      {/* Featured Cover Banner (Clean without text overlay) */}
      {(post.image || post.gradient) && (
        <div style={{
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 24,
          maxHeight: 440,
          width: '100%',
          background: post.gradient || '#0f172a',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          {post.image ? (
            <img
              src={getBlogImageUrl(post.image)}
              alt={post.title}
              style={{
                width: '100%',
                maxHeight: 440,
                objectFit: 'cover',
                display: 'block'
              }}
            />
          ) : (
            <div style={{ height: 220, background: post.gradient }} />
          )}
        </div>
      )}

      {/* Article Header & Metadata (Below the Banner) */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.3rem)',
          fontWeight: 900,
          color: '#0f172a',
          lineHeight: 1.3,
          margin: '0 0 16px'
        }}>
          {post.title}
        </h1>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          alignItems: 'center',
          paddingBottom: 18,
          borderBottom: '1px solid #e2e8f0'
        }}>
          {[
            { icon: <User size={14} />, text: post.author || 'NextGenn Editorial' },
            { icon: <Calendar size={14} />, text: displayDate },
            { icon: <Clock size={14} />, text: post.readTime || '3 min read' },
            { icon: <Eye size={14} />, text: `${post.views || 0} views` },
          ].map((m, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '0.84rem', fontWeight: 600 }}>
              {m.icon} {m.text}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{
        fontSize: '1rem',
        lineHeight: 1.85,
        color: '#334155'
      }}>
        {renderContent(post.content)}
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20 }}>
        {(post.tags || []).map(tag => (
          <span key={tag} style={{
            background: '#f1f5f9', border: '1px solid #e2e8f0',
            borderRadius: 50, padding: '4px 14px',
            fontSize: '0.78rem', fontWeight: 700, color: '#64748b',
            display: 'flex', alignItems: 'center', gap: 4
          }}>
            <Tag size={11} /> {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Blog Card ────────────────────────────────────────────────────────────────
function BlogCard({ post, onClick, featured = false }) {
  const displayDate = formatPostDate(post);

  if (featured) {
    return (
      <div
        onClick={() => { sounds.playClick(); onClick(post); }}
        style={{
          background: post.image ? `url(${getBlogImageUrl(post.image)}) center/cover no-repeat` : post.gradient,
          borderRadius: 24, padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 44px)', minHeight: 300,
          cursor: 'pointer', gridColumn: '1 / -1', position: 'relative', overflow: 'hidden',
          transition: 'transform 0.25s, box-shadow 0.25s',
          boxShadow: '0 8px 40px rgba(99,102,241,0.2)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 60px rgba(99,102,241,0.3)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(99,102,241,0.2)'; }}
      >
        {post.image && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 100%)' }} />}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.22)', borderRadius: 50, padding: '4px 14px',
            backdropFilter: 'blur(8px)', marginBottom: 14
          }}>
            <Star size={12} color="#fff" fill="#fff" />
            <span style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Featured Post</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.8rem)', fontWeight: 900, color: '#fff', lineHeight: 1.25, marginBottom: 14, maxWidth: 680 }}>
            {post.title}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.65, maxWidth: 620, marginBottom: 24, fontSize: '0.97rem' }}>
            {post.excerpt}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center', marginBottom: 20 }}>
            {[
              { icon: <User size={13} />, text: post.author || 'NextGenn Editorial' },
              { icon: <Calendar size={13} />, text: displayDate },
              { icon: <Clock size={13} />, text: post.readTime || '3 min read' },
              { icon: <Eye size={13} />, text: `${post.views || 0} views` },
            ].map((m, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.88)', fontSize: '0.8rem', fontWeight: 600 }}>
                {m.icon} {m.text}
              </span>
            ))}
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,0.95)', borderRadius: 50, padding: '9px 22px',
            color: '#0f172a', fontWeight: 800, fontSize: '0.88rem', marginTop: 8
          }}>
            Read Full Article <ArrowUpRight size={15} />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => { sounds.playClick(); onClick(post); }}
      style={{
        background: '#fff', borderRadius: 18, overflow: 'hidden',
        border: '1.5px solid #e2e8f0', cursor: 'pointer',
        transition: 'all 0.22s ease', boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
    >
      {/* Header Image */}
      <div style={{ background: post.image ? `url(${getBlogImageUrl(post.image)}) center/cover no-repeat` : post.gradient, height: 180, position: 'relative' }}>
        {post.image && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)' }} />}
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px 20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, marginBottom: 8 }}>
          {post.title}
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.excerpt}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8', fontSize: '0.74rem', fontWeight: 600 }}>
              <Clock size={11} /> {post.readTime || '3 min read'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8', fontSize: '0.74rem', fontWeight: 600 }}>
              <Eye size={11} /> {post.views || 0}
            </span>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6366f1', fontSize: '0.78rem', fontWeight: 800 }}>
            Read <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main BlogPage ────────────────────────────────────────────────────────────
export default function BlogPage({ onBackToHome }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  const fetchPosts = () => {
    const API_BASE = (CONFIG?.API_BASE || 'http://localhost:5000/api').replace(/\/+$/, '');
    fetch(`${API_BASE}/blog?_t=${Date.now()}`)
      .then(r => { if (!r.ok) throw new Error('API error'); return r.json(); })
      .then(data => {
        if (Array.isArray(data)) {
          setPosts(data);
          setApiError(false);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch blog posts:', err);
        setApiError(true);
      })
      .finally(() => { setLoading(false); });
  };

  // Fetch on mount & visibility focus events
  useEffect(() => {
    fetchPosts();

    // Auto-refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchPosts();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', fetchPosts);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', fetchPosts);
    };
  }, []);

  const featuredPost = useMemo(() => {
    if (searchQuery.trim()) return null;
    return posts.find(p => p.featured) || (posts.length > 0 ? posts[0] : null);
  }, [posts, searchQuery]);

  const filteredPosts = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return posts.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        (Array.isArray(p.tags) ? p.tags.some(t => t.toLowerCase().includes(q)) : false)
      );
    }
    if (featuredPost) {
      return posts.filter(p => (p.id || p._id) !== (featuredPost.id || featuredPost._id));
    }
    return posts;
  }, [searchQuery, posts, featuredPost]);

  if (selectedPost) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px 16px' }}>
        <ArticleDetail post={selectedPost} onBack={() => setSelectedPost(null)} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 60 }}>

      {/* ── Page Hero ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        padding: 'clamp(36px, 6vw, 52px) clamp(16px, 4vw, 24px) clamp(32px, 5vw, 48px)',
        textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: -60, left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: '8%', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,172,254,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          borderRadius: 50, padding: '6px 18px', marginBottom: 18
        }}>
          <Newspaper size={14} color="#fff" />
          <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            NextGenn Blog
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.8rem)', fontWeight: 900, color: '#fff', marginBottom: 14, lineHeight: 1.15 }}>
          Gaming News &amp; Tips
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.6 }}>
          Expert guides, industry news, game reviews, and tips to level up your gaming experience.
        </p>

        {/* Search Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.15)',
          borderRadius: 50, padding: '10px 20px', maxWidth: 440, width: '100%', margin: '0 auto',
          backdropFilter: 'blur(12px)', boxSizing: 'border-box'
        }}>
          <Search size={16} color="rgba(255,255,255,0.5)" />
          <input
            type="text"
            placeholder="Search articles…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#fff', fontSize: '0.9rem', fontWeight: 600, minWidth: 0
            }}
          />
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(20px, 4vw, 36px) clamp(12px, 3vw, 20px) 0' }}>

        {/* Loading spinner */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>⏳</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Loading articles...</div>
          </div>
        )}

        {/* Featured Post */}
        {!loading && !searchQuery && featuredPost && (
          <div style={{ marginBottom: 32, display: 'grid', gridTemplateColumns: '1fr' }}>
            <BlogCard post={featuredPost} onClick={setSelectedPost} featured />
          </div>
        )}

        {/* Article Grid */}
        {!loading && (
          filteredPosts.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
              gap: 20
            }}>
              {filteredPosts.map(post => (
                <BlogCard key={post.id} post={post} onClick={setSelectedPost} />
              ))}
            </div>
          ) : !featuredPost ? (
            <div style={{
              textAlign: 'center', padding: '60px 24px',
              background: '#fff', borderRadius: 20,
              border: '1.5px dashed #cbd5e1'
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                No articles found
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                {searchQuery ? 'Try a different search keyword.' : 'Check back soon for new gaming guides and stories!'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 7,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff', border: 'none', borderRadius: 50, padding: '10px 24px',
                    fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer'
                  }}
                >
                  View All Posts
                </button>
              )}
            </div>
          ) : null
        )}

        {/* Stats Bar */}
        <div style={{
          marginTop: 48, display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center'
        }}>
          {[
            { label: 'Articles Published', value: String(posts.length) + '+', icon: <BookOpen size={18} />, color: '#6366f1' },
            { label: 'Monthly Readers', value: '120K+', icon: <Users size={18} />, color: '#ef4444' },
            { label: 'Topics Covered', value: '10+', icon: <Tag size={18} />, color: '#f59e0b' },
            { label: 'New Posts Weekly', value: '5+', icon: <Sparkles size={18} />, color: '#10b981' },
          ].map((s, i) => (
            <div key={i} style={{
              background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16,
              padding: '18px 26px', display: 'flex', alignItems: 'center', gap: 14,
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)', minWidth: 200
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: s.color
              }}>
                {s.icon}  
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
