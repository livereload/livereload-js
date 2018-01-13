import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import buble from 'rollup-plugin-buble'
import multiEntry from 'rollup-plugin-multi-entry'
import pkg from './package.json'

const bubleConfig = {
  exclude: ['node_modules/**'],
  transforms: { dangerousForOf: true }
}

export default [
  {
    input: 'lib/startup.js',
    output: { file: pkg.browser, format: 'iife', name: 'LiveReload' },
    plugins: [
      resolve(),
      commonjs(),
      buble(bubleConfig)
    ]
  },

  {
    input: 'lib/startup.js',
    external: ['ms'],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ],
    plugins: [
      buble(bubleConfig)
    ]
  },

  {
    input: 'test/*_test.js',
    output: {
      file: 'dist/livereload.test.js',
      format: 'cjs',
      intro: 'require("source-map-support").install();',
      sourcemap: true
    },
    plugins: [
      buble(bubleConfig),
      multiEntry()
    ],
    external: [ 'mocha', 'assert', 'url', 'punycode', 'util', 'jsdom' ],
  }
]
