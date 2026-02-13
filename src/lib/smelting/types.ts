export type MetalNuggetInput = {
  metal: string;
  color?: string;
  nuggets: number;
};

export type AlloyPartConstraint = {
  metal: string;
  min: number;
  max: number;
  pct?: number;
  color?: string;
};

export type MetalAllocation = {
  metal: string;
  color?: string;
  nuggets: number;
  units: number;
};

export type PureAllocationResult = {
  requiredUnits: number;
  requiredNuggets: number;
  producedUnits: number;
  overageUnits: number;
  metals: MetalAllocation[];
};

export type AlloyAllocationResult = {
  requiredUnits: number;
  totalNuggets: number;
  producedUnits: number;
  overageUnits: number;
  parts: Array<
    MetalAllocation & {
      min: number;
      max: number;
      pctTarget: number;
      pctActual: number;
    }
  >;
};

export type SmeltingPlannerOptions = {
  alloyParts?: AlloyPartConstraint[];
  enforceMinProcessNuggets?: number;
  enforceProcessMultipleNuggets?: number;
  balanceProcesses?: boolean;
};
