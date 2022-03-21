const axios = require("axios").default;

const endpoint = (lang) => `https://${lang}.wiktionary.org/w/api.php?`;
const propIwLinksQuery = (title, trgtLang) =>
  `&action=query&prop=iwlinks&iwprefix=${trgtLang}&iwlimit=max&titles=${title}&format=json`;
const propLinksQuery = (title) =>
  `&action=query&prop=links&pllimit=max&titles=${title}&format=json`;

const getData = async (title, srcLang, trgtLang) => {
  let response = null;
  let data = {};
  let parsedTitle = "";
  try {
    response = await axios.get(
      endpoint(srcLang) + propIwLinksQuery(title, trgtLang)
    );
    [data] = Object.values(response.data.query.pages);
    if (data.iwlinks) {
      return data.iwlinks;
    } else {
      response = await axios.get(
        endpoint(srcLang) + propIwLinksQuery(title + "/translations", trgtLang)
      );
      [data] = Object.values(response.data.query.pages);
    }
    if (data.iwlinks) {
      return data.iwlinks;
    } else {
      response = await axios.get(endpoint(srcLang) + propLinksQuery(title));
      [data] = Object.values(response.data.query.pages);
      parsedTitle = data.links.find((entry) => entry.ns === 0).title;
      response = await axios.get(
        endpoint(srcLang) + propIwLinksQuery(parsedTitle, trgtLang)
      );
      if()
    }
    [data] = Object.values(response.data.query.pages);

    return data;
  } catch (error) {
    console.log(error);
  }
};

const getTranslations = async (title, srcLang, trgtLang) => {
  let translations = [];
  let data = await getData(title, srcLang, trgtLang);
  if (data.length) {
    const translations = data.map((entries) => entries["*"]);
    console.log(translations);
    return translations;
  }
};

getTranslations("wielding", "en", "pl");
getTranslations("wield", "en", "pl");
getTranslations("book", "en", "pl");
getTranslations("chair", "en", "pl");
getTranslations("tycker", "sv", "pl");
