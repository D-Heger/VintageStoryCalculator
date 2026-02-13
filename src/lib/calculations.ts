export type AlloyRatioValidation = {
  totalPercent: number;
  statusMessage: string;
  statusWarning: boolean;
};

export const validateAlloyRatios = (parts: Array<{ pct: number }>): AlloyRatioValidation => {
  const totalPercent = parts.reduce((sum, part) => sum + (Number.isFinite(part.pct) ? part.pct : 0), 0);
  const diff = Math.abs(totalPercent - 100);
  const statusMessage =
    diff < 0.01
      ? "Blend total: 100%"
      : `Blend total: ${totalPercent.toFixed(2)}% (adjusted to 100%)`;

  return {
    totalPercent,
    statusMessage,
    statusWarning: diff >= 0.01
  };
};
