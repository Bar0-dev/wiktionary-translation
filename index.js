const axios = require("axios").default;

const endpoint = (lang) => `https://${lang}.wiktionary.org/w/api.php?`;
const propIwLinksQuery = (title, trgtLang) =>
  `&action=query&prop=iwlinks&iwprefix=${trgtLang}&iwlimit=max&titles=${title}&format=json`;
const propLinksQuery = (title) =>
  `&action=query&prop=links&pllimit=max&titles=${title}&format=json&plprop=url`;
const propLangLinkQuery = (title, trgtLang) =>
  `&action=query&prop=langlinks&llprop=url&titles=${title}&format=json&lllimit=max&lllang=${trgtLang}`;

const getData = async (endpoint, props) => {
  try {
    let data = null;
    const url = encodeURI(endpoint + props);
    const response = await axios.get(url);
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
    const regex = /\/([^\/]+)\/?$/;
    const newEndpoint = endpoint(srcLang);
    const returnCallback = (entry) =>
      regex.exec(entry["*"]) ? regex.exec(entry["*"])[1] : entry["*"];
    let response = await getData(
      newEndpoint,
      propIwLinksQuery(title, trgtLang)
    );
    if (!response) return false;
    if (response.iwlinks) {
      return response.iwlinks.map(returnCallback);
    } else {
      response = await getData(
        newEndpoint,
        propIwLinksQuery(title + "/translations", trgtLang)
      );
    }
    if (response.iwlinks) {
      return response.iwlinks.map(returnCallback);
    } else {
      response = await getData(newEndpoint, propLinksQuery(title));
      parsedTitle = response.links.find((entry) => entry.ns === 0).title;
      response = await getData(
        newEndpoint,
        propIwLinksQuery(parsedTitle, trgtLang)
      );
    }
    if (response.iwlinks) {
      return response.iwlinks.map(returnCallback);
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
  }
};

const fromTrgtLang = async (title, srcLang, trgtLang) => {
  try {
    let response = await getData(
      endpoint(srcLang),
      propLangLinkQuery(title, trgtLang)
    );
    console.log(response);
    //check if the page exist by exploring langlinks props
    if (response && response.langlinks) {
      response = await getData(endpoint(trgtLang), propLinksQuery(title));
      return response;
    } else return false;
  } catch (error) {
    console.log(error);
  }
};

const testFunc = async () => {
  //   const data = await getTranslations("wielding", "en", "pl");
  // const data = await getTranslations("nein", "de", "pl");
  // const data = await getTranslations("book", "en", "pl");
  // const data = await getTranslations("chair", "en", "sv");
  // const data = await getTranslations("tycker", "sv", "pl");
  // const data = await getTranslations("cáscara", "es", "en");
  const data = await getTranslations("puszka", "pl", "en");

  console.log(data);
};

testFunc();
