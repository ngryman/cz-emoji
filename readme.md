# cz-gamedev

> Commitizen adapter formatting commit messages for game development.

**cz-gamedev** allows you to easily use emojis in your commits using [commitizen] focused on a gamedev scope of project.

```sh
? Select the type of change you are committing: (Use arrow keys)
❯ feature   🌟  A new feature
  fix       🐞  A bug fix
  docs      📚  Documentation change
  refactor  🎨  A code refactoring change
  chore     🔩  A chore change
```

## Install

**Globally**

```bash
npm install --global cz-gamedev

# set as default adapter for your projects
echo '{ "path": "cz-gamedev" }' > ~/.czrc
```

**Locally**

```bash
npm install --save-dev cz-gamedev
```

Add this to your `package.json`:

```json
"config": {
  "commitizen": {
    "path": "cz-gamedev"
  }
}
```

## Usage

```sh
$ git cz
```

## Customization

By default `cz-gamedev` comes ready to run out of the box. Uses may vary, so there are a few configuration options to allow fine tuning for project needs.

### How to

Configuring `cz-gamedev` can be handled in the users home directory (`~/.czrc`) for changes to impact all projects or on a per project basis (`package.json`). Simply add the config property as shown below to the existing object in either of the locations with your settings for override.

```json
{
  "config": {
    "cz-gamedev": {}
  }
}
```

### Configuration Options

#### Types

By default `cz-gamedev` comes preconfigured with the [Gitmoji](https://gitmoji.carloscuesta.me/) types.

An [Inquirer.js] choices array:

```json
{
  "config": {
    "cz-gamedev": {
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

#### Scopes

An [Inquirer.js] choices array:

```json
{
  "config": {
    "cz-gamedev": {
      "scopes": ["home", "accounts", "ci"]
    }
  }
}
```

#### Symbol

A boolean value that allows for an using a unicode value rather than the default of [Gitmoji](https://gitmoji.carloscuesta.me/) markup in a commit message. The default for symbol is false.

```json
{
  "config": {
    "cz-gamedev": {
      "symbol": true
    }
  }
}
```

#### Skip Questions

An array of questions you want to skip:

```json
{
  "config": {
    "cz-gamedev": {
      "skipQuestions": ["scope", "issues"]
    }
  }
}
```

You can skip the following questions: `scope`, `body`, and `issues`. The `type` and `subject` questions are mandatory.

#### Customize Questions

An object that contains overrides of the original questions:

```json
{
  "config": {
    "cz-gamedev": {
      "questions": {
        "body": "This will be displayed instead of original text"
      }
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
  extends: ['gitmoji'],
  parserPreset: {
    parserOpts: {
      headerPattern: /^(:\w*:)(?:\s)(?:\((.*?)\))?\s((?:.*(?=\())|.*)(?:\(#(\d*)\))?/,
      headerCorrespondence: ['type', 'scope', 'subject', 'ticket']
    }
  }
}
```

## License

MIT © [Ian Geier](https://github.com/Novvan)

[commitizen]: https://github.com/commitizen/cz-cli
[cz-emoji]: https://github.com/ngryman/cz-emoji
[inquirer.js]: https://github.com/SBoudrias/Inquirer.js/
