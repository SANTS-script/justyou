/* ============================================================
   AMONG THE STARS — interaction script
   ============================================================ */

/* ---------------------------------------------------------
   0. CONTENT — edit these freely
   --------------------------------------------------------- */
const GALAXIES = [
  {
    id: 1,
    name: "Galaxy of Gratitude",
    tag: "galaxy 01 · thank you",
    hue: [265, 320],           // violet -> pink
    coreColor: "#ffe9c7",
    audio: "audio-opm1",
    songLabel: "opm1.mp3 — now playing",
    message:
      "Thank you for meeting me exactly when I needed someone like you. " +
      "I don't think you realize how many ordinary days you quietly turned " +
      "into good ones, just by being yourself. This whole galaxy exists " +
      "because 'thank you' felt too small to hold everything I mean."
  },
  {
    id: 2,
    name: "Galaxy of Brighter Days",
    tag: "galaxy 02 · you make my days better",
    hue: [190, 260],           // cyan -> violet
    coreColor: "#d7fbff",
    audio: "audio-opm2",
    songLabel: "opm2.mp3 — now playing",
    message:
      "Some days feel heavy before they even start. And somehow, a single " +
      "message from you  even a small one is enough to shift the whole " +
      "weight of it. You have this quiet way of making things feel lighter, " +
      "brighter, more okay. I notice it every time, even when I don't say it."
  },
  {
    id: 3,
    name: "Galaxy of How I Feel",
    tag: "galaxy 03 · what you mean to me",
    hue: [320, 20],            // pink -> gold
    coreColor: "#fff3c4",
    audio: "audio-opm3",
    songLabel: "opm3.mp3 — now playing",
    message:
      "This is the galaxy I was most nervous to build. Because here's the " +
      "truth you matter to me, more than I usually let on and I like you. I built you an " +
      "entire universe just to find a gentle way of saying it I'm really, " +
      "really glad you exist, and I'm grateful every single time our paths cross."
  }
];

/* ---------------------------------------------------------
   1. STAGE / NAVIGATION STATE
   --------------------------------------------------------- */
const stages = ["stage-hero", "stage-letter", "stage-galaxies", "stage-finale"];
let history = ["stage-hero"];
let currentGalaxyIndex = 0;      // which galaxy is currently shown (0..2)
let unlockedGalaxies = 0;        // how many have been visited/continued past
let playingAudioId = null;

const $ = (id) => document.getElementById(id);
const backBtn = $("backBtn");

function showStage(id, { push = true } = {}) {
  stages.forEach(s => $(s).classList.toggle("active", s === id));
  if (push) history.push(id);
  backBtn.classList.toggle("show", history.length > 1);
}

function goBack() {
  if (history.length <= 1) return;
  history.pop();
  const prev = history[history.length - 1];

  // Special-case: stepping back out of the galaxy stage rewinds one galaxy
  if (prev === "stage-galaxies" && stages.includes($(document.activeElement?.id))) {
    // no-op, handled below
  }
  stopAllAudio();
  stages.forEach(s => $(s).classList.toggle("active", s === prev));
  backBtn.classList.toggle("show", history.length > 1);
}

backBtn.addEventListener("click", () => {
  // If we're inside the galaxy stage and not on the first galaxy, step back a galaxy first
  if ($("stage-galaxies").classList.contains("active") && currentGalaxyIndex > 0) {
    stopAllAudio();
    currentGalaxyIndex--;
    renderGalaxyStage(currentGalaxyIndex, { warp: true, direction: "back" });
    return;
  }
  goBack();
});

/* ---------------------------------------------------------
   2. BACKGROUND STARFIELD (ambient, always running)
   --------------------------------------------------------- */
const bgCanvas = $("bg-stars");
const bgCtx = bgCanvas.getContext("2d");
let bgStars = [];

function resizeBg() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
  bgStars = [];
  const count = Math.floor((bgCanvas.width * bgCanvas.height) / 3200);
  for (let i = 0; i < count; i++) {
    bgStars.push({
      x: Math.random() * bgCanvas.width,
      y: Math.random() * bgCanvas.height,
      r: Math.random() * 1.3 + 0.2,
      tw: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.015 + 0.005
    });
  }
}
window.addEventListener("resize", resizeBg);
resizeBg();

function drawBg() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  for (const s of bgStars) {
    s.tw += s.speed;
    const alpha = 0.4 + Math.sin(s.tw) * 0.4;
    bgCtx.beginPath();
    bgCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    bgCtx.fillStyle = `rgba(255,255,255,${Math.max(0, alpha)})`;
    bgCtx.fill();
  }
  requestAnimationFrame(drawBg);
}
drawBg();

/* ---------------------------------------------------------
   3. WARP / SPACE-TRAVEL TRANSITION
   --------------------------------------------------------- */
const warpCanvas = $("warp-canvas");
const warpCtx = warpCanvas.getContext("2d");
const warpLabel = $("warp-label");
let warpStars = [];
let warpRAF = null;

function resizeWarp() {
  warpCanvas.width = window.innerWidth;
  warpCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeWarp);
resizeWarp();

function initWarpStars() {
  warpStars = [];
  const cx = warpCanvas.width / 2, cy = warpCanvas.height / 2;
  for (let i = 0; i < 420; i++) {
    warpStars.push({
      x: (Math.random() - 0.5) * warpCanvas.width,
      y: (Math.random() - 0.5) * warpCanvas.height,
      z: Math.random() * warpCanvas.width
    });
  }
}

function stepWarp() {
  const cx = warpCanvas.width / 2, cy = warpCanvas.height / 2;
  warpCtx.fillStyle = "rgba(2,1,10,0.35)";
  warpCtx.fillRect(0, 0, warpCanvas.width, warpCanvas.height);

  for (const s of warpStars) {
    const prevZ = s.z;
    s.z -= 22;
    if (s.z <= 1) {
      s.x = (Math.random() - 0.5) * warpCanvas.width;
      s.y = (Math.random() - 0.5) * warpCanvas.height;
      s.z = warpCanvas.width;
    }
    const k = 128 / s.z;
    const x = s.x * k + cx;
    const y = s.y * k + cy;
    const pk = 128 / prevZ;
    const px = s.x * pk + cx;
    const py = s.y * pk + cy;

    const size = (1 - s.z / warpCanvas.width) * 3;
    warpCtx.strokeStyle = `rgba(180,190,255,${1 - s.z / warpCanvas.width})`;
    warpCtx.lineWidth = size;
    warpCtx.beginPath();
    warpCtx.moveTo(px, py);
    warpCtx.lineTo(x, y);
    warpCtx.stroke();
  }
  warpRAF = requestAnimationFrame(stepWarp);
}

/**
 * Plays a warp transition, then calls onArrive(), then fades out.
 */
function playWarp(labelText, onArrive, duration = 2200) {
  resizeWarp();
  initWarpStars();
  warpCanvas.classList.add("active");
  warpLabel.textContent = labelText || "traveling…";
  requestAnimationFrame(() => warpLabel.classList.add("show"));
  warpCtx.fillStyle = "#02010a";
  warpCtx.fillRect(0, 0, warpCanvas.width, warpCanvas.height);
  stepWarp();

  setTimeout(() => {
    if (onArrive) onArrive();
  }, duration * 0.55);

  setTimeout(() => {
    warpLabel.classList.remove("show");
    warpCanvas.classList.remove("active");
    cancelAnimationFrame(warpRAF);
  }, duration);
}

/* ---------------------------------------------------------
   4. STAGE 1 -> STAGE 2
   --------------------------------------------------------- */
$("playBtn").addEventListener("click", () => {
  playWarp("entering the introduction…", () => {
    showStage("stage-letter");
  }, 1800);
});

/* ---------------------------------------------------------
   5. STAGE 2 -> STAGE 3 (galaxies)
   --------------------------------------------------------- */
$("toGalaxiesBtn").addEventListener("click", () => {
  playWarp("traveling across the void…", () => {
    currentGalaxyIndex = 0;
    showStage("stage-galaxies");
    renderGalaxyStage(currentGalaxyIndex, { warp: false });
  }, 2400);
});

/* ---------------------------------------------------------
   6. GALAXY RENDERING (realistic particle spiral galaxies)
   --------------------------------------------------------- */
const gCanvas = $("galaxy-canvas");
const gCtx = gCanvas.getContext("2d");
let galaxyParticles = [];
let galaxyRAF = null;
let galaxyRotation = 0;
let galaxyEntranceProgress = 0; // 0 -> 1 fade/scale in
let hoveredGalaxy = false;

function resizeGalaxyCanvas() {
  gCanvas.width = gCanvas.clientWidth * devicePixelRatio;
  gCanvas.height = gCanvas.clientHeight * devicePixelRatio;
}
window.addEventListener("resize", () => {
  resizeGalaxyCanvas();
});

function buildGalaxyParticles(hueRange) {
  const particles = [];
  const arms = 4;
  const total = 5200;
  for (let i = 0; i < total; i++) {
    const t = Math.random();                       // 0..1 along radius
    const arm = i % arms;
    const armAngle = (arm / arms) * Math.PI * 2;
    const spiralTightness = 3.2;
    const angle = armAngle + t * spiralTightness * Math.PI + (Math.random() - 0.5) * 0.6;
    const radius = Math.pow(t, 0.65) * 1.0;         // normalized 0..1
    const scatter = (Math.random() - 0.5) * 0.06 * (1 - t * 0.4);

    const hue = hueRange[0] + (hueRange[1] - hueRange[0]) * t + (Math.random() - 0.5) * 12;
    const sat = 70 + Math.random() * 20;
    const light = 55 + (1 - t) * 30 + Math.random() * 10;
    const alpha = 0.35 + Math.random() * 0.5;
    const size = (1 - t) * 2.1 + 0.3 + Math.random() * 0.6;

    particles.push({
      angle, radius: radius + scatter,
      hue, sat, light, alpha, size,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.4 + Math.random() * 0.6
    });
  }
  return particles;
}

function renderGalaxyStage(index, { warp = true, direction = "forward" } = {}) {
  const data = GALAXIES[index];

  function doRender() {
    resizeGalaxyCanvas();
    galaxyParticles = buildGalaxyParticles(data.hue);
    galaxyEntranceProgress = 0;
    galaxyRotation = 0;
    updateProgressDots(index);
    $("galaxyHint").textContent = "click the galaxy to enter it";
    $("galaxyLabel").textContent = data.name;
    $("galaxyLabel").classList.add("show");
    $("finaleBtn").classList.add("hidden");
    if (!galaxyRAF) animateGalaxy();
  }

  if (warp) {
    playWarp(
      direction === "back" ? "returning to a previous galaxy…" : `traveling to ${data.name}…`,
      doRender,
      2200
    );
  } else {
    doRender();
  }
}

function updateProgressDots(index) {
  document.querySelectorAll(".dot").forEach((dot, i) => {
    dot.classList.toggle("current", i === index);
    dot.classList.toggle("done", i < index);
  });
}

function animateGalaxy() {
  const w = gCanvas.width, h = gCanvas.height;
  gCtx.clearRect(0, 0, w, h);

  // deep space vignette background
  const grad = gCtx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)/1.3);
  grad.addColorStop(0, "rgba(20,10,40,0.25)");
  grad.addColorStop(1, "rgba(2,1,10,0)");
  gCtx.fillStyle = grad;
  gCtx.fillRect(0, 0, w, h);

  if (galaxyEntranceProgress < 1) galaxyEntranceProgress += 0.012;
  galaxyRotation += 0.0012;

  const cx = w / 2, cy = h / 2;
  const maxR = Math.min(w, h) * 0.42 * easeOutCubic(galaxyEntranceProgress);

  gCtx.save();
  gCtx.translate(cx, cy);
  gCtx.globalCompositeOperation = "lighter";

  for (const p of galaxyParticles) {
    const wob = Math.sin(performance.now() * 0.0006 * p.wobbleSpeed + p.wobble) * 2;
    const ang = p.angle + galaxyRotation;
    const r = p.radius * maxR;
    const x = Math.cos(ang) * r + wob;
    const y = Math.sin(ang) * r * 0.55 + wob; // flatten for a disc/perspective look

    gCtx.beginPath();
    gCtx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${p.alpha * easeOutCubic(galaxyEntranceProgress)})`;
    gCtx.arc(x, y, p.size * devicePixelRatio, 0, Math.PI * 2);
    gCtx.fill();
  }

  // glowing core
  const coreR = 26 * devicePixelRatio * easeOutCubic(galaxyEntranceProgress) * (hoveredGalaxy ? 1.15 : 1);
  const coreGrad = gCtx.createRadialGradient(0, 0, 0, 0, 0, coreR * 4);
  coreGrad.addColorStop(0, "#ffffff");
  coreGrad.addColorStop(0.25, GALAXIES[currentGalaxyIndex].coreColor);
  coreGrad.addColorStop(1, "rgba(255,255,255,0)");
  gCtx.beginPath();
  gCtx.fillStyle = coreGrad;
  gCtx.arc(0, 0, coreR * 4, 0, Math.PI * 2);
  gCtx.fill();

  gCtx.restore();
  galaxyRAF = requestAnimationFrame(animateGalaxy);
}

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

/* click / hover detection on the current galaxy's core */
function galaxyHit(clientX, clientY) {
  const rect = gCanvas.getBoundingClientRect();
  const x = (clientX - rect.left) * devicePixelRatio - gCanvas.width / 2;
  const y = (clientY - rect.top) * devicePixelRatio - gCanvas.height / 2;
  const dist = Math.sqrt(x*x + y*y);
  return dist < Math.min(gCanvas.width, gCanvas.height) * 0.30;
}

gCanvas.addEventListener("mousemove", (e) => {
  hoveredGalaxy = galaxyHit(e.clientX, e.clientY);
  gCanvas.style.cursor = hoveredGalaxy ? "pointer" : "default";
});
gCanvas.addEventListener("click", (e) => {
  if (galaxyHit(e.clientX, e.clientY)) openGalaxyMessage(currentGalaxyIndex);
});
gCanvas.addEventListener("touchend", (e) => {
  const t = e.changedTouches[0];
  if (galaxyHit(t.clientX, t.clientY)) openGalaxyMessage(currentGalaxyIndex);
});

/* ---------------------------------------------------------
   7. MESSAGE MODAL + AUDIO
   --------------------------------------------------------- */
const modal = $("messageModal");

function openGalaxyMessage(index) {
  const data = GALAXIES[index];
  $("modalTag").textContent = data.tag;
  $("modalTitle").textContent = data.name;
  $("modalText").textContent = data.message;
  $("modalSong").textContent = data.songLabel;
  modal.classList.add("show");
  playGalaxyAudio(data.audio);
  $("galaxyHint").textContent = "reading a message from this galaxy…";
}

function playGalaxyAudio(audioId) {
  stopAllAudio();
  const el = $(audioId);
  el.currentTime = 0;
  el.loop = true;
  el.play().catch(() => { /* autoplay might be blocked until user gesture; click already provided one */ });
  playingAudioId = audioId;
}

function stopAllAudio() {
  ["audio-opm1", "audio-opm2", "audio-opm3"].forEach(id => {
    const el = $(id);
    el.pause();
    el.currentTime = 0;
  });
  playingAudioId = null;
}

$("closeModal").addEventListener("click", () => {
  modal.classList.remove("show");
  stopAllAudio();
  $("galaxyHint").textContent = "click the galaxy to enter it";
});

$("continueJourneyBtn").addEventListener("click", () => {
  modal.classList.remove("show");
  stopAllAudio();

  if (currentGalaxyIndex < GALAXIES.length - 1) {
    currentGalaxyIndex++;
    renderGalaxyStage(currentGalaxyIndex, { warp: true, direction: "forward" });
  } else {
    // last galaxy done — reveal finale button instead of auto-jumping
    $("galaxyHint").textContent = "you've opened every galaxy";
    $("finaleBtn").classList.remove("hidden");
  }
});

$("finaleBtn").addEventListener("click", () => {
  playWarp("returning home…", () => {
    showStage("stage-finale");
  }, 2000);
});

/* ---------------------------------------------------------
   8. FINALE -> REPLAY
   --------------------------------------------------------- */
$("replayBtn").addEventListener("click", () => {
  history = ["stage-hero"];
  currentGalaxyIndex = 0;
  backBtn.classList.remove("show");
  stopAllAudio();
  showStage("stage-hero", { push: false });
});
