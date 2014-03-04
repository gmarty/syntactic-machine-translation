#!/usr/bin/env node

'use strict';

var fs = require('fs');
var Pos = require('pos');
var enNormalize = require('./utils/en-normalizer.js');

var jsposTable = require('./utils/jspos2simplified-map.json');
var enConverter = require('./pos-converter/en.json');
var jaConverter = require('./pos-converter/ja.json');
var enDico = require('./dictionary/en.json');

// The POS common to both Chasen and js-pos.
var posItems = require('./utils/common-pos-map.json');

var source = 'The weather is bad.';
var source = 'It contains a lot of fiber.';
var source = 'I am happy.';

translate(source);

function translate(source) {
  var sentence = source;
  sentence = enNormalize(sentence);
  sentence = sentence.trim().replace(/(\.|\?|!|:)+$/, ''); // Remove the trailing punctuation.
  //sentence = sentence.replace(/(\.|;|,|:)+$/, ''); // Remove punctuation.
  var words = new Pos.Lexer().lex(sentence);
  words = new Pos.Tagger().tag(words);
  var enPos = words.map(function(word) {
    if (jsposTable[word[1]]) {
      word[1] = jsposTable[word[1]];
    }
    return word[1];
  });
  var enWords = {};
  words.forEach(function(word) {
    if (!enWords[word[1]]) {
      enWords[word[1]] = [];
    }
    enWords[word[1]].push(word[0]);
  });
  enPos = enPos.join('|');

  var jaPos = enConverter[enPos];

  if (!jaPos) {
    console.log('No sentence with a similar POS structure found for: %s (%s)', source, enPos);
    return;
  }

  console.log(enPos);
  console.log(jaPos.ja);

  // Find the most frequent POS structure in JA associated with that in EN.
  var pos = '';
  var value = -1;
  for (var i in jaPos.ja) {
    if (jaPos.ja[i] > value) {
      pos = i;
      value = jaPos.ja[i];
    }
  }
  jaPos = pos;

  var placeholders = jaConverter[jaPos].p;

  enPos = enPos.split('|');
  jaPos = jaPos.split('|');

  var placeholder = '';
  value = 0;
  for (var i in placeholders) {
    if (placeholders[i] > value) {
      placeholder = i;
      value = placeholders[i];
    }
  }

  placeholder = placeholder.split('|');

  console.log(enPos);
  console.log(jaPos);
  console.log(placeholder);

  var ja = placeholder.map(function(placeholderWord, index) {
    var translated = placeholderWord;
    posItems.some(function(posItem) {
      if (jaPos[index] === posItem) {
        var wordIndex = enPos.indexOf(jaPos[index]);
        if (wordIndex < 0) {
          return false;
        }

        // We're translating the POS in the original order. Ex if source has 2 NN, they will be
        // translated in the same order: NN1, then NN2.
        var enWord = enWords[jaPos[index]].splice(0, 1).join();

        if (!enDico[enWord.toLowerCase()]) {
          return false;
        }
        var jaWord = enDico[enWord.toLowerCase()][jaPos[index]];

        var value = -1;
        for (var i in jaWord) {
          if (jaWord[i] > value) {
            translated = i;
            value = jaWord[i];
          }
        }

        return true;
      }
      return false;
    });

    return translated;
  });

  ja = ja.join('');

  fs.writeFileSync('./translation.txt', ja, {encoding: 'utf8'});

  return ja;
}
