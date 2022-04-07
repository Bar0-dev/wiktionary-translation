//ES6 imports
import ISO6391 from "iso-639-1";
import WiktionaryRequest from "./wiktionaryRequest.js";

//Node.js imports
// const ISO6391 = require("iso-639-1");
// const { WiktionaryRequest } = require("./wiktionaryRequest.js");

class WiktData extends WiktionaryRequest {
  #langsNotInWikt;
  constructor(srcLang, trgtLang) {
    super(srcLang, trgtLang);
    this.#langsNotInWikt = ["ae", "lu", "nd", "nr", "oj"];
    this.validateCodes([srcLang, trgtLang]);
    //testing !!TO BE REMOVED!!
    console.log("running v0.0.9P");
  }
  validateCodes(langCodes) {
    const [srcLangCode, trgtLangCode] = langCodes;
    try {
      langCodes.forEach((code) => {
        if (!ISO6391.validate(code) || this.#langsNotInWikt.includes(code))
          throw new Error(`Invalid code: ${code}`);
      });
    } catch (error) {
      console.log(error);
    }
  }
  async iwLinksSrc(title) {
    try {
      const responseArray = await this.iwLinksDataSrc(title);
      if (!responseArray) throw new Error("iWLinks request was unsuccessful");
      //Filter array with condition that iwlinks property exists
      const [filteredResponse] = responseArray.filter((entry) => entry.iwlinks);
      if (!filteredResponse) return false;
      const translations = filteredResponse.iwlinks.map((entry) => entry["*"]);
      if (translations.length) return translations;
      return false;
    } catch (error) {
      console.log(error);
    }
  }
  async linksSrc(title) {
    try {
      const responseArray = await this.linksDataSrc(title);
      if (!responseArray) throw new Error("links request was unsuccessful");
      const [response] = responseArray;
      /*
    With langlinks it is possible to check if the target language page with
    the same title exists. The existence of this page is required for the algorithm
    to work, thus if this page does not exist it's ok to terminate the whole process
    at this point.
    */
      if (!response.langlinks || !response.links) return false;
      const srcLinks = response.links
        .map((entry) => entry.title)
        .filter((localTitle) => localTitle !== title);
      return srcLinks;
    } catch (error) {
      console.log(error);
    }
  }
  async linksTrgt(title) {
    const responseArray = await this.linksDataTrgt(title);
    if (!responseArray) throw new Error("links request was unsuccessful");
    const [response] = responseArray.filter((entry) => entry.links);
    if (!response) return false;
    const links = response.links
      .map((entry) => entry.title)
      .filter((localTitle) => localTitle !== title);
    if (links.length) return links;
    return false;
  }
  async categoriesParse(title) {
    const linksFromSrc = await this.linksSrc(title);
    const linksFromTrgt = await this.linksTrgt(title);
    if (!linksFromSrc || !linksFromTrgt) return false;
    //Filter same titles form both arrays (arrays intersection)
    const sameTitles = linksFromSrc.filter((title) =>
      linksFromTrgt.includes(title)
    );
    const categories = await this.categoriesDataTrgt(sameTitles);
    //filter for responses only with categories parameter
    const existingCategories = categories.filter((entry) => entry.categories);
    const parsedCategories = existingCategories.map((entry) => ({
      title: entry.title,
      categories: entry.categories.map((entry) => entry.title),
    }));
    const filteredCategories = parsedCategories.filter((entry) =>
      this.#checkCategories(entry.categories)
    );
    const parsedTitles = filteredCategories.map((entry) => entry.title);
    if (parsedTitles.length) return parsedTitles;
    return false;
  }
  async getTranslations(originalTile) {
    const title = originalTile.toLowerCase();
    //Request #1 - get translations from internal wiki links
    const iwLinksResp = await this.iwLinksSrc(title);
    if (iwLinksResp) return this.#parseTitles(iwLinksResp);
    //If Request #1 was unsucess continue with fetching from Requests #2, #3 and #4
    const categoriesParseResp = await this.categoriesParse(title);
    if (categoriesParseResp) return this.#parseTitles(categoriesParseResp);
    // this return false is giving a information that no translations were parsed
    return false;
  }

  #checkCategories(categories) {
    const categoriesString = categories.join(" ");
    const nativeName = ISO6391.getNativeName(this.trgtLang);
    const codeRegex = (langCode) => new RegExp(`:${langCode}`, "gi");
    const nameRegex = (langName) => new RegExp(`:?${langName}`, "gi");
    if (
      nameRegex(nativeName).test(categoriesString) &&
      !codeRegex(this.srcLang).test(categoriesString)
    ) {
      return true;
    } else {
      return false;
    }
  }

  #parseTitles(titles) {
    const regex = /([^\/]+$)/;
    const titlesParsed = titles.map((title) =>
      regex.test(title) ? title.match(regex)[0] : title
    );
    return titlesParsed;
  }
}

const testFunc = async () => {
  const wikiRequest = new WiktData("en", "pl");
  const data = await wikiRequest.getTranslations("bubble");
  console.log(data);
};
