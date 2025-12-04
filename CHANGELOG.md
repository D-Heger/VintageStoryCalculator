# Changelog
<!-- Order of Entries: Added -> Fixed -> Changed -> Removed -->
<!-- markdownlint-disable MD024 -->
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/D-Heger/VintageStoryCalculator/compare/0.3.0-beta.6...HEAD
[0.3.0-beta.6]: https://github.com/D-Heger/VintageStoryCalculator/releases/tag/0.3.0-beta.6
[0.3.0-beta.5]: https://github.com/D-Heger/VintageStoryCalculator/releases/tag/0.3.0-beta.5
[0.3.0-beta.4]: https://github.com/D-Heger/VintageStoryCalculator/releases/tag/0.3.0-beta.4
[0.3.0-beta.3]: https://github.com/D-Heger/VintageStoryCalculator/releases/tag/0.3.0-beta.3
[0.3.0-beta.2]: https://github.com/D-Heger/VintageStoryCalculator/releases/tag/0.3.0-beta.2
[0.3.0-beta.1]: https://github.com/D-Heger/VintageStoryCalculator/releases/tag/0.3.0-beta.1
[0.2.0]: https://github.com/D-Heger/VintageStoryCalculator/releases/tag/0.2.0
[0.1.1]: https://github.com/D-Heger/VintageStoryCalculator/releases/tag/0.1.1
[0.1.0]: https://github.com/D-Heger/VintageStoryCalculator/releases/tag/0.1.0
