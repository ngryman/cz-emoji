# cz-emoji

> Commitizen adapter formatting commit messages using emojis.


**cz-emoji-xg** allows you to easily use emojis in your commits using [commitizen].

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
npm install --global cz-emoji-xg

# set as default adapter for your projects
echo '{ "path": "cz-emoji-xg" }' > ~/.czrc
```

## Usage

```sh
$ git cz
```

## Customize

By default `cz-emoji-xg` comes preconfigured with the [Gitemoji](https://gitmoji.carloscuesta.me/) types.

But you can customize things on a project basis by adding a configuration section in your `package.json`:

```json
{
  "config": {
    "cz-emoji-xg": {}
  }
}
```

### Types

An [Inquirer.js] choices array:
```json
{
  "config": {
    "cz-emoji-xg": {
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
    "cz-emoji-xg": {
      "scopes": [
        "home",
        "accounts",
        "ci"
      ]
    }
  }
}
```

## Examples

 - https://github.com/Falieson/TRAM


[commitizen]: https://github.com/commitizen/cz-cli
[Inquirer.js]: https://github.com/SBoudrias/Inquirer.js/
