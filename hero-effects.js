// Hero interactive effects: custom cursor, hero parallax, particles (desktop only)
(function(){
  const isDesktop = () => window.innerWidth >= 900;
  document.addEventListener('DOMContentLoaded', ()=>{
    if (!isDesktop()) return;

    // Custom cursor
    const cursor = document.createElement('div'); cursor.id = 'custom-cursor'; cursor.className = 'custom-cursor';
    cursor.innerHTML = '<div class="cursor-inner"></div>';
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0; let curX = 0, curY = 0;
    const speed = 0.15;
    window.addEventListener('mousemove', (e)=>{ mouseX = e.clientX; mouseY = e.clientY; });

    function raf(){ curX += (mouseX - curX) * speed; curY += (mouseY - curY) * speed; cursor.style.transform = `translate3d(${curX - 10}px, ${curY - 10}px, 0)`; requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    // scale cursor on hover of interactive elements
    const interactive = ['a', '.btn-cta', '.chat-toggle', '.card-lift', 'button', '.hero-name-hover'];
    function hoverOn(){ cursor.classList.add('cursor-grow'); }
    function hoverOff(){ cursor.classList.remove('cursor-grow'); }
    interactive.forEach(sel => document.querySelectorAll(sel).forEach(el => { el.addEventListener('mouseenter', hoverOn); el.addEventListener('mouseleave', hoverOff); }));

    // Hero parallax and particles
    const layer = document.getElementById('hero-effects-layer');
    const hero = document.querySelector('.hero-title') ? document.querySelector('.hero-title').closest('section') : null;
    if (!layer || !hero) return;

    // create particles
    const particles = [];
    const PARTICLE_COUNT = 12;
    for (let i=0;i<PARTICLE_COUNT;i++){
      const p = document.createElement('div'); p.className = 'hero-particle';
      const size = 6 + Math.random()*12; p.style.width = size + 'px'; p.style.height = size + 'px';
      p.style.left = (20 + Math.random()*60) + '%'; p.style.top = (20 + Math.random()*60) + '%';
      p.dataset.tx = (Math.random()*2-1); p.dataset.ty = (Math.random()*2-1);
      layer.appendChild(p); particles.push(p);
    }

    hero.addEventListener('mousemove', (e)=>{
      const r = hero.getBoundingClientRect();
      const cx = r.left + r.width/2; const cy = r.top + r.height/2;
      const dx = (e.clientX - cx)/r.width; const dy = (e.clientY - cy)/r.height;
      // title parallax
      const spans = document.querySelectorAll('.hero-title > span');
      if (spans[0]) spans[0].style.transform = `translate3d(${dx*18}px, ${dy*10}px, 0)`;
      if (spans[1]) spans[1].style.transform = `translate3d(${dx*-14}px, ${dy*-8}px, 0)`;
      // particles subtle move
      particles.forEach((p, idx) => {
        const factor = 6 + (idx % 5);
        const tx = dx * factor * Number(p.dataset.tx);
        const ty = dy * factor * Number(p.dataset.ty);
        p.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      });

      // update card gradient positions for visible cards
      document.querySelectorAll('.card-lift').forEach(card => {
        const r = card.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom){
          const mx = Math.round(((e.clientX - r.left) / r.width) * 100);
          const my = Math.round(((e.clientY - r.top) / r.height) * 100);
          card.style.setProperty('--mx', mx + '%');
          card.style.setProperty('--my', my + '%');
        }
      });
    });

    // global mouse move to update card gradient positions anywhere on page
    document.addEventListener('mousemove', (e)=>{
      document.querySelectorAll('.card-lift').forEach(card => {
        const r = card.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom){
          const mx = Math.round(((e.clientX - r.left) / r.width) * 100);
          const my = Math.round(((e.clientY - r.top) / r.height) * 100);
          card.style.setProperty('--mx', mx + '%');
          card.style.setProperty('--my', my + '%');
        }
      });
    });

    hero.addEventListener('mouseleave', ()=>{
      document.querySelectorAll('.hero-title > span').forEach(s=> s.style.transform='');
      particles.forEach(p=> p.style.transform='');
    });

  });
})();
