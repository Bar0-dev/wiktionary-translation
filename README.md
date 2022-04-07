# Wiktionary translations

JavaScript scraper for wiktionary translations.

## Warning

This module is still in development, it is not advisable to use it in a project yet. The behaviour of functions can be different depending on the version.

### Recently changed

The module has been rewritten in an object paradigm to support better scalability. Be aware of updated usage syntax. The request count has been cut down to only up to 4 requests per word lookup.

## General information

### How this works

Scraping translations from wiktionary is a really challenging task. Pages are written in the so-called WikiText markup language which is then translated to HTML. Information on the Wiktionary.org pages is easy to read for people but hard to understand for computers. Luckily parser provided through MediaWiki API is recognizing language links and sometimes even translations. It all depends on how well the page is built along with Wiktionary.org standards. Using links and language links along with word categories, it is possible to take out most of the translations. The parameters to the functions are named as they are used with WikiMedia API, thus no 'word' or 'text' but 'title'. That's the same title that is pointing to the article if you search on the [wiktionary.org](https://www.wiktionary.org/).

### Supported languages

As far this module works pretty well with more popular languages it can struggle with niche ones. Keep in mind that results vary on how well the page on Wiktionary is written. Sometimes language pairs can perform better one way than the other. I encourage you to report how different language pairs are performing on [github](https://github.com/Bar0-dev/wiktionary-translations) page by creating an issue or starting a discussion.

### Use etiquette

This module is pretty heavy on the number of HTTP requests per word lookup on the MediaWiki API. I would not recommend using this for bigger projects because It can significantly impact the MediaWiki server's performance. Please check out [API:Etiquette](https://www.mediawiki.org/wiki/API:Etiquette) to learn more about how the MediaWiki API should be handled.

### Plans for future updates

- parsing image URLs;
- parsing pronunciation audio files URLs;

## Usage

### Installation

For installation use the following command

    npm i wiktionary-translations

### Importing

- for Node.js

      const WiktTransl = require("wiktionary-translations").default;

- for ES module

      import WiktTransl from "wiktionary-translations";

### Functions

#### getTranslations

    const dict = new WiktTransl("srcLangCode", "trgtLangCode");
    const translations = await dict.getTranslations("title");

- params {string}
- return {array}
