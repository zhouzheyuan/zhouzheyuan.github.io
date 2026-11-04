// Publication covers use native image loading.
(function () {
  if (window.jQuery && window.jQuery.fn.tooltip) {
    window.jQuery(function () { window.jQuery('[data-toggle="tooltip"]').tooltip(); });
  }
})();
