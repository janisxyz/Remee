/* Offline compatibility shim for the archived Remee programmer. */
(() => {
  'use strict';

  const IMAGE_ROOT = 'assets/www.sleepwithremee.com/img/';
  const rewriteImagePath = (value) => {
    if (typeof value !== 'string') return value;
    const match = value.match(/^(?:\.\.\/|\.\/|\/)?img\/([^?#]+)([?#].*)?$/i);
    return match ? `${IMAGE_ROOT}${match[1]}${match[2] || ''}` : value;
  };

  const originalSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, value) {
    if (this.tagName === 'IMG' && String(name).toLowerCase() === 'src') {
      value = rewriteImagePath(String(value));
    }
    return originalSetAttribute.call(this, name, value);
  };

  const srcDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  if (srcDescriptor?.get && srcDescriptor?.set) {
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      configurable: true,
      enumerable: srcDescriptor.enumerable,
      get: srcDescriptor.get,
      set(value) {
        srcDescriptor.set.call(this, rewriteImagePath(String(value)));
      },
    });
  }

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function(node, referenceNode) {
    if (node?.tagName === 'SCRIPT' && /google-analytics\.com|googletagmanager\.com/i.test(node.src || '')) {
      return node;
    }
    return originalInsertBefore.call(this, node, referenceNode);
  };

  const repairImages = (root = document) => {
    root.querySelectorAll?.('img[src]').forEach((image) => {
      const current = image.getAttribute('src');
      const rewritten = rewriteImagePath(current);
      if (rewritten !== current) originalSetAttribute.call(image, 'src', rewritten);
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    repairImages();
    document.querySelectorAll('#user_info, #short_url').forEach((element) => {
      element.style.display = 'none';
    });

    new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.target instanceof HTMLImageElement) {
          repairImages(mutation.target.parentNode || document);
        }
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) repairImages(node);
        });
      }
    }).observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['src'],
    });
  });

  window._gaq = { push() {} };
})();
