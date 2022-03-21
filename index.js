const axios = require("axios").default;

const endpoint = (lang) => `https://${lang}.wiktionary.org/w/api.php?`;
const propIwLinksQuery = (title, trgtLang) =>
  `&action=query&prop=iwlinks&iwprefix=${trgtLang}&iwlimit=max&titles=${title}&format=json`;
const propLinksQuery = (title) =>
  `&action=query&prop=links&pllimit=max&titles=${title}&format=json`;

const getData = async (endpoint, props) => {
  try {
    let data = null;
    const response = await axios.get(endpoint + props);
    if (response.status === 200) {
      [data] = Object.values(response.data.query.pages);
      return data;
    } else {
      throw response.error;
    }
  } catch (error) {
    console.log(error);
  }
};

const getTranslations = async (title, srcLang, trgtLang) => {
  try {
    const targetEndpoint = endpoint(srcLang);
    const returnCallback = (entry) => entry["*"];
    let response = await getData(
      targetEndpoint,
      propIwLinksQuery(title, trgtLang)
    );
    console.log(response);
    if (!response) return false;
    if (response.iwlinks) {
      return response.iwlinks.map(returnCallback);
    } else {
      response = await getData(
        targetEndpoint,
        propIwLinksQuery(title + "/translations", trgtLang)
      );
    }
    if (response.iwlinks) {
      return response.iwlinks.map(returnCallback);
    } else {
      response = await getData(targetEndpoint, propLinksQuery(title));
      parsedTitle = response.links.find((entry) => entry.ns === 0).title;
      response = await getData(
        targetEndpoint,
        propIwLinksQuery(parsedTitle, trgtLang)
      );
    }
    if (response.iwlinks) {
      return response.iwlinks.map(returnCallback);
    } else {
      throw new Error("No translation was found");
      return false;
    }
  } catch (error) {
    console.log(error);
  }
};

// getTranslations("wielding", "en", "pl");
// getTranslations("wield", "en", "pl");
// getTranslations("book", "en", "pl");
// getTranslations("chair", "en", "pl");
// getTranslations("tycker", "sv", "pl");

const testFunc = async () => {
  //   const data = await getTranslations("wielding", "en", "pl");
  //   const data = await getTranslations("wield", "en", "de");
  //   const data = await getTranslations("book", "en", "pl");
  //   const data = await getTranslations("chair", "en", "sv");
  //   const data = await getTranslations("tycker", "sv", "pl");
  //   const data = await getTranslations("cáscara", "es", "en");
  const data = await getTranslations(encodeURI("puszka"), "pl", "en");
  console.log(data);
};

testFunc();
