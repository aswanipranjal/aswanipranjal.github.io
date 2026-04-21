(function () {
  var links = [
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
    li.appendChild(a);
    list.appendChild(li);
  });
})();
