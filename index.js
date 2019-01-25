'use strict'

const readPkg = require('read-pkg-up')
const truncate = require('cli-truncate')
const wrap = require('wrap-ansi')
const pad = require('pad')
const types = require('./lib/types')

function getEmojiChoices(types) {
  const maxNameLength = types.reduce(
    (maxLength, type) => (type.name.length > maxLength ? type.name.length : maxLength
  ), 0)

  return types.map(choice => ({
    name: `${pad(choice.name, maxNameLength)}  ${choice.emoji}  ${choice.description}`,
    value: choice.code
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
let appendsNames = [];

function createQuestions(res) {
  const config = res.pkg.config || {}
  const emojiConfig = config['cz-emoji-xg'] || {};
  const appends = emojiConfig.appends || [];
  appendsNames = appends.map(function (item) { return item.name;});

  return [
    {
      type: 'list',
      name: 'type',
      message: "Select the type of change you're committing:",
      choices: getEmojiChoices(emojiConfig.types || types)
    }].concat(appends, [
    {
      type: emojiConfig.scopes ? 'list' : 'input',
      name: 'scope',
      message: 'Specify the affected scope (pages or files ...):',
      choices: emojiConfig.scopes && [{ name: '[none]', value: '' }].concat(emojiConfig.scopes)
    },
    {
      type: 'input',
      name: 'subject',
      message: 'Write a short description:'
    },
    // {
    //   type: 'input',
    //   name: 'issues',
    //   message: 'List any issue closed:'
    // },
    {
      type: 'input',
      name: 'breaking',
      message: 'List any breaking changes:'
    },
    {
      type: 'input',
      name: 'body',
      message: 'Provide a longer description:'
    }
    ]);
}

/**
 * Format the git commit message from given answers.
 *
 * @param {Object} answers Answers provide by `inquier.js`
 * @return {String} Formated git commit message
 */
function format(answers) {

  // parentheses are only needed when a scope is present
  const scope = answers.scope ? '(' + answers.scope.trim() + '): ' : ''

  // concat appends
  let appends = '';
  if (appendsNames.length) {
    appendsNames.forEach(function (item) {
      appends += '[' + answers[item] + ']'
    });
  }

  // build head line and limit it to 100
  let commit = truncate(answers.type + appends + scope + answers.subject.trim(), 100)

  // wrap body at 100
  const body = wrap(answers.body, 100);
  if (body) {
    commit += '\n\n' + body
  }

  // const issues = wrap(answers.issues, 100);
  // if (issues) {
  //   commit += '\n\n' + issues
  // }

  const breaking = wrap(answers.breaking, 100);
  if (breaking) {
    commit += '\n\nBREAKING CHANGE: ' + breaking
  }

  return (commit)
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
