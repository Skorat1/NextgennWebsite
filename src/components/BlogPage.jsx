import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { CONFIG } from '../config';
import {
  ArrowLeft, BookOpen, Flame, Sparkles, Trophy, Zap, Gamepad2,
  Clock, Tag, User, ChevronRight, Search, Star, TrendingUp,
  Monitor, Smartphone, Globe2, Shield, Calendar, Eye, MessageSquare,
  Share2, Heart, ArrowUpRight, Newspaper, Users, Play, Check, Copy, ExternalLink
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { updatePageSeo, toGameSlug } from '../utils/seo';

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

// ─── Inline Markdown Parser ──────────────────────────────────────────────────
function formatInlineMarkdown(text) {
  if (!text) return '';
  // Tokenize bold, italic, code, and markdown links [text](url)
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} style={{ color: '#0f172a', fontWeight: 800 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic: *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    // Inline Code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={index}
          style={{
            background: '#f1f5f9',
            color: '#e11d48',
            padding: '2px 6px',
            borderRadius: 5,
            fontSize: '0.88em',
            fontFamily: 'Consolas, Monaco, monospace'
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Markdown Link: [text](url)
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#4f46e5',
            textDecoration: 'underline',
            fontWeight: 700
          }}
        >
          {linkMatch[1]}
        </a>
      );
    }

    return part;
  });
}

// ─── Full Article Content Renderer ──────────────────────────────────────────
function renderContent(rawContent) {
  if (!rawContent) return null;

  // Check if content is pre-rendered HTML
  const isHtml = /<[a-z][\s\S]*>/i.test(rawContent);
  if (isHtml) {
    return (
      <div
        className="blog-rendered-html"
        style={{
          lineHeight: 1.85,
          color: '#334155',
          fontSize: '1.03rem'
        }}
        dangerouslySetInnerHTML={{ __html: rawContent }}
      />
    );
  }

  const lines = rawContent.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Markdown image: ![alt](url)
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      const alt = imgMatch[1];
      const src = getBlogImageUrl(imgMatch[2]);
      elements.push(
        <figure key={`img-${i}`} style={{ margin: '28px 0', textAlign: 'center' }}>
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
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          {alt && (
            <figcaption style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 8, fontStyle: 'italic' }}>
              {alt}
            </figcaption>
          )}
        </figure>
      );
      i++;
      continue;
    }

    // 2. Headings (#, ##, ###)
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '28px 0 10px' }}>
          {formatInlineMarkdown(trimmed.slice(4))}
        </h3>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '34px 0 14px', borderBottom: '2px solid #e2e8f0', paddingBottom: 8 }}>
          {formatInlineMarkdown(trimmed.slice(3))}
        </h2>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h2 key={`h1-${i}`} style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '36px 0 16px' }}>
          {formatInlineMarkdown(trimmed.slice(2))}
        </h2>
      );
      i++;
      continue;
    }

    // 3. Blockquotes (> )
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={`bq-${i}`} style={{ borderLeft: '4px solid #6366f1', margin: '20px 0', padding: '12px 20px', background: '#f8fafc', color: '#1e293b', fontStyle: 'italic', borderRadius: '0 12px 12px 0' }}>
          {formatInlineMarkdown(trimmed.slice(2))}
        </blockquote>
      );
      i++;
      continue;
    }

    // 4. Group consecutive Unordered Lists (- or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const listItems = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        listItems.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ margin: '14px 0 18px 24px', paddingLeft: 0, listStyleType: 'disc' }}>
          {listItems.map((item, idx) => (
            <li key={idx} style={{ color: '#334155', lineHeight: 1.85, marginBottom: 6 }}>
              {formatInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 5. Group consecutive Ordered Lists (1. , 2. )
    if (/^\d+\. /.test(trimmed)) {
      const listItems = [];
      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\. /, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} style={{ margin: '14px 0 18px 24px', paddingLeft: 0 }}>
          {listItems.map((item, idx) => (
            <li key={idx} style={{ color: '#334155', lineHeight: 1.85, marginBottom: 6 }}>
              {formatInlineMarkdown(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 6. Group Table rows (| ... |)
    if (trimmed.startsWith('|')) {
      const tableRows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const rowLine = lines[i].trim();
        if (!rowLine.match(/^\|[-:| ]+\|$/)) {
          const cells = rowLine.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
          if (cells.length > 0) {
            tableRows.push(cells);
          }
        }
        i++;
      }

      if (tableRows.length > 0) {
        const headerRow = tableRows[0];
        const bodyRows = tableRows.slice(1);
        elements.push(
          <div key={`table-${i}`} style={{ overflowX: 'auto', margin: '24px 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  {headerRow.map((cell, ci) => (
                    <th key={ci} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                      {formatInlineMarkdown(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, ri) => (
                  <tr key={ri} style={{ borderBottom: '1px solid #f1f5f9', background: ri % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{ padding: '9px 14px', color: '#334155', fontSize: '0.88rem' }}>
                        {formatInlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // 7. Regular paragraphs
    if (trimmed) {
      elements.push(
        <p key={`p-${i}`} style={{ color: '#475569', lineHeight: 1.85, margin: '14px 0', fontSize: '1.02rem' }}>
          {formatInlineMarkdown(trimmed)}
        </p>
      );
    } else {
      elements.push(<div key={`sp-${i}`} style={{ height: 10 }} />);
    }

    i++;
  }

  return elements;
}

// ─── Article Detail View ──────────────────────────────────────────────────────
function ArticleDetail({ post, onBack, onPlayGame, allGames = [] }) {
  const displayDate = formatPostDate(post);
  const [copied, setCopied] = useState(false);

  // Sync SEO for specific article
  useEffect(() => {
    if (post) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nextgenn.com';
      const canonical = `${origin}/blog?article=${encodeURIComponent(post.id || post._id)}`;
      const postImage = getBlogImageUrl(post.image);

      updatePageSeo({
        title: `${post.title} - NextGenn Gaming Blog`,
        description: post.excerpt || (post.content ? post.content.slice(0, 155) : 'Read gaming guides on NextGenn Blog.'),
        canonicalUrl: canonical,
        image: postImage,
        type: 'article',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt || post.title,
          image: postImage || `${origin}/nextgenn-icon.png`,
          datePublished: post.createdAt,
          dateModified: post.updatedAt || post.createdAt,
          author: {
            '@type': 'Person',
            name: post.author || 'NextGenn Editorial'
          },
          publisher: {
            '@type': 'Organization',
            name: 'NextGenn Games',
            logo: {
              '@type': 'ImageObject',
              url: `${origin}/nextgenn-icon.png`
            }
          }
        }
      });
    }
  }, [post]);

  const handleShare = async () => {
    sounds.playClick();
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || post.title,
          url: url
        });
        return;
      } catch {}
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  };

  // Launch Playable Game linked in post
  const handleLaunchGame = () => {
    sounds.playClick();
    if (!post?.gameUrl) return;

    const rawGameUrl = post.gameUrl.trim();
    const cleanUrl = rawGameUrl.toLowerCase();
    const cleanTitle = (post.gameTitle || post.title || '').trim().toLowerCase();

    // 1. Extract gameId if gameUrl is internal like /game/gm-49103 or http://localhost:5173/game/gm-49103
    let extractedGameId = null;
    const internalMatch = rawGameUrl.match(/(?:(?:\/game\/)|(?:[\?&]game=))([a-zA-Z0-9_\-\.]+)/i);
    if (internalMatch && internalMatch[1]) {
      extractedGameId = decodeURIComponent(internalMatch[1]).trim().toLowerCase();
    }

    // 2. Search platform games
    const matched = (allGames || []).find(g => {
      const gId = String(g.id || g._id || '').toLowerCase();
      const gSlug = toGameSlug(g.title);
      if (extractedGameId && (gId === extractedGameId || gSlug === extractedGameId)) return true;
      if (cleanUrl === gId || cleanUrl === gSlug) return true;
      if (g.gameUrl && g.gameUrl.toLowerCase() === cleanUrl) return true;
      if (post.gameTitle && g.title && g.title.toLowerCase() === post.gameTitle.trim().toLowerCase()) return true;
      if (g.title && cleanTitle && (g.title.toLowerCase() === cleanTitle || cleanTitle.includes(g.title.toLowerCase()))) return true;
      return false;
    });

    if (matched && onPlayGame) {
      onPlayGame(matched);
      return;
    }

    // 3. If extracted game ID from internal link, construct playable object for platform
    if (extractedGameId && onPlayGame) {
      const gameObj = {
        id: extractedGameId,
        title: post.gameTitle || post.title || 'Featured Game',
        thumbnail: getBlogImageUrl(post.image) || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
        category: post.category || 'Action',
        description: post.excerpt || post.title
      };
      onPlayGame(gameObj);
      return;
    }

    // 4. If direct embed link (HTML5 iframe), construct synthetic game for internal player
    const isDirectEmbed = rawGameUrl.includes('gamemonetize') || rawGameUrl.includes('gamepix') || rawGameUrl.includes('itch.io') || rawGameUrl.endsWith('.html');
    if (isDirectEmbed && onPlayGame) {
      const syntheticGame = {
        id: `blog-game-${post.id || Date.now()}`,
        title: post.gameTitle || post.title || 'Featured Game',
        gameUrl: rawGameUrl,
        thumbnail: getBlogImageUrl(post.image) || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
        category: post.category || 'Arcade',
        description: post.excerpt || post.title || 'Play featured online game on NextGenn.'
      };
      onPlayGame(syntheticGame);
      return;
    }

    // 5. Fallback for external links
    window.open(rawGameUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', padding: '0 0 60px' }}>
      {/* Top Action Bar (Back + Share) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <button
          onClick={() => { sounds.playClick(); onBack(); }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#ffffff', border: '1.5px solid #e2e8f0',
            borderRadius: 50, padding: '9px 22px', cursor: 'pointer',
            color: '#334155', fontWeight: 800, fontSize: '0.86rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
        >
          <ArrowLeft size={16} /> Back to Blog
        </button>

        <button
          onClick={handleShare}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: copied ? '#10b981' : '#ffffff',
            color: copied ? '#ffffff' : '#475569',
            border: `1.5px solid ${copied ? '#10b981' : '#e2e8f0'}`,
            borderRadius: 50, padding: '9px 18px', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.84rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'all 0.2s'
          }}
          title="Share or Copy Link"
        >
          {copied ? <Check size={15} /> : <Share2 size={15} />}
          <span>{copied ? 'Link Copied!' : 'Share Article'}</span>
        </button>
      </div>

      {/* Featured Cover Banner (High-res image visual) */}
      {(post.image || post.gradient) && (
        <div style={{
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 26,
          maxHeight: 460,
          width: '100%',
          background: post.gradient || '#0f172a',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
          position: 'relative'
        }}>
          {post.image ? (
            <img
              src={getBlogImageUrl(post.image)}
              alt={post.title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = 'none';
              }}
              style={{
                width: '100%',
                maxHeight: 460,
                objectFit: 'cover',
                display: 'block'
              }}
            />
          ) : (
            <div style={{ height: 220, background: post.gradient }} />
          )}
        </div>
      )}

      {/* Article Header & Metadata */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.3rem)',
          fontWeight: 900,
          color: '#0f172a',
          lineHeight: 1.3,
          margin: '0 0 16px',
          wordBreak: 'break-word'
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
          {post.category && (
            <span style={{
              marginLeft: 'auto',
              background: '#e0e7ff',
              color: '#4338ca',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              {post.category}
            </span>
          )}
        </div>
      </div>

      {/* Prominent Play Game Banner (Interactive Hero CTA) */}
      {post.gameUrl && (
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
          borderRadius: 20,
          padding: 'clamp(18px, 4vw, 26px) clamp(18px, 4vw, 28px)',
          marginBottom: 32,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 18,
          boxShadow: '0 12px 36px rgba(99, 102, 241, 0.25)',
          border: '1.5px solid rgba(129, 140, 248, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: 320,
            height: 320,
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.28) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, zIndex: 1, minWidth: 240, flex: 1 }}>
            <div style={{
              width: 54,
              height: 54,
              borderRadius: 15,
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
              flexShrink: 0
            }}>
              <Gamepad2 size={28} />
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: '#34d399',
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 4
              }}>
                <Sparkles size={13} />
                <span>Featured Playable Game</span>
              </div>
              <h3 style={{
                margin: 0,
                color: '#ffffff',
                fontSize: '1.2rem',
                fontWeight: 900,
                lineHeight: 1.25,
                wordBreak: 'break-word'
              }}>
                {post.gameTitle || post.title}
              </h3>
              <p style={{
                margin: '4px 0 0',
                color: 'rgba(226, 232, 240, 0.82)',
                fontSize: '0.82rem'
              }}>
                Instant play in your browser • Free • Zero downloads
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, zIndex: 1 }}>
            <button
              onClick={handleLaunchGame}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 50,
                padding: '13px 30px',
                fontWeight: 900,
                fontSize: '0.98rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 9,
                boxShadow: '0 6px 24px rgba(16, 185, 129, 0.45)',
                transition: 'all 0.2s ease',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.6)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(16, 185, 129, 0.45)';
              }}
            >
              <Play size={18} fill="#ffffff" />
              <span>PLAY GAME NOW</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{
        fontSize: '1rem',
        lineHeight: 1.85,
        color: '#334155'
      }}>
        {renderContent(post.content)}
      </div>

      {/* Tags */}
      {Array.isArray(post.tags) && post.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 32, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
          {post.tags.map(tag => (
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
      )}
    </div>
  );
}

// ─── Blog Card ────────────────────────────────────────────────────────────────
function BlogCard({ post, onClick, featured = false }) {
  const displayDate = formatPostDate(post);
  const imageUrl = getBlogImageUrl(post.image);

  if (featured) {
    return (
      <div
        onClick={() => { sounds.playClick(); onClick(post); }}
        style={{
          borderRadius: 24, padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 44px)', minHeight: 320,
          cursor: 'pointer', gridColumn: '1 / -1', position: 'relative', overflow: 'hidden',
          transition: 'transform 0.25s, box-shadow 0.25s',
          boxShadow: '0 8px 40px rgba(99,102,241,0.2)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          background: post.gradient || 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 60px rgba(99,102,241,0.3)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(99,102,241,0.2)'; }}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={post.title}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0
            }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.45) 50%, rgba(15,23,42,0.15) 100%)', zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 14 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.22)', borderRadius: 50, padding: '4px 14px',
              backdropFilter: 'blur(8px)'
            }}>
              <Star size={12} color="#fff" fill="#fff" />
              <span style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Featured Post</span>
            </div>
            {post.category && (
              <span style={{
                background: 'rgba(99,102,241,0.85)',
                color: '#fff',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: 50,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                {post.category}
              </span>
            )}
          </div>

          <h2 style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.8rem)', fontWeight: 900, color: '#fff', lineHeight: 1.25, marginBottom: 14, maxWidth: 680 }}>
            {post.title}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.88)', lineHeight: 1.65, maxWidth: 620, marginBottom: 24, fontSize: '0.97rem' }}>
            {post.excerpt}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center', marginBottom: 20 }}>
            {[
              { icon: <User size={13} />, text: post.author || 'NextGenn Editorial' },
              { icon: <Calendar size={13} />, text: displayDate },
              { icon: <Clock size={13} />, text: post.readTime || '3 min read' },
              { icon: <Eye size={13} />, text: `${post.views || 0} views` },
            ].map((m, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.92)', fontSize: '0.8rem', fontWeight: 600 }}>
                {m.icon} {m.text}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginTop: 8 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: '#ffffff', borderRadius: 50, padding: '9px 22px',
              color: '#0f172a', fontWeight: 800, fontSize: '0.88rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              Read Full Article <ArrowUpRight size={15} />
            </span>
          </div>
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
        transition: 'all 0.22s ease', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column'
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
    >
      {/* Header Image with Fallback */}
      <div style={{ height: 180, position: 'relative', overflow: 'hidden', background: post.gradient || '#1e293b' }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={post.title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : null}

        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)', pointerEvents: 'none' }} />

        {post.category && (
          <div style={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: 'rgba(15, 23, 42, 0.78)',
            backdropFilter: 'blur(6px)',
            color: '#ffffff',
            fontSize: '0.66rem',
            fontWeight: 800,
            padding: '3px 8px',
            borderRadius: 6,
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            {post.category}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.35, marginBottom: 8 }}>
          {post.title}
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.84rem', lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.excerpt}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: 12, marginTop: 'auto' }}>
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
export default function BlogPage({ onBackToHome, onNavigate, onPlayGame, allGames = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  const fetchPosts = useCallback(() => {
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
  }, []);

  // Fetch on mount & visibility focus events
  useEffect(() => {
    fetchPosts();

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
  }, [fetchPosts]);

  // Deep linking: Read ?article= query on initial load or back/forward
  useEffect(() => {
    if (posts.length === 0) return;

    const urlParams = new URLSearchParams(window.location.search);
    const articleParam = urlParams.get('article');
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const pathArticleId = (pathSegments.length >= 2 && pathSegments[0].toLowerCase() === 'blog')
      ? decodeURIComponent(pathSegments.slice(1).join('/'))
      : null;

    const targetId = articleParam || pathArticleId;
    if (targetId) {
      const target = posts.find(p => String(p.id || p._id) === targetId);
      if (target) {
        setSelectedPost(target);
      }
    }
  }, [posts]);

  // Handle browser back/forward buttons (popstate)
  useEffect(() => {
    const handlePopState = (e) => {
      const urlParams = new URLSearchParams(window.location.search);
      const articleId = urlParams.get('article') || (e.state && e.state.articleId);
      if (articleId && posts.length > 0) {
        const found = posts.find(p => String(p.id || p._id) === articleId);
        if (found) {
          setSelectedPost(found);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
      setSelectedPost(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [posts]);

  // Main Listing SEO
  useEffect(() => {
    if (!selectedPost) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nextgenn.com';
      updatePageSeo({
        title: 'Gaming News, Guides & Reviews - NextGenn Blog',
        description: 'Read the latest free online gaming news, expert guides, industry insights, and tips on NextGenn.',
        canonicalUrl: `${origin}/blog`,
        type: 'website'
      });
    }
  }, [selectedPost]);

  // Select article with views increment and history push
  const handleSelectPost = async (post, shouldPushHistory = true) => {
    sounds.playClick();
    setSelectedPost(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const postId = String(post.id || post._id);
    if (shouldPushHistory) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('article', postId);
        window.history.pushState({ articleId: postId }, '', url.toString());
      } catch {}
    }

    // Call backend API to record view and receive updated post data
    try {
      const API_BASE = (CONFIG?.API_BASE || 'http://localhost:5000/api').replace(/\/+$/, '');
      const res = await fetch(`${API_BASE}/blog/${encodeURIComponent(postId)}`);
      if (res.ok) {
        const full = await res.json();
        if (full && (full.id || full._id)) {
          setSelectedPost(full);
          setPosts(prev => prev.map(p => (String(p.id || p._id) === postId ? full : p)));
        }
      }
    } catch (e) {
      console.warn('Failed to increment blog post view count:', e);
    }
  };

  const handleBackToList = () => {
    sounds.playClick();
    setSelectedPost(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('article')) {
        url.searchParams.delete('article');
        window.history.pushState({}, '', url.toString());
      }
    } catch {}
  };

  // Derive categories list dynamically
  const categoriesList = useMemo(() => {
    const set = new Set();
    posts.forEach(p => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    return ['All', ...Array.from(set)];
  }, [posts]);

  // Featured post logic
  const featuredPost = useMemo(() => {
    if (searchQuery.trim() || selectedCategory !== 'All') return null;
    return posts.find(p => p.featured) || (posts.length > 0 ? posts[0] : null);
  }, [posts, searchQuery, selectedCategory]);

  // Filtered posts logic
  const filteredPosts = useMemo(() => {
    let list = posts;

    if (selectedCategory && selectedCategory !== 'All') {
      list = list.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return list.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.content?.toLowerCase().includes(q) ||
        p.author?.toLowerCase().includes(q) ||
        (Array.isArray(p.tags) ? p.tags.some(t => t.toLowerCase().includes(q)) : false)
      );
    }

    if (featuredPost && selectedCategory === 'All') {
      return list.filter(p => String(p.id || p._id) !== String(featuredPost.id || featuredPost._id));
    }

    return list;
  }, [searchQuery, posts, featuredPost, selectedCategory]);

  if (selectedPost) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px 16px' }}>
        <ArticleDetail
          post={selectedPost}
          onBack={handleBackToList}
          onPlayGame={onPlayGame}
          allGames={allGames}
        />
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
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', maxWidth: 520, margin: '0 auto 28px', lineHeight: 1.6 }}>
          Expert guides, industry news, game reviews, and tips to level up your gaming experience.
        </p>

        {/* Search Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.18)',
          borderRadius: 50, padding: '10px 20px', maxWidth: 440, width: '100%', margin: '0 auto 20px',
          backdropFilter: 'blur(12px)', boxSizing: 'border-box'
        }}>
          <Search size={16} color="rgba(255,255,255,0.6)" />
          <input
            type="text"
            placeholder="Search articles, guides, tags…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#fff', fontSize: '0.9rem', fontWeight: 600, minWidth: 0
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        {categoriesList.length > 2 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center',
            maxWidth: 640, margin: '0 auto'
          }}>
            {categoriesList.map(cat => {
              const active = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => { sounds.playClick(); setSelectedCategory(cat); }}
                  style={{
                    background: active ? '#ffffff' : 'rgba(255,255,255,0.1)',
                    color: active ? '#0f172a' : 'rgba(255,255,255,0.85)',
                    border: `1px solid ${active ? '#ffffff' : 'rgba(255,255,255,0.15)'}`,
                    borderRadius: 50,
                    padding: '5px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(6px)'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Main Content ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(20px, 4vw, 36px) clamp(12px, 3vw, 20px) 0' }}>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: '2rem', marginBottom: 10 }}>⏳</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Loading latest gaming articles...</div>
          </div>
        )}

        {/* Featured Post */}
        {!loading && featuredPost && (
          <div style={{ marginBottom: 32, display: 'grid', gridTemplateColumns: '1fr' }}>
            <BlogCard
              post={featuredPost}
              onClick={handleSelectPost}
              featured
            />
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
                <BlogCard
                  key={String(post.id || post._id)}
                  post={post}
                  onClick={handleSelectPost}
                />
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
                {searchQuery || selectedCategory !== 'All'
                  ? 'Try selecting a different category or clearing search.'
                  : 'Check back soon for new gaming guides and stories!'}
              </p>
              {(searchQuery || selectedCategory !== 'All') && (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
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

        {/* Platform Stats Bar */}
        <div style={{
          marginTop: 48, display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center'
        }}>
          {[
            { label: 'Articles Published', value: `${posts.length || 0}+`, icon: <BookOpen size={18} />, color: '#6366f1' },
            { label: 'Monthly Readers', value: '120K+', icon: <Users size={18} />, color: '#ef4444' },
            { label: 'Topics Covered', value: `${categoriesList.length - 1 || 5}+`, icon: <Tag size={18} />, color: '#f59e0b' },
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
