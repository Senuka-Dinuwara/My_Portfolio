// Simple morphing slider: toggles blob visibility and animates slides
(() => {
  document.addEventListener('DOMContentLoaded', ()=>{
    const slider = document.getElementById('morph-slider');
    if (!slider) return;
    const blobs = Array.from(document.querySelectorAll('.morph-bg .blob'));
    const slides = Array.from(slider.querySelectorAll('.slide'));
    const prev = document.getElementById('slide-prev');
    const next = document.getElementById('slide-next');
    let idx = 0;

    function show(i){
      idx = (i + slides.length) % slides.length;
      slides.forEach((s,sn)=> s.style.opacity = (sn===idx)? '1' : '0');
      // animate blobs
      blobs.forEach((b,bi)=>{
        b.classList.toggle('active', bi===idx);
        // small translate to simulate movement
        b.style.transform = bi===idx ? 'scale(1.05) translateY(-6px)' : 'scale(0.98) translateY(8px)';
      });
    }

    prev.addEventListener('click', ()=> show(idx-1));
    next.addEventListener('click', ()=> show(idx+1));

    // auto cycle
    let timer = setInterval(()=> show(idx+1), 5000);
    slider.addEventListener('mouseenter', ()=> clearInterval(timer));
    slider.addEventListener('mouseleave', ()=> { clearInterval(timer); timer = setInterval(()=> show(idx+1), 5000); });

    // initial
    show(0);
  });
})();
