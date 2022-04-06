//ES6 imports
// import ISO6391 from "iso-639-1";
//Node.js imports
const ISO6391 = require("iso-639-1");
const WiktionaryRequest = require("./wiktionaryRequest");

class WiktData extends WiktionaryRequest {
  #srcLang;
  #trgtLang;
  #langsNotInWikt;
  constructor(srcLang, trgtLang) {
    super(srcLang, trgtLang);
    this.#langsNotInWikt = ["ae", "lu", "nd", "nr", "oj"];
  }
  validateCode(langCode) {
    if (
      !ISO6391.validate(langCode) ||
      this.#langsNotInWikt.includes(langCode)
    ) {
      return false;
    } else {
      return true;
    }
  }
}

const getTranslations = async (title, srcLang, trgtLang) => {
  try {
    //Langs not supported by Wiktionary
    const notInWikt = ["ae", "lu", "nd", "nr", "oj"];
    //Language codes validation
    if (!ISO6391.validate(srcLang) || notInWikt.includes(srcLang))
      throw new Error(`Invalid source language code: "${srcLang}"`);
    if (!ISO6391.validate(trgtLang) || notInWikt.includes(trgtLang))
      throw new Error(`Invalid target language code: "${trgtLang}"`);
    const newEndpoint = endpoint(srcLang);
    const noSlashRegex = /\/([^\/]+)\/?$/;
    const parseTitle = (entry) =>
      noSlashRegex.test(entry["*"])
        ? entry["*"].match(noSlashRegex)
        : entry["*"];
    const respIwLinks = await getData(
      newEndpoint,
      propIwLinksQuery(title, trgtLang)
    );
    //Guard clause
    //Check if iwlinks prop exists and if not update response vairable with new data from another source
    if (!respIwLinks) return false;
    if (respIwLinks.iwlinks) {
      return respIwLinks.iwlinks.map(parseTitle);
    }
    //Sometimes translations are on a separate page such as /translations
    const respIwLinksTrans = await getData(
      newEndpoint,
      propIwLinksQuery(title + "/translations", trgtLang)
    );
    //Guard clause
    if (!respIwLinksTrans) return false;
    if (respIwLinksTrans.iwlinks) {
      return respIwLinksTrans.iwlinks.map(parseTitle);
    }
    //If nothing was fetched from IwLinks then get parsed translations from langLinks prop
    const titlesLangLinks = await transLangLinks(title, srcLang, trgtLang);
    if (titlesLangLinks && titlesLangLinks.length) {
      return titlesLangLinks;
    }
    //If nothing was fetched return false
    return false;
  } catch (error) {
    console.log(error);
  }
};

const transLangLinks = async (title, srcLang, trgtLang) => {
  const checkCategories = (categories, srcLang, trgtLang) => {
    const catString = categories.join(" ");
    const nativeName = ISO6391.getNativeName(trgtLang);
    const codeRegex = (langCode) => new RegExp(`:${langCode}`, "gi");
    const nameRegex = (langName) => new RegExp(`:?${langName}`, "gi");
    if (
      nameRegex(nativeName).test(catString) &&
      !codeRegex(srcLang).test(catString)
    ) {
      return true;
    } else {
      return false;
    }
  };
  try {
    //Fetch LangLinks and Links from the page
    const respAllLinks = await getData(
      endpoint(srcLang),
      propLangLinksQuery(title, trgtLang)
    );
    //Guard caluses
    if (!respAllLinks) return false;
    if (!respAllLinks.langlinks || !respAllLinks.links) return false;
    //Map titles to array and filter out original title
    const titlesSrcLinks = respAllLinks.links
      .map((entry) => entry.title)
      .filter((localTitle) => !localTitle.includes(title));
    //Get all links from target language page
    const respTrgtPageLinks = await getData(
      endpoint(trgtLang),
      propLangLinksQuery(title)
    );
    //Map titles and remove original title from array of target page titles
    if (!respTrgtPageLinks || !respTrgtPageLinks.links) return false;
    const titlesTrgtPageLinks = respTrgtPageLinks.links
      .map((entry) => entry.title)
      .filter((localTitle) => !localTitle.includes(title));
    //Check for the intersection between both arrays to get a translation word we are looking for
    const intersections = titlesSrcLinks.filter((localTitle) =>
      titlesTrgtPageLinks.includes(localTitle)
    );
    //Check for categories for the rest of the words
    const translations = await Promise.all(
      intersections.map(async (localTitle) => {
        const response = await getData(
          endpoint(trgtLang),
          propCategoriesQuery(localTitle)
        );
        if (response && response.categories) {
          const categories = response.categories.map((entry) => entry.title);
          if (checkCategories(categories, srcLang, trgtLang)) {
            return localTitle;
          } else return false;
        } else return false;
      })
    );
    const filteredTranslations = translations.filter(
      (localTitle) => localTitle
    );
    return filteredTranslations;
  } catch (error) {
    console.log(error);
  }
};

export { getTranslations };
