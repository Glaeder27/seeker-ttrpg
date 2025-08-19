/*v1.2 2025-08-19T14:37:16.514Z*/

let augmentationsData = [];

async function loadSkills() {
  console.log("init: loading skills...");
  const res = await fetch("/data/skills.json");
  const data = await res.json();
  console.log("init: loaded skills:", data.skills.length);
  return data.skills;
}

async function loadAugmentations() {
  console.log("init: loading augmentations...");
  const res = await fetch("/data/augmentations.json");
  const data = await res.json();
  augmentationsData = data.augmentations;
  console.log("init: loaded augmentations:", augmentationsData.length);
}

function renderSkill(skill) {
  console.log("renderSkill: rendering skill", skill.id, skill.name);
  const slotsArray = Array(skill.augmentations.slots).fill(null);

  return `
    <article class="skill" aria-labelledby="skill-${skill.id}">
      <header class="head">
        <img class="head-icon" src="${
          skill.icon || "/assets/icons/default.png"
        }" alt="${skill.name} icon" />
        <div class="title-wrap" style="flex:1; display:flex; justify-content:space-between; align-items:baseline;">
        <div class="id">
          <h1 id="skill-${skill.id}" class="name">${skill.name}</h1>
            <div class="tags">
                ${skill.tags
                  .map((t) => `<span class="tag">${t}</span>`)
                  .join("")}
            </div>
        </div>
          <span class="category">${skill.category}</span>
        </div>
      </header>

      <p class="desc">${skill.description}</p>

      <section class="grid">
        <!-- Base Effect -->
        <div class="card" style="grid-column: span 7;">
          <h3 class="box-title">Effect</h3>
          <p class="effect-core"><strong>${skill.effect.core}</strong></p>
          <dl class="meta">
            <dt>Action Cost</dt><dd>${skill.effect.actionCost}</dd>
            <dt>Target / Range</dt><dd>${skill.effect.targetRange}</dd>
          </dl>

          ${
            skill.afflictions && skill.afflictions.length > 0
              ? `
            <hr class="rule" />
            <h3 class="box-title">Afflictions</h3>
            <ul>${skill.afflictions.map((a) => `<li>${a}</li>`).join("")}</ul>
          `
              : ""
          }
        </div>

        <!-- Augmentations -->
        <div class="card" style="grid-column: span 5;">
          <h3 class="box-title">Augmentation Slots <span class="muted">(${
            skill.augmentations.slots
          } total)</span></h3>
          <div class="slots">
            ${slotsArray
              .map(
                (_, i) => `
              <span class="slot" data-slot="${i}" title="Click to assign augmentation"></span>
            `
              )
              .join("")}
          </div>
          <p class="compat-note">Compatibility is determined by matching <em>Tags</em>.</p>
          <hr class="rule" />
          <h3 class="box-title">Assigned Augmentations</h3>
          <ul id="assigned-${skill.id}" class="assigned-list">
            <li class="muted">No augmentations assigned.</li>
          </ul>
        </div>

        <!-- Narrative -->
        <div class="card" style="grid-column: span 12;">
          <h3 class="box-title">Narrative Uses</h3>
          <ul>
            ${skill.narrative.map((n) => `<li>${n}</li>`).join("")}
          </ul>
        </div>
      </section>
    </article>
    `;
}

function renderAssignedList(container, list) {
  console.log("renderAssignedList: called with list length", list.length, "container:", container);
  if (!container) {
    console.warn("renderAssignedList: container is NULL — cannot render assigned list");
    return;
  }
  if (list.length === 0) {
    container.innerHTML = `<li class="muted">No augmentations assigned.</li>`;
    console.log("renderAssignedList: wrote 'No augmentations assigned.'");
    return;
  }
  container.innerHTML = list
    .map((aug) => `<li><strong>${aug.name}</strong> — ${aug.effect}</li>`)
    .join("");
  console.log("renderAssignedList: rendered items:", list.map((a) => a.id));
}

function setupAugmentationSlots(skill, container) {
  console.log("setupAugmentationSlots: start for skill", skill.id);
  if (!container) {
    console.error("setupAugmentationSlots: container is null! aborting");
    return;
  }

  const slots = container.querySelectorAll(`[data-slot]`);
  console.log("setupAugmentationSlots: slots found:", slots.length);

  let assigned = [];

  const compatibleAugmentations = augmentationsData.filter((aug) =>
    aug.tags.every((tag) => skill.tags.includes(tag))
  );
  console.log(
    "setupAugmentationSlots: compatible augmentations count:",
    compatibleAugmentations.length,
    compatibleAugmentations.map((a) => a.id)
  );

  slots.forEach((slot) => {
    slot.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log("slot click event for slot:", slot.dataset.slot);

      // Rimuove eventuale picker precedente
      document.querySelectorAll(".augmentation-picker").forEach((p) => p.remove());

      const picker = document.createElement("div");
      picker.classList.add("augmentation-picker");
      picker.style.position = "absolute";
      picker.style.display = "grid";
      picker.style.gridTemplateColumns = `repeat(${Math.min(
        compatibleAugmentations.length,
        4
      )}, 1fr)`;
      picker.style.gap = "6px";
      picker.style.background = "#1a1c22";
      picker.style.border = "1px solid #3a4150";
      picker.style.borderRadius = "8px";
      picker.style.padding = "3px";
      picker.style.zIndex = 1000;

      const rect = slot.getBoundingClientRect();
      picker.style.top = rect.top + window.scrollY + "px";
      picker.style.left = rect.left + window.scrollX + "px";
      picker.style.visibility = "visible";

      compatibleAugmentations.forEach((aug) => {
        const icon = document.createElement("img");
        icon.src = aug.icon || "/assets/icons/default.png";
        icon.alt = aug.name;
        icon.dataset.augId = aug.id;
        icon.title = aug.name;
        icon.style.width = "36px";
        icon.style.height = "36px";
        icon.style.cursor = "pointer";
        icon.style.opacity = assigned.some((a) => a.id === aug.id) ? "0.4" : "1";

        icon.addEventListener("click", (e) => {
          e.stopPropagation();
          console.log("aug click:", aug.id, "assigned before:", assigned.map(a => a.id));

          const isAssigned = assigned.some((a) => a.id === aug.id);

          if (isAssigned) {
            assigned = assigned.filter((a) => a.id !== aug.id);
            slot.innerHTML = "";
            slot.classList.remove("ok");
            console.log("aug removed:", aug.id);
          } else {
            assigned.push(aug);
            slot.innerHTML = "";
            const selectedIcon = document.createElement("img");
            selectedIcon.src = aug.icon || "/assets/icons/default.png";
            selectedIcon.alt = aug.name;
            selectedIcon.title = aug.name;
            selectedIcon.dataset.augId = aug.id;
            selectedIcon.style.width = "100%";
            selectedIcon.style.height = "100%";
            selectedIcon.style.objectFit = "contain";
            slot.appendChild(selectedIcon);
            slot.classList.add("ok");
            console.log("aug added:", aug.id);
          }

          console.log("assigned after:", assigned.map(a => a.id));

          // Recupera UL aggiornato dal container corrente
          const assignedList = container.querySelector(`#assigned-${skill.id}`);
          console.log("assignedList (fresh):", assignedList, "isConnected:", assignedList?.isConnected);

          renderAssignedList(assignedList, assigned);

          // Rimuove il picker
          picker.remove();
        });

        picker.appendChild(icon);
      });

      slot.appendChild(picker);

      // Chiudi il picker se clicchi altrove
      function onDocClick(evt) {
        if (!picker.contains(evt.target) && evt.target !== slot) {
          picker.remove();
          document.removeEventListener("click", onDocClick);
        }
      }
      document.addEventListener("click", onDocClick);
    });
  });
}

async function init() {
  const skills = await loadSkills();
  await loadAugmentations();

  const selector = document.getElementById("skillSelector");
  const container = document.getElementById("skillContainer");

  // Popola il menù
  skills.forEach((s, idx) => {
    const opt = document.createElement("option");
    opt.value = idx;
    opt.textContent = s.name;
    selector.appendChild(opt);
  });

  // Render default
  container.innerHTML = renderSkill(skills[0]);
  setupAugmentationSlots(skills[0], container);

  // Cambio selezione
  selector.addEventListener("change", (e) => {
    const skill = skills[e.target.value];
    container.innerHTML = renderSkill(skill);
    setupAugmentationSlots(skill, container);
  });
}

init();
