#!/usr/bin/env node

'use strict';

/**
 * Normalize the Japanese corpus. Run before anything else.
 *
 * Then convert `corpus/ja.txt` to Shift-JIS.
 */

var fs = require('fs');
var jaNormalize = require('natural').normalize_ja;

var jaCorpus = '' + fs.readFileSync('./corpus/ja-utf8.txt', {encoding: 'utf8'});

jaCorpus = jaCorpus.split('\r\n');
jaCorpus = jaCorpus.map(function(sentence) {
  return jaNormalize(sentence);
});
jaCorpus = jaCorpus.join('\r\n');

fs.writeFileSync('./corpus/ja.txt', jaCorpus, {encoding: 'utf8'});
