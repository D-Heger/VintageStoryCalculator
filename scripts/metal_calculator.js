import { getCompatibleFuels, formatFuelList } from "./fuel_definitions.js";
import metalDefinitions from "../src/data/metals.json";

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

export const METAL_DEFINITIONS = metalDefinitions;

export default class MetalCalculator {
  constructor(
    {
      root = typeof document !== "undefined" ? document : null,
      container,
      metalSelect,
      ingotsInput,
      metals = METAL_DEFINITIONS,
    } = {}
  ) {
    this.root = root;
    this.metals = metals;

    // Game constants for metal smelting
    this.UNITS_PER_INGOT = 100;
    this.UNITS_PER_NUGGET = 5;
    this.NUGGETS_PER_INGOT = this.UNITS_PER_INGOT / this.UNITS_PER_NUGGET; // 20
    this.STACK_SIZE = 128;
    this.MAX_STACKS_PER_PROCESS = 4;

    this.container =
      container ||
      (this.root && typeof this.root.querySelector === "function"
        ? this.root.querySelector("#calculator")
        : null);
    this.metalSelect =
      metalSelect ||
      (this.root && typeof this.root.querySelector === "function"
        ? this.root.querySelector("#metalSelect")
        : null);
    this.ingotsInput =
      ingotsInput ||
      (this.root && typeof this.root.querySelector === "function"
        ? this.root.querySelector("#targetIngots")
        : null);

    this.document = resolveDocument(
      this.container,
      this.metalSelect,
      this.ingotsInput,
      this.root
    );

    this.integerFormatter = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
      useGrouping: false,
    });

    this.isReady = Boolean(
      this.container && this.metalSelect && this.ingotsInput && this.document
    );
    if (!this.isReady) {
      console.warn("MetalCalculator: required DOM nodes not found.");
      return;
    }

    this.bindHandlers();
    this.init();
  }

  init() {
    this.renderStructure();
    this.bindEvents();
    this.selectMetal(this.metalSelect.value);
  }

  bindHandlers() {
    this.handleSelectChange = (event) => this.selectMetal(event.target.value);
    this.handleIngotsInput = () => this.update();
  }

  renderStructure() {
    const html = `
      <p>Nuggets needed: <strong id="nuggetsNeeded">0</strong></p>
      
      <div class="metal-info" id="metalInfo">
        <div class="info-row">
          <span class="info-label">Metal:</span>
          <span class="info-value" id="metalName">-</span>
        </div>
        <div class="info-row">
          <span class="info-label">Smelting Temperature:</span>
          <span class="info-value" id="smeltTemp">-</span>
        </div>
        <div class="info-row">
          <span class="info-label">Compatible Fuels:</span>
          <span class="info-value" id="compatibleFuels">-</span>
        </div>
        <div class="info-row">
          <span class="info-label">Ore Sources:</span>
          <span class="info-value" id="oreSources">-</span>
        </div>
      </div>
      
      <div class="bar" id="metalBar" aria-label="Metal color preview"></div>

      <div class="stack-summary" id="stackSummary">
        <div class="stack-header">
          <p class="stack-headline" id="stackHeadline">Stacks needed: 0</p>
          <p class="stack-note" id="stackNote">Up to four stacks fit into one smelt.</p>
        </div>
        <div class="process-list" id="processList"></div>
      </div>
    `;

    this.container.innerHTML = html;
    this.nuggetsNeededElm = this.container.querySelector("#nuggetsNeeded");
    this.metalNameElm = this.container.querySelector("#metalName");
    this.smeltTempElm = this.container.querySelector("#smeltTemp");
    this.compatibleFuelsElm = this.container.querySelector("#compatibleFuels");
    this.oreSourcesElm = this.container.querySelector("#oreSources");
    this.barElm = this.container.querySelector("#metalBar");
    this.stackHeadlineEl = this.container.querySelector("#stackHeadline");
    this.stackNoteEl = this.container.querySelector("#stackNote");
    this.processListEl = this.container.querySelector("#processList");
  }

  bindEvents() {
    this.metalSelect.addEventListener("change", this.handleSelectChange);
    this.ingotsInput.addEventListener("input", this.handleIngotsInput);
  }

  selectMetal(key) {
    const definition = this.metals[key];
    if (!definition) {
      console.warn(`MetalCalculator: unknown metal "${key}".`);
      return;
    }

    this.currentMetal = definition;
    this.updateMetalInfo();
    this.update();
  }

  updateMetalInfo() {
    if (!this.currentMetal) return;

    this.metalNameElm.textContent = this.currentMetal.name;
    this.smeltTempElm.textContent = this.currentMetal.smeltTemp;
    
    // Get and display compatible fuels
    const compatibleFuels = getCompatibleFuels(this.currentMetal.smeltTemp);
    this.compatibleFuelsElm.textContent = formatFuelList(compatibleFuels);
    
    this.oreSourcesElm.textContent = this.currentMetal.ores.join(", ");
    this.renderBar();
  }

  update() {
    if (!this.isReady || !this.currentMetal) return;

    const ingots = Math.max(0, parseFloat(this.ingotsInput.value) || 0);
    const nuggetsNeeded = ingots * this.NUGGETS_PER_INGOT;

    this.nuggetsNeededElm.textContent = this.integerFormatter.format(nuggetsNeeded);
    this.renderStackPlan(nuggetsNeeded);
  }

  renderStackPlan(nuggetsNeeded) {
    if (!this.currentMetal) return;

    if (!nuggetsNeeded) {
      this.stackHeadlineEl.textContent = "Stacks needed: 0";
      this.stackNoteEl.textContent = "Add ingots to see stack and smelt breakdown.";
      this.processListEl.innerHTML = "";
      return;
    }

    const plan = this.computeStackPlan([
      {
        metal: this.currentMetal.name,
        color: this.currentMetal.color,
        nuggets: nuggetsNeeded,
      },
    ]);

    this.stackHeadlineEl.textContent = `Stacks needed: ${this.integerFormatter.format(
      plan.totalStacks
    )}`;
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
            <span class="stack-chip">${this.integerFormatter.format(stack.amount)}</span>
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

  renderBar() {
    if (!this.barElm || !this.currentMetal) return;
    
    this.barElm.innerHTML = "";
    const segment = this.document.createElement("div");
    segment.className = "segment";
    segment.style.flex = 1;
    segment.style.background = this.currentMetal.color || "#ccc";
    segment.textContent = this.currentMetal.name;
    this.barElm.appendChild(segment);
  }

  destroy() {
    if (!this.isReady) return;
    this.metalSelect.removeEventListener("change", this.handleSelectChange);
    this.ingotsInput.removeEventListener("input", this.handleIngotsInput);
    this.isReady = false;
  }
}