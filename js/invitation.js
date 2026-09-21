'use strict';
const CONFIG = Object.freeze({
  // Add your own photo paths here; null preserves the supplied watercolor artwork.
  IMAGES: { hero: null, venue: null, closing: null },
  // Direct browser access to the public Drive folder; works on GitHub Pages.
  MEMORIES: {
    // Paste your website-restricted Google Drive API key between these quotes.
    API_KEY: 'AIzaSyCgpJwNoIdqQ6ivI19PRVKwQsA3PV6xnXQ',
    DRIVE_FOLDER_URL: 'https://drive.google.com/drive/folders/14RPlhVn7WI57b8FyhFIek-qcvVm_2_Oa?usp=sharing'
  },
  MAPS: {
    temple: 'https://www.google.com/maps/search/?api=1&query=Attukal+Bhagavathy+Temple+Thiruvananthapuram',
    auditorium: 'https://www.google.com/maps/search/?api=1&query=Viswaroopam+Auditorium+Attukal+Thiruvananthapuram',
    reception: 'https://www.google.com/maps/search/?api=1&query=Al+Saj+Arena+Kulathoor+Thiruvananthapuram'
  }
});
document.documentElement.classList.add('js');
const envelope = document.querySelector('#envelope-intro');
const invitationContent = document.querySelector('#invitation-content');
if (envelope && invitationContent) invitationContent.inert = true;
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
  window.addEventListener('invitation-opened', () => {
    stopped = reduceMotion.matches || !mobileLayout.matches;
    (hero ? hero.decode().catch(() => {}) : Promise.resolve()).then(() => {
      if (!stopped && scrollY < 10) timer = setTimeout(() => advance(1), 8500);
    });
  }, { once: true });
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
  const chapters = [...journey.querySelectorAll('.journey-copy [data-chapter]')];
  const art = journey.querySelector('.journey-art');
  const avatars = [...journey.querySelectorAll('.avatar')];
  let viewportWidth = 0, viewportHeight = 0;
  function sizeJourney() {
    // Freeze height through mobile toolbar expansion; recalculate on rotation.
    if (innerWidth !== viewportWidth || !viewportHeight) {
      viewportWidth = innerWidth;
      viewportHeight = innerHeight;
      journey.style.setProperty('--story-height', `${viewportHeight}px`);
    }
    const phone = viewportWidth <= 700;
    const short = viewportHeight <= 650;
    const size = Math.max(60, Math.min(
      viewportWidth * (short ? .40 : phone ? .57 : .44),
      viewportHeight * (short ? .36 : phone ? .40 : .49),
      phone ? Infinity : 440, art.clientHeight - (short ? 36 : phone ? 40 : 44)
    ));
    avatars.forEach(avatar => avatar.style.setProperty('--avatar-size', `${size}px`));
    queueJourney();
  }
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
    // Explicit pixel transforms avoid newer CSS arithmetic/container-unit dependencies.
    const phone = innerWidth <= 700;
    const far = phone ? innerWidth * .25 : Math.min(innerWidth * .27, 340);
    const near = phone ? innerWidth * .10 : Math.min(innerWidth * .10, 86);
    const distance = far + (near - far) * approach;
    avatars.forEach((avatar, index) => {
      const offset = index === 0 ? -distance : distance;
      avatar.style.transform = `translate3d(calc(-50% + ${offset}px), -50%, 0)`;
      avatar.querySelector('.avatar-casual').style.opacity = String(1 - outfit);
      avatar.querySelector('.avatar-wedding').style.opacity = String(outfit);
    });
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
  document.addEventListener('scroll', queueJourney, { passive: true, capture: true });
  window.addEventListener('resize', sizeJourney, { passive: true });
  window.visualViewport?.addEventListener('scroll', queueJourney, { passive: true });
  window.addEventListener('pageshow', sizeJourney);
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', queueJourney);
  else reduceMotion.addListener(queueJourney);
  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(sizeJourney);
    resizeObserver.observe(art);
  }
  document.fonts?.ready.then(sizeJourney);
  sizeJourney();
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

// One pointer controls the card directly; only release starts a settling animation.
const dragEnvelope = document.querySelector('#reveal-invitation');
if (envelope && invitationContent && dragEnvelope) {
  let progress = 0, pointerId = null, startY = 0, startProgress = 0;
  let dragDistance = 180, revealed = false, settling = false, settleFrame;
  const card = envelope.querySelector('.secret-card');
  const clamp = value => Math.max(0, Math.min(1, value));
  function render(value) {
    progress = clamp(value);
    dragEnvelope.style.setProperty('--pull', progress);
    dragEnvelope.style.setProperty('--flap', `${-175 * clamp(progress / .55)}deg`);
    dragEnvelope.style.setProperty('--flap-layer', progress > .28 ? 1 : 4);
    dragEnvelope.style.setProperty('--seal-opacity', 1 - clamp(progress / .2));
    dragEnvelope.style.setProperty('--copy-opacity', clamp((progress - .25) / .3));
    dragEnvelope.style.setProperty('--date-opacity', clamp((progress - .6) / .3));
  }
  function settle(target) {
    settling = true;
    const from = progress, start = performance.now();
    const duration = reduceMotion.matches ? 0 : target ? 700 : 480;
    function frame(now) {
      const t = duration ? clamp((now - start) / duration) : 1;
      render(from + (target - from) * (1 - Math.pow(1 - t, 3)));
      if (t < 1) { settleFrame = requestAnimationFrame(frame); return; }
      settling = false;
      if (target) {
        revealed = true;
        envelope.classList.add('is-revealed');
        dragEnvelope.setAttribute('aria-expanded', 'true');
        card.setAttribute('aria-hidden', 'false');
        document.querySelector('#reveal-status').textContent = 'We are getting married on 22 November 2026.';
        openInvitation();
      } else envelope.classList.remove('has-dragged');
    }
    settleFrame = requestAnimationFrame(frame);
  }
  dragEnvelope.addEventListener('pointerdown', event => {
    if (revealed || settling || pointerId !== null || !event.isPrimary || event.button !== 0) return;
    pointerId = event.pointerId;
    startY = event.clientY;
    startProgress = progress;
    dragDistance = Math.min(230, dragEnvelope.clientWidth * .58);
    dragEnvelope.setPointerCapture(pointerId);
    envelope.classList.add('has-dragged');
    stopAuto();
  });
  dragEnvelope.addEventListener('pointermove', event => {
    if (event.pointerId !== pointerId) return;
    render(startProgress + (startY - event.clientY) / dragDistance);
  });
  function endDrag(event) {
    if (event.pointerId !== pointerId) return;
    const id = pointerId;
    pointerId = null;
    if (dragEnvelope.hasPointerCapture(id)) dragEnvelope.releasePointerCapture(id);
    settle(event.type === 'pointerup' && progress >= .65 ? 1 : 0);
  }
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => dragEnvelope.addEventListener(type, endDrag));
  dragEnvelope.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (revealed || settling || pointerId !== null) return;
    envelope.classList.add('has-dragged');
    settle(1);
  });
  // Keep keyboard focus on the envelope until the automatic handoff completes.
  envelope.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    dragEnvelope.focus({ preventScroll: true });
  });
  async function openInvitation() {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.body.classList.add('invitation-revealing');
    envelope.classList.add('is-leaving');
    await new Promise(resolve => setTimeout(resolve, reduceMotion.matches ? 0 : 600));
    envelope.hidden = true;
    invitationContent.inert = false;
    document.body.classList.remove('envelope-closed', 'invitation-revealing');
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    document.querySelector('#save-date').classList.add('active');
    const title = document.querySelector('#couple-title');
    title.setAttribute('tabindex', '-1');
    title.focus({ preventScroll: true });
    window.dispatchEvent(new Event('invitation-opened'));
  }
  render(0);
}

// Explicit offset keeps the wedding instant the same for guests in every timezone.
const countdown = document.querySelector('.wedding-countdown');
if (countdown) {
  const weddingTime = Date.parse('2026-11-22T07:45:00+05:30');
  const units = ['days', 'hours', 'minutes', 'seconds'].map(unit =>
    countdown.querySelector(`[data-countdown="${unit}"]`));
  let countdownInterval;
  function updateCountdown() {
    const remaining = Math.max(0, Math.ceil((weddingTime - Date.now()) / 1000));
    const values = [Math.floor(remaining / 86400), Math.floor(remaining / 3600) % 24,
      Math.floor(remaining / 60) % 60, remaining % 60];
    units.forEach((element, index) => { element.textContent = String(values[index]).padStart(2, '0'); });
    if (remaining === 0) {
      countdown.querySelector('h2').textContent = 'Our forever has begun';
      clearInterval(countdownInterval);
    }
  }
  countdownInterval = setInterval(updateCountdown, 1000);
  updateCountdown();
}

// Query every page of the public folder directly from Google's API.
async function fetchDriveMemories() {
  const key = CONFIG.MEMORIES.API_KEY.trim();
  if (!key) throw new Error('Drive API key is not configured');
  const folderUrl = new URL(CONFIG.MEMORIES.DRIVE_FOLDER_URL);
  const folderId = folderUrl.pathname.match(/\/folders\/([\w-]+)/)?.[1];
  if (folderUrl.hostname !== 'drive.google.com' || !folderId) throw new Error('Invalid Drive folder');
  const signal = AbortSignal.timeout(35000);
  const files = [];
  const seenPages = new Set();
  let pageToken = '';
  do {
    const params = new URLSearchParams({
      key,
      q: `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`,
      fields: 'nextPageToken,files(id,name,mimeType,resourceKey)',
      pageSize: '100',
      orderBy: 'name'
    });
    if (pageToken) params.set('pageToken', pageToken);
    const resourceKey = folderUrl.searchParams.get('resourcekey');
    const headers = resourceKey ? { 'X-Goog-Drive-Resource-Keys': `${folderId}/${resourceKey}` } : {};
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      cache: 'no-store', credentials: 'omit', signal, headers
    });
    if (!response.ok) throw new Error(`Drive request failed (${response.status})`);
    const data = await response.json();
    if (!Array.isArray(data.files)) throw new Error('Invalid Drive response');
    files.push(...data.files.filter(file => /^[\w-]+$/.test(file.id) && file.mimeType?.startsWith('image/')));
    pageToken = data.nextPageToken || '';
    if (pageToken && seenPages.has(pageToken)) throw new Error('Repeated Drive page token');
    seenPages.add(pageToken);
  } while (pageToken);
  return [...new Map(files.map(file => [file.id, file])).values()].map((file, index) => {
    const params = new URLSearchParams({ id: file.id, sz: 'w1600' });
    if (file.resourceKey) params.set('resourcekey', file.resourceKey);
    return { src: `https://drive.google.com/thumbnail?${params}`, alt: `Our memories, photo ${index + 1}`};
  });
}

// Preserve the photo-card gallery, shimmer, and full-screen viewer.
async function loadMemories() {
  const gallery = document.querySelector('#memories-gallery');
  const status = document.querySelector('#memories-status');
  const viewer = document.querySelector('.memory-viewer');
  if (!gallery || !viewer) return;
  const album = document.querySelector('.memories-album-dialog');
  const albumGrid = document.querySelector('#memories-all-photos');
  const openAlbum = document.querySelector('#memories-open-album');
  const updateScrollLock = () => document.body.classList.toggle('memory-viewer-open', viewer.open || album.open);
  // Native dialogs keep focus inside; only keyboard interaction needs a focus ring.
  let viewerTrigger = null;
  document.addEventListener('pointerdown', () => document.body.classList.add('memories-pointer-mode'), { capture: true, passive: true });
  document.addEventListener('keydown', event => {
    if (['Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' '].includes(event.key)) {
      document.body.classList.remove('memories-pointer-mode');
    }
  }, true);

  openAlbum.addEventListener('click', () => { stopAuto(); album.showModal(); updateScrollLock(); });
  album.querySelector('.album-close').addEventListener('click', () => album.close());
  // album.addEventListener('click', event => { if (event.target === album) album.close(); });
  album.addEventListener('close', () => { updateScrollLock(); openAlbum.focus({ preventScroll: true }); });
  // Show stationery-shaped placeholders immediately while the folder is fetched.
  gallery.replaceChildren(...Array.from({ length: 5 }, () => {
    const placeholder = document.createElement('div');
    placeholder.className = 'memory-print memory-skeleton';
    placeholder.setAttribute('aria-hidden', 'true');
    placeholder.innerHTML = '<div class="memory-image-placeholder"></div><span class="memory-caption-placeholder"></span>';
    return placeholder;
  }));
  try {
    const photos = await fetchDriveMemories();
    let selected = 0;
    function show(index) {
      selected = (index + photos.length) % photos.length;
      viewer.querySelector('img').src = photos[selected].src;
      viewer.querySelector('img').alt = photos[selected].alt;
      viewer.querySelector('figcaption').textContent = `${selected + 1} / ${photos.length}`;
    }
    gallery.replaceChildren();
    function createPhoto(photo, index, target) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'memory-print is-loading';
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
      button.setAttribute('aria-label', `View photo: ${photo.caption}`);
      const img = document.createElement('img');
      img.alt = photo.alt;
      img.loading = 'eager';
      img.referrerPolicy = 'no-referrer';
      const caption = document.createElement('span');
      caption.textContent = photo.caption;
      let finished = false;
      const finish = success => {
        if (finished) return;
        finished = true;
        clearTimeout(imageTimeout);
        button.classList.remove('is-loading');
        button.setAttribute('aria-busy', 'false');
        button.disabled = !success;
        if (!success) { img.hidden = true; caption.textContent = 'Photo temporarily unavailable'; }
      };
      const imageTimeout = setTimeout(() => finish(false), 30000);
      img.addEventListener('load', () => finish(true), { once: true });
      img.addEventListener('error', () => finish(false), { once: true });
      img.src = photo.src;
      button.append(img, caption);
      button.addEventListener('click', () => { viewerTrigger = button; show(index); stopAuto(); viewer.showModal(); document.body.classList.add('memory-viewer-open'); });
      target.append(button);
    }
    photos.forEach((photo, index) => {
      if (index < 5) createPhoto(photo, index, gallery);
      createPhoto(photo, index, albumGrid);
    });
    const carouselControls = document.querySelector('.memories-carousel-controls');
    const previous = document.querySelector('#memories-previous');
    const next = document.querySelector('#memories-next');
    function updateCarousel() {
      const max = gallery.scrollWidth - gallery.clientWidth;
      carouselControls.hidden = photos.length < 2 || max < 2;
      previous.disabled = gallery.scrollLeft <= 2;
      next.disabled = gallery.scrollLeft >= max - 2;
    }
    function moveCarousel(direction) {
      const card = gallery.querySelector('.memory-print');
      if (!card) return;
      const gap = parseFloat(getComputedStyle(gallery).columnGap) || 0;
      gallery.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: reduceMotion.matches ? 'instant' : 'smooth' });
    }
    previous.addEventListener('click', () => moveCarousel(-1));
    next.addEventListener('click', () => moveCarousel(1));
    gallery.addEventListener('scroll', updateCarousel, { passive: true });
    gallery.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        moveCarousel(event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    new ResizeObserver(updateCarousel).observe(gallery);
    updateCarousel();
    openAlbum.hidden = photos.length === 0;
    viewer.querySelector('.memory-close').addEventListener('click', () => viewer.close());
    viewer.querySelector('.memory-previous').addEventListener('click', () => show(selected - 1));
    viewer.querySelector('.memory-next').addEventListener('click', () => show(selected + 1));
    viewer.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); show(selected + (event.key === 'ArrowRight' ? 1 : -1)); }
    });
    // viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
    viewer.addEventListener('close', () => {
      updateScrollLock();
      if (viewerTrigger?.isConnected) viewerTrigger.focus({ preventScroll: true });
    });
    status.hidden = photos.length > 0;
    status.textContent = photos.length ? '' : 'Our album is waiting for its first memories.';
  } catch (error) {
    gallery.replaceChildren();
    status.hidden = false;
    status.textContent = 'Our photos couldn’t load just now. Please refresh the page to try again.';
  } finally { gallery.setAttribute('aria-busy', 'false'); }
}
loadMemories();
