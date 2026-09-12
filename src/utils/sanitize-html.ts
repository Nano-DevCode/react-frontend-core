import DOMPurify, { type Config } from 'dompurify';
import React from 'react';

// ============================================================================
// Configuración estricta de sanitización contra Cross-Site Scripting (XSS)
// ============================================================================
const DEFAULT_SANATIZE_CONFIG: Config = {
  ALLOWED_TAGS: [
    'b',
    'i',
    'em',
    'strong',
    'a',
    'p',
    'span',
    'br',
    'ul',
    'ol',
    'li',
    'code',
    'pre',
    'blockquote',
  ],
  ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class'],
  FORBID_TAGS: [
    'script',
    'iframe',
    'object',
    'embed',
    'form',
    'input',
    'button',
    'style',
    'svg',
    'math',
  ],
  FORBID_ATTR: [
    'style',
    'onerror',
    'onload',
    'onclick',
    'onmouseover',
    'onfocus',
  ],
  ALLOWED_URI_REGEXP:
    /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  RETURN_TRUSTED_TYPE: false,
};

// Gancho para forzar 'noopener noreferrer' en cualquier enlace
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('rel', 'noopener noreferrer');
    if (!node.getAttribute('target')) {
      node.setAttribute('target', '_blank');
    }
  }
});

/**
 * Sanitiza una cadena de texto que contiene marcado HTML, neutralizando
 * cualquier vector XSS, atributos de eventos maliciosos o protocolos peligrosos (javascript:).
 */
export function sanitizeHtml(
  dirty: string,
  customConfig?: Config
): string {
  if (!dirty || typeof dirty !== 'string') return '';
  const result = DOMPurify.sanitize(dirty, {
    ...DEFAULT_SANATIZE_CONFIG,
    ...customConfig,
    RETURN_TRUSTED_TYPE: false,
  });
  return String(result);
}

export interface SafeHtmlProps {
  html: string;
  className?: string;
  as?: 'div' | 'span' | 'p';
}

/**
 * Componente seguro para renderizar HTML sanitizado con DOMPurify
 */
export const SafeHtml: React.FC<SafeHtmlProps> = ({
  html,
  className,
  as: Component = 'div',
}) => {
  const cleanHtml = React.useMemo(() => sanitizeHtml(html), [html]);

  return React.createElement(Component, {
    className,
    dangerouslySetInnerHTML: { __html: cleanHtml },
  });
};

