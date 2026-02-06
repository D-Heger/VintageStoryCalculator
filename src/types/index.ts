export interface AlloyPart {
  metal: string;
  min: number;
  max: number;
  default?: number;
  color?: string;
}

export interface Alloy {
  name: string;
  smeltTemp?: number;
  parts: AlloyPart[];
}

export interface Metal {
  name: string;
  smeltTemp: number;
  ores: string[];
  color?: string;
}

export interface Calculation {
  totalUnits?: number;
  totalNuggets?: number;
  totalStacks?: number;
  processes?: Array<{
    stacks: Array<{
      metal: string;
      amount: number;
      color?: string;
    }>;
  }>;
  requiresMultipleProcesses?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface Fuel {
  name: string;
  temp: number;
  duration: number;
}
