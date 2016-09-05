'use strict';

/**
 * Normalize English sentences.
 * Inspired by https://github.com/NaturalNode/natural/
 */

var rules = [
  // Unambiguous cases.
  {regex: /\blet's\b/ig, output: 'let us'},
  {regex: /'s (been|got|gotten)\b/ig, output: ' has $1'},
  {regex: /'s (a|an|the|this|that|not|going)\b/ig, output: ' is $1'},
  {regex: /'d (like|love)\b/ig, output: ' would $1'},

  // Irregular negations.
  {regex: /\bshouldn't've\b/ig, output: 'should not have'},
  {regex: /\bwouldn't've\b/ig, output: 'would not have'},
  {regex: /\bcouldn't've\b/ig, output: 'could not have'},
  {regex: /\bshan't\b/ig, output: 'shall not'},
  {regex: /\bcan't\b/ig, output: 'cannot'},
  {regex: /\bwon't\b/ig, output: 'will not'},

  // Regular contractions.
  {regex: new RegExp('\\b(' +
    'am|are|could|did|do|does|had|has|have|' +
    'is|might|must|should|was|were|would' +
    ')n\'t\\b', 'ig'), output: '$1 not'},
  {regex: /'ll\b/ig, output: ' will'},
  {regex: /'re\b/ig, output: ' are'},
  {regex: /'ve\b/ig, output: ' have'},
  {regex: /'m\b/ig, output: ' am'}

  //{regex: /\bhow'd\b/ig, output: 'how did'}, // or had
  //{regex: /'s\b/ig, output: ' is'}, // or has
  //{regex: /'d\b/ig, output: ' would'}, // or had
];

function normalize(str) {
  rules.forEach(function(rule) {
    str = str.replace(rule.regex, rule.output);
  });
  return str;
}

module.exports = normalize;
