#!/usr/bin/env node
const { promisify } = require('util');
const writeFile = promisify(require('fs').writeFile);

const { version } = require('./package.json');
const bwr = require('./bower.json');

writeFile('./bower.json', `${JSON.stringify({ ...bwr, version }, null, 2)}\n`, 'utf8')
  .catch(err => {
    throw err;
  });
