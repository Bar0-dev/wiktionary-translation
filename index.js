const axios = require("axios").default;
const ISO6391 = require("iso-639-1");

const endpoint = (lang) => `https://${lang}.wiktionary.org/w/api.php?`;
const propIwLinksQuery = (title, trgtLang) =>
  `&action=query&prop=iwlinks&iwprefix=${trgtLang}&iwlimit=max&titles=${title}&format=json&origin=*`;
const propLinksQuery = (title) =>
  `&action=query&prop=links&pllimit=max&titles=${title}&format=json&plprop=url&origin=*`;
const propLangLinkQuery = (title, trgtLang) =>
  `&action=query&prop=langlinks&llprop=url&titles=${title}&format=json&lllimit=max&lllang=${trgtLang}&origin=*`;
const propCategoriesQuery = (title) =>
  `&action=query&prop=categories&titles=${title}&format=json&origin=*`;

const getData = async (endpoint, props) => {
  try {
    let data = null;
    const url = encodeURI(endpoint + props);
    const response = await axios.get(url);
    if (!response || !response.data || !response.data.query) return false;
    if (response.status === 200 && response.data.query.pages) {
      [data] = Object.values(response.data.query.pages);
      return data;
    } else {
      throw new Error(response.error);
    }
  } catch (error) {
    console.log(error);
  }
};

const getTranslations = async (title, srcLang, trgtLang) => {
  try {
    const regex = /\/([^\/]+)\/?$/;
    const newEndpoint = endpoint(srcLang);
    const titlesMapping = (entry) =>
      regex.exec(entry["*"]) ? regex.exec(entry["*"])[1] : entry["*"];
    let response = await getData(
      newEndpoint,
      propIwLinksQuery(title, trgtLang)
    );
    //guard clause
    if (!response) return false;
    //check if iwlinks prop exists and if not update response vairable with new data from another source
    if (response.iwlinks) {
      return response.iwlinks.map(titlesMapping);
    } else {
      response = await getData(
        newEndpoint,
        propIwLinksQuery(title + "/translations", trgtLang)
      );
    }
    if (response.iwlinks) {
      return response.iwlinks.map(titlesMapping);
    } else {
      return fromTrgtLang(title, srcLang, trgtLang);
    }
  } catch (error) {
    console.log(error);
  }
};

const targetCategory = (categories, srcLang, trgtLang) => {
  if (
    categories.find((category) =>
      category
        .toLowerCase()
        .includes(ISO6391.getNativeName(trgtLang).toLowerCase())
    ) &&
    !categories.find((category) =>
      category.toLowerCase().includes(":" + srcLang.toLowerCase())
    )
  ) {
    return trgtLang;
  } else return false;
};

const fromTrgtLang = async (title, srcLang, trgtLang) => {
  try {
    //Check if page for given title exist in target language
    const responseFromLangLinks = await getData(
      endpoint(srcLang),
      propLangLinkQuery(title, trgtLang)
    );
    if (responseFromLangLinks.langlinks) {
      //Get all links from source language page
      const respSrcPageLinks = await getData(
        endpoint(srcLang),
        propLinksQuery(title)
      );
      //Map titles and remove original title from array of titles
      if (!respSrcPageLinks || !respSrcPageLinks.links) return false;
      const titlesSrcLangLinks = respSrcPageLinks.links
        .map((entry) => entry.title)
        .filter((localTitle) => !localTitle.includes(title));
      //Get all links from target language page
      const respTrgtPageLinks = await getData(
        endpoint(trgtLang),
        propLinksQuery(title)
      );
      //Map titles and remove original title from array of target page titles
      if (!respTrgtPageLinks || !respTrgtPageLinks.links) return false;
      const titlesTrgtPageLinks = respTrgtPageLinks.links
        .map((entry) => entry.title)
        .filter((localTitle) => !localTitle.includes(title));
      //Check for the intersection between both arrays to get a translation word we are looking for
      const intersections = titlesSrcLangLinks.filter((localTitle) =>
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
            if (targetCategory(categories, srcLang, trgtLang)) {
              return localTitle;
            } else return false;
          } else return false;
        })
      );
      const filteredTranslations = translations.filter(
        (localTitle) => localTitle
      );
      return filteredTranslations;
    } else return false;
  } catch (error) {
    console.log(error);
  }
};

module.exports = getTranslations;
