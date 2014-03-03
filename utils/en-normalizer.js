'use strict';

/**
 * Normalize English sentences.
 * Inspired by https://github.com/NaturalNode/natural/
 */

var rules = [
  {regex: /\bcan't\b/ig, output: 'cannot'},
  {regex: /\bwon't\b/ig, output: 'will not'},
  {regex: /\bcouldn't've\b/ig, output: 'could not have'},
  {regex: /\bwouldn't've\b/ig, output: 'would not have'},
  {regex: /\bi'm\b/ig, output: 'I am'},
  {regex: /\bhow'd\b/ig, output: 'how did'},
  {regex: /\blet's\b/ig, output: 'let us'},
  {regex: /\b(it|that|there|he|she)'s (been|got|gotten)\b/ig, output: '$1 has $2'},
  {regex: /\b(it|that|there|he|she)'s (a|an|the|this)\b/ig, output: '$1 is $2'},
  {regex: /\b(it|that|there|he|she)'s (.+)ing\b/ig, output: '$1 is $2ing'},
  //{regex: /\b([a-z]*)'s/ig, output: '$1 is'},
  {regex: /\b([a-z]*)n't/ig, output: '$1 not'},
  {regex: /\b([a-z]*)'ll/ig, output: '$1 will'},
  {regex: /\b([a-z]*)'re/ig, output: '$1 are'},
  {regex: /\b([a-z]*)'ve/ig, output: '$1 have'},
  {regex: /\b([a-z]*)'d/ig, output: '$1 would'}
];

function normalize(str) {
  rules.forEach(function(rule) {
    str = str.replace(rule.regex, rule.output);
  });
  return str;
}

module.exports = normalize;
