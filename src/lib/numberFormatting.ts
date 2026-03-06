const WHOLE_NUMBER_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
  useGrouping: false
});

export const formatWholeNumber = (value: number) =>
  WHOLE_NUMBER_FORMATTER.format(Number.isFinite(value) ? value : 0);