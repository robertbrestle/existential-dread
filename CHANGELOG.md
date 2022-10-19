# Changelog
All notable changes to this project will be documented in this file.

## [1.0.2] - 2022-10-19
### Added
- New splash image
- Phase II new levels
- Temporary variable `isGameSuccessful` for determining if a level was completed successfully

### Changed
- Replaced all `forEach` loops with `for`

### Fixed
- `updateDarkness()` now properly adds darkness on the first tick

## [1.0.1] - 2022-10-02
### Added
- Tile triggers
    - Supports buttons which remove specific tile types
    - Button tile state changes
- New levels
    - Tutorial
    - Phase II preview level
- Changelog file

### Changed
- Set background image on items to "glow"
    - render items with glow after darkness
- Added map file parameter for `resetGame()`
- Moved tile positions in sprite sheet

## [1.0.0] - 2020
### Added
- Initial port from Java to HTML5
- Sprite sheets
- Tile and Darkness properties to maps
- Base map editor configuration