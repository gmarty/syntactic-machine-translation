#!/usr/bin/env node

'use strict';

/**
 * POS tag the English corpus.
 */

var fs = require('fs');
var pos = require('pos');

var jsposTable = require('./utils/jspos2simplified-map.json');
var corpus = '' + fs.readFileSync('./corpus/en.txt', {encoding: 'utf8'});

var enPos = [];
var enPosString = '';

corpus = corpus.split('\r\n');
corpus = corpus.map(function(sentence) {
  sentence = sentence.trim().replace(/(\.|\?|!|:)+$/, ''); // Remove the trailing punctuation.
  //sentence = sentence.replace(/(\.|;|,|:)+$/, ''); // Remove punctuation.
  sentence = new pos.Lexer().lex(sentence);
  var taggedWords = new pos.Tagger().tag(sentence);

  taggedWords = taggedWords.map(function(word) {
    if (jsposTable[word[1]]) {
      word[1] = jsposTable[word[1]];
    }
    return word[1];
  }).join('|');
  enPos.push(taggedWords);
  enPosString += taggedWords + '\n';
});

enPosString = enPosString.trim();

fs.writeFileSync('./corpus-tagged/en.json', JSON.stringify(enPos, null, '  '), {encoding: 'utf8'});
fs.writeFileSync('./corpus-tagged/en.txt', enPosString, {encoding: 'utf8'});
