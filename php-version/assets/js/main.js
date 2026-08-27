// Client-side helpers: live table/card filtering and delete confirmation.
document.addEventListener('DOMContentLoaded', function () {
  var search = document.querySelector('[data-filter-input]');
  if (search) {
    search.addEventListener('input', function () {
      var q = this.value.trim().toLowerCase();
      document.querySelectorAll('[data-filter-item]').forEach(function (item) {
        item.style.display = item.textContent.toLowerCase().indexOf(q) > -1 ? '' : 'none';
      });
    });
  }

  document.querySelectorAll('[data-confirm]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      if (!window.confirm(form.getAttribute('data-confirm'))) e.preventDefault();
    });
  });
});
