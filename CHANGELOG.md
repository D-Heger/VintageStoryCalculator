# Changelog
<!-- Order of Entries: Added -> Fixed -> Changed -> Removed -->
<!-- markdownlint-disable MD024 -->
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Removed unused DOM-based calculator class modules after migrating to store-driven rendering
- Consolidated calculator helpers for store-driven flows and removed unused helper paths
- Migrated calculator and theme state to Svelte stores with reactive outputs replacing DOM-driven updates
- Extracted alloy definitions to `src/data/alloys.json` for improved maintainability and reusability across components
- Updated `alloy_calculator.js` to dynamically load alloys from JSON instead of hardcoded definitions
- Updated `AlloyingCalculator.svelte` to use dynamically generated select options from JSON data
- Extracted metal definitions to `src/data/metals.json` for improved maintainability and reusability across components
- Updated `metal_calculator.js` and `CastingCalculator.svelte` to load metals from JSON data
- Centralized temperature formatting and game constants in `src/data/constants.json` and `src/lib/constants.ts`, with fuels split into `src/data/fuels.json`
- Migrated the codebase to TypeScript with strict settings, shared types, and ESLint TypeScript checks
- Added reusable Svelte input/card components with typed prop and event contracts, and refactored calculator pages to use them
- Moved casting/alloy allocation and process planning into `src/lib/smelting/` with explicit pure/alloy planning boundaries
- Updated alloy nugget allocation to find the smallest feasible ingot-step total that satisfies min/max constraints
- Updated process planning to support alloy constraints, balanced multi-process splits, and 20-nugget (100-unit) batch steps
- Added per-process metadata (`nuggetsTotal`, `unitsTotal`, `ingotsTotal`, `isIngotStepValid`) for clearer stack breakdown output
- Extracted shared stack/process display helpers to `src/lib/stack-display.ts` to keep calculator routes focused on UI binding

## [0.4.1] - 2026-02-03

### Fixed

- Added missing brass alloy definition to AlloyingCalculator.svelte

## [0.4.0] - 2026-01-26

### Fixed

- Added missing brass alloy definition to alloy_calculator.js

## [0.3.0-beta.8] - 2025-12-14

### Added

- Casting and Alloying Calculators now display the layout of the stacks for each smelting process

## [0.3.0-beta.7] - 2025-12-04

### Fixed

- Broken link to Casting Calculator in Home.svelte
- References to "metal" instead of "casting" in multiple files

## [0.3.0-beta.6] - 2025-12-04

### Added

- Casting Calculator: Calculate ore nuggets needed to cast metal ingots for all 8 castable metals (Copper, Gold, Silver, Tin, Zinc, Bismuth, Lead, Nickel)
- Smelting temperature information displayed in both Alloying Calculator and Casting Calculator
- Compatible fuel information showing which fuels can be used based on required smelting temperature (Firewood, Peat, Charcoal, Coal types, Coke)
- Ore source information displayed in Casting Calculator
- New navigation entry for Casting Calculator
- Fuel definitions module with temperature data from Vintage Story wiki

### Changed

- Updated Alloying Calculator to display smelting temperatures for all alloys
- Updated home page to feature the new Casting Calculator
- Updated README.md with Casting Calculator documentation
- Replaced the word "pieces" with "nuggets" throughout the project to better reflect Vintage Story terminology

## [0.3.0-beta.5] - 2025-12-03

### Added

- SEO enhancements and robots.txt sitemap reference for better search engine indexing

## [0.3.0-beta.4] - 2025-12-03

### Fixed

- Fixed a wrong number in the black bronze definition, causing incorrect calculations for that alloy

## [0.3.0-beta.3] - 2025-12-02

### Added

- Experimental "stacked card" layout for alloying calculator on mobile

## [0.3.0-beta.2] - 2025-12-02

### Added

- Roadmap section to README.md outlining planned features and improvements
- Favicon in SVG and PNG formats

### Fixed

- Version in the footer now correctly reflects the latest release version

## [0.3.0-beta.1] - 2025-12-02

### Added

- Support for theming via CSS variables
- Added multiple named themes and theme palettes (Nature, Ocean, Bauxite, Lavender — light/dark variants)
- Added a theme selector UI including preview swatches and responsive dropdown
- Persist theme selection to localStorage and respect system color-scheme preference
- Pipeline for creating new releases using GitHub Actions
- Changelog link in footer next to version number

### Changed

- Version number in footer is now a link to the releases page
- Updated dependencies

## [0.2.0] - 2025-10-15

### Added

- Svelte single-page application shell powered by Vite while retaining calculator features

### Changed

- Development workflow now relies on Vite commands instead of opening static HTML files directly

### Fixed

- Corrected alloying table column alignment
- Restored Black Bronze default ratio to 80/10/10

## [0.1.1] - 2025-10-13

### Fixed

- Corrected version number in alloying.html
- Corrected changelog badge

## [0.1.0] - 2025-10-13

### Added

- Initial release with Alloying Calculator

[Unreleased]: https://github.com/D-Heger/VintageStoryCalculator/compare/0.4.1...HEAD
[0.4.1]: https://github.com/D-Heger/VintageStoryCalculator/releases/tag/0.4.1
[0.4.0]: https://github.com/D-Heger/VintageStoryCalculator/releases/tag/0.4.0
[0.3.0-beta.8]: https://github.com/D-Heger/VintageStoryCalculator/releases/tag/0.3.0-beta.8
[0.3.0-beta.7]: https://github.com/D-Heger/VintageStoryCalculator/releases/tag/0.3.0-beta.7
[0.3.0-beta.6]: https://github.com/D-Heger/VintageStoryCalculator/releases/tag/0.3.0-beta.6
[0.3.0-beta.5]: https://github.com/D-Heger/VintageStoryCalculator/releases/tag/0.3.0-beta.5
[0.3.0-beta.4]: https://github.com/D-Heger/VintageStoryCalculator/releases/tag/0.3.0-beta.4
[0.3.0-beta.3]: https://github.com/D-Heger/VintageStoryCalculator/releases/tag/0.3.0-beta.3
[0.3.0-beta.2]: https://github.com/D-Heger/VintageStoryCalculator/releases/tag/0.3.0-beta.2
[0.3.0-beta.1]: https://github.com/D-Heger/VintageStoryCalculator/releases/tag/0.3.0-beta.1
[0.2.0]: https://github.com/D-Heger/VintageStoryCalculator/releases/tag/0.2.0
[0.1.1]: https://github.com/D-Heger/VintageStoryCalculator/releases/tag/0.1.1
[0.1.0]: https://github.com/D-Heger/VintageStoryCalculator/releases/tag/0.1.0
