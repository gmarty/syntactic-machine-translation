#!/usr/bin/env node

'use strict';

var fs = require('fs');
var Pos = require('pos');

var jsposTable = require('./utils/jspos2simplified-map.json');
var enConverter = require('./pos-converter/en.json');
var jaConverter = require('./pos-converter/ja.json');
var jaDico = require('./dictionary/en.json');

// The POS common to both Chasen and js-pos.
var posItems = ["UH", "RB", "JJ", "NN", "NNP", "CD", "SYM", ".", ":", "(", ")", "VB", "CC"];

var source = 'The weather is bad.';
var source = 'It contains a lot of fiber.';
var source = 'I am happy.';

translate(source);

function translate(source) {
  var sentence = source.toLowerCase();
  sentence = sentence.trim().replace(/(\.|\?|!|:)+$/, ''); // Remove the trailing punctuation.
  var words = new Pos.Lexer().lex(sentence);
  words = new Pos.Tagger().tag(words);
  var enPos = words.map(function(word) {
    if (jsposTable[word[1]]) {
      word[1] = jsposTable[word[1]];
    }
    return word[1];
  });
  var enWords = words.map(function(word) {
    return word[0];
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

  var commons = jaConverter[jaPos].commons;

  console.log(enPos);
  console.log(jaPos);

  enPos = enPos.split('|');
  jaPos = jaPos.split('|');

  var ja = jaPos.map(function(pos, index) {
    var translated = pos;
    posItems.some(function(posItem) {
      if (pos === posItem) {
        var wordIndex = enPos.indexOf(pos);
        if (wordIndex < 0) {
          return false;
        }

        var enWord = enWords[wordIndex];

        if (!jaDico[enWord]) {
          return false;
        }
        var jaWord = jaDico[enWord][pos];

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

    // Find the most frequent commons for this POS at this position.
    if (translated === pos) {
      var value = -1;
      for (var i in commons[index]) {
        if (commons[index][i] > value) {
          translated = i;
          value = commons[index][i];
        }
      }

    }

    return translated;
  });

  ja = ja.join('');

  fs.writeFileSync('./translation.txt', ja, {encoding: 'utf8'});

  return ja;
}
