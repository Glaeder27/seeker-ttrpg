/*v1.10 2025-08-19T20:22:17.390Z*/

let augmentationsData = [];

// ─── Load data ───
async function loadSkills() {
  const res = await fetch("/data/skills.json");
  const data = await res.json();
  return data.skills;
}

async function loadAugmentations() {
  const res = await fetch("/data/augmentations.json");
  const data = await res.json();
  augmentationsData = data.augmentations;
}

// ─── Applica gli effetti delle Aug alla skill di base ───
function applyAugmentationsToSkill(baseSkill, assignedBySlot) {
  const assigned = (assignedBySlot || []).filter(Boolean);
  const newSkill = JSON.parse(JSON.stringify(baseSkill));

  assigned.forEach((aug) => {
    if (aug["mod-damage-type"]) {
      newSkill.effect["damage-type"] = aug["mod-damage-type"];
    }

    if (aug["add-affliction"]) {
      newSkill.afflictions = [
        ...(newSkill.afflictions || []),
        ...aug["add-affliction"],
      ];
    }

    if (aug["add-tags"]) {
      newSkill.tags = [
        ...new Set([...(newSkill.tags || []), ...aug["add-tags"]]),
      ];
    }
  });

  return newSkill;
}

// ─── Render skill HTML ───
function renderSkill(skill) {
  const slotsArray = Array(skill.augmentations.slots).fill(null);

  return `
    <article class="skill" aria-labelledby="skill-${skill.id}">
      <header class="head">
        <img class="head-icon" src="${skill.icon || "/assets/icons/default.png"}" alt="${skill.name} icon" />
        <div class="title-wrap" style="flex:1; display:flex; justify-content:space-between; align-items:baseline;">
          <div class="id">
            <h1 id="skill-${skill.id}" class="name">${skill.name}</h1>
            <div class="tags">
              ${skill.tags.map((t) => `<span class="tag">${t}</span>`).join("")}
            </div>
          </div>
          <span class="category">${skill.category}</span>
        </div>
      </header>

      <p class="desc">${skill.description}</p>

      <section class="grid">
        <div class="card" style="grid-column: span 7;">
          <h3 class="box-title">Effect</h3>
          <p class="effect-core"><strong>${replacePlaceholders(skill.effect.core, skill.effect)}</strong></p>
          <dl class="meta">
            <dt>Action Cost</dt><dd>${skill.effect.actionCost}</dd>
            <dt>Target / Range</dt><dd>${skill.effect.targetRange}</dd>
          </dl>
          ${
            skill.afflictions && skill.afflictions.length > 0
              ? `<hr class="rule" />
                 <h3 class="box-title">Afflictions</h3>
                 <ul>${skill.afflictions.map((a) => `<li>${a}</li>`).join("")}</ul>`
              : ""
          }
        </div>

        <div class="card" style="grid-column: span 5;">
          <h3 class="box-title">Augmentation Slots <span class="muted">(${skill.augmentations.slots} total)</span></h3>
          <div class="slots">
            ${slotsArray.map((_, i) => `<span class="slot" data-slot="${i}" title="Click to assign augmentation"></span>`).join("")}
          </div>
          <p class="compat-note">Compatibility is determined by matching <em>Tags</em>.</p>
          <hr class="rule" />
          <h3 class="box-title">Assigned Augmentations</h3>
          <ul id="assigned-${skill.id}" class="assigned-list">
            <li class="muted">No augmentations assigned.</li>
          </ul>
        </div>

        <div class="card" style="grid-column: span 12;">
          <h3 class="box-title">Narrative Uses</h3>
          <ul>${skill.narrative.map((n) => `<li>${n}</li>`).join("")}</ul>
        </div>
      </section>
    </article>
  `;
}

// ─── Render assigned list ───
function renderAssignedList(container, list) {
  if (!container) return;
  if (!list || list.length === 0) {
    container.innerHTML = `<li class="muted">No augmentations assigned.</li>`;
    return;
  }
  container.innerHTML = list.map((aug) => `<li><strong>${aug.name}</strong> — ${aug.effect}</li>`).join("");
}

// ─── Setup augmentation slots ───
function setupAugmentationSlots(skill, container, initializeAugmentationTooltips, preAssignedBySlot) {
  const slots = container.querySelectorAll(`[data-slot]`);
  let assignedBySlot = Array.from({ length: slots.length }, (_, i) => preAssignedBySlot?.[i] || null);

  slots.forEach((slot, i) => {
    const aug = assignedBySlot[i];
    if (aug) {
      const img = document.createElement("img");
      img.src = aug.icon || "/assets/icons/default.png";
      img.alt = aug.name;
      img.title = aug.name;
      img.dataset.augId = aug.id;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "contain";
      slot.appendChild(img);

      slot.dataset.augId = aug.id;

      slot.classList.add("ok");
    } else {
    delete slot.dataset.augId; // rimuove se vuoto
    }
  });

  const baseSkill = skill;
  const compatibleAugmentations = augmentationsData.filter((aug) =>
    aug.tags.every((tag) => baseSkill.tags.includes(tag))
  );

  function rerenderSkill() {
    const modifiedSkill = applyAugmentationsToSkill(baseSkill, assignedBySlot);
    container.innerHTML = renderSkill(modifiedSkill);

    setupAugmentationSlots(baseSkill, container, initializeAugmentationTooltips, assignedBySlot);

    if (window.applyTagIcons) window.applyTagIcons();
    if (window.initializeTagTooltips) window.initializeTagTooltips();

    const assignedList = container.querySelector(`#assigned-${baseSkill.id}`);
    renderAssignedList(assignedList, assignedBySlot.filter(Boolean));
  }

  slots.forEach((slot) => {
    const slotIndex = Number(slot.dataset.slot);
    slot.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".augmentation-picker").forEach((p) => p.remove());

      const picker = document.createElement("div");
      picker.classList.add("augmentation-picker");
      picker.style.position = "absolute";
      picker.style.display = "grid";
      picker.style.gridTemplateColumns = `repeat(${Math.min(compatibleAugmentations.length, 4)}, 1fr)`;
      picker.style.gap = "6px";
      picker.style.background = "#1a1c22";
      picker.style.border = "1px solid #3a4150";
      picker.style.borderRadius = "8px";
      picker.style.padding = "3px";
      picker.style.zIndex = 1000;

      const rect = slot.getBoundingClientRect();
      picker.style.top = rect.top + window.scrollY + "px";
      picker.style.left = rect.left + window.scrollX + "px";

      const assignedFlat = assignedBySlot.filter(Boolean);

      compatibleAugmentations.forEach((aug) => {
        const isAssignedHere = assignedBySlot[slotIndex]?.id === aug.id;
        const isAssignedOther = assignedFlat.some((a) => a.id === aug.id) && !isAssignedHere;

        const icon = document.createElement("img");
        icon.src = aug.icon || "/assets/icons/default.png";
        icon.alt = aug.name;
        icon.dataset.augId = aug.id;
        icon.title = aug.name;
        icon.style.width = "36px";
        icon.style.height = "36px";
        icon.style.cursor = isAssignedOther ? "not-allowed" : "pointer";
        icon.style.opacity = isAssignedOther ? "0.4" : "1";

        if (!isAssignedOther) {
          icon.addEventListener("click", (ev) => {
            ev.stopPropagation();
            if (typeof forceHideAugTooltip === "function") forceHideAugTooltip();
            assignedBySlot[slotIndex] = isAssignedHere ? null : aug;
            picker.remove();
            rerenderSkill();
          });
        }

        picker.appendChild(icon);
      });

      slot.appendChild(picker);

      function onDocClick(evt) {
        if (!picker.contains(evt.target) && evt.target !== slot) {
          picker.remove();
          document.removeEventListener("click", onDocClick);
        }
      }
      document.addEventListener("click", onDocClick);
    });
  });

  initializeAugmentationTooltips(augmentationsData);
  const assignedList = container.querySelector(`#assigned-${skill.id}`);
  renderAssignedList(assignedList, assignedBySlot.filter(Boolean));
}

// ─── Init ───
async function init() {
  const skills = await loadSkills();
  await loadAugmentations();

  const selector = document.getElementById("skillSelector");
  const container = document.getElementById("skillContainer");

  skills.forEach((s, idx) => {
    const opt = document.createElement("option");
    opt.value = idx;
    opt.textContent = s.name;
    selector.appendChild(opt);
  });

  // Primo render della skill
  container.innerHTML = renderSkill(skills[0]);

  // Aggiorna tag subito dopo il render
  if (window.applyTagIcons) window.applyTagIcons();
  if (window.initializeTagTooltips) window.initializeTagTooltips();

  // Setup slot augmentation
  setupAugmentationSlots(skills[0], container, initializeAugmentationTooltips);

  selector.addEventListener("change", (e) => {
    const skill = skills[e.target.value];
    container.innerHTML = renderSkill(skill);

    if (window.applyTagIcons) window.applyTagIcons();
    if (window.initializeTagTooltips) window.initializeTagTooltips();

    setupAugmentationSlots(skill, container, initializeAugmentationTooltips);
  });
}

init();