# Hacking a quick and dirty machine translation

> The goal of this project is to hack and play with machine translation using English-Japanese.

## What's interesting about this approach?

Not much, excepted that almost no prerequisites are necessary. No complicated rules are needed. To
make it work, you just need a corpus of pairs and a POS tagger for both languages.

## What's wrong with the approach?

Purely syntactic, not semantic aspect taken into consideration.

## What's wrong with the implementation?

The POS tagger, js-pos and Chasen, have very different classes of POS. I tried to match them as
best as I could. See `jspos2simplified-map.json` for the map used to simplify js-pos classes and
`chasen2jspos-map.json` for the mapping between Chasen and js-pos.

The corpus used is a bit small and contains only 5,304 pairs.

I've used an outdated version of Chasen for testing.
