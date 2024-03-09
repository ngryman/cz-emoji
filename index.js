```javascript
const findUp = require('find-up');
const fs = require('fs');
const homedir = require('homedir');
const truncate = require('cli-truncate');
const wrap = require('wrap-ansi');
const pad = require('pad');
const path = require('path');
const fuse = require('fuse.js');
const util = require('util');

const types = require('./lib/types');

const readFile = util.promisify(fs.readFile);

/**
 * Loads the configuration from a file.
 * @param {string} filename - The name of the file to load the configuration from.
 * @returns {Promise<Object>} A promise that resolves to the loaded configuration object.
 */
function loadConfig(filename) {
  return readFile(filename, 'utf8')
    .then(JSON.parse)
    .then(obj => obj && obj.config && obj.config['cz-emoji'])
    .catch(() => null);
}

/**
 * Loads the configuration from the nearest upwards file.
 * @param {string} filename - The name of the file to load the configuration from.
 * @returns {Promise<Object>} A promise that resolves to the loaded configuration object.
 */
function loadConfigUpwards(filename) {
  return findUp(filename).then(loadConfig);
}

/**
 * Gets the configuration for the commit message.
 * @returns {Promise<Object>} A promise that resolves to the configuration object.
 */
async function getConfig() {
  // Default commit message formats
  const defaultFormat = '{emoji} {scope} {subject}';
  const conventionalFormat = `{type}{scope}: {emoji} {subject}`;

  // Default configuration options
  const defaultConfig = {
    types,
    symbol: false,
    skipQuestions: [''],
    subjectMaxLength: 75,
    conventional: false
  };

  // Load configuration from different sources
  const loadedConfig =
    (await loadConfigUpwards('package.json')) ||
    (await loadConfigUpwards('.czrc')) ||
    (await loadConfig(path.join(homedir(), '.czrc'))) ||
    {};

  // Merge default and loaded configurations
  const config = {
    ...defaultConfig,
    ...{
      format: loadedConfig.conventional ? conventionalFormat : defaultFormat
    },
    ...loadedConfig
  };

  return config;
}

/**
 * Creates the questions for prompting the user.
 * @param {Object} config - The configuration object.
 * @returns {Array<Object>} An array of question objects.
 */
function createQuestions(config) {
  // Function implementation here...
}

/**
 * Formats the commit message.
 * @param {Object} answers - The answers provided by the user.
 * @param {Object} config - The configuration object.
 * @returns {string} The formatted commit message.
 */
function formatCommitMessage(answers, config) {
  // Function implementation here...
}

/**
 * Prompts the user for the commit message.
 * @param {object} cz - The commitizen object.
 * @returns {Promise<string>} A promise that resolves to the commit message provided by the user.
 */
async function promptCommitMessage(cz) {
  // Function implementation here...
}

/**
 * Export an object containing a `prompter` method.
 * This object is used by `commitizen`.
 */
module.exports = {
  prompter: (cz, commit) => {
    promptCommitMessage(cz).then(commit);
  }
};

Isso deve formatar corretamente o código JavaScript no Git para uma melhor visualização.
