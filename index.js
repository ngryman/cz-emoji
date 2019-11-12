const fs = require('fs')
const readPkg = require('read-pkg-up')
const truncate = require('cli-truncate')
const wrap = require('wrap-ansi')
const pad = require('pad')
const path = require('path')
const fuse = require('fuse.js')
const homeDir = require('home-dir')
const util = require('util')

const types = require('./lib/types')

const defaultConfig = {
  types,
  symbol: false,
  skipQuestions: [''],
  subjectMaxLength: 75
}

function getEmojiChoices({ types, symbol }) {
  const maxNameLength = types.reduce(
    (maxLength, type) => (type.name.length > maxLength ? type.name.length : maxLength),
    0
  )

  return types.map(choice => ({
    name: `${pad(choice.name, maxNameLength)}  ${choice.emoji}  ${choice.description}`,
    value: symbol ? choice.emoji : choice.code,
    code: choice.code
  }))
}

async function loadConfig() {
  const getConfig = obj => obj && obj.config && obj.config['cz-emoji']

  const readFromPkg = () => readPkg().then(res => getConfig(res.pkg))

  const readFromCzrc = dir =>
    util
      .promisify(fs.readFile)(dir, 'utf8')
      .then(JSON.parse, () => null)
      .then(getConfig)

  const readFromLocalCzrc = () =>
    readPkg().then(res => readFromCzrc(`${path.dirname(res.path)}/.czrc`))

  const readFromGlobalCzrc = () => readFromCzrc(homeDir('.czrc'))

  const config =
    (await readFromPkg()) || (await readFromLocalCzrc()) || (await readFromGlobalCzrc())

  return { ...defaultConfig, ...config }
}

function formatScope(scope) {
  return scope ? `(${scope})` : ''
}

function formatHead({ type, scope, subject }) {
  return [type, formatScope(scope), subject]
    .filter(Boolean)
    .map(s => s.trim())
    .join(' ')
}

function formatIssues(issues) {
  return issues ? 'Closes ' + (issues.match(/#\d+/g) || []).join(', closes ') : ''
}

function renderEmoji(type) {
  return types.find(t => t.emoji === type || t.code === type).emoji
}

/**
 * Create inquier.js questions object trying to read `types` and `scopes` from the current project
 * `package.json` falling back to nice default :)
 *
 * @param {Object} config Result of the `loadConfig` returned promise
 * @return {Array} Return an array of `inquier.js` questions
 * @private
 */
function createQuestions(config) {
  const choices = getEmojiChoices(config)

  const fuzzy = new fuse(choices, {
    shouldSort: true,
    threshold: 0.4,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ['name', 'code']
  })

  const questions = [
    {
      type: 'autocomplete',
      name: 'type',
      message:
        config.questions && config.questions.type
          ? config.questions.type
          : "Select the type of change you're committing:",
      source: (answersSoFar, query) => {
        return Promise.resolve(query ? fuzzy.search(query) : choices)
      }
    },
    {
      type: config.scopes ? 'list' : 'input',
      name: 'scope',
      message:
        config.questions && config.questions.scope ? config.questions.scope : 'Specify a scope:',
      choices: config.scopes && [{ name: '[none]', value: '' }].concat(config.scopes),
      when: !config.skipQuestions.includes('scope')
    },
    {
      type: 'maxlength-input',
      name: 'subject',
      message:
        config.questions && config.questions.subject
          ? config.questions.subject
          : 'Write a short description:',
      maxLength: config.subjectMaxLength
    },
    {
      type: 'input',
      name: 'body',
      message:
        config.questions && config.questions.body
          ? config.questions.body
          : 'Provide a longer description:',
      when: !config.skipQuestions.includes('body')
    },
    {
      type: 'input',
      name: 'issues',
      message:
        config.questions && config.questions.issues
          ? config.questions.issues
          : 'List any issue closed (#1, #2, ...):',
      when: !config.skipQuestions.includes('issues')
    }
  ]

  return questions
}

/**
 * Format the git commit message from given answers.
 *
 * @param {Object} answers Answers provide by `inquier.js`
 * @return {String} Formated git commit message
 */
function format(answers) {
  const { columns } = process.stdout

  const head = truncate(formatHead(answers), columns)
  const body = wrap(answers.body || '', columns)
  const footer = formatIssues(answers.issues)

  return [head, body, footer]
    .filter(Boolean)
    .join('\n\n')
    .trim()
}

/**
 * Export an object containing a `prompter` method. This object is used by `commitizen`.
 *
 * @type {Object}
 */
module.exports = {
  prompter: function(cz, commit) {
    cz.prompt.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))
    cz.prompt.registerPrompt('maxlength-input', require('inquirer-maxlength-input-prompt'))

    loadConfig()
      .then(createQuestions)
      .then(cz.prompt)
      .then(format)
      .then(commit)
  }
}
