(function () {
  function parseDate(str) {
    if (!str) return new Date(0);
    return new Date(str.replace(' ', 'T'));
  }

  function formatDate(str) {
    if (!str) return '';
    return parseDate(str).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function esc(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function safeUrl(url) {
    return /^https?:\/\//.test(url) ? url : '#';
  }

  fetch('/bookmarks/bookmarks.json')
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      var root = document.getElementById('bookmarks-root');

      var items = Object.keys(data).map(function (url) {
        var b = Object.assign({}, data[url]);
        b.url = url;
        return b;
      });

      if (items.length === 0) {
        root.innerHTML = '<p class="bookmarks-empty">No bookmarks yet.</p>';
        return;
      }

      items.sort(function (a, b) {
        var diff = parseDate(b.savedAt) - parseDate(a.savedAt);
        if (diff !== 0) return diff;
        return parseDate(b.updatedAt) - parseDate(a.updatedAt);
      });

      var catOrder = [];
      var categories = {};
      items.forEach(function (item) {
        var cat = item.category || 'Uncategorized';
        if (!categories[cat]) {
          categories[cat] = [];
          catOrder.push(cat);
        }
        categories[cat].push(item);
      });

      var html = '';
      catOrder.forEach(function (cat) {
        html += '<div class="bookmarks-category">';
        html += '<div class="bookmarks-category-title">' + esc(cat) + '</div>';

        categories[cat].forEach(function (item) {
          var readClass = item.read ? ' is-read' : '';
          html += '<div class="bookmark-item' + readClass + '">';

          html += '<div class="bookmark-title">';
          html += '<a href="' + esc(safeUrl(item.url)) + '" target="_blank" rel="noopener noreferrer">'
            + esc(item.title || item.url) + '</a>';
          if (item.read) {
            html += '<span class="bookmark-read-badge">read</span>';
          }
          html += '</div>';

          if (item.notes) {
            html += '<div class="bookmark-notes">' + esc(item.notes) + '</div>';
          }

          html += '<div class="bookmark-meta">' + esc(formatDate(item.savedAt));
          if (item.updatedAt) {
            html += ' &middot; updated ' + esc(formatDate(item.updatedAt));
          }
          html += '</div>';

          html += '</div>';
        });

        html += '</div>';
      });

      root.innerHTML = html;
    })
    .catch(function (err) {
      document.getElementById('bookmarks-root').innerHTML =
        '<p class="bookmarks-error">Could not load bookmarks.</p>';
      console.error('Bookmarks fetch error:', err);
    });
})();
