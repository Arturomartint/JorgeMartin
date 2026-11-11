/* jorgemartin.design — small progressive enhancements. The site works without this file. */

// 1. Scroll progress line under the header
const progress = document.querySelector('.site-header__progress');
if (progress) {
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

// 2. Mobile menu
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('is-open', !open);
  });
}

// 3. Fade sections in as they enter the viewport
const reveal = document.querySelectorAll('[data-reveal]');
if (reveal.length && 'IntersectionObserver' in window &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('has-reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  reveal.forEach((el) => io.observe(el));
}

// 4. Only play looping videos while they are on screen (saves battery and data)
const loops = document.querySelectorAll('video[loop]');
if (loops.length && 'IntersectionObserver' in window) {
  const vo = new IntersectionObserver((entries) => {
    entries.forEach((e) => { e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause(); });
  }, { rootMargin: '200px' });
  loops.forEach((v) => vo.observe(v));
}

// 5. Contact form: send to Formspree without leaving the page.
//    Without JavaScript the form still works, it just lands on Formspree's own thank-you page.
const form = document.querySelector('[data-contact-form]');
if (form) {
  const status = form.querySelector('.form-status');
  const button = form.querySelector('button[type="submit"]');
  const say = (state, text) => {
    status.hidden = false;
    status.dataset.state = state;
    status.textContent = text;
  };
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (form.action.includes('YOUR_FORM_ID')) {
      say('error', 'The form is not connected yet: add your Formspree form ID in contact/index.html.');
      return;
    }
    button.disabled = true;
    say('sending', 'Sending…');
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        // Formspree explains what was wrong (for example an invalid email address)
        const data = await response.json().catch(() => ({}));
        const reasons = (data.errors || []).map((e) => e.message).filter(Boolean).join('. ');
        throw new Error(reasons);
      }
      form.reset();
      say('success', "Thanks! Your message is on its way. I'll get back to you ASAP.");
    } catch (error) {
      say('error', error.message
        ? `Sorry, that didn't go through: ${error.message}.`
        : 'Sorry, something went wrong. Please try again, or reach me on LinkedIn.');
    } finally {
      button.disabled = false;
    }
  });
}
