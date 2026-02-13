export type AlloyRatioValidation = {
  totalPercent: number;
};

export const validateAlloyRatios = (parts: Array<{ pct: number }>): AlloyRatioValidation => {
  const totalPercent = parts.reduce((sum, part) => sum + (Number.isFinite(part.pct) ? part.pct : 0), 0);
  return {
    totalPercent
  };
};
