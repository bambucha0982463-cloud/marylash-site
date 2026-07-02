// появление секций и «распахивание» ресничек-разделителей при скролле
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add('in-view');
      io.unobserve(e.target);
    }
  }
}, { threshold: 0.18 });

document.querySelectorAll('.reveal, .lashline').forEach((el) => io.observe(el));
