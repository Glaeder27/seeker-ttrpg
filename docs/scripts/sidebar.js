// Glossary search logic with clickable suggestions
const input = document.getElementById("glossary-search");
const result = document.getElementById("glossary-result");

let glossary = {};

// Levenshtein distance function
function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => []);
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}

fetch("/data/glossary.json")
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

// Search function
function performSearch(term) {
  const key = Object.keys(glossary).find((k) => k.toLowerCase() === term.toLowerCase());

  if (key) {
    const { definition, link } = glossary[key];
    result.innerHTML = `${definition} <a href="${link}" target="_top">[Read More]</a>`;
  } else if (term.length > 0) {
    // "Did you mean..."
    let closestMatch = null;
    let smallestDistance = Infinity;

    for (const k of Object.keys(glossary)) {
      const distance = levenshtein(term, k.toLowerCase());
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestMatch = k;
      }
    }

    if (smallestDistance <= 3 && closestMatch) {
      result.innerHTML = `No result found. Did you mean: <a href="#" class="suggested-term">${closestMatch}</a>?`;

      // Clickable "Did you mean..."
      const suggestionLink = result.querySelector(".suggested-term");
      suggestionLink.addEventListener("click", (e) => {
        e.preventDefault();
        input.value = closestMatch;
        performSearch(closestMatch); // Repeat search
      });
    } else {
      result.textContent = "No result found.";
    }
  } else {
    result.textContent = "Type a term to see its definition.";
  }
}

// Listen input changes
input.addEventListener("input", () => {
  performSearch(input.value.trim());
});

// Archives carousel fade logic (runs once on load)
async function loadArchives() {
  try {
    const response = await fetch('/data/archives.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    const container = document.querySelector('.archives-carousel-fade');
    container.innerHTML = ''; // Clean current content

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

    initCarousel();

  } catch (error) {
    console.error('Failed to load archives:', error);
  }
}

function initCarousel() {
  const archiveItems = document.querySelectorAll(".archives-carousel-fade .archive-item");
  let currentIndex = 0;
  let archiveHovered = false;

  const showItem = (index) => {
    archiveItems.forEach((item, i) => {
      item.classList.toggle("show", i === index);
    });
  };

  const archiveBlock = document.querySelector(".archives-carousel-fade");

  archiveBlock.addEventListener("mouseenter", () => archiveHovered = true);
  archiveBlock.addEventListener("mouseleave", () => archiveHovered = false);

  setInterval(() => {
    if (!archiveHovered) {
      currentIndex = (currentIndex + 1) % archiveItems.length;
      showItem(currentIndex);
    }
  }, 8000);

  showItem(currentIndex);
}

document.addEventListener('DOMContentLoaded', loadArchives);

