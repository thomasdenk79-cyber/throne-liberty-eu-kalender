import { UI } from "./i18n.js";
import {
  clone, mergeConfig, normalizeConfig, notificationSettings, positiveSeconds,
  parseIniConfig, applyLiveTimerOverrides, serializeIniConfig
} from "./config.js";
import { CURATED_SOUNDS, scheduleNotificationSound } from "./sounds.js";
import {
  calculateRecentTimerState, calculateTimerOccurrences, compactDuration,
  intervalSecondsFromRules
} from "./schedule.js";
import { calendarEntryKey, downloadIcs as downloadCalendarIcs } from "./ics.js";

const CARD_DENSITY_VALUES = ["ultra", "compact", "comfortable", "cinematic", "big-picture", "mega"];
const BAVARIA_TIMEZONE = "Bayern/Munich";
const CONFIG_UPDATED_AT = "2026-07-24T00:00:00Z";
const APP_VERSION = document.querySelector('meta[name="app-version"]')?.getAttribute("content") || "3.3.6";
const GA4_MEASUREMENT_ID = (document.querySelector('meta[name="ga4-measurement-id"]')?.getAttribute("content") || "").trim();
const PLAUSIBLE_DOMAIN = (document.querySelector('meta[name="plausible-domain"]')?.getAttribute("content") || "").trim();
const COUNTAPI_NAMESPACE = (document.querySelector('meta[name="countapi-namespace"]')?.getAttribute("content") || "").trim();
const COUNTAPI_KEY = (document.querySelector('meta[name="countapi-key"]')?.getAttribute("content") || "").trim();
const germanClient = (navigator.language || "").toLowerCase().startsWith("de");
const clientDefaultLanguage = germanClient ? "bar" : "en";
const clientDefaultTimezone = germanClient ? BAVARIA_TIMEZONE : "Europe/Berlin";
const localeDefaultsKey = "timer_locale_defaults_v26";
const STORAGE_CONSENT_KEY = "timer_storage_consent_v1";
const LEGAL_PROFILE = {
  name: "Thomas Denk",
  address: ["Stubaierstr. 17", "81739 München", "Deutschland"],
  email: "thomas.denk79@gmail.com"
};
let storageDecision = "";
let storageConsent = false;
let deferredInstallPrompt = null;
let analyticsInitialized = false;
try {
  storageDecision = localStorage.getItem(STORAGE_CONSENT_KEY) || "";
  storageConsent = storageDecision === "accepted";
} catch {
  storageDecision = "";
  storageConsent = false;
}

function storageGet(key) {
  if (!storageConsent) return null;
  try { return localStorage.getItem(key); } catch { return null; }
}

function storageSet(key, value) {
  if (!storageConsent) return;
  try { localStorage.setItem(key, value); } catch { /* Browser storage may be unavailable. */ }
}

const state = {
  lang: storageGet("timer_language") || clientDefaultLanguage,
  baseConfig: null,
  liveOverlayText: "",
  liveOverlayError: "",
  localConfigError: "",
  localConfig: null,
  mergedConfig: null,
  categoryId: "",
  displayTimezone: clientDefaultTimezone,
  visibleIds: new Set(),
  calendarSelection: new Set(),
  calendarEntries: new Map(),
  historyMinutes: 30,
  historyCollapsed: false,
  cardDensity: "compact",
  theme: "astral",
  notificationOverride: "default",
  colorblindMode: false,
  showThumbnails: true,
  imageZoom: "large",
  liveCollapsed: false,
  calendarCollapsed: false,
  editorSide: storageGet("timer_editor_side") === "right" ? "right" : "left",
  editorCollapsed: false,
  cardRenderKey: "",
  artRotationBucket: Math.floor(Date.now() / 600000),
  editingTimerId: "",
  notified: new Set(),
  audioContext: null,
  popupTimer: null,
  imageLightboxZoomScale: 1,
  imageLightboxOriginX: 50,
  imageLightboxOriginY: 50,
  visitorCount: null,
  visitorCounterFailed: false,
  lastNotificationCheck: Date.now() - 1500,
  dockMode: new URLSearchParams(window.location.search).get("mode") === "dock",
  dockSide: new URLSearchParams(window.location.search).get("dockSide") || storageGet("timer_dock_side") || "right"
};

if (state.dockMode) {
  document.documentElement.classList.add("dock-mode");
  document.documentElement.dataset.dockSide = state.dockSide;
}

const dom = {
  brandTitle: document.getElementById("brandTitle"),
  brandSub: document.getElementById("brandSub"),
  localClock: document.getElementById("localClock"),
  serverClock: document.getElementById("serverClock"),
  heroTitle: document.getElementById("heroTitle"),
  heroSection: document.getElementById("heroSection"),
  heroCharacter: document.getElementById("heroCharacter"),
  heroText: document.getElementById("heroText"),
  heroChipAi: document.getElementById("heroChipAi"),
  heroChipLive: document.getElementById("heroChipLive"),
  heroChipPwa: document.getElementById("heroChipPwa"),
  langDeBtn: document.getElementById("langDeBtn"),
  langEnBtn: document.getElementById("langEnBtn"),
  langBarBtn: document.getElementById("langBarBtn"),
  startupError: document.getElementById("startupError"),
  dashboardMain: document.querySelector(".dashboard-main"),
  editorPanel: document.getElementById("editorPanel"),
  editorTitle: document.getElementById("editorTitle"),
  editorSideBtn: document.getElementById("editorSideBtn"),
  editorCollapseBtn: document.getElementById("editorCollapseBtn"),
  editorCloseIconBtn: document.getElementById("editorCloseIconBtn"),
  editorNote: document.getElementById("editorNote"),
  editNameLabel: document.getElementById("editNameLabel"),
  editCategoryLabel: document.getElementById("editCategoryLabel"),
  editTimezoneLabel: document.getElementById("editTimezoneLabel"),
  editFromLabel: document.getElementById("editFromLabel"),
  editUntilLabel: document.getElementById("editUntilLabel"),
  editDurationLabel: document.getElementById("editDurationLabel"),
  editDurationHelp: document.getElementById("editDurationHelp"),
  editAnchorLabel: document.getElementById("editAnchorLabel"),
  editIntervalLabel: document.getElementById("editIntervalLabel"),
  editIntervalSeconds: document.getElementById("editIntervalSeconds"),
  editIntervalHelp: document.getElementById("editIntervalHelp"),
  applyIntervalBtn: document.getElementById("applyIntervalBtn"),
  editRulesLabel: document.getElementById("editRulesLabel"),
  editRulesHelp: document.getElementById("editRulesHelp"),
  editNotifLabel: document.getElementById("editNotifLabel"),
  editNotifyWarningEnabledLabel: document.getElementById("editNotifyWarningEnabledLabel"),
  editNotifyWarningLabel: document.getElementById("editNotifyWarningLabel"),
  editNotifyWarningHelp: document.getElementById("editNotifyWarningHelp"),
  editNotifyWarningSoundLabel: document.getElementById("editNotifyWarningSoundLabel"),
  editNotifyWarningDurationLabel: document.getElementById("editNotifyWarningDurationLabel"),
  editNotifyCriticalEnabledLabel: document.getElementById("editNotifyCriticalEnabledLabel"),
  editNotifyCriticalLabel: document.getElementById("editNotifyCriticalLabel"),
  editNotifyCriticalHelp: document.getElementById("editNotifyCriticalHelp"),
  editNotifyCriticalSoundLabel: document.getElementById("editNotifyCriticalSoundLabel"),
  editNotifyCriticalDurationLabel: document.getElementById("editNotifyCriticalDurationLabel"),
  categoryLabel: document.getElementById("categoryLabel"),
  settingsGroupCategoryLabel: document.getElementById("settingsGroupCategoryLabel"),
  settingsGroupDisplayLabel: document.getElementById("settingsGroupDisplayLabel"),
  dockLaunchLabel: document.getElementById("dockLaunchLabel"),
  displayZoneLabel: document.getElementById("displayZoneLabel"),
  historyMinutesLabel: document.getElementById("historyMinutesLabel"),
  historyMinutesHelp: document.getElementById("historyMinutesHelp"),
  cardDensityLabel: document.getElementById("cardDensityLabel"),
  cardDensitySelect: document.getElementById("cardDensitySelect"),
  themeLabel: document.getElementById("themeLabel"),
  themeSelect: document.getElementById("themeSelect"),
  accessibilityLabel: document.getElementById("accessibilityLabel"),
  colorblindModeInput: document.getElementById("colorblindModeInput"),
  colorblindModeLabel: document.getElementById("colorblindModeLabel"),
  showThumbnailsInput: document.getElementById("showThumbnailsInput"),
  showThumbnailsLabel: document.getElementById("showThumbnailsLabel"),
  imageZoomLabel: document.getElementById("imageZoomLabel"),
  imageZoomSelect: document.getElementById("imageZoomSelect"),
  configUpdatedStatus: document.getElementById("configUpdatedStatus"),
  configLiveStatus: document.getElementById("configLiveStatus"),
  configExpiryStatus: document.getElementById("configExpiryStatus"),
  quickActionsLabel: document.getElementById("quickActionsLabel"),
  visibilityLabel: document.getElementById("visibilityLabel"),
  stackLabel: document.getElementById("stackLabel"),
  calendarLabel: document.getElementById("calendarLabel"),
  footerSummary: document.getElementById("footerSummary"),
  visitorCounter: document.getElementById("visitorCounter"),
  categorySelect: document.getElementById("categorySelect"),
  displayTimezone: document.getElementById("displayTimezone"),
  historyMinutesInput: document.getElementById("historyMinutesInput"),
  timerToggle: document.getElementById("timerToggle"),
  newTimerBtn: document.getElementById("newTimerBtn"),
  exportBtn: document.getElementById("exportBtn"),
  importBtn: document.getElementById("importBtn"),
  importInput: document.getElementById("importInput"),
  newCategoryBtn: document.getElementById("newCategoryBtn"),
  renameCategoryBtn: document.getElementById("renameCategoryBtn"),
  deleteCategoryBtn: document.getElementById("deleteCategoryBtn"),
  cardStack: document.getElementById("cardStack"),
  liveColumn: document.getElementById("liveColumn"),
  liveCollapseBtn: document.getElementById("liveCollapseBtn"),
  currentEventsSection: document.getElementById("currentEventsSection"),
  currentEventsLabel: document.getElementById("currentEventsLabel"),
  historyToggleBtn: document.getElementById("historyToggleBtn"),
  currentEventsList: document.getElementById("currentEventsList"),
  calendarGroups: document.getElementById("calendarGroups"),
  calendarSection: document.getElementById("calendarSection"),
  calendarCollapseBtn: document.getElementById("calendarCollapseBtn"),
  toastWrap: document.getElementById("toastWrap"),
  editName: document.getElementById("editName"),
  editCategory: document.getElementById("editCategory"),
  editTimezone: document.getElementById("editTimezone"),
  editFrom: document.getElementById("editFrom"),
  editUntil: document.getElementById("editUntil"),
  editDuration: document.getElementById("editDuration"),
  editAnchor: document.getElementById("editAnchor"),
  setAnchorNowBtn: document.getElementById("setAnchorNowBtn"),
  editRules: document.getElementById("editRules"),
  warningNotificationCard: document.getElementById("warningNotificationCard"),
  criticalNotificationCard: document.getElementById("criticalNotificationCard"),
  editNotifyWarningEnabled: document.getElementById("editNotifyWarningEnabled"),
  editNotifyWarningSeconds: document.getElementById("editNotifyWarningSeconds"),
  editNotifyWarningSound: document.getElementById("editNotifyWarningSound"),
  editNotifyWarningDuration: document.getElementById("editNotifyWarningDuration"),
  testWarningSoundBtn: document.getElementById("testWarningSoundBtn"),
  testWarningAlarmBtn: document.getElementById("testWarningAlarmBtn"),
  editNotifyCriticalEnabled: document.getElementById("editNotifyCriticalEnabled"),
  editNotifyCriticalSeconds: document.getElementById("editNotifyCriticalSeconds"),
  editNotifyCriticalSound: document.getElementById("editNotifyCriticalSound"),
  editNotifyCriticalDuration: document.getElementById("editNotifyCriticalDuration"),
  testCriticalSoundBtn: document.getElementById("testCriticalSoundBtn"),
  testCriticalAlarmBtn: document.getElementById("testCriticalAlarmBtn"),
  channelBrowser: document.getElementById("channelBrowser"),
  channelBrowserLabel: document.getElementById("channelBrowserLabel"),
  channelPopup: document.getElementById("channelPopup"),
  channelPopupLabel: document.getElementById("channelPopupLabel"),
  builderTitle: document.getElementById("builderTitle"),
  builderDays: document.getElementById("builderDays"),
  builderTimesLabel: document.getElementById("builderTimesLabel"),
  builderTimeList: document.getElementById("builderTimeList"),
  builderAddTimeBtn: document.getElementById("builderAddTimeBtn"),
  builderAddBtn: document.getElementById("builderAddBtn"),
  builderClearBtn: document.getElementById("builderClearBtn"),
  builderLines: document.getElementById("builderLines"),
  saveTimerBtn: document.getElementById("saveTimerBtn"),
  duplicateTimerBtn: document.getElementById("duplicateTimerBtn"),
  deleteTimerBtn: document.getElementById("deleteTimerBtn"),
  resetTimerBtn: document.getElementById("resetTimerBtn"),
  closeEditorBtn: document.getElementById("closeEditorBtn"),
  calendarHelp: document.getElementById("calendarHelp"),
  calendarSelectionStatus: document.getElementById("calendarSelectionStatus"),
  calendarSelectAll: document.getElementById("calendarSelectAll"),
  calendarSelectAllLabel: document.getElementById("calendarSelectAllLabel"),
  downloadSelectedIcsBtn: document.getElementById("downloadSelectedIcsBtn"),
  notificationSetupTitle: document.getElementById("notificationSetupTitle"),
  notificationOverrideLabel: document.getElementById("notificationOverrideLabel"),
  notificationOverrideSelect: document.getElementById("notificationOverrideSelect"),
  notificationPermissionStatus: document.getElementById("notificationPermissionStatus"),
  pageActivityStatus: document.getElementById("pageActivityStatus"),
  enableNotificationsBtn: document.getElementById("enableNotificationsBtn"),
  dockPad: document.getElementById("dockPad"),
  eventPopup: document.getElementById("eventPopup"),
  eventPopupLabel: document.getElementById("eventPopupLabel"),
  eventPopupTitle: document.getElementById("eventPopupTitle"),
  eventPopupText: document.getElementById("eventPopupText"),
  eventPopupCloseBtn: document.getElementById("eventPopupCloseBtn"),
  imageLightbox: document.getElementById("imageLightbox"),
  imageLightboxFrame: document.getElementById("imageLightboxFrame"),
  imageLightboxImage: document.getElementById("imageLightboxImage"),
  imageLightboxTitle: document.getElementById("imageLightboxTitle"),
  imageLightboxZoomBtn: document.getElementById("imageLightboxZoomBtn"),
  imageLightboxWallpaperBtn: document.getElementById("imageLightboxWallpaperBtn"),
  imageLightboxCloseBtn: document.getElementById("imageLightboxCloseBtn"),
  imageHoverPreview: document.getElementById("imageHoverPreview"),
  imageHoverPreviewImage: document.getElementById("imageHoverPreviewImage"),
  installAppBtn: document.getElementById("installAppBtn"),
  settingsToggleBtn: document.getElementById("settingsToggleBtn"),
  settingsPanel: document.getElementById("settingsPanel"),
  settingsPopover: document.getElementById("settingsPopover"),
  settingsPopoverTitle: document.getElementById("settingsPopoverTitle"),
  settingsPopoverCloseBtn: document.getElementById("settingsPopoverCloseBtn"),
  storageSettingsBtn: document.getElementById("storageSettingsBtn"),
  helpDocsLink: document.getElementById("helpDocsLink"),
  shareLabel: document.getElementById("shareLabel"),
  shareNativeBtn: document.getElementById("shareNativeBtn"),
  shareTelegramBtn: document.getElementById("shareTelegramBtn"),
  shareWhatsappBtn: document.getElementById("shareWhatsappBtn"),
  shareCopyBtn: document.getElementById("shareCopyBtn"),
  imprintBtn: document.getElementById("imprintBtn"),
  privacyBtn: document.getElementById("privacyBtn"),
  fanDisclaimer: document.getElementById("fanDisclaimer"),
  imprintDialog: document.getElementById("imprintDialog"),
  imprintTitle: document.getElementById("imprintTitle"),
  imprintContent: document.getElementById("imprintContent"),
  imprintCloseBtn: document.getElementById("imprintCloseBtn"),
  privacyDialog: document.getElementById("privacyDialog"),
  privacyTitle: document.getElementById("privacyTitle"),
  privacyContent: document.getElementById("privacyContent"),
  privacyCloseBtn: document.getElementById("privacyCloseBtn"),
  storageResetBtn: document.getElementById("storageResetBtn"),
  storageConsent: document.getElementById("storageConsent"),
  storageConsentTitle: document.getElementById("storageConsentTitle"),
  storageConsentText: document.getElementById("storageConsentText"),
  storageAcceptBtn: document.getElementById("storageAcceptBtn"),
  storageDeclineBtn: document.getElementById("storageDeclineBtn"),
  storagePrivacyBtn: document.getElementById("storagePrivacyBtn")
};

function text(key) {
  return UI[state.lang]?.[key] || UI.de[key] || key;
}

function resolveTimeZone(timeZone) {
  return timeZone === BAVARIA_TIMEZONE ? "Europe/Berlin" : timeZone;
}

function displayTimeZoneName(timeZone) {
  if (timeZone !== BAVARIA_TIMEZONE) return timeZone;
  if (state.lang === "bar") return "Bayern/Munich · Minga 🥨";
  if (state.lang === "de") return "Bayern/Munich · München 🥨";
  return "Bavaria/Munich 🥨";
}

function isStandaloneMode() {
  return window.matchMedia?.("(display-mode: standalone)").matches
    || window.navigator.standalone === true;
}

function updateInstallButton() {
  const standalone = isStandaloneMode();
  dom.installAppBtn.hidden = false;
  dom.installAppBtn.disabled = standalone;
  dom.installAppBtn.textContent = text(standalone ? "appRunning" : "installApp");
}

function installFallbackHint() {
  const ua = navigator.userAgent || "";
  const isIos = /iPad|iPhone|iPod/.test(ua);
  const isMac = /Macintosh/.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua);
  if (isIos || (isMac && isSafari)) return text("installManualHintIos");
  return text("installManualHintDesktop");
}

function buildShareData() {
  const url = new URL("./", window.location.href).href;
  const title = text("heroTitle");
  const summary = text("heroText");
  return { url, title, summary };
}

function openShareWindow(url) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function updateShareButtons() {
  dom.shareNativeBtn.hidden = !navigator.share;
}

function setCollapseDirection(button, direction) {
  button.dataset.direction = direction;
}

function updateCollapseButtons() {
  setCollapseDirection(dom.liveCollapseBtn, state.liveCollapsed ? "right" : "left");
  setCollapseDirection(dom.calendarCollapseBtn, state.calendarCollapsed ? "down" : "up");
}

function setLightboxZoomScale(scale, originX = state.imageLightboxOriginX, originY = state.imageLightboxOriginY) {
  const nextScale = Math.min(4, Math.max(1, Number(scale) || 1));
  state.imageLightboxZoomScale = nextScale;
  state.imageLightboxOriginX = Math.min(100, Math.max(0, Number(originX) || 50));
  state.imageLightboxOriginY = Math.min(100, Math.max(0, Number(originY) || 50));
  dom.imageLightboxFrame.classList.toggle("is-zoom-enabled", nextScale > 1.001);
  dom.imageLightboxImage.style.transformOrigin = `${state.imageLightboxOriginX.toFixed(2)}% ${state.imageLightboxOriginY.toFixed(2)}%`;
  dom.imageLightboxImage.style.transform = `scale(${nextScale.toFixed(3)})`;
  const zoomActive = nextScale > 1.001;
  dom.imageLightboxZoomBtn.setAttribute("aria-pressed", String(zoomActive));
  dom.imageLightboxZoomBtn.textContent = zoomActive ? text("lightboxZoomDisable") : text("lightboxZoomEnable");
  dom.imageLightboxZoomBtn.title = dom.imageLightboxZoomBtn.textContent;
  dom.imageLightboxZoomBtn.setAttribute("aria-label", dom.imageLightboxZoomBtn.textContent);
}

function setupHeroEffects() {
  if (!dom.heroSection) return;
  const setNeutral = () => {
    dom.heroSection.style.setProperty("--hero-spot-x", "76%");
    dom.heroSection.style.setProperty("--hero-spot-y", "18%");
  };
  setNeutral();
  dom.heroSection.addEventListener("pointermove", (event) => {
    const rect = dom.heroSection.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    dom.heroSection.style.setProperty("--hero-spot-x", `${Math.max(0, Math.min(100, x)).toFixed(1)}%`);
    dom.heroSection.style.setProperty("--hero-spot-y", `${Math.max(0, Math.min(100, y)).toFixed(1)}%`);
  });
  dom.heroSection.addEventListener("pointerleave", setNeutral);
}

function analyticsMode() {
  const value = (new URLSearchParams(window.location.search).get("analytics") || "ga4").toLowerCase();
  if (value === "both" || value === "ga4" || value === "plausible") return value;
  return "ga4";
}

function injectScript(src, attributes = {}) {
  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  Object.entries(attributes).forEach(([key, val]) => script.setAttribute(key, val));
  document.head.appendChild(script);
}

function setupGa4() {
  if (!GA4_MEASUREMENT_ID) return false;
  injectScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_MEASUREMENT_ID)}`);
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", GA4_MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: true
  });
  return true;
}

function setupPlausible() {
  if (!PLAUSIBLE_DOMAIN) return false;
  injectScript("https://plausible.io/js/script.js", { "data-domain": PLAUSIBLE_DOMAIN, defer: "defer" });
  return true;
}

function setupAnalytics() {
  if (analyticsInitialized || !storageConsent) return;
  const mode = analyticsMode();
  if (mode === "ga4") {
    analyticsInitialized = setupGa4();
    return;
  }
  if (mode === "plausible") {
    analyticsInitialized = setupPlausible();
    return;
  }
  analyticsInitialized = (setupGa4() || analyticsInitialized);
  analyticsInitialized = (setupPlausible() || analyticsInitialized);
}

function renderVisitorCounter() {
  if (!dom.visitorCounter) return;
  if (Number.isFinite(state.visitorCount)) {
    dom.visitorCounter.textContent = text("visitorCounterValue").replace("{count}", new Intl.NumberFormat(
      state.lang === "en" ? "en-GB" : "de-DE"
    ).format(state.visitorCount));
    return;
  }
  dom.visitorCounter.textContent = state.visitorCounterFailed
    ? text("visitorCounterError")
    : text("visitorCounterLoading");
}

async function refreshVisitorCounter() {
  if (!COUNTAPI_NAMESPACE || !COUNTAPI_KEY) return;
  try {
    const endpoint = `https://api.countapi.xyz/hit/${encodeURIComponent(COUNTAPI_NAMESPACE)}/${encodeURIComponent(COUNTAPI_KEY)}`;
    const response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) throw new Error(`Visitor counter failed (HTTP ${response.status})`);
    if (typeof response.json !== "function") return;
    const payload = await response.json();
    if (!Number.isFinite(payload?.value)) throw new Error("Visitor counter payload missing numeric value.");
    state.visitorCount = Number(payload.value);
    state.visitorCounterFailed = false;
  } catch (error) {
    console.warn("Visitor counter unavailable.", error);
    state.visitorCount = null;
    state.visitorCounterFailed = true;
  }
  renderVisitorCounter();
}

function canRegisterServiceWorker() {
  return "serviceWorker" in navigator && /^https?:$/.test(location.protocol);
}

function registerPwaServiceWorker() {
  if (!canRegisterServiceWorker()) return;
  navigator.serviceWorker.register("service-worker.js", { scope: "./" }).catch((error) => {
    console.error("Service worker registration failed.", error);
    toast(errorMessage(error));
  });
}

function updateEditorPanelState() {
  dom.editorPanel.dataset.side = state.editorSide;
  dom.editorPanel.dataset.collapsed = String(state.editorCollapsed);
  dom.editorCollapseBtn.textContent = state.editorCollapsed ? "▾" : "▴";
  dom.editorCollapseBtn.title = text(state.editorCollapsed ? "editorExpand" : "editorCollapse");
  dom.editorCollapseBtn.setAttribute("aria-label", dom.editorCollapseBtn.title);
  dom.editorCollapseBtn.setAttribute("aria-expanded", String(!state.editorCollapsed));
  dom.editorSideBtn.title = text("editorMoveSide");
  dom.editorSideBtn.setAttribute("aria-label", text("editorMoveSide"));
  dom.editorCloseIconBtn.title = text("close");
  dom.editorCloseIconBtn.setAttribute("aria-label", text("close"));
}

function syncDashboardHeight() {
  if (!dom.dashboardMain || window.matchMedia("(max-width: 1100px)").matches) {
    document.documentElement.style.removeProperty("--dashboard-height");
    return;
  }
  document.documentElement.style.setProperty(
    "--dashboard-height",
    Math.ceil(dom.dashboardMain.getBoundingClientRect().height) + "px"
  );
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function showStartupError(error) {
  const details = errorMessage(error);
  dom.startupError.textContent = text("startupFailed") + "\n" + details;
  dom.startupError.hidden = false;
}

const NOTIFICATION_SOUNDS = CURATED_SOUNDS.map((sound) => sound.id);
const SOUND_LABEL_KEYS = Object.fromEntries(
  CURATED_SOUNDS.map((sound) => [sound.id, sound.labelKey])
);

const art = (src, de, en, bar = de) => ({ src, title: { de, en, bar } });
const EPIC_EVENT_ART = [
  art("assets/events/linny-arkeum-invasion-v1.webp", "Linny erklärt dem Arkeum-Boss sehr höflich den Ruhestand", "Linny politely retires the Arkeum boss"),
  art("assets/events/linny-gate-memory-v1.webp", "Linny schwebt durchs Erinnerungsquiz – Wissen braucht keinen Boden", "Linny floats through the Memory Quiz – knowledge needs no floor"),
  art("assets/events/linny-summer-festival-v1.webp", "Linny reitet ins Sommerfest – Wasserbomben verneigen sich bereits", "Linny rides into Summer Festival – even water balloons bow"),
  art("assets/events/linny-archboss-v1.webp", "Archboss gesichtet. Linny übernimmt ab hier.", "Archboss spotted. Linny takes it from here."),
  art("assets/events/linny-castle-pvp-v1.webp", "Felswacht kapituliert vorsorglich vor Linny", "Stoneguard surrenders to Linny as a precaution"),
  art("assets/events/linny-guild-raid-v1.webp", "Gildenraid: Linny tankt, heilt und sieht dabei königlich aus", "Guild Raid: Linny tanks, heals and still looks royal"),
  art("assets/events/linny-amitoi-home-v1.webp", "Linnys Amitoi-Haus – fünf Sterne, null Staub", "Linny's Amitoi house – five stars, zero dust"),
  art("assets/events/gallery/linny-astral-oracle-v1.webp", "Das Orakel fragt Linny nach der Zukunft", "The oracle asks Linny about the future"),
  art("assets/events/gallery/linny-celestial-observatory-v1.webp", "Linny sortiert kurz die Sterne neu", "Linny briefly rearranges the stars"),
  art("assets/events/gallery/linny-griffin-moonflight-v1.webp", "Mondflug mit Linny – Gravitation heute geschlossen", "Moonflight with Linny – gravity is closed today"),
  art("assets/events/gallery/linny-leviathan-coast-v1.webp", "Der Leviathan wollte Linny nur um ein Autogramm bitten", "The leviathan only wanted Linny's autograph"),
  art("assets/events/gallery/linny-frozen-owl-v1.webp", "Linny und die Eule, die sogar Nix den Winter erklärt", "Linny and the owl that explains winter to Nix"),
  art("assets/events/gallery/linny-sand-titan-v1.webp", "Ein Sandtitan macht Platz für Linnys Auftritt", "A sand titan makes room for Linny's entrance"),
  art("assets/events/gallery/linny-spring-amitoi-v1.webp", "Frühlingshofstaat: Amitoi werfen Blüten für Linny", "Spring court: Amitoi scatter blossoms for Linny"),
  art("assets/events/gallery/linny-volcanic-forge-v1.webp", "Linny schmiedet Legenden vor dem Frühstück", "Linny forges legends before breakfast"),
  art("assets/events/gallery/linny-sapphire-dragon-v1.webp", "Saphirdrache? Linnys besonders großes Reittier.", "Sapphire dragon? Linny's extra-large mount."),
  art("assets/events/gallery/linny-white-stag-v1.webp", "Der weiße Hirsch führt – aber nur, weil Linny es erlaubt", "The white stag leads – because Linny allows it"),
  art("assets/events/gallery/linny-goddess-of-armies-v1.webp", "10.000 Soldaten, Götter und Könige erkennen Linnys Rang", "10,000 soldiers, gods and kings acknowledge Linny's rank"),
  art("assets/events/gallery/linny-felswacht-conqueror-v1.webp", "Linny erobert Burg Felswacht mit dem kleinen Finger", "Linny conquers Stoneguard Castle with her little finger"),
  art("assets/events/gallery/linny-golden-arena-v1.webp", "Die Arena jubelt – Linny war schon vor dem Start Siegerin", "The arena cheers – Linny won before it even started"),
  art("assets/events/gallery/linny-infinite-library-v1.webp", "Unendliche Bibliothek, ein ausgeliehenes Zauberbuch", "Infinite library, one borrowed spellbook"),
  art("assets/events/gallery/linny-kraken-storm-v1.webp", "Krakenwarnung? Der Kraken wurde vor Linny gewarnt.", "Kraken warning? The kraken was warned about Linny."),
  art("assets/events/gallery/linny-crystal-serpent-v1.webp", "Die Kristallschlange bewacht jetzt Linnys Schmuck", "The crystal serpent now guards Linny's jewellery"),
  art("assets/events/gallery/linny-autumn-amitoi-v1.webp", "Herbstpicknick mit Linnys königlicher Amitoi-Garde", "Autumn picnic with Linny's royal Amitoi guard"),
  art("assets/events/gallery/linny-shadow-portal-v1.webp", "Linny betritt das Schattenportal – die Schatten gehen", "Linny enters the shadow portal – the shadows leave"),
  art("assets/events/gallery/linny-waterfall-sanctuary-v1.webp", "Linnys Wasserfall-Heiligtum akzeptiert nur epische Gäste", "Linny's waterfall sanctuary admits epic guests only"),
  art("assets/events/gallery/linny-gigantrite-airship-v1.webp", "Linny überholt den Gigantriten im Luftverkehr", "Linny overtakes the Gigantrite in mid-air"),
  art("assets/events/themes/time-vortex/linny-time-lady-gallifrey-v1.webp", "Time Lady Linny rettet Gallifrey – schon wieder vor dem Frühstück", "Time Lady Linny saves Gallifrey – again, before breakfast", "Time Lady Linny rett Gallifrey – scho wieda vorm Frühstück"),
  art("assets/events/gallery/linny-aurora-ice-dragon-v1.webp", "Nordlicht, Eisdrache, Linny – in dieser Reihenfolge der Wichtigkeit", "Aurora, ice dragon, Linny – in ascending order of importance"),
  art("assets/events/gallery/linny-royal-victory-v1.webp", "Solisium feiert Linnys vollkommen überraschenden nächsten Sieg", "Solisium celebrates Linny's completely unexpected next victory")
];
const FUN_EVENT_ART = [
  art("assets/events/fun/linny-baggersee-v1.webp", "Baden mit Linny am Baggersee – der Drache hat Schwimmflügel", "Swimming with Linny at the lake – the dragon brought floaties", "Bodn mit da Linny am Baggersee – da Drach hod Schwimmflügl"),
  art("assets/events/fun/linny-alone-at-home-v1.webp", "Linny allein zu Haus – die Goblins bereuen bereits alles", "Linny alone at home – the goblins already regret everything", "Linny alloa dahoam – de Goblins berein scho ois"),
  art("assets/events/fun/linny-grand-mmo-city-v1.webp", "Linny besucht die große MMO-Stadt – die Wachen wechseln die Seiten", "Linny visits the grand MMO city – the guards switch sides", "Linny kimmt in d'große MMO-Stodt – de Wacha wechsln d'Seitn"),
  art("assets/events/fun/linny-cel-kingdom-v1.webp", "Linny im Himmels-Königreich – der Held darf kurz mitlaufen", "Linny in the sky kingdom – the hero may tag along", "Linny im Himmels-Kinireich – da Held derf a weng mitlaffa"),
  art("assets/events/fun/linny-kart-race-v1.webp", "Linny Kart: Blaue Schale? Wird einfach weggeblitzt.", "Linny Kart: blue shell? Simply zapped away.", "Linny-Kart: Blaue Schoin? Wird hoid weggeblitzt.")
  , art("assets/events/fun/linny-slime-isekai-v1.webp", "Linny landet im Schleim-Isekai – und wird vorsorglich zur Königin gewählt", "Linny lands in a slime isekai – and is immediately elected queen", "Linny landet im Schleim-Isekai – und werd glei zur Kini")
  , art("assets/events/fun/linny-anime-energy-v1.webp", "Linnys Energiewelle: Der Endboss beantragt Urlaub", "Linny's energy wave: the final boss files for leave", "Linnys Energiewelln: Da Endboss nimmt Urlaub")
  , art("assets/events/themes/arcade/linny-turbo-hedgehog-v1.webp", "Linny und die Turbo-Crew drehen den Endboss durch den Ring", "Linny and the turbo crew run circles around the final boss", "Linny und d'Turbo-Truppn drahn an Endboss durch'n Ring")
];
const FIXED_EVENT_ART_IDS = new Set(["arkeum_eu", "gate_memory_eu", "summer_festival_eu"]);

function stableHash(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function timerArt(timer) {
  const configured = EPIC_EVENT_ART.find((item) => item.src === timer?.image);
  const pool = timer?.categoryId === "personal" && FUN_EVENT_ART.length ? FUN_EVENT_ART : EPIC_EVENT_ART;
  if (FIXED_EVENT_ART_IDS.has(timer?.id) && configured && state.artRotationBucket % 3 !== 0) return configured;
  return pool[stableHash((timer?.id || "linny") + "|" + state.artRotationBucket) % pool.length]
    || configured
    || { src: timer?.image || "", title: {} };
}

function artTitle(item, timer) {
  return item?.title?.[state.lang] || item?.title?.de || timerName(timer);
}

function notificationLevels(timer) {
  const settings = notificationSettings(timer);
  if (state.notificationOverride === "off") return [];
  return [
    { id: "warning", ...settings.warning, enabled: state.notificationOverride === "all" ? true : settings.warning.enabled },
    { id: "critical", ...settings.critical, enabled: state.notificationOverride === "all" ? true : settings.critical.enabled }
  ].filter((level) => level.enabled)
    .map((level) => state.notificationOverride === "silent" ? { ...level, sound: "none" } : level)
    .sort((a, b) => b.seconds - a.seconds);
}

function notificationLevelKey(levelId) {
  return levelId === "critical" ? "criticalAlert" : "warningAlert";
}

function formatLeadTime(seconds) {
  const value = Math.max(1, Math.round(Number(seconds) || 1));
  const minuteUnit = "min";
  const secondUnit = state.lang === "en" ? "sec" : "Sek";
  if (value < 60) return value + " " + secondUnit;
  const minutes = Math.floor(value / 60);
  const remainder = value % 60;
  return remainder ? minutes + " " + minuteUnit + " " + remainder + " " + secondUnit : minutes + " " + minuteUnit;
}

function notificationSoundName(soundId) {
  return text(SOUND_LABEL_KEYS[soundId] || "soundNone");
}

function toast(message) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  dom.toastWrap.appendChild(el);
  setTimeout(() => el.remove(), 5000);
}

function hashString(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function dynamicMotif(timer, category) {
  if (timer.motif) return timer.motif;
  const seed = hashString((timer.name?.de || timer.name?.en || timer.id) + "|" + (category?.id || "generic"));
  const hueA = seed % 360;
  const hueB = (hueA + 48) % 360;
  const hueC = (hueA + 108) % 360;
  const posA = 70 + (seed % 25);
  const posB = 4 + (seed % 18);
  return "radial-gradient(980px 360px at " + posA + "% " + posB + "%, hsla(" + hueA + ", 88%, 64%, 0.30) 0%, transparent 63%), radial-gradient(760px 300px at 0% 100%, hsla(" + hueB + ", 78%, 52%, 0.24) 0%, transparent 62%), conic-gradient(from " + (seed % 360) + "deg at 100% 0%, hsla(" + hueC + ", 88%, 60%, 0.10), transparent 58%)";
}

function dynamicAccent(timer, category) {
  const seed = hashString(timer.id + "|" + (category?.id || "generic"));
  const hue = seed % 360;
  return {
    bar: "linear-gradient(180deg, hsl(" + hue + " 90% 66%), transparent 88%)",
    overlay: "linear-gradient(" + (96 + (seed % 40)) + "deg, hsla(" + ((hue + 10) % 360) + ", 22%, 14%, 0.96) 0%, hsla(" + ((hue + 34) % 360) + ", 20%, 12%, 0.88) 56%, hsla(" + ((hue + 58) % 360) + ", 24%, 10%, 0.95) 100%)",
    glow: "hsla(" + hue + ", 72%, 52%, 0.12)",
    patternAngle: (118 + (seed % 60)) + "deg"
  };
}

function loadLocalConfig() {
  try {
    return JSON.parse(storageGet("timer_local_config") || "null");
  } catch {
    return null;
  }
}

function saveLocalConfig() {
  storageSet("timer_local_config", JSON.stringify(state.localConfig || { categories: [], timers: [] }));
}

function loadVisibleIds() {
  try {
    const stored = storageGet("timer_visible_ids");
    if (stored === null) return null;
    return new Set(JSON.parse(stored));
  } catch {
    return null;
  }
}

function saveVisibleIds() {
  storageSet("timer_visible_ids", JSON.stringify(Array.from(state.visibleIds)));
}

function supportedTimezones() {
  let zones = [];
  try {
    if (typeof Intl.supportedValuesOf === "function") zones = Intl.supportedValuesOf("timeZone");
  } catch {
    // Use the compact fallback below.
  }
  if (!zones.length) {
    zones = [
      "Europe/Berlin", "Europe/London", "Europe/Paris", "Europe/Rome", "Europe/Vienna",
      "Europe/Warsaw", "Europe/Athens", "UTC", "America/New_York", "America/Chicago",
      "America/Denver", "America/Los_Angeles", "Asia/Tokyo", "Asia/Seoul", "Australia/Sydney"
    ];
  }
  const unique = Array.from(new Set([BAVARIA_TIMEZONE, "Europe/Berlin", "UTC", ...zones]));
  return unique.sort((a, b) => {
    if (a === b) return 0;
    if (a === BAVARIA_TIMEZONE) return -1;
    if (b === BAVARIA_TIMEZONE) return 1;
    if (a === "Europe/Berlin") return -1;
    if (b === "Europe/Berlin") return 1;
    if (a === "UTC") return -1;
    if (b === "UTC") return 1;
    return a.localeCompare(b);
  });
}

function migrateLegacyMemoryInterval(localConfig) {
  let changed = false;
  const fixedRules = ["0 1,5,9,13,17,21 * * *"];
  const intervalRules = ["@every 11806s"];
  const intervalAnchor = "2026-07-24T14:56:16Z";
  for (const timer of localConfig.timers || []) {
    if (timer.id !== "gate_memory_eu" || timer.deleted) continue;
    const rules = (timer.rules || []).map((rule) => String(rule).trim());
    const hasFixed = rules.some((rule) => fixedRules.includes(rule));
    const hasLegacyEvery = rules.some((rule) => /^@every\s+197m$/i.test(rule));
    const hasOldInterval = rules.some((rule) => /^@every\s+1180[68]s$/i.test(rule));
    if (hasFixed || hasLegacyEvery || hasOldInterval) {
      const needsRuleUpdate = !(rules.length === 1 && /^@every\s+11806s$/i.test(rules[0] || ""));
      const needsAnchorUpdate = timer.anchorUtc !== intervalAnchor;
      if (needsRuleUpdate) timer.rules = intervalRules.slice();
      if (needsAnchorUpdate) timer.anchorUtc = intervalAnchor;
      if (needsRuleUpdate || needsAnchorUpdate) changed = true;
    }
  }
  if (!changed) {
    for (const timer of localConfig.timers || []) {
      if (timer.id !== "gate_memory_eu" || timer.deleted) continue;
      if ((timer.rules || []).some((rule) => /^@every\s+11806s$/i.test(String(rule).trim())) && !timer.anchorUtc) {
        timer.anchorUtc = intervalAnchor;
        changed = true;
      }
    }
  }
  return changed;
}

function restoreCoreDefaultTimers(localConfig) {
  const required = new Set(["arkeum_eu", "gate_memory_eu", "summer_festival_eu", "archboss_eu", "innerspace_guild_boss", "boonstones_eu", "riftstones_eu", "tax_delivery_eu", "castle_event_eu", "interserver_eu"]);
  const before = (localConfig.timers || []).length;
  localConfig.timers = (localConfig.timers || []).filter((timer) => !(timer.deleted && required.has(timer.id)));
  return localConfig.timers.length !== before;
}

function migrateUpdatedDefaultDurations(localConfig) {
  const durationUpdates = new Map([
    ["arkeum_eu", [30, 25]],
    ["gate_memory_eu", [5, 4]],
    ["summer_festival_eu", [25, 5]],
    ["archboss_eu", [35, 5]],
    ["boonstones_eu", [40, 30]],
    ["castle_event_eu", [45, 30]],
    ["innerspace_guild_boss", [45, 20]]
  ]);
  let changed = false;
  for (const timer of localConfig.timers || []) {
    const update = durationUpdates.get(timer.id);
    if (update && Number(timer.durationMinutes) === update[0]) {
      timer.durationMinutes = update[1];
      changed = true;
    }
    if (timer.id === "clean_room" && (timer.name?.de === "Wohnung putzen" || timer.name?.en === "Clean apartment")) {
      timer.name = { de: "Linnys Amitoi-Haus putzen", en: "Clean Linny's Amitoi house" };
      timer.description = {
        de: "Damit sich Linnys Amitoi wieder rundum wohlfühlen.",
        en: "Make Linny's Amitoi house sparkle again."
      };
      changed = true;
    }
  }
  return changed;
}

function migrateNotificationSettings(localConfig) {
  const defaults = new Map([
    ["arkeum_eu", [300, 90]],
    ["gate_memory_eu", [300, 90]],
    ["summer_festival_eu", [600, 30]],
    ["archboss_eu", [600, 120]],
    ["innerspace_guild_boss", [600, 120]]
  ]);
  let changed = false;
  for (const timer of localConfig.timers || []) {
    if (timer.deleted) continue;
    const current = timer.notifications || {};
    if (current.warning && current.critical) continue;
    const configured = defaults.get(timer.id);
    const migrated = notificationSettings(timer);
    if (configured) {
      migrated.warning = { enabled: true, seconds: configured[0], sound: "gentle" };
      migrated.critical = { enabled: true, seconds: configured[1], sound: "urgent" };
    }
    timer.notifications = migrated;
    changed = true;
  }
  return changed;
}

function migrateJulyGuildSchedule(localConfig) {
  const oldRules = new Map([
    ["archboss_eu", ["0 19,22 * * 3,6"]],
    ["boonstones_eu", ["0 20 * * 2,4", "0 18 * * 0"]],
    ["tax_delivery_eu", ["0 19 * * 0"]],
    ["castle_event_eu", ["0 20 * * 6"]],
    ["innerspace_guild_boss", ["15 20 * * 4"]]
  ]);
  const replacements = new Map([
    ["archboss_eu", ["0 22 * * 2", "0 19,22 * * 3,6"]],
    ["boonstones_eu", ["0 21 * * 1,5"]],
    ["tax_delivery_eu", ["@every 14d"]],
    ["castle_event_eu", ["@every 14d"]],
    ["innerspace_guild_boss", ["10 20 * * 4"]]
  ]);
  let changed = false;
  localConfig.timers = (localConfig.timers || []).filter((timer) => {
    if (timer.id !== "archboss_guild_eu") return true;
    changed = true;
    return false;
  });
  for (const timer of localConfig.timers || []) {
    const expected = oldRules.get(timer.id);
    if (!expected) continue;
    const current = (timer.rules || []).map(String);
    if (current.length !== expected.length || current.some((rule, index) => rule !== expected[index])) continue;
    timer.rules = replacements.get(timer.id).slice();
    if (timer.id === "tax_delivery_eu") {
      timer.anchorUtc = "2026-07-19T17:30:00Z";
      timer.durationMinutes = 30;
    }
    if (timer.id === "castle_event_eu") {
      timer.anchorUtc = "2026-07-26T17:30:00Z";
      timer.durationMinutes = 30;
    }
    changed = true;
  }
  return changed;
}

function normalizeSummerFestivalRules(localConfig) {
  let changed = false;
  for (const timer of localConfig.timers || []) {
    if (timer.id !== "summer_festival_eu" || timer.deleted || !Array.isArray(timer.rules)) continue;
    const cleaned = timer.rules.map((x) => String(x).trim()).filter((x) => x && x !== "*/30 * * * *");
    if (cleaned.length !== timer.rules.length) {
      timer.rules = cleaned.length ? cleaned : ["30 1,5,12,21 * * 1-5", "30 1,5,12,16,21 * * 0,6"];
      changed = true;
    }
  }
  return changed;
}

function categoryLabel(category) {
  return category?.label?.[state.lang] || category?.label?.de || category?.id || "";
}

function localizedTimerValue(timer, field) {
  const values = timer?.[field] || {};
  const baseTimer = state.baseConfig?.timers?.find((candidate) => candidate.id === timer?.id);
  const baseValues = baseTimer?.[field] || {};
  const localized = values[state.lang];

  // Older local edits wrote the German name into both languages. Prefer the
  // translated Git value when that legacy duplicate is detected.
  if (
    state.lang === "en"
    && localized
    && localized === values.de
    && baseValues.en
    && baseValues.en !== baseValues.de
  ) {
    return baseValues.en;
  }

  return localized || baseValues[state.lang] || values.de || baseValues.de || "";
}

function timerName(timer) {
  return localizedTimerValue(timer, "name") || timer.id;
}

function timerDescription(timer) {
  return localizedTimerValue(timer, "description");
}

function selectedCategory() {
  return state.mergedConfig.categories.find((c) => c.id === state.categoryId) || state.mergedConfig.categories[0];
}

function parseDateTimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function toDateTimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (x) => String(x).padStart(2, "0");
  return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) + "T" + pad(date.getHours()) + ":" + pad(date.getMinutes());
}

function formatTime(date, timeZone, withSeconds = true) {
  return date.toLocaleTimeString(state.lang === "en" ? "en-GB" : "de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: withSeconds ? "2-digit" : undefined,
    timeZone: resolveTimeZone(timeZone)
  });
}

function formatDate(date, timeZone) {
  return date.toLocaleDateString(state.lang === "en" ? "en-GB" : "de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    timeZone: resolveTimeZone(timeZone)
  });
}

function countdown(target) {
  const total = Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return h + ":" + m + ":" + s;
}

const URGENCY_MS = {
  critical: 1 * 60 * 1000,
  danger: 2 * 60 * 1000,
  verySoon: 5 * 60 * 1000,
  soon: 10 * 60 * 1000,
  day: 12 * 60 * 60 * 1000,
  later: 24 * 60 * 60 * 1000,
  muchLater: 48 * 60 * 60 * 1000,
  evenLater: 72 * 60 * 60 * 1000,
  wayLater: 7 * 24 * 60 * 60 * 1000
};

function urgencyClass(ms) {
  if (ms <= URGENCY_MS.critical) return "is-critical";
  if (ms <= URGENCY_MS.danger) return "is-danger";
  if (ms <= URGENCY_MS.verySoon) return "is-verysoon";
  if (ms <= URGENCY_MS.soon) return "is-soon";
  if (ms <= URGENCY_MS.day) return "is-day";
  return "is-far";
}

function urgencyLabelKey(ms) {
  if (ms <= URGENCY_MS.critical) return "urgencyNow";
  if (ms <= URGENCY_MS.danger) return "urgencyVerySoon";
  if (ms <= URGENCY_MS.soon) return "urgencySoon";
  if (ms <= URGENCY_MS.day) return "urgencyToday";
  if (ms <= URGENCY_MS.later) return "urgencyLater";
  if (ms <= URGENCY_MS.muchLater) return "urgencyMuchLater";
  if (ms <= URGENCY_MS.evenLater) return "urgencyEvenLater";
  if (ms <= URGENCY_MS.wayLater) return "urgencyWayLater";
  return "urgencyEpicLater";
}

const URGENCY_COLOR_STOPS = [
  { ms: 72 * 60 * 60 * 1000, rgb: [166, 178, 196] },
  { ms: 24 * 60 * 60 * 1000, rgb: [103, 132, 118] },
  { ms: 12 * 60 * 60 * 1000, rgb: [46, 112, 70] },
  { ms: 2 * 60 * 60 * 1000, rgb: [111, 229, 159] },
  { ms: 30 * 60 * 1000, rgb: [184, 222, 72] },
  { ms: 10 * 60 * 1000, rgb: [248, 195, 91] },
  { ms: 5 * 60 * 1000, rgb: [255, 153, 97] },
  { ms: 2 * 60 * 1000, rgb: [255, 111, 111] },
  { ms: 1 * 60 * 1000, rgb: [224, 90, 151] },
  { ms: 0, rgb: [184, 146, 255] }
];

// The colour itself flows through every intermediate shade. The progress
// bar resets only when a new base colour phase starts.
const URGENCY_PHASE_STOPS = [
  72 * 60 * 60 * 1000,
  12 * 60 * 60 * 1000,
  30 * 60 * 1000,
  10 * 60 * 1000,
  5 * 60 * 1000,
  1 * 60 * 1000,
  0
];

function urgencyTone(ms) {
  const remaining = Math.max(0, Number(ms) || 0);
  let rgb = URGENCY_COLOR_STOPS[0].rgb;
  if (remaining < URGENCY_COLOR_STOPS[0].ms) {
    for (let index = 0; index < URGENCY_COLOR_STOPS.length - 1; index += 1) {
      const upper = URGENCY_COLOR_STOPS[index];
      const lower = URGENCY_COLOR_STOPS[index + 1];
      if (remaining > upper.ms || remaining < lower.ms) continue;
      const progress = (upper.ms - remaining) / (upper.ms - lower.ms || 1);
      rgb = upper.rgb.map((channel, channelIndex) => Math.round(
        channel + (lower.rgb[channelIndex] - channel) * progress
      ));
      break;
    }
  }
  return {
    color: "rgb(" + rgb.join(", ") + ")",
    glow: "rgba(" + rgb.join(", ") + ", 0.38)"
  };
}

function urgencyPhaseProgress(ms) {
  const remaining = Math.max(0, Number(ms) || 0);
  if (remaining >= URGENCY_PHASE_STOPS[0]) return 0;
  for (let index = 0; index < URGENCY_PHASE_STOPS.length - 1; index += 1) {
    const upper = URGENCY_PHASE_STOPS[index];
    const lower = URGENCY_PHASE_STOPS[index + 1];
    if (remaining > upper || remaining <= lower) continue;
    return Math.min(1, Math.max(0,
      (upper - remaining) / (upper - lower || 1)
    ));
  }
  return 1;
}

function timerOccurrences(timer, category, count) {
  return calculateTimerOccurrences(timer, category, count, {
    fallbackTimeZone: state.displayTimezone
  });
}

function recentTimerState(timer, category, nowMs = Date.now()) {
  return calculateRecentTimerState(timer, category, {
    nowMs,
    historyMinutes: state.historyMinutes,
    fallbackTimeZone: state.displayTimezone
  });
}

function ensureVisibleIds() {
  const ids = new Set(state.mergedConfig.timers.map((timer) => timer.id));
  let changed = false;
  for (const id of Array.from(state.visibleIds)) {
    if (!ids.has(id)) {
      state.visibleIds.delete(id);
      changed = true;
    }
  }
  if (changed) saveVisibleIds();
}

function filteredTimers() {
  return state.mergedConfig.timers.filter((timer) => timer.categoryId === state.categoryId);
}

function applyAppearanceSettings() {
  const density = CARD_DENSITY_VALUES.includes(state.cardDensity) ? state.cardDensity : "compact";
  const themeValues = ["astral", "bavaria", "time-vortex", "arcade", "solisium", "executive"];
  const theme = themeValues.includes(state.theme) ? state.theme : "astral";
  document.documentElement.dataset.density = density;
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("colorblind-mode", state.colorblindMode);
  dom.cardDensitySelect.value = density;
  dom.themeSelect.value = theme;
  dom.notificationOverrideSelect.value = state.notificationOverride;
  dom.colorblindModeInput.checked = state.colorblindMode;
  dom.showThumbnailsInput.checked = state.showThumbnails;
  dom.liveColumn.classList.toggle("is-collapsed", state.liveCollapsed && !state.dockMode);
  dom.calendarSection.classList.toggle("is-collapsed", state.calendarCollapsed);
  updateCollapseButtons();
  const heroByTheme = {
    astral: "assets/events/gallery/linny-celestial-observatory-v1.webp",
    bavaria: "assets/events/gallery/linny-white-stag-v1.webp",
    "time-vortex": "assets/events/themes/time-vortex/linny-time-lady-gallifrey-v1.webp",
    arcade: "assets/events/themes/arcade/linny-turbo-hedgehog-v1.webp",
    solisium: "assets/events/gallery/linny-felswacht-conqueror-v1.webp",
    executive: "assets/events/gallery/linny-astral-oracle-v1.webp"
  };
  const themePool = state.categoryId === "personal" ? FUN_EVENT_ART : EPIC_EVENT_ART;
  const rotated = themePool[stableHash(theme + "|" + state.artRotationBucket) % themePool.length]?.src;
  const heroImage = state.artRotationBucket % 2 === 0 ? rotated : heroByTheme[theme];
  // Resolve to an absolute URL before writing the custom property: browsers
  // resolve relative url() references inside a custom property's value
  // against the stylesheet that consumes it via var() (assets/styles/app.css),
  // not against the document, which otherwise 404s one directory too deep.
  const resolvedHeroImage = new URL(heroImage || heroByTheme.astral, document.baseURI).href;
  dom.heroSection.style.setProperty("--hero-image", "url('" + resolvedHeroImage + "')");
}

function renderLegalContent() {
  dom.imprintBtn.textContent = text("imprint");
  dom.privacyBtn.textContent = text("privacy");
  dom.fanDisclaimer.textContent = text("fanDisclaimer");
  dom.imprintTitle.textContent = text("imprintTitle");
  dom.privacyTitle.textContent = text("privacyTitle");
  dom.imprintCloseBtn.textContent = text("legalClose");
  dom.privacyCloseBtn.textContent = text("legalClose");
  dom.imageLightboxCloseBtn.textContent = text("legalClose");
  dom.imageLightboxWallpaperBtn.textContent = text("wallpaperSave");
  dom.imageLightboxWallpaperBtn.title = text("wallpaperSave");
  dom.imageLightboxWallpaperBtn.setAttribute("aria-label", text("wallpaperSave"));
  setLightboxZoomScale(state.imageLightboxZoomScale, state.imageLightboxOriginX, state.imageLightboxOriginY);
  dom.storageConsentTitle.textContent = text("storageConsentTitle");
  dom.storageConsentText.textContent = text("storageConsentText");
  dom.storageAcceptBtn.textContent = text("storageAccept");
  dom.storageDeclineBtn.textContent = text("storageDecline");
  dom.storagePrivacyBtn.textContent = text("storageDetails");
  dom.storageResetBtn.textContent = text("storageReset");
  dom.storageResetBtn.hidden = !storageConsent;

  const provider = document.createElement("p");
  const providerName = document.createElement("strong");
  providerName.textContent = LEGAL_PROFILE.name;
  provider.appendChild(providerName);
  for (const line of LEGAL_PROFILE.address) {
    provider.append(document.createElement("br"), document.createTextNode(line));
  }
  const contactHeading = document.createElement("h3");
  contactHeading.textContent = text("imprintContact");
  const contact = document.createElement("p");
  const mail = document.createElement("a");
  mail.href = "mailto:" + LEGAL_PROFILE.email;
  mail.textContent = LEGAL_PROFILE.email;
  contact.appendChild(mail);
  const disclaimer = document.createElement("p");
  disclaimer.textContent = text("fanDisclaimer");
  dom.imprintContent.replaceChildren(provider, contactHeading, contact, disclaimer);

  const privacyFragment = document.createDocumentFragment();
  const appendPrivacySection = (headingKey, bodyKey) => {
    if (headingKey) {
      const heading = document.createElement("h3");
      heading.textContent = text(headingKey);
      privacyFragment.appendChild(heading);
    }
    const body = document.createElement("p");
    body.textContent = text(bodyKey);
    privacyFragment.appendChild(body);
  };
  appendPrivacySection("", "privacyIntro");
  appendPrivacySection("privacyStorageHeading", "privacyStorageText");
  appendPrivacySection("privacyHostingHeading", "privacyHostingText");
  const hostingLink = document.createElement("a");
  hostingLink.href = "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement";
  hostingLink.target = "_blank";
  hostingLink.rel = "noreferrer";
  hostingLink.textContent = " GitHub Privacy Statement";
  privacyFragment.lastElementChild.append(hostingLink, ".");
  appendPrivacySection("privacyCounterHeading", "privacyCounterText");
  appendPrivacySection("privacyNotificationsHeading", "privacyNotificationsText");
  appendPrivacySection("privacyRightsHeading", "privacyRightsText");
  dom.privacyContent.replaceChildren(privacyFragment);
}

function renderPageActivityStatus() {
  const active = document.visibilityState === "visible";
  dom.pageActivityStatus.textContent = text(active ? "activityActive" : "activityHidden");
  dom.pageActivityStatus.className = "activity-status " + (active ? "is-ready" : "is-blocked");
}

function configDate(date) {
  return date.toLocaleDateString(state.lang === "en" ? "en-GB" : "de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Berlin"
  });
}

function renderConfigHealth() {
  dom.configUpdatedStatus.textContent = text("configUpdated").replace("{date}", configDate(new Date(CONFIG_UPDATED_AT)));
  const gate = state.mergedConfig?.timers?.find((timer) => timer.id === "gate_memory_eu");
  const liveVerified = Date.parse(gate?.liveVerifiedAt || "");
  const liveStale = Number.isFinite(liveVerified)
    && Date.now() - liveVerified > 48 * 60 * 60 * 1000;
  dom.configLiveStatus.hidden = false;
  dom.configLiveStatus.className = state.liveOverlayError || liveStale ? "is-warning" : "is-ok";
  dom.configLiveStatus.textContent = state.liveOverlayError
    ? text("configLiveUnavailable")
    : liveStale
      ? text("configLiveStale").replace("{date}", configDate(new Date(liveVerified)))
    : Number.isFinite(liveVerified)
      ? text("configLive").replace("{date}", configDate(new Date(liveVerified)))
      : text("configLiveUnavailable");
  const now = Date.now();
  const ranges = (state.mergedConfig?.timers || [])
    .map((timer) => timer.activeUntil ? Date.parse(timer.activeUntil) : NaN)
    .filter(Number.isFinite);
  const expiredCount = ranges.filter((until) => until < now).length;
  const nextExpiry = ranges.filter((until) => until >= now).sort((a, b) => a - b)[0];
  dom.configExpiryStatus.className = expiredCount ? "is-warning" : "is-ok";
  if (expiredCount) {
    dom.configExpiryStatus.textContent = text("configExpired").replace("{count}", String(expiredCount));
  } else if (nextExpiry) {
    dom.configExpiryStatus.textContent = text("configExpiresSoon").replace("{date}", configDate(new Date(nextExpiry)));
  } else {
    dom.configExpiryStatus.textContent = text("configRangesValid");
  }
}

function renderLabels() {
  document.documentElement.lang = state.lang;
  dom.brandTitle.textContent = text("heroTitle");
  dom.brandSub.textContent = text("brandSub").replace(/v\d+\.\d+\.\d+/i, "v" + APP_VERSION);
  updateInstallButton();
  dom.helpDocsLink.textContent = text("helpDocs");
  dom.heroTitle.textContent = text("heroTitle");
  dom.heroCharacter.textContent = text("heroCharacter");
  dom.heroText.textContent = text("heroText");
  dom.heroChipAi.textContent = text("heroChipAi");
  dom.heroChipLive.textContent = text("heroChipLive");
  dom.heroChipPwa.textContent = text("heroChipPwa");
  dom.langDeBtn.classList.toggle("is-active", state.lang === "de");
  dom.langEnBtn.classList.toggle("is-active", state.lang === "en");
  dom.langBarBtn.classList.toggle("is-active", state.lang === "bar");
  dom.langDeBtn.setAttribute("aria-pressed", String(state.lang === "de"));
  dom.langEnBtn.setAttribute("aria-pressed", String(state.lang === "en"));
  dom.langBarBtn.setAttribute("aria-pressed", String(state.lang === "bar"));
  dom.editorTitle.textContent = text("editorTitle");
  dom.editorNote.textContent = text("editorNote");
  dom.editNameLabel.textContent = text("name");
  dom.editCategoryLabel.textContent = text("categoryLabel");
  dom.editTimezoneLabel.textContent = text("timezone");
  dom.editFromLabel.textContent = text("activeFrom");
  dom.editUntilLabel.textContent = text("activeUntil");
  dom.editDurationLabel.textContent = text("duration");
  dom.editDurationHelp.textContent = text("durationHelp");
  dom.editAnchorLabel.textContent = text("anchor");
  dom.setAnchorNowBtn.textContent = text("setAnchorNow");
  dom.editIntervalLabel.textContent = text("intervalSeconds");
  dom.editIntervalHelp.textContent = text("intervalHelp");
  dom.applyIntervalBtn.textContent = text("applyInterval");
  dom.editRulesLabel.textContent = text("rules");
  dom.editRulesHelp.textContent = text("rulesHelp");
  dom.editNotifLabel.textContent = text("notifications");
  dom.editNotifyWarningEnabledLabel.textContent = text("warningEnabled");
  dom.editNotifyWarningLabel.textContent = text("warningReminder");
  dom.editNotifyWarningHelp.textContent = text("warningReminderHelp");
  dom.editNotifyWarningSoundLabel.textContent = text("warningSound");
  dom.editNotifyWarningDurationLabel.textContent = text("soundDuration");
  dom.editNotifyCriticalEnabledLabel.textContent = text("criticalEnabled");
  dom.editNotifyCriticalLabel.textContent = text("criticalReminder");
  dom.editNotifyCriticalHelp.textContent = text("criticalReminderHelp");
  dom.editNotifyCriticalSoundLabel.textContent = text("criticalSound");
  dom.editNotifyCriticalDurationLabel.textContent = text("soundDuration");
  dom.testWarningSoundBtn.title = text("testSound");
  dom.testWarningSoundBtn.setAttribute("aria-label", text("testSound") + ": " + text("warningSound"));
  dom.testCriticalSoundBtn.title = text("testSound");
  dom.testCriticalSoundBtn.setAttribute("aria-label", text("testSound") + ": " + text("criticalSound"));
  dom.testWarningAlarmBtn.title = text("testAlarm10");
  dom.testWarningAlarmBtn.setAttribute("aria-label", text("testAlarm10") + ": " + text("warningSound"));
  dom.testCriticalAlarmBtn.title = text("testAlarm10");
  dom.testCriticalAlarmBtn.setAttribute("aria-label", text("testAlarm10") + ": " + text("criticalSound"));
  dom.channelBrowserLabel.textContent = text("browserChannel");
  dom.channelPopupLabel.textContent = text("popupChannel");
  dom.categoryLabel.textContent = text("category");
  dom.settingsGroupCategoryLabel.textContent = text("settingsGroupCategory");
  dom.settingsGroupDisplayLabel.textContent = text("settingsGroupDisplay");
  dom.dockLaunchLabel.textContent = text("dockMode");
  dom.displayZoneLabel.textContent = text("displayZone");
  dom.historyMinutesLabel.textContent = text("historyMinutes");
  dom.historyMinutesHelp.textContent = text("historyMinutesHelp");
  if (document.activeElement !== dom.historyMinutesInput) {
    dom.historyMinutesInput.value = String(state.historyMinutes);
  }
  dom.cardDensityLabel.textContent = text("cardDensity");
  dom.cardDensitySelect.options[0].textContent = text("densityUltra");
  dom.cardDensitySelect.options[1].textContent = text("densityCompact");
  dom.cardDensitySelect.options[2].textContent = text("densityComfortable");
  dom.cardDensitySelect.options[3].textContent = text("densityCinematic");
  dom.cardDensitySelect.options[4].textContent = text("densityBigPicture");
  dom.cardDensitySelect.options[5].textContent = text("densityMega");
  dom.themeLabel.textContent = text("theme");
  ["themeAstral", "themeBavaria", "themeTimeVortex", "themeArcade", "themeSolisium", "themeExecutive"]
    .forEach((key, index) => { dom.themeSelect.options[index].textContent = text(key); });
  dom.notificationOverrideLabel.textContent = text("notificationOverride");
  ["notificationDefault", "notificationAll", "notificationSilent", "notificationOff"]
    .forEach((key, index) => { dom.notificationOverrideSelect.options[index].textContent = text(key); });
  dom.accessibilityLabel.textContent = text("accessibility");
  dom.colorblindModeLabel.textContent = text("colorblindMode");
  dom.showThumbnailsLabel.textContent = text("showThumbnails");
  dom.imageZoomLabel.textContent = text("imageZoom");
  ["zoomOff", "zoomSmall", "zoomMedium", "zoomLarge", "zoomHuge"].forEach((key, index) => {
    dom.imageZoomSelect.options[index].textContent = text(key);
  });
  dom.imageZoomSelect.value = state.imageZoom;
  dom.quickActionsLabel.textContent = text("config");
  dom.visibilityLabel.textContent = text("visibleTimers");
  dom.stackLabel.textContent = text("upcomingTimers");
  dom.currentEventsLabel.textContent = text("currentEvents");
  dom.calendarLabel.textContent = text("upcomingCalendar");
  dom.calendarHelp.textContent = text("calendarHelp");
  dom.calendarSelectAllLabel.textContent = text("selectAllDates");
  dom.downloadSelectedIcsBtn.textContent = text("exportSelectedIcs");
  dom.notificationSetupTitle.textContent = text("notificationSetupTitle");
  dom.dockPad.setAttribute("aria-label", text("dockMode"));
  dom.dockPad.querySelectorAll("[data-dock-side]").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.dockSide === state.dockSide);
  });
  dom.liveCollapseBtn.title = text("collapseTimers");
  dom.liveCollapseBtn.setAttribute("aria-label", text("collapseTimers"));
  dom.calendarCollapseBtn.title = text("collapseCalendar");
  dom.calendarCollapseBtn.setAttribute("aria-label", text("collapseCalendar"));
  dom.settingsToggleBtn.title = text("toggleSettings");
  dom.settingsToggleBtn.setAttribute("aria-label", text("toggleSettings"));
  dom.settingsPopoverTitle.textContent = text("settingsPopoverTitle");
  dom.storageSettingsBtn.textContent = text("storageSettings");
  dom.eventPopupLabel.textContent = text("eventAlert");
  dom.eventPopupCloseBtn.textContent = text("acknowledge");
  dom.footerSummary.textContent = text("footerSummary");
  renderVisitorCounter();
  dom.shareLabel.textContent = text("shareLabel");
  dom.shareNativeBtn.textContent = text("shareNative");
  dom.shareCopyBtn.textContent = text("shareCopy");
  updateShareButtons();
  renderLegalContent();
  updateEditorPanelState();

  for (const select of [dom.editNotifyWarningSound, dom.editNotifyCriticalSound]) {
    const selected = select.value;
    select.innerHTML = "";
    for (const sound of NOTIFICATION_SOUNDS) {
      const option = document.createElement("option");
      option.value = sound;
      option.textContent = notificationSoundName(sound);
      select.appendChild(option);
    }
    if (NOTIFICATION_SOUNDS.includes(selected)) select.value = selected;
  }
  applyAppearanceSettings();
  renderPageActivityStatus();
  renderConfigHealth();
  const iconActions = [
    [dom.newTimerBtn, "＋", "newTimer"],
    [dom.exportBtn, "⇩", "exportConfig"],
    [dom.importBtn, "⇧", "importConfig"],
    [dom.newCategoryBtn, "＋", "newCategory"],
    [dom.renameCategoryBtn, "✎", "renameCategory"],
    [dom.deleteCategoryBtn, "⌫", "deleteCategory"],
    [dom.settingsPopoverCloseBtn, "×", "close"],
    [dom.saveTimerBtn, "💾", "saveLocal"],
    [dom.duplicateTimerBtn, "⧉", "duplicate"],
    [dom.deleteTimerBtn, "🗑", "deleteLocal"],
    [dom.resetTimerBtn, "↺", "resetDefault"],
    [dom.closeEditorBtn, "×", "close"]
  ];
  for (const [button, icon, labelKey] of iconActions) {
    button.textContent = icon;
    button.title = text(labelKey);
    button.setAttribute("aria-label", text(labelKey));
  }
  dom.builderTitle.textContent = text("builderTitle");
  dom.builderTimesLabel.textContent = text("builderTimes");
  dom.builderAddTimeBtn.textContent = text("builderAddTime");
  dom.builderTimeList.querySelectorAll(".builder-time-input").forEach((input) => input.setAttribute("aria-label", text("builderTimes")));
  dom.builderTimeList.querySelectorAll(".builder-remove-time").forEach((button) => {
    button.title = text("builderRemoveTime");
    button.setAttribute("aria-label", text("builderRemoveTime"));
  });
  dom.builderAddBtn.textContent = text("builderAdd");
  dom.builderClearBtn.textContent = text("builderClear");
}

function renderCategories() {
  dom.categorySelect.innerHTML = "";
  dom.editCategory.innerHTML = "";
  for (const category of state.mergedConfig.categories) {
    const opt = document.createElement("option");
    opt.value = category.id;
    opt.textContent = categoryLabel(category);
    if (category.id === state.categoryId) opt.selected = true;
    dom.categorySelect.appendChild(opt);

    const opt2 = opt.cloneNode(true);
    dom.editCategory.appendChild(opt2);
  }
  const selectedTimezone = state.displayTimezone || "Europe/Berlin";
  const timezones = supportedTimezones();
  if (!timezones.includes(selectedTimezone)) timezones.unshift(selectedTimezone);
  dom.displayTimezone.innerHTML = "";
  for (const timezone of timezones) {
    const option = document.createElement("option");
    option.value = timezone;
    option.textContent = displayTimeZoneName(timezone);
    option.selected = timezone === selectedTimezone;
    dom.displayTimezone.appendChild(option);
  }
}

function renderToggles() {
  const timers = filteredTimers();
  ensureVisibleIds();
  dom.timerToggle.innerHTML = "";
  for (const timer of timers) {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = state.visibleIds.has(timer.id);
    label.classList.toggle("is-active", input.checked);
    input.addEventListener("change", () => {
      if (input.checked) state.visibleIds.add(timer.id);
      else state.visibleIds.delete(timer.id);
      saveVisibleIds();
      renderAll();
    });
    label.appendChild(input);
    const name = document.createElement("span");
    name.textContent = timerName(timer);
    label.appendChild(name);
    const editButton = document.createElement("button");
    editButton.className = "toggle-edit";
    editButton.type = "button";
    editButton.title = text("edit") + ": " + timerName(timer);
    editButton.setAttribute("aria-label", editButton.title);
    editButton.innerHTML = "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z\"/></svg>";
    editButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openEditor(timer.id);
    });
    label.appendChild(editButton);
    dom.timerToggle.appendChild(label);
  }
}

function openEditor(timerId) {
  const timer = state.mergedConfig.timers.find((x) => x.id === timerId);
  if (!timer) return;
  state.editingTimerId = timerId;
  state.editorCollapsed = false;
  dom.editorPanel.dataset.open = "true";
  document.body.classList.add("editor-open");
  updateEditorPanelState();
  dom.editName.value = timerName(timer);
  dom.editCategory.value = timer.categoryId || state.categoryId;
  dom.editTimezone.value = timer.timezone || selectedCategory().timezone || state.displayTimezone;
  dom.editFrom.value = toDateTimeLocal(timer.activeFrom);
  dom.editUntil.value = toDateTimeLocal(timer.activeUntil);
  dom.editDuration.value = String(timer.durationMinutes || 10);
  dom.editAnchor.value = timer.anchorUtc || "";
  dom.editRules.value = (timer.rules || []).join("\n");
  dom.editIntervalSeconds.value = intervalSecondsFromRules(timer.rules) || "";
  const notifications = notificationSettings(timer);
  dom.editNotifyWarningEnabled.checked = notifications.warning.enabled;
  dom.editNotifyWarningSeconds.value = String(notifications.warning.seconds);
  dom.editNotifyWarningSound.value = notifications.warning.sound;
  dom.editNotifyWarningDuration.value = String(notifications.warning.durationSeconds);
  dom.editNotifyCriticalEnabled.checked = notifications.critical.enabled;
  dom.editNotifyCriticalSeconds.value = String(notifications.critical.seconds);
  dom.editNotifyCriticalSound.value = notifications.critical.sound;
  dom.editNotifyCriticalDuration.value = String(notifications.critical.durationSeconds);
  dom.warningNotificationCard.classList.toggle("is-disabled", !notifications.warning.enabled);
  dom.criticalNotificationCard.classList.toggle("is-disabled", !notifications.critical.enabled);
  const channels = notifications.channels;
  dom.channelBrowser.checked = channels.includes("browser");
  dom.channelPopup.checked = channels.includes("popup");
  const simpleTimes = (timer.rules || []).map((rule) => {
    const bits = rule.trim().split(/\s+/);
    if (bits.length !== 5 || bits[0].includes("*") || bits[1].includes("*")) return "";
    const minute = Number(bits[0]);
    const hour = Number(bits[1]);
    if (!Number.isInteger(minute) || !Number.isInteger(hour) || minute < 0 || minute > 59 || hour < 0 || hour > 23) return "";
    return String(hour).padStart(2, "0") + ":" + String(minute).padStart(2, "0");
  }).filter(Boolean);
  renderBuilderTimes(simpleTimes.length ? simpleTimes : ["20:15"]);
  renderBuilderLines();
}

function closeEditor() {
  state.editingTimerId = "";
  state.editorCollapsed = false;
  dom.editorPanel.dataset.open = "false";
  document.body.classList.remove("editor-open");
  updateEditorPanelState();
}

function upsertLocalTimer(timer) {
  const index = state.localConfig.timers.findIndex((x) => x.id === timer.id);
  if (index >= 0) state.localConfig.timers[index] = timer;
  else state.localConfig.timers.push(timer);
  saveLocalConfig();
  state.mergedConfig = mergeConfig(state.baseConfig, state.localConfig);
}

function migrateDraftAndReminderDefaults(localConfig) {
  const before = localConfig.timers.length;
  localConfig.timers = localConfig.timers.filter((timer) => {
    const names = Object.values(timer.name || {});
    return !/^timer_\d+$/.test(timer.id || "")
      || !names.some((name) => /^(Neuer Timer|New Timer)$/i.test(String(name)));
  });
  let changed = localConfig.timers.length !== before;
  const gate = localConfig.timers.find((timer) => timer.id === "gate_memory_eu");
  if (gate?.notifications?.warning?.seconds === 300) {
    gate.notifications.warning.seconds = 360;
    changed = true;
  }
  if (gate?.notifications?.critical?.seconds === 90) {
    gate.notifications.critical.seconds = 120;
    changed = true;
  }
  return changed;
}

function saveEditor() {
  if (!state.editingTimerId) return;
  const base = state.mergedConfig.timers.find((x) => x.id === state.editingTimerId);
  if (!base) return;
  const channels = [];
  if (dom.channelBrowser.checked) channels.push("browser");
  if (dom.channelPopup.checked) channels.push("popup");
  const timer = clone(base);
  timer.name = { ...(timer.name || {}) };
  timer.name[state.lang] = dom.editName.value || timer.id;
  if (!timer.name.de) timer.name.de = timer.name[state.lang];
  if (!timer.name.en) timer.name.en = timer.name.de;
  timer.categoryId = dom.editCategory.value || timer.categoryId;
  timer.timezone = dom.editTimezone.value.trim() || selectedCategory().timezone || state.displayTimezone;
  timer.activeFrom = parseDateTimeLocal(dom.editFrom.value) || "";
  timer.activeUntil = parseDateTimeLocal(dom.editUntil.value) || "";
  timer.durationMinutes = Number(dom.editDuration.value) || 10;
  timer.anchorUtc = dom.editAnchor.value.trim();
  timer.rules = dom.editRules.value.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  if (timer.rules.some((rule) => /^@every\s+\d+(s|m|h|d)$/i.test(rule)) && !timer.anchorUtc) {
    timer.anchorUtc = new Date().toISOString();
  }
  timer.notifications = {
    channels,
    warning: {
      enabled: dom.editNotifyWarningEnabled.checked,
      seconds: positiveSeconds(dom.editNotifyWarningSeconds.value, 300),
      sound: NOTIFICATION_SOUNDS.includes(dom.editNotifyWarningSound.value) ? dom.editNotifyWarningSound.value : "gentle",
      durationSeconds: Math.max(1, Math.min(60, Math.round(Number(dom.editNotifyWarningDuration.value) || 10)))
    },
    critical: {
      enabled: dom.editNotifyCriticalEnabled.checked,
      seconds: positiveSeconds(dom.editNotifyCriticalSeconds.value, 60),
      sound: NOTIFICATION_SOUNDS.includes(dom.editNotifyCriticalSound.value) ? dom.editNotifyCriticalSound.value : "neon",
      durationSeconds: Math.max(1, Math.min(60, Math.round(Number(dom.editNotifyCriticalDuration.value) || 10)))
    }
  };
  const candidateTimers = state.mergedConfig.timers.map((item) => item.id === timer.id ? timer : item);
  try {
    normalizeConfig({
      schemaVersion: state.mergedConfig.schemaVersion,
      categories: state.mergedConfig.categories,
      timers: candidateTimers
    }, { source: text("editorTitle") });
  } catch (error) {
    console.error("Timer validation failed.", error);
    toast(errorMessage(error));
    return;
  }
  upsertLocalTimer(timer);
  toast(text("saved"));
  renderAll();
}

function duplicateEditorTimer() {
  if (!state.editingTimerId) return;
  const base = state.mergedConfig.timers.find((x) => x.id === state.editingTimerId);
  if (!base) return;
  const copy = clone(base);
  copy.id = base.id + "_copy_" + Date.now();
  copy.name = { de: timerName(base) + " Copy", en: timerName(base) + " Copy" };
  upsertLocalTimer(copy);
  state.visibleIds.add(copy.id);
  saveVisibleIds();
  renderAll();
  openEditor(copy.id);
}

function deleteEditorTimer() {
  if (!state.editingTimerId) return;
  if (!confirm(text("deleteTimerConfirm"))) return;
  const id = state.editingTimerId;
  const localIndex = state.localConfig.timers.findIndex((x) => x.id === id);
  if (localIndex >= 0) {
    state.localConfig.timers[localIndex].deleted = true;
  } else {
    state.localConfig.timers.push({ id, deleted: true });
  }
  saveLocalConfig();
  state.visibleIds.delete(id);
  saveVisibleIds();
  state.mergedConfig = mergeConfig(state.baseConfig, state.localConfig);
  closeEditor();
  toast(text("deleted"));
  renderAll();
}

function resetEditorTimer() {
  if (!state.editingTimerId) return;
  state.localConfig.timers = state.localConfig.timers.filter((x) => x.id !== state.editingTimerId);
  saveLocalConfig();
  state.mergedConfig = mergeConfig(state.baseConfig, state.localConfig);
  openEditor(state.editingTimerId);
  renderAll();
}

function createNewTimer() {
  const id = "timer_" + Date.now();
  const timer = {
    id,
    categoryId: state.categoryId,
    name: { de: "Neuer Timer", en: "New Timer" },
    description: { de: "Lokal angelegter Timer.", en: "Locally created timer." },
    durationMinutes: 15,
    rules: ["0 20 * * 4"],
    notifications: {
      channels: ["popup"],
      warning: { enabled: true, seconds: 300, sound: "gentle", durationSeconds: 10 },
      critical: { enabled: true, seconds: 60, sound: "neon", durationSeconds: 10 }
    }
  };
  state.mergedConfig.timers.push(timer);
  openEditor(id);
}

function toCategoryId(textValue) {
  return textValue
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || ("category_" + Date.now());
}

function createCategory() {
  const name = prompt(state.lang === "de" ? "Name der neuen Kategorie" : "Name of new category", "Neue Kategorie");
  if (!name) return;
  const timezone = prompt("Timezone", state.displayTimezone || "Europe/Berlin");
  if (!timezone) return;
  let id = toCategoryId(name);
  const existing = new Set(state.mergedConfig.categories.map((x) => x.id));
  while (existing.has(id)) id += "_" + Math.floor(Math.random() * 1000);
  const category = {
    id,
    label: { de: name, en: name },
    region: "custom",
    timezone: timezone.trim() || state.displayTimezone
  };
  const localIndex = state.localConfig.categories.findIndex((x) => x.id === id);
  if (localIndex >= 0) state.localConfig.categories[localIndex] = category;
  else state.localConfig.categories.push(category);
  saveLocalConfig();
  state.mergedConfig = mergeConfig(state.baseConfig, state.localConfig);
  state.categoryId = id;
  storageSet("timer_category_id", state.categoryId);
  toast(text("categoryCreated"));
  renderAll();
}

function renameCategory() {
  const category = state.mergedConfig.categories.find((x) => x.id === state.categoryId);
  if (!category) return;
  const currentName = categoryLabel(category);
  const name = prompt(state.lang === "de" ? "Neuer Name der Kategorie" : "New category name", currentName);
  if (!name || !name.trim()) return;
  const updated = clone(category);
  updated.label = { ...(updated.label || {}), de: name.trim(), en: name.trim() };
  const localIndex = state.localConfig.categories.findIndex((x) => x.id === category.id);
  if (localIndex >= 0) state.localConfig.categories[localIndex] = updated;
  else state.localConfig.categories.push(updated);
  saveLocalConfig();
  state.mergedConfig = mergeConfig(state.baseConfig, state.localConfig);
  toast(text("categoryRenamed"));
  renderAll();
}

function deleteCategory() {
  if (state.mergedConfig.categories.length <= 1) {
    toast(text("cannotDeleteLastCategory"));
    return;
  }
  if (!confirm(text("categoryDeleteConfirm"))) return;
  const id = state.categoryId;
  const localCategoryIndex = state.localConfig.categories.findIndex((x) => x.id === id);
  if (localCategoryIndex >= 0) state.localConfig.categories[localCategoryIndex] = { id, deleted: true };
  else state.localConfig.categories.push({ id, deleted: true });
  for (const timer of state.mergedConfig.timers.filter((x) => x.categoryId === id)) {
    const localTimerIndex = state.localConfig.timers.findIndex((x) => x.id === timer.id);
    if (localTimerIndex >= 0) state.localConfig.timers[localTimerIndex].deleted = true;
    else state.localConfig.timers.push({ id: timer.id, deleted: true });
    state.visibleIds.delete(timer.id);
  }
  saveVisibleIds();
  saveLocalConfig();
  state.mergedConfig = mergeConfig(state.baseConfig, state.localConfig);
  state.categoryId = state.mergedConfig.categories[0]?.id || "";
  storageSet("timer_category_id", state.categoryId);
  toast(text("categoryDeleted"));
  renderAll();
}

function selectedBuilderDays() {
  return Array.from(dom.builderDays.querySelectorAll("input[type='checkbox']"))
    .filter((input) => input.checked)
    .map((input) => Number(input.value))
    .sort((a, b) => a - b);
}

function cronFromBuilder() {
  const days = selectedBuilderDays();
  if (!days.length) {
    toast(text("builderPickDay"));
    return [];
  }
  const rawTimes = Array.from(dom.builderTimeList.querySelectorAll(".builder-time-input"))
    .map((input) => input.value.trim())
    .filter(Boolean);
  if (!rawTimes.length) {
    toast(text("builderBadTime"));
    return [];
  }
  const lines = [];
  for (const t of rawTimes) {
    const match = t.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) {
      toast(text("builderBadTime"));
      return [];
    }
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      toast(text("builderBadTime"));
      return [];
    }
    lines.push(String(minute) + " " + String(hour) + " * * " + days.join(","));
  }
  return lines;
}

function addBuilderTime(value = "20:15") {
  const row = document.createElement("div");
  row.className = "builder-time-row";
  const input = document.createElement("input");
  input.className = "builder-time-input";
  input.type = "time";
  input.step = "60";
  input.value = value;
  input.setAttribute("aria-label", text("builderTimes"));
  const remove = document.createElement("button");
  remove.className = "btn alt builder-remove-time";
  remove.type = "button";
  remove.textContent = "×";
  remove.title = text("builderRemoveTime");
  remove.setAttribute("aria-label", text("builderRemoveTime"));
  remove.addEventListener("click", () => {
    row.remove();
    if (!dom.builderTimeList.children.length) addBuilderTime();
  });
  row.append(input, remove);
  dom.builderTimeList.appendChild(row);
}

function renderBuilderTimes(values = ["20:15"]) {
  dom.builderTimeList.innerHTML = "";
  const uniqueTimes = Array.from(new Set(values.filter(Boolean)));
  for (const value of (uniqueTimes.length ? uniqueTimes : ["20:15"])) addBuilderTime(value);
}

function renderBuilderDays() {
  const previous = new Set(Array.from(dom.builderDays.querySelectorAll("input:checked")).map((input) => Number(input.value)));
  const useDefault = dom.builderDays.children.length === 0;
  const labels = state.lang !== "en"
    ? ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  dom.builderDays.innerHTML = "";
  for (let i = 0; i < 7; i += 1) {
    const label = document.createElement("label");
    label.className = "day-pill";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = String(i);
    input.checked = useDefault ? i === 4 : previous.has(i);
    label.appendChild(input);
    label.appendChild(document.createTextNode(labels[i]));
    dom.builderDays.appendChild(label);
  }
  if (!dom.builderTimeList.children.length) renderBuilderTimes();
}

function renderBuilderLines() {
  const lines = dom.editRules.value.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  dom.builderLines.innerHTML = "";
  lines.forEach((line, index) => {
    const row = document.createElement("div");
    row.className = "builder-line";
    const value = document.createElement("span");
    value.textContent = line;
    const remove = document.createElement("button");
    remove.className = "btn alt";
    remove.type = "button";
    remove.dataset.index = String(index);
    remove.textContent = "×";
    remove.addEventListener("click", () => {
      const nextLines = dom.editRules.value.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
      nextLines.splice(index, 1);
      dom.editRules.value = nextLines.join("\n");
      renderBuilderLines();
    });
    row.append(value, remove);
    dom.builderLines.appendChild(row);
  });
}

function currentUserSettings() {
  return {
    language: state.lang,
    displayTimezone: state.displayTimezone,
    categoryId: state.categoryId,
    visibleTimerIds: Array.from(state.visibleIds),
    dockSide: state.dockSide,
    editorSide: state.editorSide,
    historyMinutes: state.historyMinutes,
    historyCollapsed: state.historyCollapsed,
    cardDensity: state.cardDensity,
    theme: state.theme,
    notificationOverride: state.notificationOverride,
    colorblindMode: state.colorblindMode,
    showThumbnails: state.showThumbnails,
    imageZoom: state.imageZoom,
    liveCollapsed: state.liveCollapsed,
    calendarCollapsed: state.calendarCollapsed
  };
}

function applyImportedSettings(settings) {
  if (!settings) return;
  if (["de", "en", "bar"].includes(settings.language)) state.lang = settings.language;
  if (settings.displayTimezone) state.displayTimezone = settings.displayTimezone;
  if (settings.categoryId) state.categoryId = settings.categoryId;
  if (Array.isArray(settings.visibleTimerIds)) state.visibleIds = new Set(settings.visibleTimerIds);
  if (["left", "right", "top", "bottom", "top-left", "top-right", "bottom-left", "bottom-right"].includes(settings.dockSide)) {
    state.dockSide = settings.dockSide;
  }
  if (["left", "right"].includes(settings.editorSide)) state.editorSide = settings.editorSide;
  if (Number.isFinite(settings.historyMinutes)) state.historyMinutes = Math.max(0, Math.min(1440, Math.round(settings.historyMinutes)));
  state.historyCollapsed = Boolean(settings.historyCollapsed);
  if (["comfortable", "compact", "ultra", "cinematic", "big-picture"].includes(settings.cardDensity)) state.cardDensity = settings.cardDensity;
  if (["astral", "bavaria", "time-vortex", "arcade", "solisium", "executive"].includes(settings.theme)) state.theme = settings.theme;
  if (["default", "all", "silent", "off"].includes(settings.notificationOverride)) state.notificationOverride = settings.notificationOverride;
  state.colorblindMode = Boolean(settings.colorblindMode);
  state.showThumbnails = settings.showThumbnails !== false;
  if (["off", "small", "medium", "large", "huge"].includes(settings.imageZoom)) state.imageZoom = settings.imageZoom;
  state.liveCollapsed = Boolean(settings.liveCollapsed);
  state.calendarCollapsed = Boolean(settings.calendarCollapsed);
  storageSet("timer_language", state.lang);
  storageSet("timer_display_timezone", state.displayTimezone);
  storageSet("timer_category_id", state.categoryId);
  storageSet("timer_visible_ids", JSON.stringify(Array.from(state.visibleIds)));
  storageSet("timer_dock_side", state.dockSide);
  storageSet("timer_editor_side", state.editorSide);
  storageSet("timer_history_minutes", String(state.historyMinutes));
  storageSet("timer_history_collapsed", String(state.historyCollapsed));
  storageSet("timer_card_density", state.cardDensity);
  storageSet("timer_theme", state.theme);
  storageSet("timer_notification_override", state.notificationOverride);
  storageSet("timer_colorblind_mode", String(state.colorblindMode));
  storageSet("timer_show_thumbnails", String(state.showThumbnails));
  storageSet("timer_image_zoom", state.imageZoom);
  storageSet("timer_live_collapsed", String(state.liveCollapsed));
  storageSet("timer_calendar_collapsed", String(state.calendarCollapsed));
  storageSet(localeDefaultsKey, "1");
}

function exportConfig() {
  const exportData = { ...state.mergedConfig, settings: currentUserSettings() };
  const blob = new Blob([serializeIniConfig(exportData)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "timer-config.ini";
  a.click();
  URL.revokeObjectURL(url);
  toast(text("exported"));
}

async function importConfig(file) {
  const textContent = await file.text();
  const source = file.name || "Imported INI";
  const parsed = normalizeConfig(
    parseIniConfig(textContent, { source }),
    { source }
  );
  state.localConfig = {
    categories: parsed.categories,
    timers: parsed.timers
  };
  saveLocalConfig();
  state.mergedConfig = mergeConfig(state.baseConfig, state.localConfig);
  applyImportedSettings(parsed.settings);
  if (!state.mergedConfig.categories.find((x) => x.id === state.categoryId)) {
    state.categoryId = state.mergedConfig.categories[0]?.id || "";
    storageSet("timer_category_id", state.categoryId);
  }
  ensureVisibleIds();
  toast(text("imported"));
  renderAll();
}

function playNotificationSound(soundId = "gentle", durationSeconds = 10) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) throw new Error("Web Audio is not supported by this browser");
    const context = state.audioContext || new AudioContextClass();
    state.audioContext = context;
    if (context.state === "suspended") void context.resume();
    scheduleNotificationSound(context, soundId, durationSeconds);
    return true;
  } catch (error) {
    console.error("Notification sound failed.", error);
    return false;
  }
}

function notificationRemainingSeconds(next) {
  return Math.max(0, Math.ceil((next.getTime() - Date.now()) / 1000));
}

function showPopup(timer, next, level) {
  const title = timerName(timer);
  const alertLevel = text(notificationLevelKey(level.id));
  const remainingSeconds = notificationRemainingSeconds(next);
  const message = text("eventStarts")
    .replace("{time}", formatTime(next, state.displayTimezone, false))
    .replace("{lead}", formatLeadTime(remainingSeconds));
  toast(alertLevel + " · " + title + " · " + message);
  dom.eventPopupLabel.textContent = alertLevel;
  dom.eventPopup.dataset.level = level.id;
  dom.eventPopupTitle.textContent = title;
  dom.eventPopupText.textContent = message;
  try {
    if (!dom.eventPopup.open && typeof dom.eventPopup.showModal === "function") dom.eventPopup.showModal();
    if (state.popupTimer) clearTimeout(state.popupTimer);
    state.popupTimer = setTimeout(() => {
      if (dom.eventPopup.open) dom.eventPopup.close();
    }, 20000);
  } catch {
    // The toast above remains as a safe in-app fallback.
  }
}

function renderNotificationPermissionStatus() {
  const setNotificationButton = (labelKey) => {
    dom.enableNotificationsBtn.textContent = "🔊";
    dom.enableNotificationsBtn.title = text(labelKey);
    dom.enableNotificationsBtn.setAttribute("aria-label", text(labelKey));
  };
  const updateNotificationTooltip = () => {
    const copy = dom.notificationPermissionStatus.parentElement;
    if (copy) copy.title = [dom.notificationPermissionStatus.textContent, dom.pageActivityStatus.textContent].filter(Boolean).join(" ");
  };
  if (!("Notification" in window)) {
    dom.notificationPermissionStatus.textContent = text("notificationStatusUnsupported");
    dom.notificationPermissionStatus.className = "is-blocked";
    setNotificationButton("notificationTestSound");
    dom.channelBrowser.disabled = true;
    updateNotificationTooltip();
    return;
  }
  dom.channelBrowser.disabled = false;
  if (Notification.permission === "granted") {
    dom.notificationPermissionStatus.textContent = text("notificationStatusGranted");
    dom.notificationPermissionStatus.className = "is-ready";
    setNotificationButton("notificationTestSound");
  } else if (Notification.permission === "denied") {
    dom.notificationPermissionStatus.textContent = text("notificationStatusDenied");
    dom.notificationPermissionStatus.className = "is-blocked";
    setNotificationButton("notificationTestSound");
  } else {
    dom.notificationPermissionStatus.textContent = text("notificationStatusDefault");
    dom.notificationPermissionStatus.className = "";
    setNotificationButton("notificationEnable");
  }
  updateNotificationTooltip();
}

async function activateNotifications() {
  if (!playNotificationSound("gentle", 3)) toast(text("audioFailed"));
  if ("Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission();
  }
  renderNotificationPermissionStatus();
  if ("Notification" in window && Notification.permission === "denied") toast(text("browserBlocked"));
}

function deliverNotification(timer, next, level, channels, key) {
  if (channels.includes("popup")) showPopup(timer, next, level);
  if (!playNotificationSound(level.sound, level.durationSeconds)) toast(text("audioFailed"));
  const remainingSeconds = notificationRemainingSeconds(next);
  if (channels.includes("browser") && "Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(text(notificationLevelKey(level.id)) + " · " + timerName(timer), {
        body: text("eventStarts")
          .replace("{time}", formatTime(next, state.displayTimezone, false))
          .replace("{lead}", formatLeadTime(remainingSeconds)),
        tag: key,
        renotify: false,
        requireInteraction: true
      });
    } catch {
      toast(text("browserBlocked"));
    }
  }
}

async function scheduleAlarmTest(levelId) {
  if (!state.editingTimerId) return;
  if (dom.channelBrowser.checked && "Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission();
    renderNotificationPermissionStatus();
  }
  const isCritical = levelId === "critical";
  const level = {
    id: isCritical ? "critical" : "warning",
    enabled: true,
    seconds: positiveSeconds(isCritical ? dom.editNotifyCriticalSeconds.value : dom.editNotifyWarningSeconds.value, isCritical ? 60 : 300),
    sound: isCritical ? dom.editNotifyCriticalSound.value : dom.editNotifyWarningSound.value,
    durationSeconds: Math.max(1, Math.min(60, Math.round(Number(
      isCritical ? dom.editNotifyCriticalDuration.value : dom.editNotifyWarningDuration.value
    ) || 10)))
  };
  const base = state.mergedConfig.timers.find((timer) => timer.id === state.editingTimerId);
  if (!base) return;
  const timer = clone(base);
  timer.name = { ...(timer.name || {}), [state.lang]: dom.editName.value || timerName(base) };
  const channels = [];
  if (dom.channelBrowser.checked) channels.push("browser");
  if (dom.channelPopup.checked) channels.push("popup");
  const fireAt = Date.now() + 10000;
  const simulatedNext = new Date(fireAt + level.seconds * 1000);
  toast(text("alarmTestScheduled").replace("{level}", text(notificationLevelKey(level.id))));
  window.setTimeout(() => {
    deliverNotification(timer, simulatedNext, level, channels, "test:" + level.id + ":" + fireAt);
  }, 10000);
}

function openDockWindow() {
  const screenLeft = window.screen.availLeft || 0;
  const screenTop = window.screen.availTop || 0;
  const screenWidth = window.screen.availWidth || 1280;
  const screenHeight = window.screen.availHeight || 900;
  const horizontal = state.dockSide === "top" || state.dockSide === "bottom";
  const corner = state.dockSide.includes("-");
  const width = horizontal ? screenWidth : (corner ? Math.min(520, screenWidth) : 360);
  const height = horizontal ? Math.min(330, screenHeight) : (corner ? Math.min(680, screenHeight) : screenHeight);
  const atLeft = state.dockSide.includes("left") || state.dockSide === "left";
  const atTop = state.dockSide.includes("top") || state.dockSide === "top";
  const atBottom = state.dockSide.includes("bottom") || state.dockSide === "bottom";
  const left = horizontal ? screenLeft
    : (atLeft ? screenLeft : screenLeft + screenWidth - width);
  const top = atBottom ? screenTop + screenHeight - height : screenTop;
  const url = new URL(window.location.href);
  url.searchParams.set("mode", "dock");
  url.searchParams.set("dockSide", state.dockSide);
  const dockWindow = window.open(
    url.toString(),
    "solisiumPulseStatus",
    "popup=yes,width=" + width + ",height=" + height + ",left=" + left + ",top=" + top
  );
  if (!dockWindow) {
    toast(text("dockBlocked"));
    return;
  }
  window.setTimeout(() => {
    try {
      dockWindow.moveTo(left, top);
      dockWindow.resizeTo(width, height);
      dockWindow.focus();
    } catch {
      // Some browsers keep the requested popup size but block screen positioning.
    }
  }, 250);
}

function maybeNotify(timers) {
  const now = Date.now();
  const checkedFrom = Math.min(state.lastNotificationCheck || now - 1500, now);
  state.lastNotificationCheck = now;
  for (const timer of timers) {
    const notifications = notificationSettings(timer);
    const next = timerOccurrences(timer, selectedCategory(), 1)[0];
    if (!next) continue;
    const levels = notificationLevels(timer);
    for (const level of levels) {
      const key = timer.id + ":" + next.toISOString() + ":" + level.id + ":" + level.seconds;
      const triggerAt = next.getTime() - level.seconds * 1000;
      if (triggerAt > checkedFrom && triggerAt <= now && !state.notified.has(key)) {
        state.notified.add(key);
        const channels = notifications.channels;
        deliverNotification(timer, next, level, channels, key);
      }
    }
  }
}

function updateClocks() {
  const now = new Date();
  const category = selectedCategory();
  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const renderClock = (target, label, time, suffix) => {
    const value = document.createElement("b");
    value.textContent = time;
    target.replaceChildren(document.createTextNode(label + ": "), value, document.createTextNode(" · " + suffix));
  };
  renderClock(dom.localClock, text("localClock"), formatTime(now, localZone), localZone);
  renderClock(dom.serverClock, text("serverClock"), formatTime(now, state.displayTimezone), categoryLabel(category) || state.displayTimezone);
}

function openEventImage(timer, selectedArt = timerArt(timer)) {
  if (!selectedArt?.src) return;
  dom.imageLightboxImage.src = selectedArt.src;
  dom.imageLightboxImage.alt = artTitle(selectedArt, timer);
  dom.imageLightboxImage.dataset.wallpaperSrc = selectedArt.src;
  dom.imageLightboxTitle.textContent = artTitle(selectedArt, timer);
  setLightboxZoomScale(1, 50, 50);
  if (!dom.imageLightbox.open && typeof dom.imageLightbox.showModal === "function") {
    dom.imageLightbox.showModal();
  }
}

function updateLightboxZoomPosition(event) {
  if (state.imageLightboxZoomScale <= 1.001) return;
  const rect = dom.imageLightboxFrame.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
  const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
  const xPct = (x / rect.width) * 100;
  const yPct = (y / rect.height) * 100;
  setLightboxZoomScale(state.imageLightboxZoomScale, xPct, yPct);
}

function handleLightboxWheel(event) {
  event.preventDefault();
  const rect = dom.imageLightboxFrame.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const xPct = ((event.clientX - rect.left) / rect.width) * 100;
  const yPct = ((event.clientY - rect.top) / rect.height) * 100;
  const delta = event.deltaY < 0 ? 0.2 : -0.2;
  const targetScale = Math.abs((state.imageLightboxZoomScale + delta) - 1) < 0.12
    ? 1
    : state.imageLightboxZoomScale + delta;
  setLightboxZoomScale(targetScale, xPct, yPct);
}

async function downloadCurrentLightboxImage() {
  const sourceUrl = dom.imageLightboxImage.dataset.wallpaperSrc || dom.imageLightboxImage.currentSrc || dom.imageLightboxImage.src;
  if (!sourceUrl) return;
  try {
    const response = await fetch(sourceUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`Image download failed (HTTP ${response.status})`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = "linny-desktop-wallpaper.webp";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
    toast(text("wallpaperDownloaded"));
  } catch (error) {
    console.warn("Wallpaper download failed, opening image directly.", error);
    openShareWindow(sourceUrl);
    toast(text("wallpaperManualHint"));
  }
}

function showImageHoverPreview(selectedArt) {
  if (state.imageZoom === "off" || !selectedArt?.src || matchMedia("(hover: none)").matches) return;
  const previewWidths = {
    small: "min(34vw, 480px)",
    medium: "min(50vw, 760px)",
    large: "min(68vw, 1080px)",
    huge: "min(84vw, 1400px)"
  };
  dom.imageHoverPreview.style.width = previewWidths[state.imageZoom] || previewWidths.medium;
  dom.imageHoverPreviewImage.src = selectedArt.src;
  dom.imageHoverPreview.classList.add("is-visible");
  dom.imageHoverPreview.setAttribute("aria-hidden", "false");
}

function hideImageHoverPreview() {
  dom.imageHoverPreview.classList.remove("is-visible");
  dom.imageHoverPreview.setAttribute("aria-hidden", "true");
}

function renderCards() {
  const category = selectedCategory();
  const timers = filteredTimers().filter((timer) => state.visibleIds.has(timer.id));
  const cards = timers.map((timer) => {
    const next = timerOccurrences(timer, category, 8)[0];
    return { timer, next };
  }).filter((x) => x.next).sort((a, b) => a.next - b.next);
  const renderKey = [
    state.lang,
    state.categoryId,
    state.showThumbnails,
    state.artRotationBucket,
    cards.map(({ timer, next }) => timer.id + "@" + next.getTime()).join("|")
  ].join("::");

  if (state.cardRenderKey === renderKey) {
    for (const item of cards) {
      const el = dom.cardStack.querySelector('[data-timer-id="' + CSS.escape(item.timer.id) + '"]');
      if (!el) continue;
      const delta = item.next.getTime() - Date.now();
      const tone = urgencyTone(delta);
      const phasePercent = Math.round(urgencyPhaseProgress(delta) * 100);
      el.className = "card " + urgencyClass(delta)
        + (el.dataset.primary === "true" ? " is-primary" : "")
        + (state.showThumbnails ? " has-thumbnail" : "");
      el.style.setProperty("--urgency-color", tone.color);
      el.style.setProperty("--urgency-glow", tone.glow);
      if (state.dockMode && selectedArt.src) {
        el.addEventListener("mouseenter", () => showImageHoverPreview(selectedArt));
        el.addEventListener("mouseleave", hideImageHoverPreview);
      }
      const count = el.querySelector(".count");
      const status = el.querySelector(".card-status");
      const fill = el.querySelector(".card-phase-progress span");
      const bar = el.querySelector(".card-phase-progress");
      if (count) count.textContent = countdown(item.next);
      if (status) status.textContent = text(urgencyLabelKey(delta));
      if (fill) fill.style.width = phasePercent + "%";
      if (bar) {
        const phaseLabel = text("phaseProgress").replace("{percent}", String(phasePercent));
        bar.title = phaseLabel;
        bar.setAttribute("aria-label", phaseLabel);
        bar.setAttribute("aria-valuenow", String(phasePercent));
      }
    }
    return;
  }

  state.cardRenderKey = renderKey;
  dom.cardStack.innerHTML = "";

  if (!cards.length) {
    const empty = document.createElement("div");
    empty.className = "card";
    empty.textContent = text("noTimers");
    dom.cardStack.appendChild(empty);
    return;
  }

  cards.forEach((item, index) => {
    const timer = item.timer;
    const selectedArt = timerArt(timer);
    const next = item.next;
    const categoryRef = state.mergedConfig.categories.find((x) => x.id === timer.categoryId);
    const accent = dynamicAccent(timer, categoryRef);
    const motif = dynamicMotif(timer, categoryRef);
    const delta = next.getTime() - Date.now();
    const statusKey = urgencyLabelKey(delta);
    const tone = urgencyTone(delta);
    const phaseProgress = urgencyPhaseProgress(delta);
    const el = document.createElement("article");
    el.className = "card " + urgencyClass(delta) + (index === 0 ? " is-primary" : "");
    el.dataset.timerId = timer.id;
    el.dataset.primary = String(index === 0);
    if (state.showThumbnails && selectedArt.src) el.classList.add("has-thumbnail");
    el.style.setProperty("--motif", motif);
    el.style.setProperty("--accent-bar", accent.bar);
    el.style.setProperty("--card-overlay", accent.overlay);
    el.style.setProperty("--card-glow", accent.glow);
    el.style.setProperty("--pattern-angle", accent.patternAngle);
    el.style.setProperty("--urgency-color", tone.color);
    el.style.setProperty("--urgency-glow", tone.glow);

    const head = document.createElement("div");
    head.className = "card-head";

    const title = document.createElement("div");
    title.className = "card-title";
    title.tabIndex = 0;
    title.setAttribute("aria-label", timerName(timer));
    title.addEventListener("mouseenter", () => {
      const rect = title.getBoundingClientRect();
      const tooltipWidth = Math.min(340, window.innerWidth - 24);
      const left = Math.max(12, Math.min(rect.left, window.innerWidth - tooltipWidth - 12));
      const estimatedHeight = 245;
      const below = rect.bottom + 8;
      const top = below + estimatedHeight <= window.innerHeight
        ? below
        : Math.max(12, rect.top - estimatedHeight - 8);
      title.style.setProperty("--tooltip-left", left + "px");
      title.style.setProperty("--tooltip-top", top + "px");
    });
    const heading = document.createElement("b");
    heading.textContent = timerName(timer);
    title.appendChild(heading);

    const tooltip = document.createElement("div");
    tooltip.className = "card-tooltip";
    tooltip.setAttribute("role", "tooltip");
    const description = document.createElement("p");
    description.textContent = timerDescription(timer) || text("noSchedule");
    tooltip.appendChild(description);

    const scheduleRow = document.createElement("div");
    scheduleRow.className = "card-tooltip-row";
    const scheduleLabel = document.createElement("span");
    scheduleLabel.className = "card-tooltip-label";
    scheduleLabel.textContent = text("tooltipSchedule");
    const schedule = document.createElement("code");
    schedule.textContent = (timer.rules || []).join(" | ") || text("noSchedule");
    scheduleRow.append(scheduleLabel, schedule);
    tooltip.appendChild(scheduleRow);

    const durationRow = document.createElement("div");
    durationRow.className = "card-tooltip-row";
    const durationLabel = document.createElement("span");
    durationLabel.className = "card-tooltip-label";
    durationLabel.textContent = text("tooltipDuration");
    const durationValue = document.createElement("span");
    durationValue.textContent = String(timer.durationMinutes || 10) + " min";
    durationRow.append(durationLabel, durationValue);
    tooltip.appendChild(durationRow);

    const notifications = notificationSettings(timer);

    const warningRow = document.createElement("div");
    warningRow.className = "card-tooltip-row";
    const warningLabel = document.createElement("span");
    warningLabel.className = "card-tooltip-label";
    warningLabel.textContent = text("tooltipWarningTimer");
    const warningValue = document.createElement("span");
    warningValue.textContent = !notifications.warning.enabled
      ? text("tooltipNotificationDisabled")
      : text("tooltipWarningActive")
        .replace("{lead}", formatLeadTime(notifications.warning.seconds))
        .replace("{sound}", notificationSoundName(notifications.warning.sound))
        .replace("{duration}", formatLeadTime(notifications.warning.durationSeconds));
    warningRow.append(warningLabel, warningValue);
    tooltip.appendChild(warningRow);

    const criticalRow = document.createElement("div");
    criticalRow.className = "card-tooltip-row";
    const criticalLabel = document.createElement("span");
    criticalLabel.className = "card-tooltip-label";
    criticalLabel.textContent = text("tooltipCriticalTimer");
    const criticalValue = document.createElement("span");
    criticalValue.textContent = !notifications.critical.enabled
      ? text("tooltipNotificationDisabled")
      : text("tooltipCriticalActive")
        .replace("{lead}", formatLeadTime(notifications.critical.seconds))
        .replace("{sound}", notificationSoundName(notifications.critical.sound))
        .replace("{duration}", formatLeadTime(notifications.critical.durationSeconds));
    criticalRow.append(criticalLabel, criticalValue);
    tooltip.appendChild(criticalRow);
    title.appendChild(tooltip);

    head.appendChild(title);

    const count = document.createElement("div");
    count.className = "count";
    count.textContent = countdown(next);

    const meta = document.createElement("div");
    meta.className = "meta";
    const when = document.createElement("span");
    when.className = "card-when";
    when.textContent = formatDate(next, state.displayTimezone) + " · " + formatTime(next, state.displayTimezone, false);
    const status = document.createElement("span");
    status.className = "card-status";
    status.textContent = text(statusKey);
    meta.append(when, status);

    const phaseBar = document.createElement("div");
    phaseBar.className = "card-phase-progress";
    const phasePercent = Math.round(phaseProgress * 100);
    const phaseLabel = text("phaseProgress").replace("{percent}", String(phasePercent));
    phaseBar.title = phaseLabel;
    phaseBar.setAttribute("role", "progressbar");
    phaseBar.setAttribute("aria-label", phaseLabel);
    phaseBar.setAttribute("aria-valuemin", "0");
    phaseBar.setAttribute("aria-valuemax", "100");
    phaseBar.setAttribute("aria-valuenow", String(phasePercent));
    const phaseFill = document.createElement("span");
    phaseFill.style.width = phasePercent + "%";
    phaseBar.appendChild(phaseFill);

    if (state.showThumbnails && selectedArt.src) {
      const thumbnail = document.createElement("button");
      thumbnail.className = "card-thumbnail";
      thumbnail.type = "button";
      thumbnail.title = text("thumbnailHint");
      thumbnail.setAttribute("aria-label", text("thumbnailHint") + " " + timerName(timer));
      const image = document.createElement("img");
      image.src = selectedArt.src;
      image.alt = "";
      image.loading = index < 2 ? "eager" : "lazy";
      image.decoding = "async";
      const caption = document.createElement("span");
      caption.className = "card-art-caption";
      const captionTrack = document.createElement("span");
      captionTrack.className = "card-art-caption-track";
      captionTrack.textContent = artTitle(selectedArt, timer);
      caption.appendChild(captionTrack);
      thumbnail.append(image, caption);
      thumbnail.title = artTitle(selectedArt, timer);
      thumbnail.setAttribute("aria-label", artTitle(selectedArt, timer));
      thumbnail.addEventListener("mouseenter", () => showImageHoverPreview(selectedArt));
      thumbnail.addEventListener("mouseleave", hideImageHoverPreview);
      thumbnail.addEventListener("blur", hideImageHoverPreview);
      thumbnail.addEventListener("click", () => openEventImage(timer, selectedArt));
      thumbnail.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openEventImage(timer, selectedArt);
        }
      });
      el.appendChild(thumbnail);
    }
    el.append(head, count, meta, phaseBar);
    dom.cardStack.appendChild(el);
  });
}

function renderCurrentEvents() {
  const now = Date.now();
  const category = selectedCategory();
  const items = filteredTimers()
    .filter((timer) => state.visibleIds.has(timer.id))
    .map((timer) => ({ timer, timing: recentTimerState(timer, category, now) }))
    .filter((item) => item.timing)
    .sort((a, b) => {
      if (a.timing.status !== b.timing.status) return a.timing.status === "running" ? -1 : 1;
      return b.timing.startMs - a.timing.startMs;
    });

  dom.currentEventsSection.hidden = items.length === 0;
  dom.currentEventsList.innerHTML = "";
  const historyCount = items.filter((item) => item.timing.status === "ended").length;
  dom.historyToggleBtn.hidden = historyCount === 0;
  const historyToggleText = text(state.historyCollapsed ? "showHistory" : "hideHistory")
    .replace("{count}", String(historyCount));
  dom.historyToggleBtn.title = historyToggleText;
  dom.historyToggleBtn.setAttribute("aria-label", historyToggleText);
  dom.historyToggleBtn.setAttribute("aria-expanded", String(!state.historyCollapsed));
  setCollapseDirection(dom.historyToggleBtn, state.historyCollapsed ? "down" : "up");
  const historyCountBadge = dom.historyToggleBtn.querySelector(".history-count");
  if (historyCountBadge) historyCountBadge.textContent = String(historyCount);
  for (const { timer, timing } of items) {
    const isRunning = timing.status === "running";
    if (!isRunning && state.historyCollapsed) continue;
    const remainingText = isRunning
      ? text("eventRemaining").replace("{time}", compactDuration(timing.endMs - now))
      : text("eventEndedAgo").replace("{time}", compactDuration(now - timing.endMs));
    const row = document.createElement("article");
    row.className = "current-event " + (isRunning ? "is-running" : "is-ended");
    const head = document.createElement("div");
    head.className = "current-event-head";
    const titleWrap = document.createElement("div");
    const title = document.createElement("b");
    title.textContent = timerName(timer);
    const stateLabel = document.createElement("small");
    stateLabel.textContent = isRunning ? text("currentRunning") : text("recentlyEnded");
    titleWrap.append(title, stateLabel);
    const remaining = document.createElement("strong");
    remaining.textContent = remainingText;
    head.append(titleWrap, remaining);
    const progress = document.createElement("div");
    progress.className = "event-progress";
    const progressFill = document.createElement("span");
    progressFill.style.width = Math.min(100, Math.max(0, timing.progress * 100)).toFixed(2) + "%";
    progress.appendChild(progressFill);
    const meta = document.createElement("div");
    meta.className = "current-event-meta";
    const start = document.createElement("span");
    start.textContent = formatTime(new Date(timing.startMs), state.displayTimezone, false);
    const duration = document.createElement("span");
    duration.textContent = (timer.durationMinutes || 10) + " min";
    meta.append(start, duration);
    row.append(head, progress, meta);
    dom.currentEventsList.appendChild(row);
  }
}

function downloadIcs(entries, filename) {
  downloadCalendarIcs(entries, filename, { timerName, timerDescription });
}

function updateCalendarSelectionUi() {
  const availableKeys = Array.from(state.calendarEntries.keys());
  const selectedKeys = availableKeys.filter((key) => state.calendarSelection.has(key));
  const selectedCount = selectedKeys.length;
  const totalCount = availableKeys.length;
  dom.calendarSelectionStatus.textContent = text("selectedCount").replace("{count}", String(selectedCount));
  dom.calendarSelectAll.checked = totalCount > 0 && selectedCount === totalCount;
  dom.calendarSelectAll.indeterminate = selectedCount > 0 && selectedCount < totalCount;
  dom.calendarSelectAll.disabled = totalCount === 0;
  dom.downloadSelectedIcsBtn.disabled = selectedCount === 0;
  dom.calendarGroups.querySelectorAll(".calendar-select").forEach((checkbox) => {
    const checked = state.calendarSelection.has(checkbox.dataset.key);
    checkbox.checked = checked;
    checkbox.closest(".calendar-row")?.classList.toggle("is-selected", checked);
  });
}

function renderCalendar() {
  dom.calendarGroups.innerHTML = "";
  state.calendarEntries = new Map();
  const category = selectedCategory();
  const timers = filteredTimers().filter((timer) => state.visibleIds.has(timer.id));
  for (const timer of timers) {
    const occurrences = timerOccurrences(timer, category, 8);
    if (!occurrences.length) continue;
    const wrap = document.createElement("div");
    wrap.className = "calendar-group";
    const heading = document.createElement("h3");
    heading.textContent = timerName(timer);
    heading.dataset.timerId = timer.id;
    heading.dataset.toggleHint = text("calendarToggleHint");
    heading.title = text("calendarToggleHint");
    wrap.appendChild(heading);
    for (const date of occurrences) {
      const key = calendarEntryKey(timer.id, date.getTime());
      state.calendarEntries.set(key, { timer, start: date.getTime() });
      const checked = state.calendarSelection.has(key);
      const row = document.createElement("div");
      row.className = "calendar-row" + (checked ? " is-selected" : "");
      const checkbox = document.createElement("input");
      checkbox.className = "calendar-select";
      checkbox.type = "checkbox";
      checkbox.dataset.key = key;
      checkbox.checked = checked;
      const dateValue = document.createElement("b");
      dateValue.textContent = formatDate(date, state.displayTimezone);
      const timeValue = document.createElement("strong");
      timeValue.textContent = formatTime(date, state.displayTimezone, false);
      const name = document.createElement("span");
      name.textContent = timerName(timer);
      const ics = document.createElement("button");
      ics.className = "btn alt ics-btn";
      ics.type = "button";
      ics.dataset.key = key;
      ics.textContent = "ICS";
      row.append(checkbox, dateValue, timeValue, name, ics);
      wrap.appendChild(row);
    }
    dom.calendarGroups.appendChild(wrap);
  }

  for (const key of Array.from(state.calendarSelection)) {
    if (!state.calendarEntries.has(key)) state.calendarSelection.delete(key);
  }

  if (!state.calendarEntries.size) {
    const empty = document.createElement("div");
    empty.className = "calendar-group";
    empty.textContent = text("noSchedule");
    dom.calendarGroups.appendChild(empty);
  }

  dom.calendarGroups.querySelectorAll(".calendar-select").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) state.calendarSelection.add(checkbox.dataset.key);
      else state.calendarSelection.delete(checkbox.dataset.key);
      updateCalendarSelectionUi();
    });
  });

  dom.calendarGroups.querySelectorAll(".ics-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const entry = state.calendarEntries.get(button.dataset.key);
      if (entry) downloadIcs([entry], entry.timer.id + ".ics");
    });
  });

  dom.calendarGroups.querySelectorAll(".calendar-group h3[data-timer-id]").forEach((heading) => {
    heading.addEventListener("dblclick", () => {
      const timerId = heading.dataset.timerId;
      const keys = Array.from(state.calendarEntries.entries())
        .filter(([, entry]) => entry.timer.id === timerId)
        .map(([key]) => key);
      if (!keys.length) return;
      const allSelected = keys.every((key) => state.calendarSelection.has(key));
      for (const key of keys) {
        if (allSelected) state.calendarSelection.delete(key);
        else state.calendarSelection.add(key);
      }
      updateCalendarSelectionUi();
      const timer = state.calendarEntries.get(keys[0])?.timer;
      toast(text(allSelected ? "calendarEventCleared" : "calendarEventSelected")
        .replace("{count}", String(keys.length))
        .replace("{event}", timer ? timerName(timer) : timerId));
    });
  });

  updateCalendarSelectionUi();
}

function renderAll() {
  renderLabels();
  renderCategories();
  renderToggles();
  renderCurrentEvents();
  renderCards();
  renderCalendar();
  renderNotificationPermissionStatus();
  updateClocks();
  window.requestAnimationFrame(syncDashboardHeight);
}

async function loadConfig() {
  const iniResponse = await fetch("config.ini", { cache: "no-cache" });
  if (!iniResponse.ok) {
    throw new Error(`config.ini could not be loaded (HTTP ${iniResponse.status})`);
  }
  const configText = await iniResponse.text();
  const loadedConfig = normalizeConfig(
    parseIniConfig(configText, { source: "config.ini" }),
    { source: "config.ini" }
  );
  try {
    const liveResponse = await fetch("live-timers.ini", { cache: "no-store" });
    if (!liveResponse.ok) {
      throw new Error(`live-timers.ini returned HTTP ${liveResponse.status}`);
    }
    const liveOverlayText = await liveResponse.text();
    applyLiveTimerOverrides(loadedConfig, liveOverlayText);
    state.liveOverlayText = liveOverlayText;
    state.liveOverlayError = "";
  } catch (error) {
    console.warn("Using checked-in timer anchors because the live overlay is unavailable.", error);
    state.liveOverlayText = "";
    state.liveOverlayError = errorMessage(error);
  }
  state.baseConfig = normalizeConfig(loadedConfig, { source: "Merged base configuration" });
  state.localConfig = loadLocalConfig() || { categories: [], timers: [] };
  if (normalizeSummerFestivalRules(state.localConfig)) {
    saveLocalConfig();
  }
  if (restoreCoreDefaultTimers(state.localConfig)) {
    saveLocalConfig();
  }
  if (migrateLegacyMemoryInterval(state.localConfig)) {
    saveLocalConfig();
  }
  if (migrateUpdatedDefaultDurations(state.localConfig)) {
    saveLocalConfig();
  }
  if (migrateNotificationSettings(state.localConfig)) {
    saveLocalConfig();
  }
  if (migrateJulyGuildSchedule(state.localConfig)) {
    saveLocalConfig();
  }
  if (migrateDraftAndReminderDefaults(state.localConfig)) {
    saveLocalConfig();
  }
  state.mergedConfig = mergeConfig(state.baseConfig, state.localConfig);
  try {
    state.mergedConfig = normalizeConfig(state.mergedConfig, {
      source: "Local timer configuration"
    });
  } catch (error) {
    state.localConfigError = errorMessage(error);
    console.error("Stored local timer configuration was ignored.", error);
    state.localConfig = { categories: [], timers: [] };
    state.mergedConfig = clone(state.baseConfig);
  }
  state.categoryId = storageGet("timer_category_id") || state.mergedConfig.categories[0]?.id || "";
  state.displayTimezone = storageGet("timer_display_timezone") || clientDefaultTimezone;
  state.historyMinutes = Math.max(0, Number(storageGet("timer_history_minutes") ?? "30") || 0);
  state.historyCollapsed = storageGet("timer_history_collapsed") === "true";
  state.cardDensity = CARD_DENSITY_VALUES.includes(storageGet("timer_card_density"))
    ? storageGet("timer_card_density")
    : "compact";
  state.theme = ["astral", "bavaria", "time-vortex", "arcade", "solisium", "executive"].includes(storageGet("timer_theme"))
    ? storageGet("timer_theme")
    : "astral";
  state.notificationOverride = ["default", "all", "silent", "off"].includes(storageGet("timer_notification_override"))
    ? storageGet("timer_notification_override")
    : "default";
  state.colorblindMode = storageGet("timer_colorblind_mode") === "true";
  state.showThumbnails = storageGet("timer_show_thumbnails") !== "false";
  state.imageZoom = ["off", "small", "medium", "large", "huge"].includes(storageGet("timer_image_zoom"))
    ? storageGet("timer_image_zoom")
    : "large";
  state.liveCollapsed = storageGet("timer_live_collapsed") === "true";
  state.calendarCollapsed = storageGet("timer_calendar_collapsed") === "true";
  updateEditorPanelState();
  const storedVisibleIds = loadVisibleIds();
  state.visibleIds = storedVisibleIds || new Set(state.mergedConfig.timers.map((timer) => timer.id));
  if (storedVisibleIds && storageGet("timer_visibility_schema") !== "2026-07-24") {
    for (const timer of state.mergedConfig.timers) state.visibleIds.add(timer.id);
    storageSet("timer_visibility_schema", "2026-07-24");
    saveVisibleIds();
  }
  if (!storedVisibleIds) saveVisibleIds();
  if (!state.mergedConfig.categories.find((x) => x.id === state.categoryId)) {
    state.categoryId = state.mergedConfig.categories[0]?.id || "";
  }
}

function setLanguage(language, persist = true) {
  state.lang = ["de", "en", "bar"].includes(language) ? language : clientDefaultLanguage;
  if (persist) storageSet("timer_language", state.lang);
  renderBuilderDays();
  renderAll();
}

function setupPwa() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallButton();
  });
  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    updateInstallButton();
  });
  window.matchMedia?.("(display-mode: standalone)")
    .addEventListener?.("change", updateInstallButton);
  updateInstallButton();
  registerPwaServiceWorker();
}

function bind() {
  dom.langDeBtn.addEventListener("click", () => setLanguage("de"));
  dom.langEnBtn.addEventListener("click", () => setLanguage("en"));
  dom.langBarBtn.addEventListener("click", () => setLanguage("bar"));
  dom.installAppBtn.addEventListener("click", async () => {
    if (isStandaloneMode() || !deferredInstallPrompt) {
      if (!isStandaloneMode()) toast(installFallbackHint());
      updateInstallButton();
      return;
    }
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    updateInstallButton();
  });
  dom.shareNativeBtn.addEventListener("click", async () => {
    const shareData = buildShareData();
    if (!navigator.share) {
      toast(text("shareNotSupported"));
      return;
    }
    try {
      await navigator.share({ title: shareData.title, text: shareData.summary, url: shareData.url });
    } catch (error) {
      if (error?.name !== "AbortError") {
        toast(text("shareFailed"));
      }
    }
  });
  dom.shareTelegramBtn.addEventListener("click", () => {
    const shareData = buildShareData();
    openShareWindow(`https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.summary)}`);
  });
  dom.shareWhatsappBtn.addEventListener("click", () => {
    const shareData = buildShareData();
    openShareWindow(`https://wa.me/?text=${encodeURIComponent(`${shareData.summary} ${shareData.url}`)}`);
  });
  dom.shareCopyBtn.addEventListener("click", async () => {
    const shareData = buildShareData();
    if (!navigator.clipboard?.writeText) {
      toast(text("shareCopyManual"));
      return;
    }
    await navigator.clipboard.writeText(shareData.url);
    toast(text("shareCopied"));
  });

  dom.categorySelect.addEventListener("change", () => {
    state.categoryId = dom.categorySelect.value;
    storageSet("timer_category_id", state.categoryId);
    renderAll();
  });
  for (const control of [dom.categorySelect, dom.newCategoryBtn, dom.renameCategoryBtn, dom.deleteCategoryBtn, dom.newTimerBtn]) {
    control.addEventListener("pointerdown", (event) => event.stopPropagation());
    control.addEventListener("click", (event) => event.stopPropagation());
  }

  dom.displayTimezone.addEventListener("change", () => {
    state.displayTimezone = dom.displayTimezone.value || clientDefaultTimezone;
    storageSet("timer_display_timezone", state.displayTimezone);
    renderAll();
  });

  dom.historyMinutesInput.addEventListener("change", () => {
    state.historyMinutes = Math.max(0, Math.min(1440, Math.round(Number(dom.historyMinutesInput.value) || 0)));
    dom.historyMinutesInput.value = String(state.historyMinutes);
    storageSet("timer_history_minutes", String(state.historyMinutes));
    renderCurrentEvents();
  });

  dom.historyToggleBtn.addEventListener("click", () => {
    state.historyCollapsed = !state.historyCollapsed;
    storageSet("timer_history_collapsed", String(state.historyCollapsed));
    renderCurrentEvents();
  });

  dom.cardDensitySelect.addEventListener("change", () => {
    state.cardDensity = CARD_DENSITY_VALUES.includes(dom.cardDensitySelect.value)
      ? dom.cardDensitySelect.value
      : "compact";
    storageSet("timer_card_density", state.cardDensity);
    applyAppearanceSettings();
  });

  dom.themeSelect.addEventListener("change", () => {
    state.theme = ["astral", "bavaria", "time-vortex", "arcade", "solisium", "executive"].includes(dom.themeSelect.value)
      ? dom.themeSelect.value
      : "astral";
    storageSet("timer_theme", state.theme);
    applyAppearanceSettings();
  });

  dom.notificationOverrideSelect.addEventListener("change", () => {
    state.notificationOverride = ["default", "all", "silent", "off"].includes(dom.notificationOverrideSelect.value)
      ? dom.notificationOverrideSelect.value
      : "default";
    storageSet("timer_notification_override", state.notificationOverride);
  });

  dom.colorblindModeInput.addEventListener("change", () => {
    state.colorblindMode = dom.colorblindModeInput.checked;
    storageSet("timer_colorblind_mode", String(state.colorblindMode));
    applyAppearanceSettings();
  });

  dom.showThumbnailsInput.addEventListener("change", () => {
    state.showThumbnails = dom.showThumbnailsInput.checked;
    storageSet("timer_show_thumbnails", String(state.showThumbnails));
    state.cardRenderKey = "";
    renderCards();
  });

  dom.imageZoomSelect.addEventListener("change", () => {
    state.imageZoom = ["off", "small", "medium", "large", "huge"].includes(dom.imageZoomSelect.value)
      ? dom.imageZoomSelect.value
      : "large";
    storageSet("timer_image_zoom", state.imageZoom);
    hideImageHoverPreview();
  });

  dom.liveCollapseBtn.addEventListener("click", () => {
    state.liveCollapsed = !state.liveCollapsed;
    storageSet("timer_live_collapsed", String(state.liveCollapsed));
    applyAppearanceSettings();
  });

  dom.calendarCollapseBtn.addEventListener("click", () => {
    state.calendarCollapsed = !state.calendarCollapsed;
    storageSet("timer_calendar_collapsed", String(state.calendarCollapsed));
    applyAppearanceSettings();
  });

  dom.settingsToggleBtn.addEventListener("click", () => {
    dom.settingsPopover.showModal();
  });
  dom.settingsPopoverCloseBtn.addEventListener("click", () => dom.settingsPopover.close());
  dom.settingsPopover.addEventListener("click", (event) => {
    if (event.target === dom.settingsPopover) dom.settingsPopover.close();
  });
  dom.storageSettingsBtn.addEventListener("click", () => {
    dom.privacyDialog.showModal();
  });

  document.addEventListener("visibilitychange", renderPageActivityStatus);

  dom.newTimerBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    createNewTimer();
  });
  dom.newCategoryBtn.addEventListener("click", createCategory);
  dom.renameCategoryBtn.addEventListener("click", renameCategory);
  dom.deleteCategoryBtn.addEventListener("click", deleteCategory);
  dom.exportBtn.addEventListener("click", exportConfig);
  dom.importBtn.addEventListener("click", () => dom.importInput.click());
  dom.importInput.addEventListener("change", async () => {
    if (dom.importInput.files && dom.importInput.files[0]) {
      try {
        await importConfig(dom.importInput.files[0]);
      } catch (error) {
        console.error("INI import failed.", error);
        toast(text("importFailed") + " " + errorMessage(error));
      }
      dom.importInput.value = "";
    }
  });

  dom.calendarSelectAll.addEventListener("change", () => {
    state.calendarSelection.clear();
    if (dom.calendarSelectAll.checked) {
      for (const key of state.calendarEntries.keys()) state.calendarSelection.add(key);
    }
    updateCalendarSelectionUi();
  });

  dom.downloadSelectedIcsBtn.addEventListener("click", () => {
    const entries = Array.from(state.calendarSelection)
      .map((key) => state.calendarEntries.get(key))
      .filter(Boolean);
    if (!entries.length) {
      toast(text("noIcsSelection"));
      return;
    }
    downloadIcs(entries, "linny-epic-time-portal-events.ics");
    toast(text("icsExported").replace("{count}", String(entries.length)));
  });

  dom.enableNotificationsBtn.addEventListener("click", () => {
    void activateNotifications();
  });

  dom.editNotifyWarningEnabled.addEventListener("change", () => {
    dom.warningNotificationCard.classList.toggle("is-disabled", !dom.editNotifyWarningEnabled.checked);
  });
  dom.editNotifyCriticalEnabled.addEventListener("change", () => {
    dom.criticalNotificationCard.classList.toggle("is-disabled", !dom.editNotifyCriticalEnabled.checked);
  });
  dom.testWarningSoundBtn.addEventListener("click", () => {
    if (!playNotificationSound(dom.editNotifyWarningSound.value, dom.editNotifyWarningDuration.value)) {
      toast(text("audioFailed"));
    }
  });
  dom.testCriticalSoundBtn.addEventListener("click", () => {
    if (!playNotificationSound(dom.editNotifyCriticalSound.value, dom.editNotifyCriticalDuration.value)) {
      toast(text("audioFailed"));
    }
  });
  dom.testWarningAlarmBtn.addEventListener("click", () => void scheduleAlarmTest("warning"));
  dom.testCriticalAlarmBtn.addEventListener("click", () => void scheduleAlarmTest("critical"));

  dom.dockPad.querySelectorAll("[data-dock-side]").forEach((button) => {
    button.addEventListener("click", () => {
      state.dockSide = button.dataset.dockSide || "right";
      storageSet("timer_dock_side", state.dockSide);
      applyAppearanceSettings();
      openDockWindow();
    });
  });

  dom.eventPopupCloseBtn.addEventListener("click", () => {
    if (state.popupTimer) clearTimeout(state.popupTimer);
    if (dom.eventPopup.open) dom.eventPopup.close();
  });

  dom.imageLightboxCloseBtn.addEventListener("click", () => dom.imageLightbox.close());
  dom.imageLightboxZoomBtn.addEventListener("click", () => {
    if (state.imageLightboxZoomScale > 1.001) {
      setLightboxZoomScale(1, 50, 50);
      return;
    }
    setLightboxZoomScale(2, state.imageLightboxOriginX, state.imageLightboxOriginY);
  });
  dom.imageLightboxWallpaperBtn.addEventListener("click", () => void downloadCurrentLightboxImage());
  dom.imageLightboxFrame.addEventListener("pointermove", updateLightboxZoomPosition);
  dom.imageLightboxFrame.addEventListener("wheel", handleLightboxWheel, { passive: false });
  dom.imageLightboxFrame.addEventListener("pointerleave", () => {
    if (state.imageLightboxZoomScale <= 1.001) return;
    setLightboxZoomScale(state.imageLightboxZoomScale, 50, 50);
  });
  dom.imageLightbox.addEventListener("close", () => setLightboxZoomScale(1, 50, 50));
  dom.imprintBtn.addEventListener("click", () => dom.imprintDialog.showModal());
  dom.privacyBtn.addEventListener("click", () => dom.privacyDialog.showModal());
  dom.storagePrivacyBtn.addEventListener("click", () => dom.privacyDialog.showModal());
  dom.imprintCloseBtn.addEventListener("click", () => dom.imprintDialog.close());
  dom.privacyCloseBtn.addEventListener("click", () => dom.privacyDialog.close());
  dom.storageAcceptBtn.addEventListener("click", () => {
    try {
      localStorage.setItem(STORAGE_CONSENT_KEY, "accepted");
      storageDecision = "accepted";
      storageConsent = true;
      window.location.reload();
    } catch {
      storageDecision = "";
      storageConsent = false;
    }
  });
  dom.storageDeclineBtn.addEventListener("click", () => {
    try {
      localStorage.setItem(STORAGE_CONSENT_KEY, "declined");
      storageDecision = "declined";
    } catch {
      storageDecision = "declined";
    }
    storageConsent = false;
    if (dom.storageConsent.open) dom.storageConsent.close();
  });
  dom.storageResetBtn.addEventListener("click", async () => {
    if (!window.confirm(text("storageResetConfirm"))) return;
    try {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("timer_")) localStorage.removeItem(key);
      }
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter((key) => key.startsWith("linny-")).map((key) => caches.delete(key)));
      }
    } finally {
      storageDecision = "";
      storageConsent = false;
      window.location.reload();
    }
  });

  dom.saveTimerBtn.addEventListener("click", saveEditor);
  dom.duplicateTimerBtn.addEventListener("click", duplicateEditorTimer);
  dom.deleteTimerBtn.addEventListener("click", deleteEditorTimer);
  dom.resetTimerBtn.addEventListener("click", resetEditorTimer);
  dom.closeEditorBtn.addEventListener("click", closeEditor);
  dom.editorCloseIconBtn.addEventListener("click", closeEditor);
  dom.editorCollapseBtn.addEventListener("click", () => {
    state.editorCollapsed = !state.editorCollapsed;
    updateEditorPanelState();
  });
  dom.editorSideBtn.addEventListener("click", () => {
    state.editorSide = state.editorSide === "left" ? "right" : "left";
    storageSet("timer_editor_side", state.editorSide);
    updateEditorPanelState();
  });
  dom.setAnchorNowBtn.addEventListener("click", () => {
    if (!state.editingTimerId) return;
    dom.editAnchor.value = new Date().toISOString();
    saveEditor();
    toast(text("anchorNowSaved"));
  });

  dom.applyIntervalBtn.addEventListener("click", () => {
    const seconds = Math.floor(Number(dom.editIntervalSeconds.value));
    if (!Number.isFinite(seconds) || seconds < 1) return;
    dom.editRules.value = "@every " + seconds + "s";
    if (!dom.editAnchor.value) dom.editAnchor.value = new Date().toISOString();
    renderBuilderLines();
  });

  dom.builderAddTimeBtn.addEventListener("click", () => addBuilderTime("20:15"));

  dom.builderAddBtn.addEventListener("click", () => {
    const cronLines = cronFromBuilder();
    if (!cronLines.length) return;
    const lines = dom.editRules.value.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
    dom.editRules.value = Array.from(new Set([...lines, ...cronLines])).join("\n");
    renderBuilderLines();
    toast(text("builderAdded"));
  });

  dom.builderClearBtn.addEventListener("click", () => {
    dom.editRules.value = "";
    dom.editIntervalSeconds.value = "";
    renderBuilderLines();
  });

  dom.editRules.addEventListener("input", () => {
    dom.editIntervalSeconds.value = intervalSecondsFromRules(
      dom.editRules.value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    ) || "";
    renderBuilderLines();
  });

  window.addEventListener("languagechange", () => {
    if (!storageGet("timer_language")) {
      setLanguage((navigator.language || "").toLowerCase().startsWith("de") ? "bar" : "en", false);
    }
  });

  window.addEventListener("storage", (event) => {
    if (state.dockMode && event.key?.startsWith("timer_")) window.location.reload();
  });
  window.addEventListener("resize", syncDashboardHeight);
  dom.dashboardMain.addEventListener("pointerdown", (event) => {
    if (event.target.closest("#settingsPanel")) return;
    if (state.editingTimerId) closeEditor();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (state.editingTimerId) closeEditor();
  });
}

async function start() {
  let started = false;
  try {
    await loadConfig();
    bind();
    setupPwa();
    setupHeroEffects();
    setupAnalytics();
    renderBuilderDays();
    renderAll();
    void refreshVisitorCounter();
    if (state.localConfigError) {
      toast(state.localConfigError);
    }
    if (typeof ResizeObserver === "function" && dom.dashboardMain) {
      const dashboardObserver = new ResizeObserver(syncDashboardHeight);
      dashboardObserver.observe(dom.dashboardMain);
    }
    if (!state.dockMode && !storageDecision && typeof dom.storageConsent.showModal === "function") {
      dom.storageConsent.showModal();
    }
    started = true;
  } catch (error) {
    console.error("Application startup failed.", error);
    showStartupError(error);
  } finally {
    document.documentElement.classList.remove("booting");
  }
  if (!started) return;
  window.setInterval(() => {
    const artRotationBucket = Math.floor(Date.now() / 600000);
    if (artRotationBucket !== state.artRotationBucket) {
      state.artRotationBucket = artRotationBucket;
      state.cardRenderKey = "";
    }
    renderCurrentEvents();
    renderCards();
    updateClocks();
    if (!state.dockMode || !window.opener || window.opener.closed) {
      maybeNotify(filteredTimers().filter((timer) => state.visibleIds.has(timer.id)));
    }
  }, 1000);
}

start();
