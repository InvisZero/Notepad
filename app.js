const note = document.getElementById("note");
const title = document.getElementById("title");
const fontSelector = document.getElementById("fontSelector");
const darkModeToggle = document.getElementById("darkModeToggle");

const encrypt = (text) => btoa(unescape(encodeURIComponent(text)));
const decrypt = (text) => decodeURIComponent(escape(atob(text)));

// Load saved data
const savedTitle = localStorage.getItem("noteTitle");
const savedNote = localStorage.getItem("noteBody");
const savedFont = localStorage.getItem("noteFont");
const savedTheme = localStorage.getItem("darkMode");

if (savedTitle) title.value = decrypt(savedTitle);
if (savedNote) note.value = decrypt(savedNote);

if (savedFont) {
  const font = decrypt(savedFont);
  fontSelector.value = font;
  note.style.fontFamily = font;
}

if (savedTheme === "enabled") {
  document.body.classList.add("dark");
  darkModeToggle.checked = true;
}

// Autosave
title.addEventListener("input", () => {
  localStorage.setItem("noteTitle", encrypt(title.value));
});

note.addEventListener("input", () => {
  localStorage.setItem("noteBody", encrypt(note.value));
});

fontSelector.addEventListener("change", () => {
  const font = fontSelector.value;
  note.style.fontFamily = font;
  localStorage.setItem("noteFont", encrypt(font));
});

// PDF Download
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

// Dark Mode
function toggleDarkMode() {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");

  if (isDark) {
    localStorage.setItem("darkMode", "enabled");
    darkModeToggle.checked = true;
  } else {
    localStorage.setItem("darkMode", "disabled");
    darkModeToggle.checked = false;
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
  }
}