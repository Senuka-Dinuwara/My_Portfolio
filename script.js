AOS.init({ duration: 1000, once: true });
	
// Animate skill bars when they enter viewport
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bars = entry.target.querySelectorAll('.skill-bar');
      bars.forEach(bar => {
        const width = bar.getAttribute('data-width');
        setTimeout(() => {
          bar.style.width = width;
        }, 100);
      });
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.skill-item').forEach(item => {
  observer.observe(item);
});

// Remove #id from URL without breaking smooth scroll or page position
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
	anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');

    if (targetId !== '#' && targetId.startsWith('#')) {
      e.preventDefault();

      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
        history.replaceState(null, null, ' ');
      }
    }
  });
});