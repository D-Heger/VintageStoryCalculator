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
5. For alloys: select your alloy type and adjust percentages to see exact nuggets needed
6. For metals: select your metal and target ingots to see nuggets required

## Development

- `npm run dev`: start a hot-reloading development server (default port 5173)
- `npm run build`: generate an optimized production build
- `npm run preview`: serve the production build locally for verification

## Project Structure

```shell
VintageStoryCalculator/         # Root directory
├── .github/                    # Issue templates and repo automation
├── index.html                  # Vite entry point
├── package.json                # Project configuration and scripts
├── scripts/                    # Framework-agnostic logic
│   ├── alloy_calculator.js     # Alloy calculator engine
│   └── metal_calculator.js     # Casting calculator engine
├── src/                        # Svelte application source
│   ├── App.svelte              # Root layout and navigation
│   ├── data/                   # Game data files
│   │   ├── alloys.json         # Alloy recipes and definitions
│   │   └── metals.json         # Metal definitions
│   ├── lib/                    # Shared utilities
│   │   └── version.js          # Changelog parser
│   ├── main.js                 # Application bootstrap
│   └── routes/                 # Route-aligned components
│       ├── AlloyingCalculator.svelte
│       ├── CastingCalculator.svelte
│       └── Home.svelte
├── styles/                     # Shared styling
│   └── styles.css
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
