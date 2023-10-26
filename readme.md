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

**Globally**

```bash
npm install --global cz-emoji

# set as default adapter for your projects
echo '{ "path": "cz-emoji" }' > ~/.czrc
```

**Locally**

```bash
npm install --save-dev cz-emoji
```

Add this to your `package.json`:

```json
"config": {
  "commitizen": {
    "path": "cz-emoji"
  }
}
```

ℹ️ _`pnpm` requires you to specify `node_modules/cz-emoji`._

## Usage

```sh
$ git cz
```

## Customization

By default `cz-emoji` comes ready to run out of the box. Uses may vary, so there are a few configuration options to allow fine tuning for project needs.

### How to

Configuring `cz-emoji` can be handled in the users home directory (`~/.czrc`) for changes to impact all projects or on a per project basis (`package.json`). Simply add the config property as shown below to the existing object in either of the locations with your settings for override.

```json
{
  "config": {
    "cz-emoji": {}
  }
}
```

### Configuration Options

#### Types

By default `cz-emoji` comes preconfigured with the [Gitmoji](https://gitmoji.carloscuesta.me/) types.

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

#### Scopes

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

#### Symbol

A boolean value that allows for an using a unicode value rather than the default of [Gitmoji](https://gitmoji.carloscuesta.me/) markup in a commit message. The default for symbol is false.

```json
{
  "config": {
    "cz-emoji": {
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
    "cz-emoji": {
      "skipQuestions": ["scope", "issues"]
    }
  }
}
```

You can skip the following questions: `scope`, `body`, `issues`, and `breaking`. The `type` and `subject` questions are mandatory.

#### Customize Questions

An object that contains overrides of the original questions:

```json
{
  "config": {
    "cz-emoji": {
      "questions": {
        "body": "This will be displayed instead of original text"
      }
    }
  }
}
```

#### Customize the subject max length

The maximum length you want your subject has

```json
{
  "config": {
    "cz-emoji": {
      "subjectMaxLength": 200
    }
  }
}
```

## Examples

- https://github.com/Falieson/TRAM

## Commitlint

Commitlint can be set to work with this package with the following configuration:

_commitlint.config.js_

```js
const pkg = require('./package.json')

// Check if the user has configured the package to use conventional commits.
const isConventional = pkg.config ? pkg.config['cz-emoji']?.conventional : false

// Regex for default and conventional commits.
const RE_DEFAULT_COMMIT = /^(?::.*:|(?:\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]))\s(?<emoji>\((?<scope>.*)\)\s)?.*$/gm
const RE_CONVENTIONAL_COMMIT = /^^(?<type>\w+)(?:\((?<scope>\w+)\))?\s(?<emoji>:.*:|(?:\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]))\s.*$/gm

module.exports = {
  rules: {
    'cz-emoji': [2, 'always']
  },
  plugins: [
    {
      rules: {
        'cz-emoji': ({ raw }) => {
          const isValid = isConventional
            ? RE_CONVENTIONAL_COMMIT.test(raw)
            : RE_DEFAULT_COMMIT.test(raw)

          const message = isConventional
            ? `Your commit message should follow conventional commit format.`
            : `Your commit message should be: <emoji> (<scope>)?: <subject>`

          return [isValid, message]
        }
      }
    }
  ]
}
```

_Let me know if you are interested in having the above configuration published
as a `commitlint` plugin._

## Other projects

- [Fauda](https://github.com/ngryman/fauda): configuration made simple.
- [Commitizen Emoji](https://github.com/ngryman/cz-emoji): Commitizen adapter formatting commit messages using emojis.
- [Reading Time](https://github.com/ngryman/reading-time): Medium's like reading time estimation.

## License

MIT © [Nicolas Gryman](http://ngryman.sh)

[commitizen]: https://github.com/commitizen/cz-cli
[inquirer.js]: https://github.com/SBoudrias/Inquirer.js/
