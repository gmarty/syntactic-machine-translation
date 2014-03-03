#!/usr/bin/env node

'use strict';

/**
 * Run:
 * ```bash
 * "C:\Program Files (x86)\ChaSen\chasen.exe" -F "%M|%m|%U(%P-)\n" C:\Users\FCHGMX\Dropbox\Dev\www\js-demo\machine-translation\corpus\ja.txt > C:\Users\FCHGMX\Dropbox\Dev\www\js-demo\machine-translation\dictionary\ja.txt
 * ```
 *
 * Convert `dictionary\ja.txt` to UTF-8.
 *
 * Run this script.
 */

var fs = require('fs');
var pos = require('pos');
var TreebankWordTokenizer = require('natural').TreebankWordTokenizer;
var normalizer = require('natural').normalize.normalize_tokens;

var tokenizer = new TreebankWordTokenizer();
var table = require('./utils/chasen2jspos-map.json');
var jsposTable = require('./utils/jspos2simplified-map.json');

var enCorpus = '' + fs.readFileSync('./corpus/en.txt', {encoding: 'utf8'});
var jaPos = '' + fs.readFileSync('./dictionary/ja.txt', {encoding: 'utf8'});

// The POS common to both Chasen and js-pos.
var posItems = ["UH", "RB", "JJ", "NN", "NNP", "CD", "SYM", ".", ":", "(", ")", "VB", "CC"];

// Convert the POS items from Chasen to js-pos.
jaPos = jaPos.split('\r\nEOS\r\n');
jaPos = jaPos.map(function(sentence) {
  sentence = sentence.trim();
  sentence = sentence.split('\r\n');
  sentence = sentence.map(function(word) {
    word = word.split('|');
    if (table[word[2]]) {
      word[2] = table[word[2]];
    } else {
      word[2] = 'Unknown';
    }
    word = [word[0], word[2]];
    //word = word.join('|');
    return word;
  });

  // Group words by their POS type.
  var obj = {};
  sentence.forEach(function(word) {
    if (!obj[word[1]]) {
      obj[word[1]] = [];
    }
    obj[word[1]].push(word[0]);
  });

  //sentence = sentence.join('\n');
  return obj;
});
//jaPos = jaPos.join('\nEOS\n');

// Generate the tagged corpus in EN.
var enPos = [];
enCorpus = enCorpus.split('\r\n');
enCorpus.map(function(sentence) {
  sentence = sentence.trim().replace(/(\.|\?|!|:)+$/, ''); // Remove the trailing punctuation.
  var words = tokenizer.tokenize(sentence);
  words = normalizer(words);
  words = words.join(' ').replace(/\s+/g, ' ');

  words = new pos.Lexer().lex(words);
  sentence = new pos.Tagger().tag(words);

  // Group words by their POS type.
  var obj = {};
  sentence.forEach(function(word) {
    if (jsposTable[word[1]]) {
      word[1] = jsposTable[word[1]];
    }

    if (!obj[word[1]]) {
      obj[word[1]] = [];
    }
    obj[word[1]].push(word[0]);
  });

  enPos.push(obj);
});

enCorpus = undefined;

console.log(jaPos[0]);
console.log(enPos[0]);
console.log(jaPos[1]);
console.log(enPos[1]);
console.log(jaPos[2]);
console.log(enPos[2]);

var jaDico = {};
var enDico = {};

// First pass.
// We match POS in pairs when it only appears once in both languages (e.g. 1 NN or 1 VB...).
for (var i = 0; i < jaPos.length; i++) {
  // For each posItem, find a sentence where it is only one in each pair.
  posItems.forEach(function(posItem) {
    if (jaPos[i][posItem] && enPos[i][posItem] && jaPos[i][posItem].length === 1 && enPos[i][posItem].length === 1) {
      var key = jaPos[i][posItem][0].toLowerCase();
      if (!jaDico[key]) {
        jaDico[key] = {};
      }
      if (!jaDico[key][posItem]) {
        jaDico[key][posItem] = {};
      }
      if (!jaDico[key][posItem][enPos[i][posItem][0]]) {
        jaDico[key][posItem][enPos[i][posItem][0]] = 0;
      }
      jaDico[key][posItem][enPos[i][posItem][0]]++;

      key = enPos[i][posItem][0].toLowerCase();
      if (!enDico[key]) {
        enDico[key] = {};
      }
      if (!enDico[key][posItem]) {
        enDico[key][posItem] = {};
      }
      if (!enDico[key][posItem][jaPos[i][posItem][0]]) {
        enDico[key][posItem][jaPos[i][posItem][0]] = 0;
      }
      enDico[key][posItem][jaPos[i][posItem][0]]++;

      // We remove the entries from jaPos/enPos to prepare the 2nd pass.
      delete jaPos[i][posItem];
      delete enPos[i][posItem];
    }
  });
}

console.log('-------------------');
console.log(jaPos[0]);
console.log(enPos[0]);
console.log(jaPos[1]);
console.log(enPos[1]);
console.log(jaPos[2]);
console.log(enPos[2]);

var tmp = {};
var tmpCount = 0;

function secondpass() {
  // 2nd pass.
  for (i = 0; i < jaPos.length; i++) {
    // For each posItem...
    posItems.forEach(function(posItem) {
      if (!jaPos[i][posItem]) {
        return;
      }

      jaPos[i][posItem].forEach(function(word, index) {
        // Let's see if we can match one of these pos item in both languages.
        if (!enPos[i][posItem]) {
          return;
        }

        var key = word.toLowerCase();
        if (jaDico[key] && jaDico[key][posItem]) {
          var enWords = jaDico[key][posItem];
          var bestMatch = '';
          var bestMatchPosition = 0;
          for (var enWord in enWords) {
            bestMatchPosition = enPos[i][posItem].indexOf(enWord);
            if (bestMatchPosition >= 0) {
              bestMatch = enWord;
              break;
            }
          }

          if (bestMatch !== '') {
            jaDico[key][posItem][bestMatch]++;
            enDico[bestMatch.toLowerCase()][posItem][word]++;
            tmp[key] = bestMatch;
            tmpCount++;

            // We remove the entries from jaPos/enPos to prepare the 2nd pass.
            jaPos[i][posItem].splice(index, 1);
            enPos[i][posItem].splice(bestMatchPosition, 1);

            if (jaPos[i][posItem].length === 0) {
              delete jaPos[i][posItem];
            }
            if (enPos[i][posItem].length === 0) {
              delete enPos[i][posItem];
            }
          }
        }
      });
    });
  }
}

secondpass();
console.log(tmpCount);

secondpass();
console.log(tmpCount);

secondpass();
console.log(tmpCount);

console.log('-------------------');
console.log(jaPos[0]);
console.log(enPos[0]);
console.log(jaPos[1]);
console.log(enPos[1]);
console.log(jaPos[2]);
console.log(enPos[2]);

fs.writeFileSync('./dictionary/ja-unmatched.json', JSON.stringify(jaPos, null, '  '), {encoding: 'utf8'});
fs.writeFileSync('./dictionary/en-unmatched.json', JSON.stringify(enPos, null, '  '), {encoding: 'utf8'});

fs.writeFileSync('./dictionary/ja.json', JSON.stringify(jaDico, null, '  '), {encoding: 'utf8'});
fs.writeFileSync('./dictionary/en.json', JSON.stringify(enDico, null, '  '), {encoding: 'utf8'});
