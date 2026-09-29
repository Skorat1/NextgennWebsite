import React from 'react';

/**
 * NextGenn Official Brand Logo Component
 * - variant="icon": Renders the official NextGenn gamepad controller mark
 * - variant="full": Renders the official NextGenn controller + wordmark lockup
 */
export default function NextGennLogo({
  variant = 'full', // 'full' | 'icon'
  size = 40,
  className = '',
  style = {}
}) {
  if (variant === 'icon') {
    return (
      <img
        src="/nextgenn-icon.png"
        alt="NextGenn"
        width={size}
        height={size}
        className={`nextgenn-brand-icon ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          display: 'inline-block',
          verticalAlign: 'middle',
          flexShrink: 0,
          ...style
        }}
      />
    );
  }

  // Full Brand Logo Lockup
  return (
    <img
      src="/nextgenn-full.png"
      alt="NextGenn"
      height={size}
      className={`nextgenn-brand-full ${className}`}
      style={{
        height: `${size}px`,
        width: 'auto',
        maxWidth: '100%',
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style
      }}
    />
  );
}

