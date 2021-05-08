const Lem = require('javascript-lemmatizer')

const lemmatizer = new Lem()

const tokenize = input => input.split(/[ \t,;:.-_]/).filter(Boolean) //perhaps remove _ to keep emoji words joint

// Feature extractor - a function that takes a sample and adds features to a given features set:
const wordExtractor = (input, features) => {
  //similar to limdu.features.NGramsOfWords(1)
  const tokens = tokenize(input)
  tokens.forEach(word => {
    features[word.toLowerCase()] = 1
  })
  return tokens
}

const extract = (input, features) => {
  const tokens = tokenize(input)
  // TODO Consider using:
  /*
    const lemmas = lemmatizer.only_lemmas(token);
    return lemmas.length ? lemmas[0] : false
  }).filter(Boolean)
  */
  const extraction = tokens.map(token => lemmatizer.only_lemmas(token)[0])
  extraction.forEach(word => {
    features[word.toLowerCase()] = 1
  })
  return extraction
}

module.exports = {extract, wordExtractor}
