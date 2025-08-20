/*v1.13 2025-08-20T15:55:01.486Z*/

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
    if (aug["mod-damage-type-note"]) {
      newSkill.effect["damage-type-note"] = aug["mod-damage-type-note"];
    }
    if (aug["mod-action-cost"]) {
      const baseCost = Number(newSkill.effect.actionCost) || 0;
      newSkill.effect.actionCost = baseCost + Number(aug["mod-action-cost"]);
    }
    if (aug["mod-target"]) {
      newSkill.effect.target = aug["mod-target"];
    }
    if (aug["mod-area"]) {
      newSkill.effect.area = aug["mod-area"];
    }
    if (aug["add-tags"]) {
      newSkill.tags = [
        ...new Set([...(newSkill.tags || []), ...aug["add-tags"]]),
      ];
    }
    if (aug["add-affliction"]) {
      const afflictionsHTML = aug["add-affliction"]
        .map(
          (a) => `<li>Add <span class="iconize">${a}</span> to the Target.</li>`
        )
        .join("");
      newSkill.effect.core += afflictionsHTML;
    }
  });

  return newSkill;
}

// ─── Controlla conflitti tra augmentations selezionate ───
function areAugmentationsCompatible(selectedAugmentations) {
  for (let i = 0; i < selectedAugmentations.length; i++) {
    for (let j = i + 1; j < selectedAugmentations.length; j++) {
      const augA = selectedAugmentations[i];
      const augB = selectedAugmentations[j];

      const excludesA = augA.excludes || [];
      const excludesB = augB.excludes || [];

      // conflitto se condividono almeno un valore in excludes
      const conflict =
        excludesA.some((ex) => excludesB.includes(ex)) ||
        excludesB.some((ex) => excludesA.includes(ex));

      if (conflict) return false;
    }
  }
  return true;
}

// ─── Render skill HTML ───
function renderSkill(skill) {
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
              ${skill.tags.map((t) => `<span class="tag">${t}</span>`).join("")}
            </div>
          </div>
          <div class="category"><span class="bold">${
            skill.category
          }</span> <span class="normal">Skill</span></div>
        </div>
      </header>

      <p class="desc">${skill.description}</p>

      <section class="grid">
        <div class="card" style="grid-column: span 5;">
          <h3 class="box-title">Effect</h3>
          <p class="effect-core"><ol>${replacePlaceholders(
            skill.effect.core,
            skill.effect
          )}</ol></p>
          <dl class="meta">
            <dt>Action Cost</dt><dd>${skill.effect.actionCost}</dd>
            <dt>Target • Area</dt><dd>${skill.effect.target} • ${
    skill.effect.area
  }</dd>
          </dl>
          ${
            skill.afflictions && skill.afflictions.length > 0
              ? `<hr class="rule" />
                 <h3 class="box-title">Afflictions</h3>
                 <ul>${skill.afflictions
                   .map((a) => `<li>${a}</li>`)
                   .join("")}</ul>`
              : ""
          }
        </div>

        <div class="card" style="grid-column: span 7;">
          <h3 class="box-title">Augmentation Slots <span class="muted">(${
            skill.augmentations.slots
          } total)</span><button id="removeAllAugments" type="button">
  <i class="fa-solid fa-trash"></i>
  <span class="sr-only">Remove All Augmentations</span>
</button></h3>
          
          <div class="slots">
            ${slotsArray
              .map(
                (_, i) =>
                  `<span class="slot" data-slot="${i}" title="Click to assign augmentation"></span>`
              )
              .join("")}
          </div>
          <p class="compat-note">Compatibility is determined by <em>requires</em> and <em>excludes</em>.</p>
          <hr class="rule" />
          <h3 class="box-title">Assigned Augmentations</h3>
          <ul id="assigned-${skill.id}" class="assigned-list">
            <li class="muted">No augmentations assigned.</li>
          </ul>
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
  container.innerHTML = list
    .map((aug) => `<li><strong>${aug.name}</strong> — ${aug.effect}</li>`)
    .join("");
}

// ─── Setup augmentation slots ───
function setupAugmentationSlots(
  skill,
  container,
  initializeAugmentationTooltips,
  preAssignedBySlot
) {
  const slots = container.querySelectorAll(`[data-slot]`);
  let assignedBySlot = Array.from(
    { length: slots.length },
    (_, i) => preAssignedBySlot?.[i] || null
  );

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
      delete slot.dataset.augId;
    }
  });

  // Filtra augmentations compatibili con la skill
  const baseSkill = skill;
  const compatibleAugmentations = augmentationsData.filter((aug) => {
    const meetsRequirements = aug.requires.every((req) =>
      baseSkill.tags.includes(req)
    );
    return meetsRequirements;
  });

  function rerenderSkill() {
    const modifiedSkill = applyAugmentationsToSkill(baseSkill, assignedBySlot);
    container.innerHTML = renderSkill(modifiedSkill);

    if (window.runIconizer) runIconizer(container);

    setupAugmentationSlots(
      baseSkill,
      container,
      initializeAugmentationTooltips,
      assignedBySlot
    );

    if (window.applyTagIcons) window.applyTagIcons();
    if (window.initializeTagTooltips) window.initializeTagTooltips(container);

    const assignedList = container.querySelector(`#assigned-${baseSkill.id}`);
    renderAssignedList(assignedList, assignedBySlot.filter(Boolean));
  }

  slots.forEach((slot) => {
    const slotIndex = Number(slot.dataset.slot);
    slot.addEventListener("click", (e) => {
      e.stopPropagation();
      document
        .querySelectorAll(".augmentation-picker")
        .forEach((p) => p.remove());

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

      const assignedFlat = assignedBySlot.filter(Boolean);

      compatibleAugmentations.forEach((aug) => {
        const isAssignedHere = assignedBySlot[slotIndex]?.id === aug.id;
        const isAlreadyTaken =
          assignedFlat.some((a) => a.id === aug.id) && !isAssignedHere;

        // Simuliamo come sarebbe la lista se scegliessi questa aug qui
        const simulatedAssigned = [...assignedBySlot];
        simulatedAssigned[slotIndex] = aug;

        // Verifica compatibilità con gli altri assegnati
        const wouldBeCompatible = areAugmentationsCompatible(
          simulatedAssigned.filter(Boolean)
        );

        const icon = document.createElement("img");
        icon.src = aug.icon || "/assets/icons/default.png";
        icon.alt = aug.name;
        icon.dataset.augId = aug.id;
        icon.title = aug.name;
        icon.style.width = "36px";
        icon.style.height = "36px";

        if (isAlreadyTaken || !wouldBeCompatible) {
          icon.classList.add("incompatible");

          let reason = "";
          if (isAlreadyTaken) {
            reason = "Already assigned to another slot";
          } else if (!wouldBeCompatible) {
            const assignedNames = assignedFlat.map((a) => a.name).join(", ");
            reason = `Incompatible with: ${assignedNames}`;
          }

          // memorizziamo la reason in dataset
          icon.dataset.warning = reason;
        } else {
          icon.style.cursor = "var(--cursor-pointer)";
          icon.addEventListener("click", (ev) => {
            ev.stopPropagation();
            if (typeof forceHideAugTooltip === "function")
              forceHideAugTooltip();

            const newAssigned = [...assignedBySlot];
            newAssigned[slotIndex] = isAssignedHere ? null : aug;

            if (areAugmentationsCompatible(newAssigned.filter(Boolean))) {
              assignedBySlot = newAssigned;
              picker.remove();
              rerenderSkill();
            }
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

  function renderAndSetup(skill, preAssignedBySlot) {
    container.innerHTML = renderSkill(skill);

    if (window.runIconizer) runIconizer(container);
    if (window.applyTagIcons) window.applyTagIcons();
    if (window.initializeTagTooltips) window.initializeTagTooltips(container);

    setupAugmentationSlots(
      skill,
      container,
      initializeAugmentationTooltips,
      preAssignedBySlot
    );
  }

  renderAndSetup(skills[0]);

  selector.addEventListener("change", (e) => {
    const skill = skills[e.target.value];
    renderAndSetup(skill);
  });

  container.addEventListener("click", (e) => {
    const btn = e.target.closest("#removeAllAugments");
    if (!btn) return;

    const skill = skills[selector.value];
    const emptySlots = Array(skill.augmentations.slots).fill(null);
    renderAndSetup(skill, emptySlots);
  });
}

init();
