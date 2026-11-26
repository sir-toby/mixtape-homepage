import { defineHastPlugin } from 'satteri';

/**
 * Root-relative links and images in Markdown ("/newsletter/", "/uploads/x.jpg") get the deploy base prepended,
 * so content works on GitHub Pages (/mixtape-homepage/) and on the own domain (/).
 * External links open in a new tab.
 */
export default function links({ base = '/' } = {}) {
  const prefix = base.replace(/\/$/, '');
  const needsBase = (path) => path.startsWith('/') && !path.startsWith('//') && prefix && !path.startsWith(prefix + '/');
  return defineHastPlugin({
    name: 'mixtape-links',
    element: {
      filter: ['a', 'img'],
      visit(node, ctx) {
        if (node.tagName === 'img') {
          const src = node.properties.src;
          if (typeof src === 'string' && needsBase(src)) ctx.setProperty(node, 'src', prefix + src);
          return;
        }
        const href = node.properties.href;
        if (typeof href !== 'string') return;
        if (needsBase(href)) {
          ctx.setProperty(node, 'href', prefix + href);
        } else if (/^https?:\/\//.test(href)) {
          ctx.setProperty(node, 'target', '_blank');
          ctx.setProperty(node, 'rel', 'noopener');
        }
      },
    },
  });
}
