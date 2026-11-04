// Progressive enhancement: all comparisons remain visible without JavaScript.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.results-carousel').forEach(carousel => {
    const slides = Array.from(carousel.children).filter(child => child.classList.contains('item'));
    if (slides.length < 2) return;
    const controls = document.createElement('div');
    controls.className = 'project-carousel-controls';
    const previous = document.createElement('button');
    previous.type = 'button'; previous.textContent = '← Previous';
    const next = document.createElement('button');
    next.type = 'button'; next.textContent = 'Next →';
    const status = document.createElement('span');
    status.setAttribute('aria-live', 'polite');
    controls.append(previous, status, next); carousel.after(controls);
    carousel.setAttribute('aria-label', '3D anomaly comparison videos');
    carousel.tabIndex = 0;
    let current = 0;
    let visible = false;
    const playActive = () => slides.forEach((slide, index) => {
      slide.querySelectorAll('video').forEach(video => {
        if (index === current && visible) {
          video.preload = 'metadata';
          video.play().catch(() => {});
        } else video.pause();
      });
    });
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => { slide.hidden = i !== current; });
      const label = slides[current].className.match(/item-([\w-]+)/)?.[1] || 'Comparison';
      status.textContent = label.charAt(0).toUpperCase() + label.slice(1) + ' · ' + (current + 1) + ' / ' + slides.length;
      playActive();
    }
    previous.addEventListener('click', () => show(current - 1));
    next.addEventListener('click', () => show(current + 1));
    carousel.addEventListener('keydown', event => {
      if (event.target !== carousel) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault(); show(current + (event.key === 'ArrowLeft' ? -1 : 1));
      }
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => { visible = entries[0].isIntersecting; playActive(); }, {threshold:0.1}).observe(carousel);
    } else visible = true;
    show(0);
  });
});