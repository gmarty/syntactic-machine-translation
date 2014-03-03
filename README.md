# Hacking a quick and dirty syntactic machine translation

> The goal of this project is to hack a quick and dirty machine translation for English and
> Japanese that is based on syntax only.

Try online the [machine translation engine](http://gmarty.github.io/syntactic-machine-translation/).

## What's interesting about this approach?

Not much, except that almost no prerequisites are necessary. No complicated rules are needed. To
make it work, you just need a corpus of pairs and a POS tagger for both languages.

## What's wrong with the approach?

It's purely syntactic, not semantic aspect taken into consideration.

## What's wrong with the implementation?

The POS tagger, `js-pos` (used for English) and `Chasen` (for Japanese), have very different classes
of POS. I tried to match them as best as I could. See `utils/jspos2simplified-map.json` for the map
used to simplify js-pos classes and `utils/chasen2jspos-map.json` for the mapping between Chasen and
js-pos.

If there are several POS of the same type in the source sentence, then the order is preserved in the
translation. This can lead to grammatical mistakes.

The corpus used is a bit small and contains only 4,737 pairs.

The web version only allows translating from English to Japanese as Chasen can't run in the browser.

I'm using an outdated version of Chasen 2.3.3 because it couldn't find a more recent binary for
Windows.
