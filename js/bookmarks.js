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

  function slugify(str) {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
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

      // Build sidebar
      var pagePath = window.location.pathname;
      var sidebarHtml = '';
      catOrder.forEach(function (cat, i) {
        var id = slugify(cat);
        var activeClass = i === 0 ? ' is-active' : '';
        sidebarHtml += '<a href="' + pagePath + '#' + id + '" class="sidebar-link' + activeClass + '">'
          + esc(cat)
          + ' <span class="sidebar-count">' + categories[cat].length + '</span>'
          + '</a>';
      });

      // Build content
      var contentHtml = '';
      catOrder.forEach(function (cat) {
        var id = slugify(cat);
        contentHtml += '<div class="bookmarks-category" id="' + id + '">';
        contentHtml += '<div class="bookmarks-category-title">' + esc(cat) + '</div>';

        categories[cat].forEach(function (item) {
          var readClass = item.read ? ' is-read' : '';
          contentHtml += '<div class="bookmark-item' + readClass + '">';

          contentHtml += '<div class="bookmark-title">';
          contentHtml += '<a href="' + esc(safeUrl(item.url)) + '" target="_blank" rel="noopener noreferrer">'
            + esc(item.title || item.url) + '</a>';
          if (item.read) {
            contentHtml += '<span class="bookmark-read-badge">read</span>';
          }
          contentHtml += '<span class="bookmark-meta">' + esc(formatDate(item.savedAt));
          if (item.updatedAt) {
            contentHtml += ' &middot; updated ' + esc(formatDate(item.updatedAt));
          }
          contentHtml += '</span>';
          contentHtml += '</div>';

          if (item.notes) {
            contentHtml += '<div class="bookmark-notes">' + esc(item.notes) + '</div>';
          }

          contentHtml += '</div>';
        });

        contentHtml += '</div>';
      });

      root.innerHTML =
        '<div class="bookmarks-layout">'
        + '<aside class="bookmarks-sidebar">' + sidebarHtml + '</aside>'
        + '<div class="bookmarks-content">' + contentHtml + '</div>'
        + '</div>';

      // Highlight active sidebar link on scroll
      var sections = root.querySelectorAll('.bookmarks-category');
      var links = root.querySelectorAll('.sidebar-link');

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            links.forEach(function (link) {
              link.classList.toggle(
                'is-active',
                link.getAttribute('href') === pagePath + '#' + entry.target.id
              );
            });
          }
        });
      }, { rootMargin: '-10% 0px -80% 0px' });

      sections.forEach(function (section) { observer.observe(section); });
    })
    .catch(function (err) {
      document.getElementById('bookmarks-root').innerHTML =
        '<p class="bookmarks-error">Could not load bookmarks.</p>';
      console.error('Bookmarks fetch error:', err);
    });
})();
