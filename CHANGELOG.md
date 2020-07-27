# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
## [2.1.1-beta] - YYYY-MM-DD

### Added
  - redis entities adapter?
  - documentation on how to extend operators
  - documentation on require mocks
  - what is require mocks (README at the end)?

## [2.1.0-beta] - YYYY-MM-DD

### Added
  - new step to assert context variables `the variable {variable} {op}`
  - negative operators: `does not contain`, `does not exist`, `does not match`, `isn't`
  - more tests to the memory entities adapter
  - `exists` operator tests

### Fixed
  - printing errors with unary operators (`exists` and `does not exist`)

### Changed
  - `Operator` and `OperatorError` interfaces
    - `Operator` now does not need unused `error` key
    - `OperatorError` now have optional `expected` key
    - `OperatorError` now have a new key `unary` which tells the error printer to ignore the expected value
      - Example for `exists` operator
        - Before: undefined is not truthy undefined
        - Now: undefined is not truthy
