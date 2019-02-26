# cz-emoji

> Commitizen adapter formatting commit messages using emojis.

**cz-emoji** allows you to easily use emojis in your commits using [commitizen].

```sh
? Select the type of change you are committing: (Use arrow keys)
❯ feature   🌟  A new feature
  fix       🐞  A bug fix
  docs      📚  Documentation change
  refactor  🎨  A code refactoring change
  chore     🔩  A chore change
```

## Install

```bash
npm install --global cz-emoji

# set as default adapter for your projects
echo '{ "path": "cz-emoji" }' > ~/.czrc
```

## Usage

```sh
$ git cz
```

## Customize

By default `cz-emoji` comes preconfigured with the [Gitmoji](https://gitmoji.carloscuesta.me/) types.

But you can customize things on a project basis by adding a configuration section in your `package.json`:

```json
{
  "config": {
    "cz-emoji": {}
  }
}
```

### Types

An [Inquirer.js] choices array:

```json
{
  "config": {
    "cz-emoji": {
      "types": [
        {
          "emoji": "🌟",
          "code": ":star2:",
          "description": "A new feature",
          "name": "feature"
        }
      ]
    }
  }
}
```

The value `property` must be the emoji itself.

### Scopes

An [Inquirer.js] choices array:

```json
{
  "config": {
    "cz-emoji": {
      "scopes": ["home", "accounts", "ci"]
    }
  }
}
```

### Symbol

A boolean value that allows for an using a unicode value rather than the default of gitmoji markup in a commit message. The default for symbol is false.

```json
{
  "config": {
    "cz-emoji": {
      "symbol": true
    }
  }
}
```

## Examples

- https://github.com/Falieson/TRAM

## Commitlint

Commitlint can be set to work with this package by leveraging the package https://github.com/arvinxx/commitlint-config-gitmoji.

```bash
npm install --save-dev commitlint-config-gitmoji
```

_commitlint.config.js_

```js
module.exports = {
  extends: ["gitmoji"],
  parserPreset: {
    parserOpts: {
      headerPattern: /^(:\w*:)(?:\s)(?:\((.*?)\))?\s((?:.*(?=\())|.*)(?:\(#(\d*)\))?/,
      headerCorrespondence: ["type", "scope", "subject", "ticket"]
    }
  }
};
```

## License

MIT © [Nicolas Gryman](http://ngryman.sh)

[commitizen]: https://github.com/commitizen/cz-cli
[inquirer.js]: https://github.com/SBoudrias/Inquirer.js/
