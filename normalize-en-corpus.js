#!/usr/bin/env node

'use strict';

/**
 * Normalize the English corpus. Run before anything else.
 */

var fs = require('fs');
var enNormalize = require('./utils/en-normalizer.js');

var enCorpus = '' + fs.readFileSync('./corpus/en.txt', {encoding: 'utf8'});

enCorpus = enCorpus.split('\r\n');
enCorpus = enCorpus.map(function(sentence) {
  sentence = sentence.trim();
  sentence = enNormalize(sentence);
  return sentence;
});
enCorpus = enCorpus.join('\r\n');
enCorpus = enCorpus.trim();

fs.writeFileSync('./corpus/en.txt', enCorpus, {encoding: 'utf8'});
