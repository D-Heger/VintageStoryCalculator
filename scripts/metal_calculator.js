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

export const METAL_DEFINITIONS = {
  copper: {
    name: "Copper",
    ores: ["Native copper", "Malachite"],
    smeltTemp: "1084°C",
    color: "#b87333",
  },
  gold: {
    name: "Gold",
    ores: ["Native gold"],
    smeltTemp: "1063°C",
    color: "#ffd700",
  },
  silver: {
    name: "Silver",
    ores: ["Native silver"],
    smeltTemp: "961°C",
    color: "#c0c0ff",
  },
  tin: {
    name: "Tin",
    ores: ["Cassiterite"],
    smeltTemp: "232°C",
    color: "#c0c0c0",
  },
  zinc: {
    name: "Zinc",
    ores: ["Sphalerite"],
    smeltTemp: "419°C",
    color: "#d0d8ff",
  },
  bismuth: {
    name: "Bismuth",
    ores: ["Bismuthinite"],
    smeltTemp: "271°C",
    color: "#f5f0e1",
  },
  lead: {
    name: "Lead",
    ores: ["Galena"],
    smeltTemp: "327°C",
    color: "#9aa0a6",
  },
  nickel: {
    name: "Nickel",
    ores: ["Pentlandite"],
    smeltTemp: "1325°C",
    color: "#e6e6e6",
  },
};

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
    `;

    this.container.innerHTML = html;
    this.nuggetsNeededElm = this.container.querySelector("#nuggetsNeeded");
    this.metalNameElm = this.container.querySelector("#metalName");
    this.smeltTempElm = this.container.querySelector("#smeltTemp");
    this.compatibleFuelsElm = this.container.querySelector("#compatibleFuels");
    this.oreSourcesElm = this.container.querySelector("#oreSources");
    this.barElm = this.container.querySelector("#metalBar");
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