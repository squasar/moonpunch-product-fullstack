/**
 * Tooltip initialization
 * Handles Bootstrap tooltips
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize Bootstrap tooltips
  if (typeof $ !== 'undefined' && $.fn.tooltip) {
    $('[data-toggle="tooltip"]').tooltip();
  }
});
