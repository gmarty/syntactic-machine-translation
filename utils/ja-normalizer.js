'use strict';

/**
 * Normalize Japanese verbs.
 * @todo Convert 有ります.
 */

var rules = [
  {regex: /(され|させ|でき)ます/g, output: '$1る'},
  {regex: /(し|され|させ|でき)ませんでした/g, output: '$1なかった'},
  {regex: /(し|され|させ|でき)ていません/g, output: '$1ていない'},
  {regex: /(し|され|させ|でき)ています/g, output: '$1ている'},
  {regex: /(し|され|させ|でき)ません/g, output: '$1ない'},
  {regex: /(し|され|させ|でき)ました/g, output: '$1た'},
  {regex: /(し|され|させ|でき)ていませんでした/g, output: '$1ていなかった'},
  {regex: /(し|され|させ|でき)ていました/g, output: '$1ていた'},
  {regex: /します/g, output: 'する'},
  {regex: /(.)です([。！]+)?$/g, output: function(match, match1, match2) {
    if (match1 === 'い') {
      return match;
    }
    match1 = match1 ? match1 : '';
    match2 = match2 ? match2 : '';
    return match1 + 'だ' + match2;
  }}
];

function normalize(str) {
  rules.forEach(function(rule) {
    str = str.replace(rule.regex, rule.output);
  });
  return str;
}

module.exports = normalize;
