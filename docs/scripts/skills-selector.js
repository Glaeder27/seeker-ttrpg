/*v1.16 2025-08-20T20:51:58.350Z*/

let augmentationsData = [];
let tagsData = [];

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

async function loadTags() {
  const res = await fetch("/data/tags.json");
  const data = await res.json();
  tagsData = data.tags;
}

// ─── Applica effetti delle augmentations alla skill ───
function applyAugmentationsToSkill(baseSkill, assignedBySlot) {
  const assigned = (assignedBySlot || []).filter(Boolean);
  const newSkill = JSON.parse(JSON.stringify(baseSkill));

  // --- Modifiche base ---
  assigned.forEach((aug) => {
  // modifica voci numeriche già esistenti
  Object.keys(newSkill.effect)
    .filter((k) => /^\d+$/.test(k))
    .forEach((key) => {
      const part = newSkill.effect[key];
      if (aug["mod-damage-type"] && part["damage-type"]) {
        part["damage-type"] = aug["mod-damage-type"];
      }
      if (aug["mod-damage-type-note"] && part["damage-type"]) {
        part["damage-type-note"] = aug["mod-damage-type-note"];
      }
      if (aug["mod-affliction"] && part["affliction-type"] === aug["mod-affliction"]) {
        const modValue = Number(aug["mod-affliction-value"]) || 0;
        part["affliction-count"] = (part["affliction-count"] || 0) + modValue;
      }
    });

    if (aug["mod-action-cost"])
      newSkill.effect.actionCost =
        (Number(newSkill.effect.actionCost) || 0) +
        Number(aug["mod-action-cost"]);
    if (aug["mod-target"]) newSkill.effect.target = aug["mod-target"];
    if (aug["mod-area"]) newSkill.effect.area = aug["mod-area"];
    if (aug["add-tags"])
      newSkill.tags = [
        ...new Set([...(newSkill.tags || []), ...aug["add-tags"]]),
      ];
  });

  // --- Afflictions ---
  let afflictions = {};
  assigned.forEach((aug) => {
    if (aug["add-affliction"]) {
      const value = Number(aug["add-affliction-value"]) || 1;
      const affs = Array.isArray(aug["add-affliction"])
        ? aug["add-affliction"]
        : [aug["add-affliction"]];
      affs.forEach((a) => {
        afflictions[a] = (afflictions[a] || 0) + value;
      });
    }
    if (aug["mod-affliction"]) {
      const target = aug["mod-affliction"];
      const modValue = Number(aug["mod-affliction-value"]) || 0;
      afflictions[target] = (afflictions[target] || 0) + modValue;
    }
  });

  // --- Determina prossimo indice numerico per la skill ---
  let nextIndex =
    Math.max(
      0,
      ...Object.keys(newSkill.effect)
        .filter((k) => /^\d+$/.test(k))
        .map(Number)
    ) + 1;

  // --- Inserisci afflictions come voci numeriche ---
  Object.entries(afflictions).forEach(([name, value]) => {
    if (value !== 0) {
      newSkill.effect[nextIndex++] = {
        "action-type": "Inflict",
        "affliction-count": value,
        "affliction-type": name,
        condition: "on Hit",
      };
    }
  });

  // --- Inserisci specials / HTML dalle augmentations ---
  assigned.forEach((aug) => {
  if (aug["add-special"]) {
    const specialEntry = {
      "action-type": aug["add-special"] ?? "",
      "affliction-count": aug["add-special-value"] ?? "",
      "affliction-type": aug["add-special-value-unit"] ?? "",
      condition: aug["add-special-condition"] ?? "",
    };
    if (specialEntry["affliction-count"]) {
      newSkill.effect[nextIndex++] = specialEntry;
    }
  }

  if (aug.effect) {
    if (!aug["add-special"]) {
    }
  }
});

  return newSkill;
}

// ─── Controlla conflitti tra augmentations selezionate ───
function areAugmentationsCompatible(selectedAugmentations) {
  for (let i = 0; i < selectedAugmentations.length; i++) {
    for (let j = i + 1; j < selectedAugmentations.length; j++) {
      const a = selectedAugmentations[i];
      const b = selectedAugmentations[j];
      if (!a || !b) continue;
      if (
        (a.excludes || []).some((ex) => (b.excludes || []).includes(ex)) ||
        (b.excludes || []).some((ex) => (a.excludes || []).includes(ex))
      ) {
        return false;
      }
    }
  }
  return true;
}

function composeSkillCore(effect) {
  const coreItems = [];

  if (effect.text) {
    coreItems.push(effect.text);
  }

  Object.keys(effect)
    .filter((k) => /^\d+$/.test(k))
    .sort((a, b) => Number(a) - Number(b))
    .forEach((key) => {
      const part = effect[key];
      let li = "";

      // Text
      if (part["text"]) {
        li += part["text"] + " ";
      }

      // Action-type
      if (part["action-type"]) {
        li += `<span class="tooltip">${part["action-type"]}</span> `;
      }

      // Damage
      if (part["damage-count"]) {
        li += `<b>${part["damage-count"]}</b> `;
      }
      if (part["damage-type"]) {
        li += `<span class="iconize">${part["damage-type"]}</span> `;
      }

      // Affliction
      if (part["affliction-count"]) {
        li += `<b>${part["affliction-count"]}</b> `;
      }
      if (part["affliction-type"]) {
        li += `<span class="iconize">${part["affliction-type"]}</span> `;
      }

      // Target
      if (part.target) {
        li += `<span class="tooltip">${part.target}</span> `;
      }

      // Area
      if (part.area) {
        li +=
          part.area.replace(/Unit/g, `<span class="tooltip">Unit</span>`) + " ";
      }

      // Condition
      if (part.condition) {
        li += part.condition.replace(
          /Hit/g,
          `<span class="tooltip">Hit</span>`
        );
      }

      if (part["custom-html"]) {
        coreItems.push(part["custom-html"]);
      } else {
        coreItems.push(`<li>${li.trim()}</li>`);
      }
    });

  return coreItems.join("");
}

// ─── Render skill HTML ───
function renderSkill(skill) {
  // --- Mappa tag → categoria ---
  const tagCategoryMap = {};
  tagsData.forEach((t) => {
    tagCategoryMap[t.name] = t.category;
  });

  // --- Ordina i tag della skill in base alla categoria ---
  const sortedTags = (skill.tags || []).slice().sort((a, b) => {
    const catA = tagCategoryMap[a] || "";
    const catB = tagCategoryMap[b] || "";
    return catA.localeCompare(catB); // puoi cambiare con ordine personalizzato
  });

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
      <div class="tags">${sortedTags
        .map((t) => `<span class="tag">${t}</span>`)
        .join("")}</div>
    </div>
    <div class="category"><span class="bold">${
      skill.category
    }</span> <span class="normal">Skill</span></div>
  </div>
</header>
<section class="grid">
  <div class="card" style="grid-column: span 5;">
    <h3 class="box-title">Effect</h3>
    <p class="desc">${skill.description || ""}</p>
    <p class="effect-core"><ol>${composeSkillCore(skill.effect)}</ol></p>
    <dl class="meta">
      <dt>Action Cost</dt><dd>${skill.effect.actionCost || 0}</dd>
      <dt>Target • Area</dt><dd>${skill.effect.target || "-"} • ${
    skill.effect.area || "-"
  }</dd>
    </dl>
  </div>
  <div class="card" style="grid-column: span 7;">
    <h3 class="box-title">Augmentation Slots <span class="muted">(${
      skill.augmentations.slots
    } total)</span>
      <button id="removeAllAugments" type="button"><i class="fa-solid fa-trash"></i><span class="sr-only">Remove All Augmentations</span></button>
    </h3>
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
</article>`;
}

// ─── Render assigned list ───
function renderAssignedList(container, list) {
  if (!container) return;
  if (!list || list.length === 0) {
    container.innerHTML = `<li class="muted">No augmentations assigned.</li>`;
    return;
  }
  container.innerHTML = list
    .map((aug) => `<li><strong>${aug.name}</strong> — ${aug.effect || ""}</li>`)
    .join("");
}

// ─── Controlla requirements delle augmentations assegnate ───
function checkAssignedAugmentationsRequirements(
  skill,
  assignedBySlot,
  container
) {
  const slots = container.querySelectorAll(`[data-slot]`);
  const currentSkill = applyAugmentationsToSkill(skill, assignedBySlot);

  slots.forEach((slot, i) => {
    const img = slot.querySelector("img");
    if (!img) return;
    const aug = assignedBySlot[i];
    img.classList.remove("invalid-slot");
    delete img.dataset.warning;
    if (!aug) return;

    const requires = aug.requires || [];
    const meets = requires.every((r) => currentSkill.tags.includes(r));
    if (!meets) {
      img.classList.add("invalid-slot");
      img.dataset.warning = `Missing required tags: ${requires
        .filter((r) => !currentSkill.tags.includes(r))
        .join(", ")}`;
    }
  });
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

  function rerenderSkill() {
    const modifiedSkill = applyAugmentationsToSkill(skill, assignedBySlot);
    container.innerHTML = renderSkill(modifiedSkill);
    setupAugmentationSlots(
      skill,
      container,
      initializeAugmentationTooltips,
      assignedBySlot
    );
    checkAssignedAugmentationsRequirements(skill, assignedBySlot, container);
    if (window.runIconizer) runIconizer(container);
    if (window.applyTagIcons) window.applyTagIcons();
    if (window.initializeTagTooltips) window.initializeTagTooltips(container);
    if (window.initializeTooltips) window.initializeTooltips(container);
    const assignedList = container.querySelector(`#assigned-${skill.id}`);
    renderAssignedList(assignedList, assignedBySlot.filter(Boolean));
  }

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

    slot.addEventListener("click", (e) => {
      e.stopPropagation();
      if (window.forceHideAugTooltipNow) window.forceHideAugTooltipNow();
      document
        .querySelectorAll(".augmentation-picker, .augmentation-overlay")
        .forEach((p) => p.remove());

      // --- Overlay ---
      const overlay = document.createElement("div");
      overlay.classList.add("augmentation-overlay");
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100vw";
      overlay.style.height = "100vh";
      overlay.style.background = "rgba(0,0,0,0.5)";
      overlay.style.backdropFilter = "blur(4px)";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.zIndex = 9999;
      document.body.appendChild(overlay);

      // --- Picker ---
      const picker = document.createElement("div");
      picker.classList.add("augmentation-picker");
      picker.style.display = "grid";
      picker.style.gridTemplateColumns = `repeat(${Math.min(
        augmentationsData.length,
        10
      )}, 1fr)`;
      picker.style.gap = "6px";
      picker.style.background = "var(--background-dark-1)";
      picker.style.border = "1px solid var(--pale-beige)";
      picker.style.padding = "16px";
      picker.style.maxWidth = "90%";
      picker.style.maxHeight = "80%";
      picker.style.overflowY = "auto";
      overlay.appendChild(picker);

      const label = document.createElement("p");
      label.textContent = "Choose Augmentation:";
      label.style.gridColumn = `1 / -1`;
      label.style.margin = "0 0 6px 0";
      label.style.fontWeight = "normal";
      picker.appendChild(label);

      const assignedFlat = assignedBySlot.filter(Boolean);
      const currentSkill = applyAugmentationsToSkill(skill, assignedFlat);

      augmentationsData.forEach((aug) => {
        const isAssignedHere = assignedBySlot[i]?.id === aug.id;
        const isAlreadyTaken =
          assignedFlat.some((a) => a.id === aug.id) && !isAssignedHere;

        const requires = aug.requires || [];
        const meetsRequires = requires.every((req) =>
          currentSkill.tags.includes(req)
        );

        const simulatedAssigned = [...assignedBySlot];
        simulatedAssigned[i] = aug;
        const wouldBeCompatible = areAugmentationsCompatible(
          simulatedAssigned.filter(Boolean)
        );

        const icon = document.createElement("img");
        icon.src = aug.icon || "/assets/icons/default.png";
        icon.alt = aug.name;
        icon.title = aug.name;
        icon.dataset.augId = aug.id;
        icon.style.width = "60px";
        icon.style.height = "60px";
        icon.style.cursor = "pointer";

        // --- Mostra tooltip direttamente sulle icone del picker ---
        icon.addEventListener("mouseenter", () => showAugTooltip(icon, aug));
        icon.addEventListener("mouseleave", () => hideAugTooltip());

        if (!meetsRequires || isAlreadyTaken || !wouldBeCompatible) {
          icon.classList.add("incompatible");
          icon.style.opacity = "0.5";
          icon.style.border = "2px solid red";
          icon.dataset.warning = !meetsRequires
            ? `Missing required tags: ${requires
                .filter((r) => !currentSkill.tags.includes(r))
                .join(", ")}`
            : isAlreadyTaken
            ? "Already assigned to another slot"
            : `Incompatible with: ${assignedFlat
                .map((a) => a.name)
                .join(", ")}`;
        } else {
          icon.addEventListener("click", (ev) => {
            ev.stopPropagation();
            assignedBySlot[i] = isAssignedHere ? null : aug;
            if (areAugmentationsCompatible(assignedBySlot.filter(Boolean))) {
              if (window.forceHideAugTooltipNow)
                window.forceHideAugTooltipNow();
              overlay.remove();
              rerenderSkill();
            }
          });
        }

        picker.appendChild(icon);
      });

      overlay.addEventListener("click", (ev) => {
        if (ev.target === overlay) overlay.remove();
      });
    });
  });

  initializeAugmentationTooltips(augmentationsData);
  const assignedList = container.querySelector(`#assigned-${skill.id}`);
  renderAssignedList(assignedList, assignedBySlot.filter(Boolean));
}

// ─── Init ───
async function init() {
  await loadTags();
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
    if (window.forceHideAugTooltipNow) window.forceHideAugTooltipNow();
    const modifiedSkill = applyAugmentationsToSkill(
      skill,
      preAssignedBySlot || []
    );
    container.innerHTML = renderSkill(modifiedSkill);
    if (window.runIconizer) runIconizer(container);
    if (window.applyTagIcons) window.applyTagIcons();
    if (window.initializeTagTooltips) window.initializeTagTooltips(container);
    if (window.initializeTooltips) window.initializeTooltips(container);

    setupAugmentationSlots(
      skill,
      container,
      initializeAugmentationTooltips,
      preAssignedBySlot || []
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
