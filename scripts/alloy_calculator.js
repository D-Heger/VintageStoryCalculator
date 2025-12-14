import { getCompatibleFuels, formatFuelList } from "./fuel_definitions.js";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const resolveDocument = (...nodes) => {
  for (const node of nodes) {
    if (node && node.ownerDocument) {
      return node.ownerDocument;
    }
  }
  if (typeof document !== "undefined") {
    return document;
  }
  return null;
};

export const ALLOY_DEFINITIONS = {
  tin_bronze: {
    name: "Tin Bronze",
    smeltTemp: "950°C",
    parts: [
      { metal: "Copper", min: 88, max: 92, color: "#b87333" },
      { metal: "Tin", min: 8, max: 12, color: "#c0c0c0" },
    ],
  },
  bismuth_bronze: {
    name: "Bismuth Bronze",
    smeltTemp: "850°C",
    parts: [
      { metal: "Copper", min: 50, max: 70, color: "#b87333" },
      { metal: "Zinc", min: 20, max: 30, color: "#d0d8ff" },
      { metal: "Bismuth", min: 10, max: 20, color: "#f5f0e1" },
    ],
  },
  black_bronze: {
    name: "Black Bronze",
    smeltTemp: "1020°C",
    parts: [
      { metal: "Copper", min: 68, max: 84, default: 80, color: "#b87333" },
      { metal: "Gold", min: 8, max: 16, default: 10, color: "#ffd700" },
      { metal: "Silver", min: 8, max: 16, default: 10, color: "#c0c0ff" },
    ],
  },
  lead_solder: {
    name: "Lead Solder",
    smeltTemp: "327°C",
    parts: [
      { metal: "Lead", min: 45, max: 55, color: "#9aa0a6" },
      { metal: "Tin", min: 45, max: 55, color: "#c0c0c0" },
    ],
  },
  molybdochalkos: {
    name: "Molybdochalkos",
    smeltTemp: "902°C",
    parts: [
      { metal: "Lead", min: 88, max: 92, color: "#9aa0a6" },
      { metal: "Copper", min: 8, max: 12, color: "#b87333" },
    ],
  },
  silver_solder: {
    name: "Silver Solder",
    smeltTemp: "758°C",
    parts: [
      { metal: "Tin", min: 50, max: 60, color: "#c0c0c0" },
      { metal: "Silver", min: 40, max: 50, color: "#c0c0ff" },
    ],
  },
  electrum: {
    name: "Electrum",
    smeltTemp: "1010°C",
    parts: [
      { metal: "Gold", min: 40, max: 60, color: "#ffd700" },
      { metal: "Silver", min: 40, max: 60, color: "#c0c0ff" },
    ],
  },
  cupronickel: {
    name: "Cupronickel",
    smeltTemp: "1171°C",
    parts: [
      { metal: "Copper", min: 65, max: 75, color: "#b87333" },
      { metal: "Nickel", min: 25, max: 35, color: "#e6e6e6" },
    ],
  },
};

export default class AlloyCalculator {
  constructor(
    {
      root = typeof document !== "undefined" ? document : null,
      container,
      alloySelect,
      ingotsInput,
      alloys = ALLOY_DEFINITIONS,
    } = {}
  ) {
    this.root = root;
    this.alloys = alloys;

    this.UNITS_PER_INGOT = 100;
    this.UNITS_PER_PIECE = 5;
    this.STACK_SIZE = 128;
    this.MAX_STACKS_PER_PROCESS = 4;

    this.container =
      container ||
      (this.root && typeof this.root.querySelector === "function"
        ? this.root.querySelector("#calculator")
        : null);
    this.alloySelect =
      alloySelect ||
      (this.root && typeof this.root.querySelector === "function"
        ? this.root.querySelector("#alloySelect")
        : null);
    this.ingotsInput =
      ingotsInput ||
      (this.root && typeof this.root.querySelector === "function"
        ? this.root.querySelector("#targetIngots")
        : null);

    this.document = resolveDocument(
      this.container,
      this.alloySelect,
      this.ingotsInput,
      this.root
    );

    this.state = { parts: [] };

    this.percentPrecision = 1;
    this.percentStep = Math.pow(10, -this.percentPrecision);
    this.integerFormatter = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
      useGrouping: false,
    });

    this.isReady = Boolean(
      this.container && this.alloySelect && this.ingotsInput && this.document
    );
    if (!this.isReady) {
      console.warn("AlloyCalculator: required DOM nodes not found.");
      return;
    }

    this.bindHandlers();
    this.init();
  }

  init() {
    this.renderStructure();
    this.bindEvents();
    this.selectAlloy(this.alloySelect.value);
  }

  bindHandlers() {
    this.handleSelectChange = (event) => this.selectAlloy(event.target.value);
    this.handleIngotsInput = () => this.update();
    this.handlePercentInput = (event) => {
      const context = this.extractRowContext(event);
      if (!context) return;
      const value = parseFloat(event.target.value);
      if (!Number.isFinite(value)) return;
      this.setPartPercent(context.index, value);
    };
    this.handlePercentBlur = (event) => {
      const context = this.extractRowContext(event);
      if (!context) return;
      const part = this.state.parts[context.index];
      event.target.value = part ? part.pct.toFixed(this.percentPrecision) : "";
    };
    this.handleSliderInput = (event) => {
      const context = this.extractRowContext(event);
      if (!context) return;
      const value = parseFloat(event.target.value);
      if (!Number.isFinite(value)) return;
      this.setPartPercent(context.index, value);
    };
  }

  renderStructure() {
    const html = `
            <p class="status" id="blendStatus"></p>
            <p>Total units needed: <strong id="totalUnits">0</strong></p>
            <p>Smelting temperature: <strong id="smeltTemp">-</strong> | Compatible fuels: <strong id="compatibleFuels">-</strong></p>

            <table aria-label="Alloy recipe">
                <thead>
                    <tr>
                        <th>Metal</th>
                        <th>Recipe %</th>
                        <th>Units needed</th>
                        <th>Nuggets</th>
                        <th>Adjust</th>
                    </tr>
                </thead>
                <tbody id="alloyRows"></tbody>
            </table>

            <div class="bar" id="blendBar" aria-label="Alloy blend proportions"></div>

            <div class="stack-summary" id="stackSummary">
              <div class="stack-header">
                <p class="stack-headline" id="stackHeadline">Stacks needed: 0</p>
                <p class="stack-note" id="stackNote">Up to four stacks fit into one smelt.</p>
              </div>
              <div class="process-list" id="processList"></div>
            </div>
        `;

    this.container.innerHTML = html;
    this.rowsEl = this.container.querySelector("#alloyRows");
    this.totalUnitsElm = this.container.querySelector("#totalUnits");
    this.statusElm = this.container.querySelector("#blendStatus");
    this.smeltTempElm = this.container.querySelector("#smeltTemp");
    this.compatibleFuelsElm = this.container.querySelector("#compatibleFuels");
    this.barElm = this.container.querySelector("#blendBar");
    this.stackSummaryEl = this.container.querySelector("#stackSummary");
    this.stackHeadlineEl = this.container.querySelector("#stackHeadline");
    this.stackNoteEl = this.container.querySelector("#stackNote");
    this.processListEl = this.container.querySelector("#processList");
  }

  bindEvents() {
    this.alloySelect.addEventListener("change", this.handleSelectChange);
    this.ingotsInput.addEventListener("input", this.handleIngotsInput);
  }

  selectAlloy(key) {
    const definition = this.alloys[key];
    if (!definition) {
      console.warn(`AlloyCalculator: unknown alloy "${key}".`);
      return;
    }

    // Update temperature and fuel display
    if (this.smeltTempElm && definition.smeltTemp) {
      this.smeltTempElm.textContent = definition.smeltTemp;
      
      // Get and display compatible fuels
      if (this.compatibleFuelsElm) {
        const compatibleFuels = getCompatibleFuels(definition.smeltTemp);
        this.compatibleFuelsElm.textContent = formatFuelList(compatibleFuels);
      }
    }

    this.state.parts = definition.parts.map((part) => {
      const min = Number.isFinite(part.min) ? part.min : 0;
      const max =
        Number.isFinite(part.max) && part.max >= min
          ? part.max
          : Math.max(min, 100);
      const midpoint = (min + max) / 2;
      const base = Number.isFinite(part.default) ? part.default : midpoint;
      return {
        metal: part.metal,
        color: part.color,
        min,
        max,
        pct: clamp(base, min, max),
      };
    });

    this.normalizeParts();
    this.renderRows();
    this.update();
  }

  renderRows() {
    if (!this.rowsEl) return;
    this.rowsEl.innerHTML = "";
    this.state.parts.forEach((part, index) => {
      const row = this.createRow(part, index);
      this.rowsEl.appendChild(row);
    });
  }

  setPartPercent(index, value) {
    const parts = this.state.parts;
    if (!parts[index]) return;

    parts.forEach((part) => {
      const min = Number.isFinite(part.min) ? part.min : 0;
      const max = Number.isFinite(part.max) && part.max >= min ? part.max : 100;
      part.min = min;
      part.max = max;
      part.pct = clamp(part.pct, min, max);
    });

    parts[index].pct = clamp(value, parts[index].min, parts[index].max);
    this.rebalancePercents(index);
    this.roundParts(index);
    this.syncInputs();
    this.update();
  }

  syncInputs() {
    const rows = Array.from(this.rowsEl.children);
    const activeElement = this.getActiveElement();
    rows.forEach((tr, idx) => {
      const part = this.state.parts[idx];
      if (!part) return;
      const pct = part.pct;
      const numberInput = tr.querySelector(".percent");
      const sliderInput = tr.querySelector(".slider");
      if (numberInput && activeElement !== numberInput) {
        numberInput.value = pct.toFixed(this.percentPrecision);
      }
      if (sliderInput && activeElement !== sliderInput) {
        sliderInput.value = pct.toFixed(this.percentPrecision);
      }
    });
  }

  getTotalUnits() {
    const ingots = Math.max(0, parseFloat(this.ingotsInput.value) || 0);
    return ingots * this.UNITS_PER_INGOT;
  }

  update() {
    if (!this.isReady) return;
    const totalUnits = this.getTotalUnits();
    this.totalUnitsElm.textContent = this.integerFormatter.format(totalUnits);

    const pieceAllocations = this.calculatePieceAllocations(totalUnits);
    const totalPercent = this.updateRows(totalUnits, pieceAllocations);
    this.updateStatus(totalPercent);
    this.renderBar();
    this.renderStackPlan(pieceAllocations);
  }

  updateRows(totalUnits, pieceAllocations) {
    let percentTotal = 0;

    const activeElement = this.getActiveElement();

    this.state.parts.forEach((part, index) => {
      percentTotal += part.pct;
      const row = this.rowsEl.children[index];
      if (!row) return;

      const allocation = pieceAllocations[index] || { nuggets: 0, units: 0 };
      const { nuggets, units } = allocation;

      const unitsCell = row.querySelector(".units");
      const nuggetsCell = row.querySelector(".nuggets");
      if (unitsCell) unitsCell.textContent = this.formatQuantity(units);
      if (nuggetsCell) nuggetsCell.textContent = this.formatQuantity(nuggets);

      const numberInput = row.querySelector(".percent");
      const sliderInput = row.querySelector(".slider");
      if (numberInput && activeElement !== numberInput) {
        numberInput.value = part.pct.toFixed(this.percentPrecision);
      }
      if (sliderInput && activeElement !== sliderInput) {
        sliderInput.value = part.pct.toFixed(this.percentPrecision);
      }
    });

    return percentTotal;
  }

  updateStatus(totalPercent) {
    const diff = Math.abs(totalPercent - 100);
    const message =
      diff < 0.01
        ? `Blend total: 100%`
        : `Blend total: ${totalPercent.toFixed(2)}% (adjusted to 100%)`;
    this.statusElm.textContent = message;
    this.statusElm.classList.toggle("warning", diff >= 0.01);
  }

  renderBar() {
    if (!this.barElm) return;
    this.barElm.innerHTML = "";
    const totalPercent = this.state.parts.reduce(
      (sum, part) => sum + part.pct,
      0
    );
    if (totalPercent <= 0) {
      const emptySegment = document.createElement("div");
      emptySegment.className = "segment";
      emptySegment.style.flex = 1;
      emptySegment.style.background = "#eee";
      emptySegment.textContent = "No metals";
      this.barElm.appendChild(emptySegment);
      return;
    }

    this.state.parts.forEach((part) => {
      if (part.pct <= 0) return;
      const segment = document.createElement("div");
      segment.className = "segment";
      segment.style.flex = part.pct;
      segment.style.background = part.color || "#ccc";
      segment.textContent = `${part.metal} ${part.pct.toFixed(1)}%`;
      this.barElm.appendChild(segment);
    });
  }

  normalizeParts() {
    if (!this.state.parts.length) return;

    const total = this.state.parts.reduce((sum, part) => sum + part.pct, 0);
    if (total === 0) {
      const share = 100 / this.state.parts.length;
      this.state.parts.forEach((part) => {
        part.pct = clamp(share, part.min, part.max);
      });
    } else {
      const scale = 100 / total;
      this.state.parts.forEach((part) => {
        part.pct = clamp(part.pct * scale, part.min, part.max);
      });
    }

    this.rebalancePercents(0);
    this.roundParts(0);
  }

  rebalancePercents(anchorIndex = 0) {
    const parts = this.state.parts;
    if (!parts.length) return;

    const clampAll = () => {
      parts.forEach((part) => {
        part.pct = clamp(part.pct, part.min, part.max);
      });
    };

    clampAll();

    let diff = 100 - parts.reduce((sum, part) => sum + part.pct, 0);
    if (Math.abs(diff) <= 1e-6) return;

    const direction = diff > 0 ? 1 : -1;
    let remaining = Math.abs(diff);
    const others = parts
      .map((part, idx) => ({ part, idx }))
      .filter((entry) => entry.idx !== anchorIndex);

    const capacity = (entry) =>
      direction > 0
        ? entry.part.max - entry.part.pct
        : entry.part.pct - entry.part.min;

    let guard = 0;
    while (remaining > 1e-4 && guard < 50) {
      guard += 1;
      const adjustable = others.filter((entry) => capacity(entry) > 1e-6);
      if (!adjustable.length) break;

      const share = remaining / adjustable.length;
      adjustable.forEach((entry) => {
        const delta = Math.min(capacity(entry), share);
        entry.part.pct += direction * delta;
        remaining -= delta;
      });
    }

    if (remaining > 1e-4 && parts[anchorIndex]) {
      const anchor = parts[anchorIndex];
      const anchorCapacity =
        direction > 0 ? anchor.max - anchor.pct : anchor.pct - anchor.min;
      const delta = Math.min(anchorCapacity, remaining);
      anchor.pct += direction * delta;
      remaining -= delta;
    }

    clampAll();

    if (remaining > 1e-3) {
      const unconstrainedTotal = parts.reduce((sum, part) => sum + part.pct, 0);
      if (unconstrainedTotal > 0) {
        const scale = 100 / unconstrainedTotal;
        parts.forEach((part) => {
          part.pct = clamp(part.pct * scale, part.min, part.max);
        });
      }
    }

    const finalDiff = 100 - parts.reduce((sum, part) => sum + part.pct, 0);
    if (Math.abs(finalDiff) > 0.01 && parts[anchorIndex]) {
      parts[anchorIndex].pct = clamp(
        parts[anchorIndex].pct + finalDiff,
        parts[anchorIndex].min,
        parts[anchorIndex].max
      );
    }
  }

  roundParts(anchorIndex = 0) {
    const parts = this.state.parts;
    if (!parts.length) return;

    parts.forEach((part) => {
      part.pct = clamp(
        Number(part.pct.toFixed(this.percentPrecision)),
        part.min,
        part.max
      );
    });

    let diff = Number(
      (100 - parts.reduce((sum, part) => sum + part.pct, 0)).toFixed(
        this.percentPrecision
      )
    );
    if (Math.abs(diff) < Math.pow(10, -this.percentPrecision)) return;

    const direction = diff > 0 ? 1 : -1;
    const candidates = parts
      .map((part, idx) => ({ part, idx }))
      .filter((entry) => entry.idx !== anchorIndex)
      .sort((a, b) => {
        const capA =
          direction > 0 ? a.part.max - a.part.pct : a.part.pct - a.part.min;
        const capB =
          direction > 0 ? b.part.max - b.part.pct : b.part.pct - b.part.min;
        return capB - capA;
      });

    const target = candidates.find((entry) => {
      const cap =
        direction > 0
          ? entry.part.max - entry.part.pct
          : entry.part.pct - entry.part.min;
      return cap > 0;
    }) || { part: parts[anchorIndex], idx: anchorIndex };

    if (!target.part) return;
    const capacity =
      direction > 0
        ? target.part.max - target.part.pct
        : target.part.pct - target.part.min;
    const delta = direction * Math.min(Math.abs(diff), capacity);
    target.part.pct = clamp(
      Number((target.part.pct + delta).toFixed(this.percentPrecision)),
      target.part.min,
      target.part.max
    );

    const epsilon = Math.pow(10, -this.percentPrecision);
    let finalDiff = Number(
      (100 - parts.reduce((sum, part) => sum + part.pct, 0)).toFixed(
        this.percentPrecision
      )
    );
    if (Math.abs(finalDiff) >= epsilon) {
      const adjustDirection = finalDiff > 0 ? 1 : -1;
      let adjustIndex = parts.findIndex((part, idx) => {
        if (idx === target.idx) return false;
        const cap =
          adjustDirection > 0 ? part.max - part.pct : part.pct - part.min;
        return cap >= epsilon;
      });
      if (adjustIndex === -1) adjustIndex = anchorIndex;
      const adjustPart = parts[adjustIndex];
      if (adjustPart) {
        const cap =
          adjustDirection > 0
            ? adjustPart.max - adjustPart.pct
            : adjustPart.pct - adjustPart.min;
        const adjustment = adjustDirection * Math.min(Math.abs(finalDiff), cap);
        adjustPart.pct = clamp(
          Number((adjustPart.pct + adjustment).toFixed(this.percentPrecision)),
          adjustPart.min,
          adjustPart.max
        );
        finalDiff = Number(
          (100 - parts.reduce((sum, part) => sum + part.pct, 0)).toFixed(
            this.percentPrecision
          )
        );
        if (Math.abs(finalDiff) >= epsilon && adjustIndex !== anchorIndex) {
          const anchor = parts[anchorIndex];
          if (anchor) {
            const anchorCap =
              adjustDirection > 0
                ? anchor.max - anchor.pct
                : anchor.pct - anchor.min;
            const anchorAdjustment =
              adjustDirection * Math.min(Math.abs(finalDiff), anchorCap);
            anchor.pct = clamp(
              Number(
                (anchor.pct + anchorAdjustment).toFixed(this.percentPrecision)
              ),
              anchor.min,
              anchor.max
            );
          }
        }
      }
    }
  }

  calculatePieceAllocations(totalUnits) {
    const partsCount = this.state.parts.length;
    if (!partsCount) return [];

    const totalNuggets = Math.max(
      0,
      Math.round(totalUnits / this.UNITS_PER_PIECE)
    );
    if (totalNuggets === 0) {
      return this.state.parts.map(() => ({ nuggets: 0, units: 0 }));
    }

    const allocations = this.state.parts.map((part, idx) => {
      const exactNuggets = totalNuggets * (part.pct / 100);
      const baseNuggets = Math.floor(exactNuggets);
      return {
        idx,
        nuggets: baseNuggets,
        remainder: exactNuggets - baseNuggets,
      };
    });

    let assignedNuggets = allocations.reduce(
      (sum, entry) => sum + entry.nuggets,
      0
    );
    let remaining = totalNuggets - assignedNuggets;

    if (remaining > 0) {
      const byRemainderDesc = [...allocations].sort((a, b) => {
        if (b.remainder === a.remainder) return a.idx - b.idx;
        return b.remainder - a.remainder;
      });

      for (const entry of byRemainderDesc) {
        if (remaining <= 0) break;
        entry.nuggets += 1;
        remaining -= 1;
      }
    } else if (remaining < 0) {
      const byRemainderAsc = [...allocations].sort((a, b) => {
        if (a.remainder === b.remainder) return b.idx - a.idx;
        return a.remainder - b.remainder;
      });

      for (const entry of byRemainderAsc) {
        if (remaining >= 0) break;
        if (entry.nuggets === 0) continue;
        entry.nuggets -= 1;
        remaining += 1;
      }
    }

    return allocations
      .sort((a, b) => a.idx - b.idx)
      .map((entry) => ({
        nuggets: entry.nuggets,
        units: entry.nuggets * this.UNITS_PER_PIECE,
      }));
  }

  createRow(part, index) {
    const doc = this.document || (typeof document !== "undefined" ? document : null);
    if (!doc) {
      throw new Error("AlloyCalculator: cannot create table row without document context.");
    }
    const row = doc.createElement("tr");
    row.dataset.index = String(index);

    const min = Number.isFinite(part.min) ? part.min : 0;
    const max = Number.isFinite(part.max) ? part.max : 100;
    const pctValue = part.pct.toFixed(this.percentPrecision);

    row.innerHTML = `
        <td data-label="Metal">${part.metal}</td>
        <td data-label="Recipe %">
                <input
                    class="percent"
                    type="number"
                    inputmode="decimal"
                    aria-label="${part.metal} percent"
                    value="${pctValue}"
                    min="${min}"
                    max="${max}"
                    step="${this.percentStep}"
                >
            </td>
        <td class="units" data-label="Units needed">${this.formatQuantity(0)}</td>
        <td class="nuggets" data-label="Nuggets">${this.formatQuantity(0)}</td>
        <td class="sliders" data-label="Adjust">
                <input
                    class="slider"
                    type="range"
                    min="${min}"
                    max="${max}"
                    step="${this.percentStep}"
                    value="${pctValue}"
                    aria-label="${part.metal} percent slider"
                >
            </td>
        `;

    const percentInput = row.querySelector(".percent");
    const sliderInput = row.querySelector(".slider");
    if (percentInput) {
      percentInput.addEventListener("input", this.handlePercentInput);
      percentInput.addEventListener("change", this.handlePercentBlur);
    }
    if (sliderInput) {
      sliderInput.addEventListener("input", this.handleSliderInput);
    }

    return row;
  }

  extractRowContext(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return null;
    const row = target.closest("tr");
    if (!row) return null;
    const index = Number.parseInt(row.dataset.index || "", 10);
    if (!Number.isInteger(index)) return null;
    return { row, index };
  }

  formatQuantity(value) {
    return this.integerFormatter.format(Number.isFinite(value) ? value : 0);
  }

  getActiveElement() {
    const doc = this.document || (typeof document !== "undefined" ? document : null);
    return doc ? doc.activeElement : null;
  }

  renderStackPlan(pieceAllocations) {
    if (!this.stackSummaryEl || !Array.isArray(pieceAllocations)) return;

    const planInputs = pieceAllocations
      .map((allocation, idx) => ({
        metal: this.state.parts[idx]?.metal || `Metal ${idx + 1}`,
        color: this.state.parts[idx]?.color,
        nuggets: allocation?.nuggets || 0,
      }))
      .filter((entry) => entry.nuggets > 0);

    if (!planInputs.length) {
      this.stackHeadlineEl.textContent = "Stacks needed: 0";
      this.stackNoteEl.textContent = "Add ingots to see stack and smelt breakdown.";
      this.processListEl.innerHTML = "";
      return;
    }

    const plan = this.computeStackPlan(planInputs);
    this.stackHeadlineEl.textContent = `Stacks needed: ${this.formatQuantity(plan.totalStacks)}`;
    const processCount = plan.processes.length || (plan.totalStacks ? 1 : 0);
    this.stackNoteEl.textContent = plan.requiresMultipleProcesses
      ? `More than four stacks means ${processCount} smelting processes (4-stack limit).`
      : "Fits in one smelting process (4-stack limit).";

    this.processListEl.innerHTML = plan.processes
      .map((process, idx) => this.renderProcess(process, idx))
      .join("");
  }

  renderProcess(process, index) {
    if (!process || !Array.isArray(process.stacks)) return "";
    const pairs = process.stacks
      .map(
        (stack) => `
          <div class="stack-pair" aria-label="${stack.metal} stack">
            <span class="stack-chip">${this.formatQuantity(stack.amount)}</span>
            <span class="stack-label" style="--stack-color:${stack.color || "var(--primary-color)"}">${
              stack.metal
            }</span>
          </div>
        `
      )
      .join("");

    return `
      <div class="process-card" aria-label="Process ${index + 1} stack layout">
        <div class="process-title">Process ${index + 1}</div>
        <div class="stack-row pairs">${pairs || "-"}</div>
      </div>
    `;
  }

  computeStackPlan(planInputs) {
    const remaining = planInputs.map((entry) => ({ ...entry }));
    const processes = [];
    let totalStacks = 0;

    const remainingTotal = () =>
      remaining.reduce((sum, entry) => sum + (entry.nuggets || 0), 0);

    while (remainingTotal() > 0) {
      const targetSize = Math.min(
        remainingTotal(),
        this.STACK_SIZE * this.MAX_STACKS_PER_PROCESS
      );

      const processAllocations = this.allocateProcess(remaining, targetSize);
      if (!processAllocations.some((value) => value > 0)) {
        break;
      }

      const stacks = [];
      processAllocations.forEach((amount, idx) => {
        if (amount <= 0) return;
        const entry = remaining[idx];
        this.splitIntoStacks(amount).forEach((chunk) => {
          stacks.push({
            metal: entry.metal,
            color: entry.color,
            amount: chunk,
          });
        });
        entry.nuggets = Math.max(0, entry.nuggets - amount);
      });

      totalStacks += stacks.length;
      processes.push({ stacks });
    }

    return {
      totalStacks,
      processes,
      requiresMultipleProcesses: processes.length > 1,
    };
  }

  allocateProcess(remaining, targetSize) {
    const totalRemaining = remaining.reduce(
      (sum, entry) => sum + (entry.nuggets || 0),
      0
    );
    if (totalRemaining === 0) return remaining.map(() => 0);

    let size = Math.min(targetSize, totalRemaining);
    while (size > 0) {
      const allocation = this.distributeByRatio(size, remaining);
      const stackCount = allocation.reduce((sum, amount) => {
        if (amount <= 0) return sum;
        return sum + Math.ceil(amount / this.STACK_SIZE);
      }, 0);

      if (stackCount <= this.MAX_STACKS_PER_PROCESS && allocation.some((v) => v > 0)) {
        return allocation;
      }

      size -= 1;
    }

    const fallback = remaining.map(() => 0);
    let stacksLeft = this.MAX_STACKS_PER_PROCESS;
    for (let i = 0; i < remaining.length && stacksLeft > 0; i++) {
      const cap = Math.min(remaining[i].nuggets, this.STACK_SIZE);
      if (cap <= 0) continue;
      fallback[i] = cap;
      stacksLeft -= 1;
    }
    return fallback;
  }

  distributeByRatio(size, remaining) {
    const total = remaining.reduce((sum, entry) => sum + (entry.nuggets || 0), 0);
    if (total === 0) return remaining.map(() => 0);

    const exactShares = remaining.map((entry) => ((entry.nuggets || 0) * size) / total);
    const base = exactShares.map((share, idx) =>
      Math.min(remaining[idx].nuggets, Math.floor(share))
    );

    let allocated = base.reduce((sum, value) => sum + value, 0);
    let leftover = Math.min(size, total) - allocated;

    const order = exactShares
      .map((share, idx) => ({ idx, remainder: share - Math.floor(share) }))
      .sort((a, b) => {
        if (b.remainder === a.remainder) return a.idx - b.idx;
        return b.remainder - a.remainder;
      });

    while (leftover > 0) {
      let placed = false;
      for (const entry of order) {
        const idx = entry.idx;
        if (base[idx] >= remaining[idx].nuggets) continue;
        base[idx] += 1;
        leftover -= 1;
        placed = true;
        if (leftover <= 0) break;
      }
      if (!placed) break;
    }

    if (leftover > 0) {
      for (let i = 0; i < remaining.length && leftover > 0; i++) {
        const room = remaining[i].nuggets - base[i];
        if (room <= 0) continue;
        const add = Math.min(room, leftover);
        base[i] += add;
        leftover -= add;
      }
    }

    return base;
  }

  splitIntoStacks(amount) {
    const stacks = [];
    const fullStacks = Math.floor(amount / this.STACK_SIZE);
    for (let i = 0; i < fullStacks; i++) {
      stacks.push(this.STACK_SIZE);
    }
    const remainder = amount % this.STACK_SIZE;
    if (remainder > 0) stacks.push(remainder);
    return stacks;
  }

  destroy() {
    if (!this.isReady) return;
    this.alloySelect.removeEventListener("change", this.handleSelectChange);
    this.ingotsInput.removeEventListener("input", this.handleIngotsInput);
    if (this.rowsEl) {
      const percentInputs = this.rowsEl.querySelectorAll(".percent");
      percentInputs.forEach((input) => {
        input.removeEventListener("input", this.handlePercentInput);
        input.removeEventListener("change", this.handlePercentBlur);
      });
      const sliderInputs = this.rowsEl.querySelectorAll(".slider");
      sliderInputs.forEach((input) => {
        input.removeEventListener("input", this.handleSliderInput);
      });
    }
    this.isReady = false;
  }
}
