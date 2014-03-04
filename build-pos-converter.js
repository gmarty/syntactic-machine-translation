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
var _ = require('lodash');

var jaCorpus = ('' + fs.readFileSync('./corpus/ja-segmented.txt', {encoding: 'utf8'})).split('\r\n');
var enCorpus = ('' + fs.readFileSync('./corpus/en.txt', {encoding: 'utf8'})).split('\r\n');

var jaPos = require('./corpus-tagged/ja.json');
var enPos = require('./corpus-tagged/en.json');

// The POS common to both Chasen and js-pos.
var posItems = require('./utils/common-pos-map.json');

var lexer = new pos.Lexer();

var jaConverter = {};
var enConverter = {};

var sentence = ''; // Temporary variable.
var length = Math.min(jaPos.length, enPos.length);

for (var i = 0; i < length; i++) {
  // Expand the Japanese POS converter.
  if (!jaConverter[jaPos[i]]) {
    jaConverter[jaPos[i]] = {
      'en': {},
      'commons': Array(jaPos[i].split('|').length),
      'p': []
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
  var words = sentence.split('|');
  words.forEach(function(word, index) {
    if (!jaConverter[jaPos[i]]['commons'][index]) {
      jaConverter[jaPos[i]]['commons'][index] = {};
    }
    if (!jaConverter[jaPos[i]]['commons'][index][word]) {
      jaConverter[jaPos[i]]['commons'][index][word] = 0;
    }
    jaConverter[jaPos[i]]['commons'][index][word]++;
  });
  jaConverter[jaPos[i]]['p'].push(sentence);

  // Expand the English POS converter.
  if (!enConverter[enPos[i]]) {
    enConverter[enPos[i]] = {
      'ja': {},
      'commons': Array(enPos[i].split('|').length),
      'p': []
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
  //sentence = sentence.replace(/(\.|;|,|:)+$/, ''); // Remove punctuation.
  var words = lexer.lex(sentence);
  words.forEach(function(word, index) {
    if (!enConverter[enPos[i]]['commons'][index]) {
      enConverter[enPos[i]]['commons'][index] = {};
    }
    if (!enConverter[enPos[i]]['commons'][index][word]) {
      enConverter[enPos[i]]['commons'][index][word] = 0;
    }
    enConverter[enPos[i]]['commons'][index][word]++;
  });
  enConverter[enPos[i]]['p'].push(sentence);
}

// Pass 2, filling in the placeholders.
// The engine should be able to manage replace POS item in common in both corpus. So we need a way
// to get the most common structure for POS items non existing in one or the other (P.c....).

// Generate the Japanese placeholder string used in English to Japanese translation.
for (var i in jaConverter) {
  // For each commons, find the more frequent item.
  jaConverter[i]['commons'] = jaConverter[i]['commons'].map(function(terms) {
    var term = '';
    var value = 0;
    for (var j in terms) {
      if (terms[j] > value) {
        term = j;
        value = terms[j];
      }
    }
    return term;
  });

  // Generate the placeholders.
  jaConverter[i]['p'] = jaConverter[i]['p'].map(function(sentence) {
    return sentence.split('|');
  });

  var pos = i.split('|');

  pos.forEach(function(posItem, index) {
    if (posItems.indexOf(posItem) > 0) {
      jaConverter[i]['p'] = jaConverter[i]['p'].map(function(samples) {
        samples[index] = '@@@';
        return samples;
      });
    }
  });

  jaConverter[i]['p'] = jaConverter[i]['p'].map(function(sentence) {
    return sentence.join('|');
  });
  jaConverter[i]['p'] = _.countBy(jaConverter[i]['p'], function(num) {
    return num;
  });
  var placeholders = {};
  for (var j in jaConverter[i]['p']) {
    pos = j.split('|');
    pos = pos.map(function(posItem, index) {
      if (posItem === '@@@') {
        return jaConverter[i]['commons'][index];
      }
      return posItem;
    });
    pos = pos.join('|');
    placeholders[pos] = jaConverter[i]['p'][j];
  }
  jaConverter[i]['p'] = placeholders;

  // From here, we don't need common anymore.
  delete jaConverter[i]['commons'];
}

// Generate the English placeholder string used in Japanese to English translation.
for (var i in enConverter) {
  // For each commons, find the more frequent item.
  enConverter[i]['commons'] = enConverter[i]['commons'].map(function(terms) {
    var term = '';
    var value = 0;
    for (var j in terms) {
      if (terms[j] > value) {
        term = j;
        value = terms[j];
      }
    }
    return term;
  });

  // Generate the placeholders.
  enConverter[i]['p'] = enConverter[i]['p'].map(function(sentence) {
    return lexer.lex(sentence);
  });

  var pos = i.split('|');

  pos.forEach(function(posItem, index) {
    if (posItems.indexOf(posItem) > 0) {
      enConverter[i]['p'] = enConverter[i]['p'].map(function(samples) {
        samples[index] = '@@@';
        return samples;
      });
    }
  });

  enConverter[i]['p'] = enConverter[i]['p'].map(function(sentence) {
    return sentence.join('|');
  });
  enConverter[i]['p'] = _.countBy(enConverter[i]['p'], function(num) {
    return num;
  });
  var placeholders = {};
  for (var j in enConverter[i]['p']) {
    pos = j.split('|');
    pos = pos.map(function(posItem, index) {
      if (posItem === '@@@') {
        return enConverter[i]['commons'][index];
      }
      return posItem;
    });
    pos = pos.join('|');
    placeholders[pos] = enConverter[i]['p'][j];
  }
  enConverter[i]['p'] = placeholders;

  // From here, we don't need common anymore.
  delete enConverter[i]['commons'];
}

fs.writeFileSync('./pos-converter/ja.json', JSON.stringify(jaConverter, null, '  '), {encoding: 'utf8'});
fs.writeFileSync('./pos-converter/en.json', JSON.stringify(enConverter, null, '  '), {encoding: 'utf8'});
