# checklib

<img alt="NPM Downloads" src="https://img.shields.io/npm/dm/check-libraries?style=for-the-badge"> <img alt="NPM Version" src="https://img.shields.io/npm/v/check-libraries?style=for-the-badge"> <img alt="NPM License" src="https://img.shields.io/npm/l/check-libraries?style=for-the-badge"> <img alt="NPM Unpacked Size" src="https://img.shields.io/npm/unpacked-size/check-libraries?style=for-the-badge">

Simple command-line tool designed to check if the linked libraries in your HTML files are up to date. It currently supports following cdn providers:

- [cdnjs](https://cdnjs.com/)
- [jsdelivr](https://www.jsdelivr.com/)
- [unpkg](https://unpkg.com/)

<img src="https://i.imgur.com/OxfsXdm.png">

## Installation

```bash
    $ npm install -g check-libraries
```

## Usage

```bash
    $ checklib <options>
```

## Options

- `-v, --version` - output the version number
- `-h, --help` - output usage information
- `-p --path <path>` - path to the html file. Use `--warnings-only` to only show warnings about outdated libraries

## Contributing

Pull requests are welcome. Feel free to `fork` this repository and contribute.

## License

Code is licensed under [MIT](https://choosealicense.com/licenses/mit/) license.
