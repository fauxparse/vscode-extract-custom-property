# Extract custom property

Replace a CSS value with a named custom property.

## Features

- Determines the default name based on the current CSS scope (supports nesting)
- Inserts the new custom property at the top of the current block

## Usage

Select the value you want to extract and activate the `Extract custom property` command.

## Known Issues

- Currently only available in CSS and SCSS files
- Only works when there is a selection active
- Doesn't do much (any) syntactic checking on what you've got selected

## Release Notes

### 1.0.0

Initial release
