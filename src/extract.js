// const extractLemma = require('extract-lemmatized-nonstop-words')
// @todo find a lemmatizer as good as the defunct ^

// Feature extractor - a function that takes a sample and adds features to a given features set:
const wordExtractor = (input, features) => {
  //similar to limdu.features.NGramsOfWords(1)
  input
    /* .replace(/[:\-_]/g, ' ') //normalisation
    .replace(/\s{2,}/, ' ')
    .split(' ') //tokenification */
    .split(/[ \t,;:.-_]/) //perhaps remove _ to keep emoji words joint
    .filter(Boolean)
    //@todo replace the above lines by
    .forEach(word => {
      features[word.toLowerCase()] = 1
    })
}

// const extract = (input, features) => {
//   const extraction = extractLemma(input).map(ex =>
//     'lemma' in ex ? ex.lemma : ex.normal,
//   )
//   extraction.forEach(word => {
//     features[word] = 1
//   })
//   return extraction
// }

module.exports = {wordExtractor}
