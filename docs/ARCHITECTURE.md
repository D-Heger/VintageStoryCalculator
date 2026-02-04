# Data-Driven Architecture

This document describes the data-driven architecture implemented in the Vintage Story Calculator.

## Overview

The application has been refactored to separate game data from business logic, making it easy to add or modify game content without touching the code.

## Data Files Location

All game data is stored in JSON files under `/public/data/`:

- `metals.json` - Metal definitions (name, ores, smelting temperature, color)
- `alloys.json` - Alloy recipes (name, parts, percentages, smelting temperature)
- `fuels.json` - Fuel types (name, temperature, duration)
- `themes.json` - UI themes (theme ID to display name mapping)

## Data Loader Module

The `src/lib/dataLoader.js` module provides functions to load data:

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

1. **Easy Updates**: Game data can be updated without code changes
2. **Separation of Concerns**: Business logic is separate from data
3. **Maintainability**: Clear structure makes it easy to find and modify data
4. **Extensibility**: New features can be added by extending JSON schemas
5. **Version Control**: Data changes are tracked separately from code
6. **Collaboration**: Non-developers can contribute data updates

## Architecture Diagram

```
Svelte Components → Data Loader Module → JSON Data Files → Calculator Classes
```

## Future Enhancements

1. **Schema Validation**: Add JSON schema validation for data files
2. **Data Editor**: Create a UI for editing game data
3. **Versioning**: Add data version tracking for game updates
4. **Localization**: Support multiple languages by separating text
5. **User Data**: Allow users to save and load custom recipes
