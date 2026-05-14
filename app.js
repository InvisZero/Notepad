const note = document.getElementById("note");
const title = document.getElementById("title");
const fontSelector = document.getElementById("fontSelector");
const darkModeToggle = document.getElementById("darkModeToggle");
const stats = document.getElementById("stats");

const encrypt = (text) => btoa(unescape(encodeURIComponent(text)));
const decrypt = (text) => decodeURIComponent(escape(atob(text)));

const savedTitle = localStorage.getItem("noteTitle");
const savedNote = localStorage.getItem("noteBody");
const savedFont = localStorage.getItem("noteFont");
const savedTheme = localStorage.getItem("darkMode");

// Load saved data
if (savedTitle) {
  title.value = decrypt(savedTitle);
}

if (savedNote) {
  note.value = decrypt(savedNote);
}

if (savedFont) {
  const font = decrypt(savedFont);
  fontSelector.value = font;
  note.style.fontFamily = font;
}

if (savedTheme === "enabled") {
  document.body.classList.add("dark");
  darkModeToggle.checked = true;
}

// Stats
function updateStats() {
  const text = note.value || "";

  const words = text.trim().length > 0
    ? text.trim().split(/\s+/).length
    : 0;

  const characters = text.replace(/\s/g, "").length;

  const lines = text.trim().length > 0
    ? text.split("\n").filter(line => line.trim().length > 0).length
    : 0;

  const abbreviations = [
    "Dr.", "Mr.", "Mrs.", "Ms.", "Prof.",
    "Sr.", "Jr.", "etc.", "e.g.", "i.e.",
    "vs.", "U.S.", "U.K."
  ];

  let cleanText = text;

  for (let i = 0; i < abbreviations.length; i++) {
    const escaped = abbreviations[i].replace(/\./g, "\\.");
    cleanText = cleanText.replace(new RegExp(escaped, "g"), "");
  }

  const sentences = (cleanText.match(/[.!?]+/g) || []).length;

  stats.textContent =
    `Words: ${words} | Characters: ${characters} | Lines: ${lines} | Sentences: ${sentences}`;
}

updateStats();


// Autosave
title.addEventListener("input", () => {
  localStorage.setItem("noteTitle", encrypt(title.value));
});

note.addEventListener("input", () => {
  localStorage.setItem("noteBody", encrypt(note.value));
  updateStats();
});

fontSelector.addEventListener("change", () => {
  const font = fontSelector.value;
  note.style.fontFamily = font;
  localStorage.setItem("noteFont", encrypt(font));
  updateStats();
});

// PDF
function downloadPDF() {
  const pdfContent = document.createElement("div");
  pdfContent.style.fontFamily = fontSelector.value;

  pdfContent.innerHTML = `
    <h2>${title.value || "Untitled Note"}</h2>
    <p>${note.value.replace(/\n/g, "<br>")}</p>
  `;

  html2pdf()
    .set({
      margin: 10,
      filename: `${title.value || "note"}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait"
      }
    })
    .from(pdfContent)
    .save();
}

// Dark mode
function toggleDarkMode() {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("darkMode", "enabled");
  } else {
    localStorage.setItem("darkMode", "disabled");
  }
}

// Clear
function clearAll() {
  if (confirm("Are you sure you want to clear all content?")) {
    title.value = "";
    note.value = "";
    fontSelector.value = "Arial, sans-serif";
    note.style.fontFamily = "Arial, sans-serif";

    localStorage.removeItem("noteTitle");
    localStorage.removeItem("noteBody");
    localStorage.removeItem("noteFont");

    updateStats();
  }
}
//for refresh
