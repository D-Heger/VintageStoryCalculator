import charcoalData from "../data/charcoal.json";

const {
  firewoodPerLog,
  firewoodPerStack,
  charcoalPerStack,
  maxPitDimension,
  minPitDimension,
  burnTimeGameHours,
  defaultRealMinutesPerGameDay,
  gameHoursPerDay
} = charcoalData;

export {
  firewoodPerLog,
  firewoodPerStack,
  charcoalPerStack,
  maxPitDimension,
  minPitDimension,
  burnTimeGameHours
};

// Maximum charcoal obtainable from the largest pit (11³ × avg yield)
export const maxPossibleCharcoal = Math.floor(
  maxPitDimension ** 3 * charcoalPerStack.avg
);

export interface CharcoalResult {
  volume: number;
  totalFirewoodStacks: number;
  totalFirewood: number;
  totalLogs: number;
  charcoalMin: number;
  charcoalMax: number;
  charcoalAvg: number;
  burnTimeGameHours: number;
  burnTimeRealMinutes: number;
}

export interface SuggestedPit {
  width: number;
  depth: number;
  height: number;
  volume: number;
}

const burnTimeRealMinutes =
  (burnTimeGameHours / gameHoursPerDay) * defaultRealMinutesPerGameDay;

export function calculateFromDimensions(
  width: number,
  depth: number,
  height: number
): CharcoalResult {
  const w = width;
  const d = depth;
  const h = height;
  const volume = w * d * h;

  const totalFirewoodStacks = volume;
  const totalFirewood = totalFirewoodStacks * firewoodPerStack;
  const totalLogs = totalFirewood / firewoodPerLog;

  return {
    volume,
    totalFirewoodStacks,
    totalFirewood,
    totalLogs,
    charcoalMin: totalFirewoodStacks * charcoalPerStack.min,
    charcoalMax: totalFirewoodStacks * charcoalPerStack.max,
    charcoalAvg: totalFirewoodStacks * charcoalPerStack.avg,
    burnTimeGameHours,
    burnTimeRealMinutes
  };
}

export function suggestPitDimensions(targetCharcoal: number): SuggestedPit {
  const stacksNeeded = Math.ceil(
    Math.max(1, targetCharcoal) / charcoalPerStack.avg
  );

  const maxVolume = maxPitDimension ** 3;
  const clampedStacks = Math.min(stacksNeeded, maxVolume);

  // Find the smallest roughly-cubic pit that fits the needed stacks
  const side = Math.ceil(Math.cbrt(clampedStacks));
  const w = Math.min(side, maxPitDimension);
  const d = Math.min(Math.ceil(Math.sqrt(clampedStacks / w)), maxPitDimension);
  const h = Math.min(Math.ceil(clampedStacks / (w * d)), maxPitDimension);

  return { width: w, depth: d, height: h, volume: w * d * h };
}
