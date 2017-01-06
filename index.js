'use strict'

const readPkg = require('read-pkg-up')
const truncate = require('cli-truncate')
const wrap = require('wrap-ansi')
const types = require('./lib/types')

/**
 * Create inquier.js questions object trying to read `types` and `scopes` from the current project
 * `package.json` falling back to nice default :)
 *
 * @param {Object} res Result of the `readPkg` returned promise
 * @return {Array} Return an array of `inquier.js` questions
 * @private
 */
function createQuestions(res) {
  const config = res.pkg.config || {}
  const emojiConfig = config['cz-emoji'] || {}

  return [
    {
      type: 'list',
      name: 'type',
      message: "Select the type of change you're committing:",
      choices: emojiConfig.types || types
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
    readPkg()
      .then(createQuestions)
      .then(cz.prompt)
      .then(format)
      .then(commit)
  }
}
