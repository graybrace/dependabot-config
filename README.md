# dependabot-config
Utilities for creating and managing Dependabot config files

## Usage

`depc create --p <npm|maven|...> --i <monthly|weekly|daily> --ignore.dir <DIR...> --ignore.path <PATH...>`

Create a Dependabot config YAML file in `.github/dependabot.yml`
- `--p --packageEcosystem`: Package ecosystems to support, out of `github-actions`, `npm`, `pip`, `maven`
- `--int --schedule.interval`: Dependabot update frequency (`monthly`, `weekly`, or `daily`)
- `--ignore.dir`: Pattern(s) of directories to ignore for traversal
- `--ignore.path`: Pattern(s) of file paths to ignore for checking for package files

Patterns must be compatible with [minimatch](https://github.com/isaacs/minimatch)

## License
Licensed under MIT
