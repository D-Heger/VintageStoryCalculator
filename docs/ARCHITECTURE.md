# Data-Driven Architecture

This document describes the architectural improvements implemented in the Vintage Story Calculator.

## Overview

The application has been refactored with three main goals:

1. **Data-Driven Design**: Separate game data from business logic
2. **Performance Optimization**: Reduce recalculations and improve response time
3. **Error Reduction**: Use precise decimal arithmetic and better algorithms

## Architecture Layers

### 1. Data Layer (`/public/data/*.json`)

All game data is stored in JSON files:

- `metals.json` - Metal definitions (name, ores, smelting temperature, color)
- `alloys.json` - Alloy recipes (name, parts, percentages, smelting temperature)
- `fuels.json` - Fuel types (name, temperature, duration)
- `themes.json` - UI themes (theme ID to display name mapping)

### 2. Data Loading Layer (`src/lib/dataLoader.js`)

Handles asynchronous loading with caching:

```javascript
import { loadMetals, loadAlloys, loadFuels, loadThemes } from './lib/dataLoader.js';

// Load individual data
const metals = await loadMetals();
const alloys = await loadAlloys();
const fuels = await loadFuels();
const themes = await loadThemes();

// Or load all at once
const { metals, alloys, fuels, themes } = await loadAllData();
```

### 3. Calculation Layer (`src/lib/*Calculations.js`)

Pure calculation functions separated from DOM manipulation:

- `alloyCalculations.js` - Precise alloy composition calculations
- `metalCalculations.js` - Metal casting calculations
- `utils.js` - Shared utilities and constants

**Key improvements:**

- **Decimal.js** for precise percentage calculations
- **Largest Remainder Method** for accurate nugget distribution
- **Memoization** for expensive calculations
- **Pure functions** for easy testing and debugging

### 4. Presentation Layer (Calculators & Components)

UI components that use the calculation layer:

- Calculator classes handle DOM manipulation
- Svelte components manage state and user interaction
- Clear separation between calculation and presentation

## Performance Improvements

### 1. Precise Decimal Arithmetic

Uses `decimal.js` library to eliminate floating-point rounding errors:

```javascript
// Before: 0.1 + 0.2 = 0.30000000000000004
// After: Decimal(0.1).plus(0.2) = 0.3 (exact)
```

### 2. Calculation Caching

Memoizes expensive calculations to avoid redundant work:

```javascript
const cache = new CalculationCache();
const key = CalculationCache.createKey(parts, ingots);
const cached = cache.get(key);
if (cached) return cached;
```

### 3. Debouncing & Throttling

Limits calculation frequency during rapid input:

```javascript
const debouncedUpdate = debounce(updateCalculations, 150);
```

### 4. Optimized Algorithms

- **Largest Remainder Method**: More accurate than simple rounding
- **Proportional Distribution**: Fair allocation across parts
- **Early Returns**: Skip calculations when possible

## Error Reduction

### 1. Floating-Point Precision

Old approach (floating-point errors):
```javascript
const pct = 33.3 + 33.3 + 33.4; // Might not equal 100.0
```

New approach (precise decimal):
```javascript
const pct = new Decimal(33.3).plus(33.3).plus(33.4); // Exactly 100.0
```

### 2. Rounding Strategy

- Uses banker's rounding (round half to even)
- Largest remainder method for discrete allocations
- Ensures totals always match expected values

### 3. Input Validation

All inputs are validated and sanitized:

```javascript
function validateInput(value, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return clamp(num, min, max);
}
```

## Maintainability Improvements

### 1. Separation of Concerns

- **Data**: JSON files
- **Calculations**: Pure functions
- **UI**: DOM manipulation
- **State**: Svelte reactivity

### 2. Testability

Pure calculation functions can be easily unit tested:

```javascript
import { calculateAlloyComposition } from './alloyCalculations.js';

test('calculates brass correctly', () => {
  const result = calculateAlloyComposition(
    [{ metal: 'Copper', pct: 65 }, { metal: 'Zinc', pct: 35 }],
    10,
    GAME_CONSTANTS
  );
  expect(result.totalNuggets).toBe(200);
});
```

### 3. Centralized Constants

All game constants in one place:

```javascript
export const GAME_CONSTANTS = {
  UNITS_PER_INGOT: 100,
  UNITS_PER_PIECE: 5,
  STACK_SIZE: 128,
  MAX_STACKS_PER_PROCESS: 4
};
```

## Adding New Game Data

### Adding a New Metal

1. Open `public/data/metals.json`
2. Add a new entry with the metal key and properties:

```json
{
  "iron": {
    "name": "Iron",
    "ores": ["Hematite", "Limonite", "Magnetite"],
    "smeltTemp": "1500°C",
    "color": "#8b7355"
  }
}
```

3. The metal will automatically appear in the Casting Calculator dropdown

### Adding a New Alloy

1. Open `public/data/alloys.json`
2. Add a new entry with the alloy key and recipe:

```json
{
  "steel": {
    "name": "Steel",
    "smeltTemp": "1370°C",
    "parts": [
      { "metal": "Iron", "min": 95, "max": 100, "color": "#8b7355" },
      { "metal": "Black coal", "min": 0, "max": 5, "color": "#333333" }
    ]
  }
}
```

3. The alloy will automatically appear in the Alloying Calculator dropdown

### Adding a New Fuel

1. Open `public/data/fuels.json`
2. Add a new entry:

```json
{
  "oil": {
    "name": "Oil",
    "temp": 1400,
    "duration": 100
  }
}
```

3. The fuel will automatically be suggested for compatible smelting temperatures

### Adding a New Theme

1. Open `public/data/themes.json`
2. Add a new theme mapping:

```json
{
  "sakura-light": "Sakura Light"
}
```

3. Create the corresponding CSS in `styles/themes.css`

## Benefits

### Immediate Benefits

1. **Easy Updates**: Game data can be updated without code changes
2. **Separation of Concerns**: Business logic is separate from data
3. **Maintainability**: Clear structure makes it easy to find and modify data
4. **Extensibility**: New features can be added by extending JSON schemas
5. **Version Control**: Data changes are tracked separately from code
6. **Collaboration**: Non-developers can contribute data updates

### Performance Benefits

1. **Precise Calculations**: Decimal.js eliminates floating-point errors
2. **Reduced Recalculations**: Memoization caches expensive operations
3. **Optimized Algorithms**: Largest remainder method is more accurate
4. **Input Debouncing**: Prevents excessive calculations during rapid typing
5. **Smaller Bundle**: Calculation logic can be code-split

### Code Quality Benefits

1. **Testable**: Pure functions are easy to unit test
2. **Debuggable**: Clear data flow makes debugging easier
3. **Type-Safe**: Better IDE support with separated modules
4. **Documented**: Clear interfaces and JSDoc comments
5. **Consistent**: Centralized constants prevent magic numbers

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│           Svelte Components                 │
│     (State Management & User Events)        │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│         Calculator Classes                  │
│       (DOM Manipulation Layer)              │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│      Calculation Modules (Pure)             │
│   alloyCalculations, metalCalculations      │
│         (Business Logic)                    │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│         Data Loader Module                  │
│      (Async Loading + Caching)              │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│          JSON Data Files                    │
│   metals, alloys, fuels, themes             │
└─────────────────────────────────────────────┘
```

## Comparison: Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| Data Location | Hardcoded in JS | External JSON files |
| Calculations | Mixed with DOM | Pure calculation modules |
| Rounding | JavaScript floats | Decimal.js precision |
| Performance | Recalculate on every change | Memoization + debouncing |
| Testability | Hard to test | Easy unit testing |
| Maintainability | Coupled code | Separated concerns |
| Bundle Size | Larger | Smaller (code splitting) |
| Error Rate | Float precision errors | Eliminated precision errors |

## Future Enhancements

1. **Schema Validation**: Add JSON schema validation for data files
2. **Data Editor**: Create a UI for editing game data
3. **Versioning**: Add data version tracking for game updates
4. **Localization**: Support multiple languages by separating text
5. **User Data**: Allow users to save and load custom recipes
6. **Web Workers**: Move heavy calculations to background threads
7. **Service Worker**: Cache data files for offline use
