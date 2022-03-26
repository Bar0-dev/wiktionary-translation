# Wiktionary translations

JavaScript scraper for wiktionary translations.

## General information

### How this works

Scraping translations from wiktionary is a really challenging task. Pages are written in the so-called WikiText markup language which is then translated to HTML. Information on the Wiktionary.org pages is easy to read for people but hard to understand for computers. Luckily parser provided through MediaWiki API is recognizing language links and sometimes even translations. It all depends on how well the page is built along with Wiktionary.org standards. Using links and language links along with word categories, it is possible to take out most of the translations.

### Supported languages

As far this module works pretty well with more popular languages it can struggle with niche ones. Keep in mind that results vary on how well the page on Wiktionary is written. Sometimes language pairs can perform better one way than the other. I encourage you to report how different language pairs are performing on [github](https://github.com/Bar0-dev/wiktionary-translations) page by creating an issue or starting a discussion.

### Use etiquette

This module is pretty heavy on the number of HTTP requests per word lookup on the MediaWiki API. Sometimes, it can be up to tens of requests. I am constantly working on cutting down the number of requests per lookup. I would not recommend using this for bigger projects because It can significantly impact the MediaWiki server's performance. Please check out [API:Etiquette](https://www.mediawiki.org/wiki/API:Etiquette) to learn more about the fair use of MediaWiki API.

### Plans for future updates

- parsing image URLs;
- parsing pronunciation audio files URLs;

## Usage

### Installation

For installation use the following command

`npm i wiktionary-translations`

### Importing

To import the module

`const getTranslations = require("wiktionary-translations")`

### Get translations

Get translations with simple

`const translations = await getTranslations(articleTitle, sourceLanguage, targetLanguage)`

- params {string}
- returns {array}
