// Glossary search logic
    const input = document.getElementById('glossary-search');
    const result = document.getElementById('glossary-result');

    let glossary = {};

    fetch('https://glaeder27.github.io/seeker-ttrpg/data/glossary.json')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not OK');
        return response.json();
      })
      .then(data => {
        glossary = data;
      })
      .catch(error => {
        console.error('Error fetching glossary:', error);
        result.textContent = 'Failed to load glossary data.';
      });

    input.addEventListener('input', () => {
      const term = input.value.trim();
      if (glossary[term]) {
        const { definition, link } = glossary[term];
        result.innerHTML = `${definition} <a href="${link}" target="_top">[Read More]</a>`;
      } else if (term.length > 0) {
        result.textContent = 'No entry found.';
      } else {
        result.textContent = 'Type a term to see its definition.';
      }
    });

    // Archives carousel fade logic (runs once on load)
    const archiveItems = document.querySelectorAll('.archives-carousel-fade .archive-item');
    let currentIndex = 0;
    let archiveHovered = false;

    const showItem = (index) => {
      archiveItems.forEach((item, i) => {
        item.classList.toggle('show', i === index);
      });
    };

    const archiveBlock = document.querySelector('.archives-carousel-fade');

    archiveBlock.addEventListener('mouseenter', () => archiveHovered = true);
    archiveBlock.addEventListener('mouseleave', () => archiveHovered = false);

    setInterval(() => {
      if (!archiveHovered) {
        currentIndex = (currentIndex + 1) % archiveItems.length;
        showItem(currentIndex);
      }
    }, 8000);

    showItem(currentIndex);