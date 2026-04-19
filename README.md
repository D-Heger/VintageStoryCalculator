# Vintage Story Calculator

[![License][license-badge]][license]
[![Release][release-badge]][release-link]
[![Changelog][changelog-badge]][changelog]
[![Netlify Status][netlify-badge]][netlify-link]

A modern, Svelte-powered calculator application designed to assist players of Vintage Story with various game calculations, including alloy recipes and resource management.

Visit now at: [vintagecalc.eu](https://vintagecalc.eu)

## Roadmap

Planned features and improvements include (but are not limited to):

### Near Term

- Smelting time and fuel consumption calculations integrated into the Alloying and Casting calculators
- Bloomery requirement information and iron/steel making support
- Expanded help text throughout the application
- Enhanced mobile UI and UX

### Medium Term

- Claywork calculator: compute clay needed for bricks, vessels, pots, and molds by target count
- Glass calculator: calculate ingredients and fuel for the desired amount of glass
- Leather calculator for crafting resource planning
- User-defined themes with sharing capabilities
- XSkills compatibility: adjust calculations based on relevant skill perks (toggleable in settings)

### Longer Term

- Progressive web app (PWA) support
- Additional specialized calculators and tools

## Available Tools

### Alloying Calculator

Calculate the exact amounts of metals needed to create your desired alloy. Supports all alloys and solders in Vintage Story. Switch between "I need ingots" and "I have nuggets" modes. The first mode calculates the required nuggets to produce the desired ingots, while the second mode figures out how many ingots you can produce from the nuggets on hand. Includes smelting temperature information, a process-by-process stack plan view for multi-batch runs, and a share button that copies the current recipe URL.

### Casting Calculator

Calculate the number of ore nuggets needed to cast metal ingots in a crucible. Supports all 8 castable metals, shows smelting temperatures and ore source information, includes a visual stack plan for each smelting process, and supports shareable calculator URLs. Also supports the "I have nuggets" mode to see how many ingots your stock produces.

### Usage Finder

Enter the metals you have and discover every alloy and casting option available to you. The tool checks your inventory against all game recipes, shows how many ingots each option yields, and provides a per-metal breakdown of nuggets used versus leftover. Expanding a result reveals the full stack plan and compatible fuels.

### Charcoal Calculator

Calculate pit dimensions, firewood requirements, and charcoal yield for your smelting operations. Supports both "I have a pit" mode (calculate resources needed) and "I need charcoal" mode (find suggested pit size). Includes burn time calculations in both game and real-world minutes, an interactive 3D pit preview, and support for shareable calculator URLs.

## Shareable Recipe URLs

Both calculators support URL-encoded state so you can share exact setups with others.

- Use the `Share recipe` button in the calculator sidebar to copy the current setup URL.
- Opening that URL restores calculator selections automatically.
- URL format is route-aware, for example: `#alloying?a=tin_bronze&n=10&Copper=90.0&Tin=10.0`, `#casting?m=copper&n=10`, and `#usage?Copper=100&Tin=50`.
- The "have" mode is encoded as `d=h` with per-metal nugget counts so shared links preserve the calculation direction.
- The sharing system is extensible via per-route codecs registered through `src/lib/url-state.ts`.

### Feedback Form

Send feedback from a dedicated in-app page without creating an account. Submissions are handled by Netlify Forms with spam filtering, minimal required fields, and a privacy acknowledgement.

## How to Use

1. Run `npm install` to install dependencies
2. Start the development server with `npm run dev`
3. Open the provided local URL in your browser
4. Navigate to the desired calculator using the in-app navigation
5. Optionally open settings from the header to customize theme, font family, UI scale, and help-text visibility
6. For alloys: select your alloy type and adjust percentages to see exact nuggets needed
7. For metals: select your metal and target ingots to see nuggets required
8. Use the mode toggle to switch between "I need ingots" and "I have nuggets" in either calculator
9. Use the Usage Finder to add metals from your inventory and see every recipe you can craft

## Development

- `npm run dev`: start a hot-reloading development server (default port 5173)
- `npm run build`: generate an optimized production build
- `npm run preview`: serve the production build locally for verification
- `npm run lint`: run ESLint checks for TypeScript sources

## Project Structure

```shell
VintageStoryCalculator/             # Root directory
├── .github/                        # Issue templates and repo automation
├── index.html                      # Vite entry point
├── package.json                    # Project configuration and scripts
├── src/                            # Svelte application source
│   ├── App.svelte                  # Root layout and navigation
│   ├── components/                 # Reusable UI components
│   │   ├── calculator-card.svelte
│   │   ├── feedback-form.svelte
│   │   ├── mode-toggle.svelte
│   │   ├── number-input.svelte
│   │   ├── pit-preview.svelte
│   │   ├── result-display.svelte
│   │   ├── select-input.svelte
│   │   ├── share-button.svelte
│   │   ├── settings-modal.svelte
│   │   ├── stack-plan-panel.svelte
│   │   └── temperature-display.svelte
│   ├── data/                       # Game data files
│   │   ├── alloys.json             # Alloy recipes and definitions
│   │   ├── charcoal.json           # Charcoal pit constants and yield data
│   │   ├── constants.json          # Shared game constants and fuel data
│   │   ├── fuels.json              # Fuel definitions and burn times
│   │   └── metals.json             # Metal definitions
│   ├── lib/                        # Shared utilities
│   │   ├── calculations.ts         # Pure calculator helpers
│   │   ├── charcoal.ts             # Charcoal calculation and pit planning helpers
│   │   ├── constants.ts            # Typed constants exports
│   │   ├── fuels.ts                # Typed fuel definitions
│   │   ├── numberFormatting.ts     # Shared numeric formatting helpers
│   │   ├── stack-display.ts        # Process and stack display labels
│   │   ├── stack-plan.ts           # Stack breakdown helper
│   │   ├── url-state.ts            # Share URL codec registry and parsing helpers
│   │   ├── smelting/               # Smelting planning and allocation helpers
│   │   │   ├── allocation.ts
│   │   │   ├── index.ts
│   │   │   ├── planner.ts
│   │   │   └── types.ts
│   │   └── version.ts              # Changelog parser
│   ├── main.ts                     # Application bootstrap
│   ├── stores/                     # Svelte stores
│   │   ├── alloyCalculator.ts      # Alloying calculator store
│   │   ├── charcoalCalculator.ts   # Charcoal calculator store
│   │   ├── metalCalculator.ts      # Casting calculator store
│   │   ├── settings.ts             # Persistent UI settings store
│   │   ├── usageFinder.ts          # Usage Finder inventory and results store
│   │   ├── share/                  # URL sharing codecs per calculator
│   │   │   ├── alloyCodec.ts
│   │   │   ├── charcoalCodec.ts
│   │   │   ├── index.ts
│   │   │   ├── metalCodec.ts
│   │   │   └── usageCodec.ts
│   │   └── theme.ts                # Theme store
│   ├── types/                      # Shared TypeScript interfaces
│   │   ├── components.ts           # Component prop and event contracts
│   │   └── index.ts                # Data and calculation types
│   └── routes/                     # Route-aligned components
│       ├── AlloyingCalculator.svelte
│       ├── CastingCalculator.svelte
│       ├── CharcoalCalculator.svelte
│       ├── Feedback.svelte
│       ├── Home.svelte
│       ├── Privacy.svelte
│       └── UsageFinder.svelte
├── tsconfig.json                   # TypeScript configuration
├── .eslintrc.cjs                   # ESLint configuration
├── styles/                         # Shared styling
│   ├── base.css
│   ├── calculator.css              # Calculator style entrypoint importing modular partials
│   ├── calculator/
│   │   ├── layout.css
│   │   ├── responsive.css
│   │   ├── share-button.css
│   │   └── stack.css
│   ├── components.css
│   ├── layout.css
│   └── themes.css
├── CHANGELOG.md                    # Release notes
├── LICENSE                         # MIT License
└── README.md                       # Project overview
```

## Browser Support

Works in all modern web browsers that support ES6+ JavaScript features.

## Contributing

See the [CONTRIBUTING][contributing] file for contribution guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE][license] file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes and release history.

## Links

- [Vintage Story Official Website](https://www.vintagestory.at/)

<!-- Files -->
[contributing]: ./CONTRIBUTING.md
[license]: ./LICENSE
[changelog]: ./CHANGELOG.md
<!-- Badges -->
[release-badge]: https://img.shields.io/github/release/D-Heger/VintageStoryCalculator.svg
[netlify-badge]: https://api.netlify.com/api/v1/badges/3da43ce5-7b01-468a-a86c-4b6f90933b76/deploy-status
[license-badge]: https://img.shields.io/github/license/D-Heger/VintageStoryCalculator.svg
[changelog-badge]: https://img.shields.io/github/v/release/D-Heger/VintageStoryCalculator.svg?label=changelog&include_prereleases&sort=semver
<!-- Links -->
[release-link]: https://github.com/D-Heger/VintageStoryCalculator/releases
[netlify-link]: https://app.netlify.com/sites/kaleidoscopic-kitsune-48847d/deploys?branch=release
