'use strict'

const fs = require('fs')
const readPkg = require('read-pkg-up')
const truncate = require('cli-truncate')
const wrap = require('wrap-ansi')
const pad = require('pad')
const fuse = require('fuse.js')
const homeDir = require('home-dir')
const types = require('./lib/types')

const defaultConfig = {
  types,
  symbol: false,
  skipQuestions: ['']
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

function loadConfig() {
  const getConfig = obj => obj && obj.config && obj.config['cz-emoji']

  return readPkg()
    .then(({ pkg }) => {
      const config = getConfig(pkg)
      if (config) return config

      return new Promise((resolve, reject) => {
        fs.readFile(homeDir('.czrc'), 'utf8', (err, content) => {
          if (err) reject(err)
          const czrc = (content && JSON.parse(content)) || null
          resolve(getConfig(czrc))
        })
      })
    })
    .then(config => Object.assign({}, defaultConfig, config))
    .catch(() => defaultConfig)
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
      message: "Select the type of change you're committing:",
      source: (answersSoFar, query) => {
        return Promise.resolve(query ? fuzzy.search(query) : choices)
      }
    },
    {
      type: config.scopes ? 'list' : 'input',
      name: 'scope',
      message: 'Specify a scope:',
      choices: config.scopes && [{ name: '[none]', value: '' }].concat(config.scopes),
      when: !config.skipQuestions.includes('scope')
    },
    {
      type: 'input',
      name: 'subject',
      message: 'Write a short description:'
    },
    {
      type: 'input',
      name: 'body',
      message: 'Provide a longer description:',
      when: !config.skipQuestions.includes('body')
    },
    {
      type: 'input',
      name: 'issues',
      message: 'List any issue closed (#1, #2, ...):',
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
  const scope = answers.scope ? '(' + answers.scope.trim() + ') ' : ''
  const issues = answers.issues
    ? 'Closes ' + (answers.issues.match(/#\d+/g) || []).join(', closes ')
    : ''

  const head = truncate(answers.type + ' ' + scope + answers.subject.trim(), 100)
  const body = wrap(answers.body || '', 100)
  const footer = issues

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
    loadConfig()
      .then(createQuestions)
      .then(cz.prompt)
      .then(format)
      .then(commit)
  }
}
