# Vintage Story Calculator

[![License][license-badge]][license]
[![Release][release-badge]][release-link]
[![Changelog][changelog-badge]][changelog]
[![Netlify Status][netlify-badge]][netlify-link]

A web-based (currently just) calculator application designed to assist players of Vintage Story with various game calculations, including alloy recipes and resource management.

## Available Tools

### Alloying Calculator

Calculate the exact amounts of metals needed to create your desired alloy. Supports all alloys and solders in Vintage Story.

## How to Use

1. Open [index.html][index] in your web browser
2. Navigate to the desired calculator from the home page
3. Select your alloy type and target number of ingots
4. Adjust the metal percentages using the sliders or input fields
5. View the calculated amounts of each metal needed

## Project Structure

```shell
VintageStoryCalculator/         # Root directory
├── .github/                    # GitHub configuration files
│   └── ISSUE_TEMPLATE/         # Issue templates
│       ├── config.yml          # Issue template configuration
│       └── bug_report.yml      # Bug report template
│       └── feature_request.yml # Feature request template
│       └── general_issue.yml   # General issue template
├── index.html                  # Main homepage
├── html/                       # Pages directory
│   └── alloying.html           # Alloying calculator page
├── scripts/                    # JavaScript files
│   ├── alloy_calculator.js     # Calculator logic
│   └── version_setter.js       # Version management
├── styles/                     # CSS styles
│   └── styles.css              # Application styling
└── LICENSE                     # MIT License
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
[index]: ./index.html
[contributing]: ./CONTRIBUTING.md
[license]: ./LICENSE
[changelog]: ./CHANGELOG.md
<!-- Badges -->
[release-badge]: https://img.shields.io/github/release/D-Heger/VintageStoryCalculator.svg
[netlify-badge]: https://api.netlify.com/api/v1/badges/3da43ce5-7b01-468a-a86c-4b6f90933b76/deploy-status
[license-badge]: https://img.shields.io/github/license/D-Heger/VintageStoryCalculator.svg
[changelog-badge]: https://img.shields.io/github/v/release/D-Heger/VintageStoryCalculator?include_prereleases&sort=semver
<!-- Links -->
[release-link]: https://github.com/D-Heger/VintageStoryCalculator/releases
[netlify-link]: https://app.netlify.com/sites/kaleidoscopic-kitsune-48847d/deploys?branch=release
