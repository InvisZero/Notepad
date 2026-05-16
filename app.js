const note = document.getElementById("note");
const title = document.getElementById("title");
const fontSelector = document.getElementById("fontSelector");
const darkModeBtn = document.getElementById("darkModeBtn");
const stats = document.getElementById("stats");

const searchInput = document.getElementById("searchInput");
const replaceInput = document.getElementById("replaceInput");
const matchInfo = document.getElementById("matchInfo");

const saveBtn = document.getElementById("saveBtn");
const saveMenu = document.getElementById("saveMenu");

const findToggleBtn = document.getElementById("findToggleBtn");
const searchPanel = document.getElementById("searchPanel");
const closeSearchBtn = document.getElementById("closeSearchBtn");

const canvas = document.getElementById("gridCanvas");
const ctx = canvas.getContext("2d");

let matchPositions = [];
let currentMatchIndex = -1;

const encrypt = (text) => btoa(unescape(encodeURIComponent(text)));
const decrypt = (text) => decodeURIComponent(escape(atob(text)));

const savedTitle = localStorage.getItem("noteTitle");
const savedNote = localStorage.getItem("noteBody");
const savedFont = localStorage.getItem("noteFont");
const savedTheme = localStorage.getItem("darkMode");

/* Load */
if (savedTitle) title.value = decrypt(savedTitle);
if (savedNote) note.value = decrypt(savedNote);

if (savedFont) {
  const font = decrypt(savedFont);
  fontSelector.value = font;
  note.style.fontFamily = font;
}

if (savedTheme === "enabled") {
  document.body.classList.add("dark");
}

/* Stats */
function updateStats() {
  const text = note.value;

  const words = text.trim()
    ? text.trim().split(/\s+/).length
    : 0;

  const characters = text.replace(/\s/g, "").length;

  const lines = text.trim()
    ? text.split("\n").filter(line => line.trim().length > 0).length
    : 0;

  const abbreviations = [
    "Dr.", "Mr.", "Mrs.", "Ms.", "Prof.",
    "Sr.", "Jr.", "etc.", "e.g.", "i.e.",
    "vs.", "U.S.", "U.K."
  ];

  let cleanText = text;

  abbreviations.forEach(abbr => {
    const escaped = abbr.replace(/\./g, "\\.");
    cleanText = cleanText.replace(new RegExp(escaped, "g"), "");
  });

  const sentences = (cleanText.match(/[.!?]+/g) || []).length;

  stats.textContent =
    `Words: ${words} | Characters: ${characters} | Lines: ${lines} | Sentences: ${sentences}`;
}

/* Search */
function updateMatches(resetIndex = true) {
  const searchTerm = searchInput.value;
  const text = note.value;

  matchPositions = [];

  if (resetIndex) currentMatchIndex = -1;

  if (!searchTerm) {
    matchInfo.textContent = "Matches: 0";
    return;
  }

  let index = 0;

  while ((index = text.indexOf(searchTerm, index)) !== -1) {
    matchPositions.push(index);
    index += searchTerm.length;
  }

  matchInfo.textContent =
    matchPositions.length === 0
      ? "Matches: 0"
      : currentMatchIndex >= 0
      ? `Match ${currentMatchIndex + 1} of ${matchPositions.length}`
      : `Matches: ${matchPositions.length}`;
}

function jumpToMatch(index) {
  if (!matchPositions.length) return;

  currentMatchIndex = index;

  const start = matchPositions[index];
  const end = start + searchInput.value.length;

  note.focus();
  note.setSelectionRange(start, end);

  matchInfo.textContent = `Match ${index + 1} of ${matchPositions.length}`;
}

function findNext() {
  updateMatches(false);
  if (!matchPositions.length) return;

  currentMatchIndex =
    currentMatchIndex >= matchPositions.length - 1
      ? 0
      : currentMatchIndex + 1;

  jumpToMatch(currentMatchIndex);
}

function findPrevious() {
  updateMatches(false);
  if (!matchPositions.length) return;

  currentMatchIndex =
    currentMatchIndex <= 0
      ? matchPositions.length - 1
      : currentMatchIndex - 1;

  jumpToMatch(currentMatchIndex);
}

function replaceCurrent() {
  updateMatches(false);
  if (!matchPositions.length) return;

  if (currentMatchIndex === -1) currentMatchIndex = 0;

  const searchTerm = searchInput.value;
  const replaceTerm = replaceInput.value;
  const start = matchPositions[currentMatchIndex];

  note.value =
    note.value.substring(0, start) +
    replaceTerm +
    note.value.substring(start + searchTerm.length);

  localStorage.setItem("noteBody", encrypt(note.value));

  updateStats();
  updateMatches();
}

function replaceAll() {
  const searchTerm = searchInput.value;
  const replaceTerm = replaceInput.value;

  if (!searchTerm) return;

  note.value = note.value.split(searchTerm).join(replaceTerm);

  localStorage.setItem("noteBody", encrypt(note.value));

  updateStats();
  updateMatches();
}

/* Save */
function downloadPDF() {
  const pdfContent = document.createElement("div");
  pdfContent.style.fontFamily = fontSelector.value;
  pdfContent.innerHTML = `
    <h2>${title.value || "Untitled Note"}</h2>
    <p>${note.value.replace(/\n/g, "<br>")}</p>
  `;
  html2pdf().from(pdfContent).save(`${title.value || "note"}.pdf`);
}

function downloadTXT() {
  const blob = new Blob(
    [`${title.value}\n\n${note.value}`],
    { type: "text/plain" }
  );

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${title.value || "note"}.txt`;
  link.click();
}

function downloadHTML() {
  const content = `
    <html>
      <body>
        <h1>${title.value}</h1>
        <p>${note.value.replace(/\n/g, "<br>")}</p>
      </body>
    </html>
  `;

  const blob = new Blob([content], { type: "text/html" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${title.value || "note"}.html`;
  link.click();
}

/* Undo/Redo */
function undoEdit() {
  document.execCommand("undo");
}

function redoEdit() {
  document.execCommand("redo");
}

/* Dark */
function toggleDarkMode() {
  document.body.classList.toggle("dark");

  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark")
      ? "enabled"
      : "disabled"
  );
}

/* UI */
saveBtn.addEventListener("click", () => {
  saveMenu.classList.toggle("show");
});

findToggleBtn.addEventListener("click", () => {
  searchPanel.classList.toggle("hidden");
});

closeSearchBtn.addEventListener("click", () => {
  searchPanel.classList.add("hidden");
});

document.addEventListener("click", (e) => {
  if (!saveBtn.contains(e.target) && !saveMenu.contains(e.target)) {
    saveMenu.classList.remove("show");
  }
});

/* Autosave */
title.addEventListener("input", () => {
  localStorage.setItem("noteTitle", encrypt(title.value));
});

note.addEventListener("input", () => {
  localStorage.setItem("noteBody", encrypt(note.value));
  updateStats();
  updateMatches(false);
});

fontSelector.addEventListener("change", () => {
  note.style.fontFamily = fontSelector.value;
  localStorage.setItem("noteFont", encrypt(fontSelector.value));
});

searchInput.addEventListener("input", updateMatches);

/* Magnetic Grid */
let points = [];
let mouse = { x: -9999, y: -9999 };

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  createGrid();
}

function createGrid() {
  points = [];
  const spacing = 40;

  for (let y = 0; y <= canvas.height; y += spacing) {
    for (let x = 0; x <= canvas.width; x += spacing) {
      points.push({
        ox: x,
        oy: y,
        x: x,
        y: y
      });
    }
  }
}

function animateGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const dark = document.body.classList.contains("dark");

  ctx.strokeStyle = dark
    ? "rgba(255,255,255,0.05)"
    : "rgba(0,0,0,0.05)";

  ctx.lineWidth = 1;

  const spacing = 40;
  const cols = Math.floor(canvas.width / spacing) + 1;

  // Update point positions
  points.forEach(point => {
    const dx = mouse.x - point.ox;
    const dy = mouse.y - point.oy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    let targetX = point.ox;
    let targetY = point.oy;

    if (distance < 150) {
      const force = (150 - distance) / 150;
      targetX = point.ox + dx * force * 5;
      targetY = point.oy + dy * force * 5;
    }

    point.x += (targetX - point.x) * 0.12;
    point.y += (targetY - point.y) * 0.12;
  });

  // Draw grid
  for (let i = 0; i < points.length; i++) {
    const point = points[i];

    if ((i + 1) % cols !== 0) {
      const right = points[i + 1];
      if (right) {
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(right.x, right.y);
        ctx.stroke();
      }
    }

    const below = points[i + cols];
    if (below) {
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(below.x, below.y);
      ctx.stroke();
    }
  }

  requestAnimationFrame(animateGrid);
}

window.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener("resize", resizeCanvas);

/* Init */
updateStats();
updateMatches();
resizeCanvas();
animateGrid();