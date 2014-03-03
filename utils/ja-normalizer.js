'use strict';

/**
 * Normalize Japanese verbs.
 * @todo Convert 有ります.
 */

var rules = [
  {regex: /します/g, output: 'する'},
  {regex: /(され|させ|でき)ます/g, output: '$1る'},
  {regex: /(し|され|させ|でき)ません/g, output: '$1ない'},
  {regex: /(し|され|させ|でき)ています/g, output: '$1ている'},
  {regex: /(し|され|させ|でき)ていません/g, output: '$1ていない'},
  {regex: /(し|され|させ|でき)ました/g, output: '$1た'},
  {regex: /(し|され|させ|でき)ませんでした/g, output: '$1なかった'},
  {regex: /(し|され|させ|でき)ていました/g, output: '$1ていた'},
  {regex: /(し|され|させ|でき)ていませんでした/g, output: '$1ていなかった'},
  {regex: /です([。！]+)?$/g, output: 'だ$1'} // Incorrect if after a -i adjective.
];

function normalize(str) {
  rules.forEach(function(rule) {
    str = str.replace(rule.regex, rule.output);
  });
  return str;
}

module.exports = normalize;
