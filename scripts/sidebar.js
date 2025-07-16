// Glossary search logic
const input = document.getElementById("glossary-search");
const result = document.getElementById("glossary-result");

let glossary = {};

fetch("https://glaeder27.github.io/seeker-ttrpg/data/glossary.json")
  .then((response) => {
    if (!response.ok) throw new Error("Network response was not OK");
    return response.json();
  })
  .then((data) => {
    glossary = data;
  })
  .catch((error) => {
    console.error("Error fetching glossary:", error);
    result.textContent = "Failed to load glossary data.";
  });

input.addEventListener("input", () => {
  const term = input.value.trim().toLowerCase();

  const key = Object.keys(glossary).find((k) => k.toLowerCase() === term);

  if (key) {
    const { definition, link } = glossary[key];
    result.innerHTML = `${definition} <a href="${link}" target="_top">[Read More]</a>`;
  } else if (term.length > 0) {
    result.textContent = "No entry found.";
  } else {
    result.textContent = "Type a term to see its definition.";
  }
});

// Archives carousel fade logic (runs once on load)
const archiveItems = document.querySelectorAll(
  ".archives-carousel-fade .archive-item"
);
let currentIndex = 0;
let archiveHovered = false;

const showItem = (index) => {
  archiveItems.forEach((item, i) => {
    item.classList.toggle("show", i === index);
  });
};

const archiveBlock = document.querySelector(".archives-carousel-fade");

archiveBlock.addEventListener("mouseenter", () => (archiveHovered = true));
archiveBlock.addEventListener("mouseleave", () => (archiveHovered = false));

setInterval(() => {
  if (!archiveHovered) {
    currentIndex = (currentIndex + 1) % archiveItems.length;
    showItem(currentIndex);
  }
}, 8000);

showItem(currentIndex);

// "From the Archives" Content

async function loadArchives() {
  try {
    const response = await fetch('https://glaeder27.github.io/seeker-ttrpg/data/archives.json'); // metti qui il path corretto
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    const container = document.querySelector('.archives-carousel-fade');
    container.innerHTML = ''; // svuota contenuto attuale

    data.archives.forEach(archive => {
      const item = document.createElement('div');
      item.classList.add('archive-item');

      const quote = document.createElement('p');
      quote.textContent = `"${archive.quote}"`;

      const author = document.createElement('div');
      author.classList.add('archive-author');
      author.textContent = `— ${archive.author}`;

      item.appendChild(quote);
      item.appendChild(author);
      container.appendChild(item);
    });

    if (container.firstChild) {
      container.firstChild.classList.add('show');
    }

  } catch (error) {
    console.error('Failed to load archives:', error);
  }
}

document.addEventListener('DOMContentLoaded', loadArchives);
