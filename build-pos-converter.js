#!/usr/bin/env node

'use strict';

/**
 * Build a map for POS tagged structure of a language to another.
 *
 * Tag the JA corpus:
 * ```bash
 * "C:\Program Files (x86)\ChaSen\chasen.exe" -F "%m|" C:\Users\FCHGMX\Dropbox\Dev\www\js-demo\machine-translation\corpus\ja.txt > C:\Users\FCHGMX\Dropbox\Dev\www\js-demo\machine-translation\corpus\ja-segmented.txt
 * ```
 *
 * Convert `corpus\ja-segmented.txt` to UTF-8.
 *
 * Run `convert-chasen-pos.js` and `pos-tag-en.js` beforehand.
 */

var fs = require('fs');
var pos = require('pos');

var jaCorpus = ('' + fs.readFileSync('./corpus/ja-segmented.txt', {encoding: 'utf8'})).split('\r\n');
var enCorpus = ('' + fs.readFileSync('./corpus/en.txt', {encoding: 'utf8'})).split('\r\n');

var jaPos = require('./corpus-tagged/ja.json');
var enPos = require('./corpus-tagged/en.json');

var jaConverter = {};
var enConverter = {};

var jaConverterString = '';
var enConverterString = '';

var sentence = ''; // Temporary variable.

for (var i = 0; i < jaPos.length; i++) {
  // Expand the Japanese POS converter.
  if (!jaConverter[jaPos[i]]) {
    jaConverter[jaPos[i]] = {
      en: {},
      commons: Array(jaPos[i].split('|').length)
    };
  }
  // Add English matches to the list.
  if (!jaConverter[jaPos[i]]['en'][enPos[i]]) {
    jaConverter[jaPos[i]]['en'][enPos[i]] = 0;
  }
  jaConverter[jaPos[i]]['en'][enPos[i]]++;
  // Add Japanese commons to the list.
  sentence = jaCorpus[i];
  sentence = sentence.replace(/\|$/, ''); // Remove the trailing pipe.
  sentence = sentence.split('|');
  sentence.forEach(function(word, index) {
    if (!jaConverter[jaPos[i]]['commons'][index]) {
      jaConverter[jaPos[i]]['commons'][index] = {};
    }
    if (!jaConverter[jaPos[i]]['commons'][index][word]) {
      jaConverter[jaPos[i]]['commons'][index][word] = 0;
    }
    jaConverter[jaPos[i]]['commons'][index][word]++;
  });

  jaConverterString += jaPos[i] + '\n';

  // Expand the English POS converter.
  if (!enConverter[enPos[i]]) {
    enConverter[enPos[i]] = {
      ja: {},
      commons: Array(enPos[i].split('|').length)
    };
  }
  // Add Japanese matches to the list.
  if (!enConverter[enPos[i]]['ja'][jaPos[i]]) {
    enConverter[enPos[i]]['ja'][jaPos[i]] = 0;
  }
  enConverter[enPos[i]]['ja'][jaPos[i]]++;
  // Add English commons to the list.
  sentence = enCorpus[i];
  sentence = sentence.trim().replace(/(\.|\?|!|:)+$/, ''); // Remove the trailing punctuation.
  sentence = new pos.Lexer().lex(sentence);
  sentence.forEach(function(word, index) {
    if (!enConverter[enPos[i]]['commons'][index]) {
      enConverter[enPos[i]]['commons'][index] = {};
    }
    if (!enConverter[enPos[i]]['commons'][index][word]) {
      enConverter[enPos[i]]['commons'][index][word] = 0;
    }
    enConverter[enPos[i]]['commons'][index][word]++;
  });

  enConverterString += enPos[i] + '\n';
}

jaConverterString = jaConverterString.trim();
enConverterString = enConverterString.trim();

fs.writeFileSync('./pos-converter/ja.json', JSON.stringify(jaConverter, null, '  '), {encoding: 'utf8'});
fs.writeFileSync('./pos-converter/en.json', JSON.stringify(enConverter, null, '  '), {encoding: 'utf8'});

fs.writeFileSync('./pos-converter/ja.txt', jaConverterString, {encoding: 'utf8'});
fs.writeFileSync('./pos-converter/en.txt', enConverterString, {encoding: 'utf8'});
