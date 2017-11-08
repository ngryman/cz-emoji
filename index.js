'use strict'

const readPkg = require('read-pkg-up')
const truncate = require('cli-truncate')
const wrap = require('wrap-ansi')
const pad = require('pad')
const fuse = require('fuse.js')
const Promise = require('bluebird')
const types = require('./lib/types')

function getEmojiChoices(types, symbol) {
  const maxNameLength = types.reduce(
    (maxLength, type) => (type.name.length > maxLength ? type.name.length : maxLength
  ), 0)

  return types.map(choice => ({
    name: `${pad(choice.name, maxNameLength)}  ${choice.emoji}  ${choice.description}`,
    value: symbol ? choice.emoji : choice.code
  }))
}

/**
 * Create inquier.js questions object trying to read `types` and `scopes` from the current project
 * `package.json` falling back to nice default :)
 *
 * @param {Object} res Result of the `readPkg` returned promise
 * @return {Array} Return an array of `inquier.js` questions
 * @private
 */
function createQuestions(res) {
  const pkg = res.pkg || {}
  const config = pkg.config || {}
  const emojiConfig = config['cz-emoji'] || {}

  const choices = getEmojiChoices(emojiConfig.types || types, emojiConfig.symbol || false)
  const fuzzy = new fuse(choices, {
    keys: ['name'],
    shouldSort: true,
    threshold: 0.4,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 0
  })

  return [
    {
      type: 'autocomplete',
      name: 'type',
      message: "Select the type of change you're committing:",
      source: (ansersSoFar, query) => {
        if (!query) {
          return Promise.resolve(choices)
        }
        return Promise.resolve(fuzzy.search(query))
      }
    },
    {
      type: emojiConfig.scopes ? 'list' : 'input',
      name: 'scope',
      message: 'Specify a scope:',
      choices: emojiConfig.scopes && [{ name: '[none]', value: '' }].concat(emojiConfig.scopes)
    },
    {
      type: 'input',
      name: 'subject',
      message: 'Write a short description:'
    },
    {
      type: 'input',
      name: 'issues',
      message: 'List any issue closed:'
    },
    {
      type: 'input',
      name: 'body',
      message: 'Provide a longer description:'
    }
  ]
}

/**
 * Format the git commit message from given answers.
 *
 * @param {Object} answers Answers provide by `inquier.js`
 * @return {String} Formated git commit message
 */
function format(answers) {
  // parentheses are only needed when a scope is present
  const scope = answers.scope ? '(' + answers.scope.trim() + ') ' : ''

  // build head line and limit it to 100
  const head = truncate(answers.type + ' ' + scope + answers.subject.trim(), 100)

  // wrap body at 100
  const body = wrap(answers.body, 100)

  return (head + '\n\n' + body)
}

/**
 * Export an object containing a `prompter` method. This object is used by `commitizen`.
 *
 * @type {Object}
 */
module.exports = {
  prompter: function(cz, commit) {
    cz.prompt.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))
    readPkg()
      .then(createQuestions)
      .then(cz.prompt)
      .then(format)
      .then(commit)
  }
}
