const findUp = require('find-up')
const fs = require('fs')
const homedir = require('homedir')
const truncate = require('cli-truncate')
const wrap = require('wrap-ansi')
const pad = require('pad')
const path = require('path')
const fuse = require('fuse.js')
const util = require('util')

const readFile = util.promisify(fs.readFile)

const types = require('./lib/types')

function loadConfig(filename) {
  return readFile(filename, 'utf8')
    .then(JSON.parse)
    .then(obj => obj && obj.config && obj.config['cz-emoji'])
    .catch(() => null)
}

function loadConfigUpwards(filename) {
  return findUp(filename).then(loadConfig)
}

async function getConfig() {
  const defaultConfig = {
    types,
    symbol: false,
    skipQuestions: [''],
    subjectMaxLength: 75,
    conventional: false
  }

  const config =
    (await loadConfigUpwards('package.json')) ||
    (await loadConfigUpwards('.czrc')) ||
    (await loadConfig(path.join(homedir(), '.czrc')))

  return { ...defaultConfig, ...config }
}

function getEmojiChoices({ types, symbol }) {
  const maxNameLength = types.reduce(
    (maxLength, type) => (type.name.length > maxLength ? type.name.length : maxLength),
    0
  )

  return types.map(choice => ({
    name: `${pad(choice.name, maxNameLength)}  ${choice.emoji}  ${choice.description}`,
    value: {
      emoji: symbol ? `${choice.emoji} ` : choice.code,
      name: choice.name
    },
    code: choice.code
  }))
}

function formatScope(scope) {
  return scope ? `(${scope})` : ''
}

function formatHead({ type, scope, subject }, config) {
  const prelude = config.conventional
    ? `${type.name}${formatScope(scope)}: ${type.emoji}`
    : `${type.emoji} ${formatScope(scope)}`

  return `${prelude} ${subject}`
}

function formatIssues(issues) {
  return issues ? 'Closes ' + (issues.match(/#\d+/g) || []).join(', closes ') : ''
}

/**
 * Create inquier.js questions object trying to read `types` and `scopes` from the current project
 * `package.json` falling back to nice default :)
 *
 * @param {Object} config Result of the `getConfig` returned promise
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
      source: (_, query) => Promise.resolve(query ? fuzzy.search(query) : choices)
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
      maxLength: config.subjectMaxLength,
      filter: (subject, answers) => formatHead({ ...answers, subject }, config)
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
      name: 'breakingBody',
      message:
        'A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself:\n',
      when: !config.skipQuestions.includes('breaking')
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

  const head = truncate(answers.subject, columns)
  const body = wrap(answers.body || '', columns)
  const breaking =
    answers.breakingBody && answers.breakingBody.trim().length !== 0
      ? wrap(`BREAKING CHANGE: ${answers.breakingBody.trim()}`, columns)
      : ''
  const footer = formatIssues(answers.issues)

  return [head, body, breaking, footer]
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

    getConfig()
      .then(createQuestions)
      .then(cz.prompt)
      .then(format)
      .then(commit)
  }
}
