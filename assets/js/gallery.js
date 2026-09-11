const COPY = {
  de: { title: 'Linnys Welten', note: 'Ein Zauberbuch. Unzählige Abenteuer.', all: 'Alle Motive', epic: 'Solisium', fun: 'Auszeit', fresh: 'Neue Anime-Motive', open: 'Bild öffnen', play: 'Diashow starten', pause: 'Diashow pausieren', prev: 'Vorheriges Bild', next: 'Nächstes Bild', worlds: 'Themenwelt wählen', visit: 'Galerie entdecken', art: 'Bild ansehen' },
  en: { title: "Linny’s worlds", note: 'One spellbook. Countless adventures.', all: 'All artwork', epic: 'Solisium', fun: 'Time out', fresh: 'New anime artwork', open: 'Open artwork', play: 'Start slideshow', pause: 'Pause slideshow', prev: 'Previous image', next: 'Next image', worlds: 'Choose a world', visit: 'Explore gallery', art: 'View artwork' }
};

export const NEW_ART = [
  { src: 'assets/events/gallery/linny-astral-atelier-v2.webp', group: 'fresh', title: { de: 'Das Astrale Atelier', en: 'The Astral Atelier' } },
  { src: 'assets/events/gallery/linny-summer-reverie-v2.webp', group: 'fresh', title: { de: 'Sommer zwischen den Welten', en: 'Summer Between Worlds' } },
  { src: 'assets/events/themes/time-vortex/linny-time-traveller-v2.webp', group: 'fresh', title: { de: 'Die Hüterin der Zeit', en: 'The Keeper of Time' } }
];

export function createGallery({ epic, fun, openImage, themeSelect }) {
  const root = document.getElementById('artGallery');
  const grid = document.getElementById('galleryGrid');
  const filters = document.getElementById('galleryFilters');
  const worlds = document.getElementById('worldNav');
  const dialog = document.getElementById('imageLightbox');
  const entries = [...NEW_ART, ...epic.map(item => ({ ...item, group: 'epic' })), ...fun.map(item => ({ ...item, group: 'fun' }))];
  const seen = new Set();
  const unique = entries.filter(item => {
    if (seen.has(item.src)) return false;
    seen.add(item.src);
    return true;
  });
  let language = 'de';
  let group = 'fresh';
  let current = -1;
  let interval = null;
  let active = unique;
  const copy = () => COPY[language] || COPY.de;
  const title = item => item.title[language] || item.title.de;
  const play = document.getElementById('galleryPlay');
  const prev = document.getElementById('galleryPrev');
  const next = document.getElementById('galleryNext');

  function stop() {
    window.clearInterval(interval);
    interval = null;
    play.textContent = copy().play;
    play.setAttribute('aria-pressed', 'false');
  }
  function show(index) {
    current = (index + active.length) % active.length;
    openImage(active[current]);
    prev.hidden = next.hidden = play.hidden = false;
    document.getElementById('galleryPosition').textContent = `${current + 1} / ${active.length}`;
  }
  function renderGrid() {
    active = unique.filter(item => group === 'all' || item.group === group);
    const fragment = document.createDocumentFragment();
    active.forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'gallery-art';
      button.setAttribute('aria-label', `${copy().open}: ${title(item)}`);
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = title(item);
      img.loading = 'lazy';
      img.decoding = 'async';
      img.width = 768;
      img.height = 512;
      const caption = document.createElement('span');
      caption.textContent = title(item);
      button.append(img, caption);
      button.addEventListener('click', () => show(index));
      fragment.append(button);
    });
    grid.replaceChildren(fragment);
    document.getElementById('galleryCount').textContent = String(active.length).padStart(2, '0');
    filters.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.group === group)));
  }
  function update(lang, theme) {
    const focusedWorld = document.activeElement?.dataset.world;
    language = lang;
    document.getElementById('galleryTitle').textContent = copy().title;
    document.getElementById('galleryNote').textContent = copy().note;
    document.getElementById('heroGalleryLink').textContent = copy().visit;
    document.getElementById('heroArtBtn').textContent = copy().art;
    worlds.setAttribute('aria-label', copy().worlds);
    worlds.replaceChildren(...Array.from(themeSelect.options, (option, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.world = option.value;
      button.setAttribute('aria-pressed', String(option.value === theme));
      const number = document.createElement('small');
      number.textContent = String(i + 1).padStart(2, '0');
      const label = document.createElement('span');
      label.textContent = option.textContent;
      button.append(number, label);
      button.addEventListener('click', () => {
        themeSelect.value = option.value;
        themeSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
      });
      return button;
    }));
    filters.replaceChildren(...['all', 'fresh', 'epic', 'fun'].map(value => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.group = value;
      button.textContent = copy()[value];
      button.addEventListener('click', () => { group = value; stop(); renderGrid(); });
      return button;
    }));
    prev.setAttribute('aria-label', copy().prev);
    next.setAttribute('aria-label', copy().next);
    play.textContent = copy()[interval ? 'pause' : 'play'];
    renderGrid();
    if (focusedWorld) worlds.querySelector(`[data-world="${focusedWorld}"]`)?.focus();
  }
  prev.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  play.addEventListener('click', () => {
    if (interval) { stop(); return; }
    play.textContent = copy().pause;
    play.setAttribute('aria-pressed', 'true');
    interval = window.setInterval(() => { if (!document.hidden) show(current + 1); }, 7000);
  });
  dialog.addEventListener('keydown', event => {
    if (current < 0 || event.target.matches('input, select, textarea')) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
  });
  dialog.addEventListener('close', () => {
    stop(); current = -1;
    prev.hidden = next.hidden = play.hidden = true;
    document.getElementById('galleryPosition').textContent = '';
  });
  root.hidden = false;
  return { update };
}
