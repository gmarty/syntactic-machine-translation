#!/usr/bin/env node

'use strict';

/**
 * Tag the JA corpus:
 * ```bash
 * "C:\Program Files (x86)\ChaSen\chasen.exe" -F "%U(%P-)|" C:\Users\FCHGMX\Dropbox\Dev\www\js-demo\machine-translation\corpus\ja.txt > C:\Users\FCHGMX\Dropbox\Dev\www\js-demo\machine-translation\corpus-tagged\ja-raw.txt
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

jaPos = jaPos.split('\r\n');
jaPos = jaPos.map(function(sentence) {
  sentence = sentence.replace(/\|$/, ''); // Remove the trailing pipe.
  sentence = sentence.split('|');
  sentence = sentence.map(function(word) {
    if (table[word]) {
      word = table[word];
    } else {
      word = 'Unknown';
    }
    return word;
  });

  sentence = sentence.join('|');

  jaPosString += sentence + '\n';

  return sentence;
});

jaPosString = jaPosString.trim();

fs.writeFileSync('./corpus-tagged/ja.json', JSON.stringify(jaPos, null, '  '), {encoding: 'utf8'});
fs.writeFileSync('./corpus-tagged/ja.txt', jaPosString, {encoding: 'utf8'});
