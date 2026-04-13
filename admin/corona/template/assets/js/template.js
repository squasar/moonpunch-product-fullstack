/**
 * Template utilities
 * Common utilities used across the admin template
 */

// UI initialization and common functions
(function() {
  'use strict';
  
  // Initialize common UI elements
  window.initTemplateUI = function() {
    if (typeof $ !== 'undefined') {
      // Initialize popovers
      if ($.fn.popover) {
        $('[data-toggle="popover"]').popover();
      }
      
      // Initialize dropdowns
      if ($.fn.dropdown) {
        $('.dropdown-toggle').dropdown();
      }
    }
  };
  
  // Run on document ready
  document.addEventListener('DOMContentLoaded', function() {
    initTemplateUI();
  });
})();
