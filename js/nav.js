(function () {
  var links = [
    { name: 'Resume',    url: '/resume.pdf', newTab: true },
    { name: 'Posts',     url: '/posts/' },
    { name: 'Bookmarks', url: '/bookmarks/' },
  ];

  var list = document.getElementById('nav-list');
  if (!list) return;

  links.forEach(function (link) {
    var li = document.createElement('li');
    li.className = 'navigation-item';
    var a = document.createElement('a');
    a.className = 'navigation-link';
    a.href = link.url;
    a.textContent = link.name;
    if (link.newTab) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
    li.appendChild(a);
    list.appendChild(li);
  });
})();
