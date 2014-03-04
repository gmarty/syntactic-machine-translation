#!/usr/bin/env node

'use strict';

/**
 * Tag the JA corpus:
 * ```bash
 * "C:\Program Files (x86)\ChaSen\chasen.exe" -F "%M|%m|%U(%P-)\n" C:\Users\FCHGMX\Dropbox\Dev\www\js-demo\machine-translation\corpus\ja.txt > C:\Users\FCHGMX\Dropbox\Dev\www\js-demo\machine-translation\corpus-tagged\ja-raw.txt
 * ```
 *
 * Convert `corpus-tagged\ja-raw.txt` to UTF-8.
 *
 * Run this script.
 */

var table = require('./utils/chasen2jspos-map.json');

var fs = require('fs');
var _ = require('lodash');

var jaPos = '' + fs.readFileSync('./corpus-tagged/ja-raw.txt', {encoding: 'utf8'});
var jaPosString = '';

jaPos = jaPos.split('\r\nEOS\r\n');
jaPos = jaPos.map(function(sentence) {
  sentence = sentence.split('\r\n');
  sentence = sentence.map(function(word) {
    word = word.split('|');
    var pos = word[2];
    pos = table[pos] ? table[pos] : 'Unknown';
    return pos;
  });

  sentence = sentence.join('|');

  jaPosString += sentence + '\n';

  return sentence;
});

jaPosString = jaPosString.trim();

fs.writeFileSync('./corpus-tagged/ja.json', JSON.stringify(jaPos, null, '  '), {encoding: 'utf8'});
fs.writeFileSync('./corpus-tagged/ja.txt', jaPosString, {encoding: 'utf8'});
