# Vintage Story Calculator

[![License][license-badge]][license]
[![Release][release-badge]][release-link]
[![Changelog][changelog-badge]][changelog]
[![Netlify Status][netlify-badge]][netlify-link]

A modern, Svelte-powered calculator application designed to assist players of Vintage Story with various game calculations, including alloy recipes and resource management.

Visit now at: [vintagecalc.eu](https://vintagecalc.eu)

## Roadmap

Planned features and improvements include (but are not limited to):

- Claywork calculator: compute clay needed for bricks, vessels, pots, and molds by target count
- Brick blocks calculator: Calculate resource requirements for the amount of brick blocks desired
- Glass calculator: calculate ingredients and fuel for the desired amount of glass
- Smelting planner: total input (ore and fuel) for ingots, including iron and steel blooms
- Bloomery estimator: number of bloomeries required for a target output and the bricks needed to build them
- XSkills compatibility: adjust calculations based on relevant skill perks
- Mobile UX: fix responsive CSS and improve small‑screen layout

## Available Tools

### Alloying Calculator

Calculate the exact amounts of metals needed to create your desired alloy. Supports all alloys and solders in Vintage Story. Now includes smelting temperature information for each alloy.

### Casting Calculator

Calculate the number of ore nuggets needed to cast metal ingots in a crucible. Supports all 8 castable metals and shows smelting temperatures as well as ore source information.

## How to Use

1. Run `npm install` to install dependencies
2. Start the development server with `npm run dev`
3. Open the provided local URL in your browser
4. Navigate to the desired calculator using the in-app navigation
5. Optionally open settings from the header to customize theme, font family, UI scale, and help-text visibility
6. For alloys: select your alloy type and adjust percentages to see exact nuggets needed
7. For metals: select your metal and target ingots to see nuggets required

## Development

- `npm run dev`: start a hot-reloading development server (default port 5173)
- `npm run build`: generate an optimized production build
- `npm run preview`: serve the production build locally for verification
- `npm run lint`: run ESLint checks for TypeScript sources

### Feedback, Feature, and Bug Intake

The header includes a dedicated support panel button. Inside the panel, users can switch between:

- Feature requests
- General feedback
- Bug reports

Each flow opens an in-app form with two submission options:

- **GitHub account (recommended)**: opens a prefilled GitHub issue form in a new tab
- **Anonymous**: submits via Netlify Function and creates a GitHub issue through a bot token

For anonymous submissions, configure these environment variables in Netlify:

- `GITHUB_TOKEN` (required): token with permission to create issues on the repository
- `GITHUB_OWNER` (optional, defaults to `D-Heger`)
- `GITHUB_REPO` (optional, defaults to `VintageStoryCalculator`)

Anonymous reporters are informed they must check issue progress manually unless they voluntarily provide contact info.

## Project Structure

```shell
VintageStoryCalculator/         # Root directory
├── .github/                    # Issue templates and repo automation
├── index.html                  # Vite entry point
├── package.json                # Project configuration and scripts
├── src/                        # Svelte application source
│   ├── App.svelte              # Root layout and navigation
│   ├── components/             # Reusable UI components
│   │   ├── calculator-card.svelte
│   │   ├── number-input.svelte
│   │   ├── result-display.svelte
│   │   ├── select-input.svelte
│   │   ├── settings-modal.svelte
│   │   └── temperature-display.svelte
│   ├── data/                   # Game data files
│   │   ├── alloys.json         # Alloy recipes and definitions
│   │   ├── constants.json      # Shared game constants and fuel data
│   │   ├── fuels.json          # Fuel definitions and burn times
│   │   └── metals.json         # Metal definitions
│   ├── lib/                    # Shared utilities
│   │   ├── calculations.ts     # Pure calculator helpers
│   │   ├── constants.ts        # Typed constants exports
│   │   ├── fuels.ts            # Typed fuel definitions
│   │   ├── stack-display.ts    # Process and stack display labels
│   │   ├── stack-plan.ts       # Stack breakdown helper
│   │   ├── smelting/           # Smelting planning and allocation helpers
│   │   │   ├── allocation.ts
│   │   │   ├── index.ts
│   │   │   ├── planner.ts
│   │   │   └── types.ts
│   │   └── version.ts          # Changelog parser
│   ├── main.ts                 # Application bootstrap
│   ├── stores/                 # Svelte stores
│   │   ├── alloyCalculator.ts  # Alloying calculator store
│   │   ├── metalCalculator.ts  # Casting calculator store
│   │   ├── settings.ts         # Persistent UI settings store
│   │   └── theme.ts            # Theme store
│   ├── types/                  # Shared TypeScript interfaces
│   │   ├── components.ts       # Component prop and event contracts
│   │   └── index.ts            # Data and calculation types
│   └── routes/                 # Route-aligned components
│       ├── AlloyingCalculator.svelte
│       ├── CastingCalculator.svelte
│       └── Home.svelte
├── tsconfig.json               # TypeScript configuration
├── .eslintrc.cjs               # ESLint configuration
├── styles/                     # Shared styling
│   ├── base.css
│   ├── calculator.css
│   ├── components.css
│   ├── layout.css
│   └── themes.css
├── CHANGELOG.md                # Release notes
├── LICENSE                     # MIT License
└── README.md                   # Project overview
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
