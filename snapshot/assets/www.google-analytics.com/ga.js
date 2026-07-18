/* Offline compatibility shim for the archived Remee programmer. */
(() => {
  'use strict';

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function(node, referenceNode) {
    if (node?.tagName === 'SCRIPT' && /google-analytics\.com|googletagmanager\.com/i.test(node.src || '')) {
      return node;
    }
    return originalInsertBefore.call(this, node, referenceNode);
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#user_info, #short_url').forEach((element) => {
      element.style.display = 'none';
    });
  });

  window._gaq = { push() {} };
})();
