'use strict';
const CONFIG = Object.freeze({
  // Add your own photo paths here; null preserves the supplied watercolor artwork.
  IMAGES: { hero: null, venue: null, closing: null },
  MAPS: {
    temple: 'https://www.google.com/maps/search/?api=1&query=Attukal+Bhagavathy+Temple+Thiruvananthapuram',
    auditorium: 'https://www.google.com/maps/search/?api=1&query=Viswaroopam+Auditorium+Attukal+Thiruvananthapuram',
    reception: 'https://www.google.com/maps/search/?api=1&query=Al+Saj+Arena+Kulathoor+Thiruvananthapuram'
  }
});
document.documentElement.classList.add('js');
const scenes = [...document.querySelectorAll('.scene')];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const mobileLayout = matchMedia('(max-width: 700px)');
let stopped = reduceMotion.matches || !mobileLayout.matches || !!location.hash;
let timer, animationFrame, autoScrolling = false;
function stopAuto() {
  stopped = true;
  clearTimeout(timer);
  cancelAnimationFrame(animationFrame);
  autoScrolling = false;
}
['touchstart', 'pointerdown', 'wheel', 'keydown'].forEach(event =>
  window.addEventListener(event, stopAuto, { passive: true }));
window.addEventListener('scroll', () => { if (!autoScrolling) stopAuto(); }, { passive: true });
document.addEventListener('visibilitychange', () => { if (document.hidden) stopAuto(); });
reduceMotion.addEventListener('change', e => { if (e.matches) stopAuto(); });
mobileLayout.addEventListener('change', stopAuto);

// A single, interruptible eased movement. Native touch and wheel scrolling stay native.
function glideTo(target, complete = () => {}) {
  cancelAnimationFrame(animationFrame);
  const start = window.scrollY;
  const destination = Math.max(0, Math.min(target.getBoundingClientRect().top + start,
    document.documentElement.scrollHeight - innerHeight));
  if (reduceMotion.matches) {
    window.scrollTo({ top: destination, behavior: 'instant' }); complete(); return;
  }
  autoScrolling = true;
  const began = performance.now(), duration = 1450;
  const frame = now => {
    const t = Math.min(1, (now - began) / duration);
    const ease = t < .5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2;
    window.scrollTo({ top: start + (destination - start) * ease, behavior: 'instant' });
    if (t < 1) animationFrame = requestAnimationFrame(frame);
    else animationFrame = requestAnimationFrame(() => { autoScrolling = false; complete(); });
  };
  animationFrame = requestAnimationFrame(frame);
}

document.querySelectorAll('[data-image]').forEach(img => {
  const replacement = CONFIG.IMAGES[img.dataset.image];
  if (replacement) { img.src = replacement; img.classList.remove('reference-art'); }
});
const venue = document.querySelector('[data-venue-photo]');
if (venue && CONFIG.IMAGES.venue) {
  venue.style.backgroundImage = `url("${encodeURI(CONFIG.IMAGES.venue).replace(/"/g, '%22')}")`;
  venue.classList.add('has-photo');
}
if (scenes.length) {
  scenes.forEach(scene => scene.querySelectorAll('.reveal').forEach((item, index) =>
    item.style.setProperty('--delay', `${Math.min(index * .13, .65)}s`)));
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      document.querySelectorAll('.story-nav a').forEach(a => {
        if (a.hash === '#' + entry.target.id) a.setAttribute('aria-current', 'step');
        else a.removeAttribute('aria-current');
      });
    }
  }), { threshold: 0, rootMargin: '-15% 0px -50% 0px' });
  scenes.forEach(scene => observer.observe(scene));
  function advance(index) {
    if (stopped || !scenes[index]) return;
    // The interactive story waits for the guest to scroll; never skip its chapters.
    glideTo(scenes[index]);
  }
  const hero = document.querySelector('[data-image="hero"]');
  (hero ? hero.decode().catch(() => {}) : Promise.resolve()).then(() => {
    if (!stopped && scrollY < 10) timer = setTimeout(() => advance(1), 8500);
  });
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', event => {
    const target = document.getElementById(a.hash.slice(1));
    if (!target) return;
    event.preventDefault(); stopAuto(); glideTo(target, () => {
      history.replaceState(null, '', a.hash);
      target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true });
    });
  }));
  if (new URLSearchParams(location.search).has('export')) document.body.classList.add('export');
}
document.querySelectorAll('[data-map]').forEach(a => a.href = CONFIG.MAPS[a.dataset.map]);
function escapeICS(value) { return value.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;'); }
function calendarText(kind) {
  const reception = kind === 'reception';
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Akhil and Parvathy//Wedding//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',
  'UID:' + kind + '-20261122@akhil-parvathy.invitation',
  'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''),
  'DTSTART:' + (reception ? '20261122T120000Z' : '20261122T021500Z'),
  ...(reception ? [] : ['DTEND:20261122T023500Z']),
  'SUMMARY:' + escapeICS(reception ? 'Wedding reception of Akhil & Parvathy' : 'Wedding of Akhil & Parvathy'),
  'LOCATION:' + escapeICS(reception ? 'Al Saj Arena, NH-47, Opp Infosys, Kulathoor, Trivandrum' : 'Attukal Bhagavathy Temple, Thiruvananthapuram'),
  'DESCRIPTION:' + escapeICS(reception ? 'Reception from 5:30 pm onwards (India Standard Time). End time is not specified.' : 'Thalikettu, 7:45 AM – 8:05 AM (India Standard Time). Followed by Viswaroopam Auditorium, Attukal, Trivandrum.'),
  'END:VEVENT','END:VCALENDAR'];
  // Fold to 75 UTF-8 octets for standards-compliant calendar clients.
  return lines.map(line => { let out='', row='', length=0; for(const char of line){ const size=new TextEncoder().encode(char).length; if(length+size>75){out+=row+'\r\n';row=' ';length=1;}row+=char;length+=size;}return out+row; }).join('\r\n')+'\r\n';
}
document.querySelectorAll('[data-calendar]').forEach(button => button.addEventListener('click', () => {
  const url=URL.createObjectURL(new Blob([calendarText(button.dataset.calendar)],{type:'text/calendar;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='akhil-parvathy-'+button.dataset.calendar+'.ics';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
}));

// Scroll-driven story: one scheduled frame per scroll, no permanent animation loop.
const journey = document.querySelector('.story-journey');
if (journey) {
  const stage = journey.querySelector('.story-stage');
  const chapters = [...journey.querySelectorAll('[data-chapter]')];
  const steps = [...journey.querySelectorAll('[data-story-step]')];
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  let pending = false, currentChapter = -1;
  function updateJourney() {
    pending = false;
    const travel = Math.max(1, journey.offsetHeight - stage.offsetHeight);
    const progress = clamp(-journey.getBoundingClientRect().top / travel);
    const chapter = progress < .38 ? 0 : progress < .77 ? 1 : 2;
    const approach = reduceMotion.matches ? (chapter === 0 ? 0 : 1) : smooth(progress / .48);
    const outfit = reduceMotion.matches ? (chapter === 2 ? 1 : 0) : smooth((progress - .73) / .15);
    stage.style.setProperty('--together', approach.toFixed(4));
    stage.style.setProperty('--wedding', outfit.toFixed(4));
    stage.style.setProperty('--story-progress', progress.toFixed(4));
    if (chapter !== currentChapter) {
      currentChapter = chapter;
      chapters.forEach((item, index) => {
        item.classList.toggle('is-current', index === chapter);
        item.setAttribute('aria-hidden', String(index !== chapter));
      });
      steps.forEach((button, index) => button.setAttribute('aria-pressed', String(index === chapter)));
      stage.dataset.chapter = String(chapter);
    }
  }
  function queueJourney() {
    if (!pending) { pending = true; requestAnimationFrame(updateJourney); }
  }
  window.addEventListener('scroll', queueJourney, { passive: true });
  window.addEventListener('resize', queueJourney, { passive: true });
  reduceMotion.addEventListener('change', queueJourney);
  const resizeObserver = new ResizeObserver(queueJourney);
  resizeObserver.observe(journey); resizeObserver.observe(stage);
  steps.forEach(button => button.addEventListener('click', () => {
    stopAuto();
    const step = Number(button.dataset.storyStep);
    const amount = [0, .55, 1][step];
    const top = journey.getBoundingClientRect().top + scrollY;
    const target = top + amount * (journey.offsetHeight - stage.offsetHeight);
    // Chapter buttons provide the same experience without repeated swiping.
    window.scrollTo({ top: target, behavior: reduceMotion.matches ? 'instant' : 'smooth' });
  }));
  updateJourney();
}
