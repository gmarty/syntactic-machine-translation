#!/usr/bin/env node

'use strict';

/**
 * Normalize the Japanese corpus. Run before anything else.
 *
 * Then convert `corpus/ja.txt` to Shift-JIS.
 */

var fs = require('fs');
var jaNormalize = require('natural').normalize_ja;
var jaNormalizeVerbs = require('./utils/ja-normalizer.js');

var jaCorpus = '' + fs.readFileSync('./corpus/ja-utf8.txt', {encoding: 'utf8'});

jaCorpus = jaCorpus.split('\n');
jaCorpus = jaCorpus.map(function(sentence) {
  sentence = sentence.trim();
  sentence = jaNormalize(sentence);
  //sentence = jaNormalizeVerbs(sentence);
  return sentence;
});
jaCorpus = jaCorpus.join('\r\n');
jaCorpus = jaCorpus.trim();

fs.writeFileSync('./corpus/ja.txt', jaCorpus, {encoding: 'utf8'});
