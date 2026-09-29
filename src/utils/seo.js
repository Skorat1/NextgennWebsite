/**
 * NextGenn SEO Management Engine
 * Dynamically manages document title, meta descriptions, canonical URLs,
 * OpenGraph, Twitter Cards, and Schema.org JSON-LD Structured Data.
 */

const DEFAULT_TITLE = 'NextGenn - Play Free Online Games | Instant Arcade & HTML5 Games';
const DEFAULT_DESC = 'Play 5000+ free online games right in your browser. Instant loading action, arcade, puzzles, racing, and shooting games on NextGenn with no downloads needed.';
const DEFAULT_IMAGE = 'https://nextgenn.com/nextgenn-full.png';

function setMetaTag(selector, attrName, attrValue, content) {
  try {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content || '');
  } catch (e) {
    console.debug('SEO tag error:', e);
  }
}

function setCanonical(url) {
  try {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  } catch (e) {
    console.debug('Canonical error:', e);
  }
}

function setJsonLd(schemaObj) {
  try {
    let script = document.getElementById('nextgenn-dynamic-jsonld');
    if (!schemaObj) {
      if (script) script.remove();
      return;
    }
    if (!script) {
      script = document.createElement('script');
      script.id = 'nextgenn-dynamic-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schemaObj, null, 2);
  } catch (e) {
    console.debug('JSON-LD error:', e);
  }
}

/**
 * Updates full SEO state dynamically for the current route
 */
export function updatePageSeo({
  title,
  description,
  keywords,
  canonicalUrl,
  image,
  type = 'website',
  jsonLd = null
}) {
  try {
    const finalTitle = title ? `${title} | NextGenn` : DEFAULT_TITLE;
    document.title = finalTitle;

    const finalDesc = description || DEFAULT_DESC;
    const finalImage = image || DEFAULT_IMAGE;
    const finalUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : 'https://nextgenn.com/');

    // Basic Meta
    setMetaTag('meta[name="description"]', 'name', 'description', finalDesc);
    if (keywords) {
      setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);
    }
    setMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // Canonical
    setCanonical(finalUrl);

    // OpenGraph
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', finalTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', finalDesc);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', finalImage);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', finalUrl);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', type);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'NextGenn Games');

    // Twitter Card
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', finalTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', finalDesc);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', finalImage);

    // Schema.org Structured Data
    setJsonLd(jsonLd);
  } catch (err) {
    console.debug('Error updating SEO:', err);
  }
}

/**
 * Converts a game title or object into a clean SEO URL-friendly slug
 * e.g. "Need for Race" -> "need-for-race"
 */
export function toGameSlug(gameOrTitle) {
  if (!gameOrTitle) return '';
  const title = typeof gameOrTitle === 'string'
    ? gameOrTitle
    : (gameOrTitle.title || gameOrTitle.name || gameOrTitle.id || '');

  const slug = String(title)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || (typeof gameOrTitle === 'object' && gameOrTitle.id ? String(gameOrTitle.id).toLowerCase() : '');
}

/**
 * Generates Schema.org VideoGame JSON-LD object for a specific game
 */
export function buildGameSchema(game) {
  if (!game) return null;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nextgenn.com';
  const gameSlug = toGameSlug(game);
  const gameUrl = `${baseUrl}/game/${encodeURIComponent(gameSlug)}`;
  const rawCat = game.category || 'Arcade';
  const catSlug = encodeURIComponent(rawCat.toLowerCase());
  const catName = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);
  const catUrl = `${baseUrl}/category/${catSlug}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'VideoGame',
        'name': game.title,
        'description': game.description || `Play ${game.title} free online in your browser on NextGenn. Instant gameplay, no download required.`,
        'image': game.thumbnail || `${baseUrl}/logo.png`,
        'url': gameUrl,
        'genre': rawCat,
        'gamePlatform': ['Web Browser', 'Desktop', 'Mobile', 'Tablet'],
        'applicationCategory': 'Game',
        'operatingSystem': 'Any',
        'inLanguage': 'en',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD',
          'category': 'Free'
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': Number(game.rating || 4.8).toFixed(1),
          'bestRating': '5',
          'worstRating': '1',
          'ratingCount': Math.max(Number(game.likes || 0) + Number(game.dislikes || 0), 10)
        },
        'author': {
          '@type': 'Organization',
          'name': game.developer || game.author || 'NextGenn Games'
        }
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': `${baseUrl}/`
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': `${catName} Games`,
            'item': catUrl
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': game.title,
            'item': gameUrl
          }
        ]
      }
    ]
  };
}
