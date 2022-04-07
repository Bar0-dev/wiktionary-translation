//ES6 imports
import axios from "axios";

//Node.js imports
// const axios = require("axios").default;

class WiktionaryRequest {
  srcLang;
  trgtLang;
  #defaultConfig;
  constructor(srcLang, trgtLang) {
    this.srcLang = srcLang;
    this.trgtLang = trgtLang;
    this.#defaultConfig = { action: "query", format: "json", origin: "*" };
  }

  #titleCapitalize(title) {
    return title.replace(title[0], title[0].toUpperCase());
  }

  #endpoint(langCode) {
    return `https://${langCode}.wiktionary.org/w/api.php?`;
  }
  #iwLinksQuery(langCode, title) {
    return {
      ...this.#defaultConfig,
      prop: "iwlinks",
      iwlimit: "max",
      iwprefix: langCode,
      titles: `${title}|${title}/translations|${this.#titleCapitalize(title)}`,
    };
  }

  #linksQuery(langCode, title) {
    return {
      ...this.#defaultConfig,
      prop: "langlinks|links",
      lllimit: "max",
      pllimit: "max",
      lllang: langCode,
      titles: title,
    };
  }

  #categoriesQuery(titles) {
    return {
      ...this.#defaultConfig,
      prop: "categories",
      titles: titles,
    };
  }

  //Request #1
  async iwLinksDataSrc(title) {
    try {
      const response = await axios.get(this.#endpoint(this.srcLang), {
        params: this.#iwLinksQuery(this.trgtLang, title),
      });
      if (!response || !response.data || !response.data.query)
        throw new Error("Invalid request");
      if (response.status !== 200 || !response.data.query.pages)
        throw new Error("Request to the server unsuccessful");
      const data = Object.values(response.data.query.pages);
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  //Request #2
  async linksDataSrc(title) {
    try {
      const response = await axios.get(this.#endpoint(this.srcLang), {
        params: this.#linksQuery(this.trgtLang, title),
      });
      if (!response || !response.data || !response.data.query)
        throw new Error("Invalid request");
      if (response.status !== 200 || !response.data.query.pages)
        throw new Error("Request to the server unsuccessful");
      const data = Object.values(response.data.query.pages);
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  //Request #3

  async linksDataTrgt(title) {
    try {
      const response = await axios.get(this.#endpoint(this.trgtLang), {
        params: this.#linksQuery("no langlinks", title),
      });
      if (!response || !response.data || !response.data.query)
        throw new Error("Invalid request");
      if (response.status !== 200 || !response.data.query.pages)
        throw new Error("Request to the server unsuccessful");
      const data = Object.values(response.data.query.pages);
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  //Request #4
  async categoriesDataTrgt(titles) {
    try {
      const response = await axios.get(this.#endpoint(this.trgtLang), {
        params: this.#categoriesQuery(titles.join("|")),
      });
      if (!response || !response.data || !response.data.query)
        throw new Error("Invaalid request");
      if (response.status !== 200 || !response.data.query.pages)
        throw new Error("Request to the server unsuccessful");
      const data = Object.values(response.data.query.pages).filter(
        (entry) => entry.pageid
      );
      return data;
    } catch (error) {
      console.log(error);
    }
  }
}

//Node.js
// module.exports.WiktionaryRequest = WiktionaryRequest;

//ES6
export default WiktionaryRequest;
