Array.from(document.querySelectorAll('h2, h3, h4, h5, h6'))
    .filter(function (heading) {
        return heading.id;
    })
    .map(function (heading) {
        heading.innerHTML = '<a href="#' + heading.id + '">' + heading.innerHTML + '</a>';
    });
