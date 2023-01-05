<!-- START doctoc generated TOC please keep comment here to allow auto update -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [ac-learn](#ac-learn)
  - [Install](#install)
  - [Documentation](#documentation)
    - [Learner](#learner)
    - [ConfusionMatrix](#confusionmatrix)
  - [Contributors](#contributors)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# ac-learn

Where the All Contributors machine can learn about your contributions.

## Install

```bash
yarn add ac-learn --save
#or
npm i -D ac-learn
```

## Usage

```js
const Learner = require('ac-learn')

//If you want to load a learner from a JSON export:
const learner = Learner.fromJSON(require('./your-learner.json'))
//If you want to use the default one
const learner = new Learner()
//If you want to your own dataset or customise the learner, check https://github.com/all-contributors/ac-learn#learner

//Training
learner.train() //Or
learner.train(someTrainingSet)

//Testing and getting stats
const fullStats = learner.eval()

//Cross-validation
const {microAvg, macroAvg} = learner.crossValidate()

//Confusion matrix (as string or console table)
const textualTable = learner.confusionMatrix.toString()
const cmTable = learner.confusionMatrix.toTable()

//Classifying an input
const output = learner.classify(someInput)
//Getting an input from an output
const input = learner.backClassify(someOutput)

//Saving the model to a JSON file
const savedModel = learner.toJSON()
const {writeFileSync} = require('fs')
writeFileSync('your-learner.json', JSON.stringify(jsonData))
```

## Documentation

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

- [Learner](#learner)
  - [Parameters](#parameters)
  - [Examples](#examples)
  - [train](#train)
    - [Parameters](#parameters-1)
  - [eval](#eval)
    - [Parameters](#parameters-2)
  - [serializeClassifier](#serializeclassifier)
  - [serializeAndSaveClassifier](#serializeandsaveclassifier)
    - [Parameters](#parameters-3)
  - [deserializeClassifier](#deserializeclassifier)
    - [Parameters](#parameters-4)
  - [loadAndDeserializeClassifier](#loadanddeserializeclassifier)
    - [Parameters](#parameters-5)
  - [classify](#classify)
    - [Parameters](#parameters-6)
  - [crossValidate](#crossvalidate)
    - [Parameters](#parameters-7)
  - [backClassify](#backclassify)
    - [Parameters](#parameters-8)
  - [toJSON](#tojson)
  - [fromJSON](#fromjson)
    - [Parameters](#parameters-9)
  - [getCategoryPartition](#getcategorypartition)
    - [Parameters](#parameters-10)
  - [getStats](#getstats)
    - [Parameters](#parameters-11)
- [ConfusionMatrix](#confusionmatrix)
  - [addEntry](#addentry)
    - [Parameters](#parameters-12)
  - [setEntry](#setentry)
    - [Parameters](#parameters-13)
  - [getEntry](#getentry)
    - [Parameters](#parameters-14)
  - [getTotal](#gettotal)
  - [getTP](#gettp)
    - [Parameters](#parameters-15)
  - [getFP](#getfp)
    - [Parameters](#parameters-16)
  - [getFN](#getfn)
    - [Parameters](#parameters-17)
  - [getTN](#gettn)
    - [Parameters](#parameters-18)
  - [getDiagonal](#getdiagonal)
  - [getTrue](#gettrue)
  - [getFalse](#getfalse)
  - [getPositive](#getpositive)
    - [Parameters](#parameters-19)
  - [getNegative](#getnegative)
    - [Parameters](#parameters-20)
  - [getPredPositive](#getpredpositive)
    - [Parameters](#parameters-21)
  - [getPredNegative](#getprednegative)
    - [Parameters](#parameters-22)
  - [getSupport](#getsupport)
    - [Parameters](#parameters-23)
  - [getAccuracy](#getaccuracy)
    - [Parameters](#parameters-24)
  - [getMicroAccuracy](#getmicroaccuracy)
  - [getMacroAccuracy](#getmacroaccuracy)
  - [getWeightedAccuracy](#getweightedaccuracy)
  - [getTotalPositiveRate](#gettotalpositiverate)
    - [Parameters](#parameters-25)
  - [getMicroRecall](#getmicrorecall)
  - [getMacroRecall](#getmacrorecall)
  - [getWeightedRecall](#getweightedrecall)
  - [getPositivePredictiveValue](#getpositivepredictivevalue)
    - [Parameters](#parameters-26)
  - [getPositivePredictiveValue](#getpositivepredictivevalue-1)
    - [Parameters](#parameters-27)
  - [getMicroPrecision](#getmicroprecision)
  - [getMacroPrecision](#getmacroprecision)
  - [getWeightedPrecision](#getweightedprecision)
  - [getMicroF1](#getmicrof1)
  - [getMacroF1](#getmacrof1)
  - [getWeightedF1](#getweightedf1)
  - [getFalseNegativeRate](#getfalsenegativerate)
    - [Parameters](#parameters-28)
  - [getMicroMissRate](#getmicromissrate)
  - [getMacroMissRate](#getmacromissrate)
  - [getWeightedMissRate](#getweightedmissrate)
  - [getFalsePositiveRate](#getfalsepositiverate)
    - [Parameters](#parameters-29)
  - [getMicroFallOut](#getmicrofallout)
  - [getMacroFallOut](#getmacrofallout)
  - [getWeightedFallOut](#getweightedfallout)
  - [getTrueNegativeRate](#gettruenegativerate)
    - [Parameters](#parameters-30)
  - [getMicroSpecificity](#getmicrospecificity)
  - [getMacroSpecificity](#getmacrospecificity)
  - [getWeightedSpecificity](#getweightedspecificity)
  - [getPrevalence](#getprevalence)
    - [Parameters](#parameters-31)
  - [getMicroPrevalence](#getmicroprevalence)
  - [getMacroPrevalence](#getmacroprevalence)
  - [getWeightedPrevalence](#getweightedprevalence)
  - [toString](#tostring)
    - [Parameters](#parameters-32)
    - [Examples](#examples-1)
  - [toTable](#totable)
    - [Parameters](#parameters-33)
  - [getShortStats](#getshortstats)
    - [Parameters](#parameters-34)
  - [getStats](#getstats-1)
  - [fromData](#fromdata)
    - [Parameters](#parameters-35)

### Learner

NodeJS Classification-based learner.

#### Parameters

- `opts`
  **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**
  Options.
  - `opts.dataset`
    **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)>**
    Dataset (for training and testing) (optional, default
    `require('./conv')('io')`)
  - `opts.splits`
    **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
    Dataset split percentage for the training/validation set (default:
    70%/15%/15%) (optional, default `[.7,.15]`)
  - `opts.classifier` **function ():
    [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**
    Classifier builder function (optional, default `classifierBuilder`)
  - `opts.pastTrainingSamples`
    **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)>**
    Past training samples for the classifier (optional, default `[]`)
  - `opts.classes`
    **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>**
    List of classes (categories) (optional, default `require('./categories')`)

#### Examples

Using pre-defined data

```javascript
const learner = new Learner()
```

Using a custom dataset

```javascript
const learner = new Learner({
  dataset: [
    {input: 'something bad', output: 'bad'},
    {input: 'a good thing', output: 'good'},
  ],
})
```

Using a specified classifier function

```javascript
const learner = new Learner({
  classifier: myClassifierBuilderFn, //see {@link module:./classifier} for an example (or checkout `limdu`'s examples)
})
```

Changing the train/test split percentage

```javascript
const learner = new Learner({
  splits: [0.6, 0.2],
})
```

(Re-)Using past-training samples

```javascript
const learner = new Learner({
  pastTrainingSamples: [
    {input: 'something bad', output: 'bad'},
    {input: 'a good thing', output: 'good'},
  ],
})
```

#### train

##### Parameters

- `trainSet`
  **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)>**
  Training set (optional, default `this.trainSet`)

#### eval

##### Parameters

- `log`
  **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**
  Log events (optional, default `false`)

Returns
**[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**
Statistics from a confusion matrix

#### serializeClassifier

Returns
**[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
Serialized classifier

#### serializeAndSaveClassifier

##### Parameters

- `file`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Filename (optional, default `'classifier.json'`)

Returns
**[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)
\|
[Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error))>**
Serialized classifier

#### deserializeClassifier

##### Parameters

- `serializedClassifier`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  .

Returns
**[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**
Deserialized classifier

#### loadAndDeserializeClassifier

##### Parameters

- `file`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Filename (optional, default `'classifier.json'`)

Returns
**[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)
\|
[Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error))>**
Deserialized classifier

#### classify

##### Parameters

- `data` **{input: any, output: any}** Data to classify

Returns
**[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>**
Classes

#### crossValidate

##### Parameters

- `numOfFolds`
  **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
  Cross-validation folds (optional, default `5`)
- `verboseLevel`
  **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
  Verbosity level on limdu's explainations (optional, default `0`)
- `log`
  **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**
  Cross-validation logging (optional, default `false`)

Returns **{microAvg:
[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object),
macroAvg:
[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)}**
Averages

#### backClassify

##### Parameters

- `category`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Category name.

Returns
**[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>**
Labels associated with `category`

#### toJSON

JSON representation of the learner with the serialized classification model.

Returns
**[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**
JSON representation

#### fromJSON

##### Parameters

- `json`
  **([JSON](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/JSON)
  \|
  [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object))**
  JSON form

Returns **[Learner](#learner)** Generated learner from `json`

#### getCategoryPartition

Get the observational overall/train/validation/test count for each classes in
the associated dataset.

##### Parameters

- `log`
  **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**
  Log events (optional, default `false`)
- `outputFile`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Filename for the output (to be used by chart.html) (optional, default `''`)

Returns
**[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String),
{overall:
[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number),
test:
[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number),
validation:
[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number),
train:
[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)}>**
Partitions

#### getStats

##### Parameters

- `log`
  **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**
  Log events (optional, default `false`)
- `categoryPartitionOutput`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Filename for the output of the category partitions. (optional, default `''`)

Returns
**[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**
Statistics

### ConfusionMatrix

Multi-class focused confusion matrix.

#### addEntry

##### Parameters

- `actual`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Actual class
- `predicted`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Predicted class

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
Updated entry

#### setEntry

##### Parameters

- `actual`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Actual class
- `predicted`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Predicted class
- `val`
  **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
  New entry

#### getEntry

##### Parameters

- `actual`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Actual class
- `predicted`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Predicted class

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
Entry

#### getTotal

Get the total count of **all** entries.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
Total count

#### getTP

Number of elements _in_ the `category` class correctly predicted.

##### Parameters

- `category`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Class/category considered as positive

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
True Positives

#### getFP

Number of elements that _aren't in_ the `category` class but predicted as such.

##### Parameters

- `category`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Class/category considered as positive

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
False Positives

#### getFN

Number of elements _in_ the `category` class but predicted as not being in it.

##### Parameters

- `category`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Class/category considered as positive

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
False Negatives

#### getTN

Number of elements that _aren't in_ the `category` class correctly predicted.

##### Parameters

- `category`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Class/category considered as positive

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
True Negatives

#### getDiagonal

Diagonal of truth (top-left → bottom-right)

Returns
**[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)>**
Numbers in the diagonal

#### getTrue

Number of correct (truthful) predictions.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
TP

#### getFalse

Number of incorrect predictions.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
FP + FN

#### getPositive

Number of real (actual) "positive" elements (i.e. elements that belong to the
`category` class).

##### Parameters

- `category`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Class/category considered as positive

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
TP + FN

#### getNegative

Number of real (actual) "negative" elements (i.e. elements that don't belong to
the `category` class).

##### Parameters

- `category`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Class/category considered as positive

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
TN + FP

#### getPredPositive

Number of predicted "positive" elements (i.e. elements guessed as belonging to
the `category` class).

##### Parameters

- `category`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Class/category considered as positive

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
TP + FN

#### getPredNegative

Number of predicted "negative" elements (i.e. elements guessed as not belonging
to the `category` class).

##### Parameters

- `category`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Class/category considered as positive

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
TN + FP

#### getSupport

Support value (count/occurrences) of `category` in the matrix

##### Parameters

- `category`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Class/category to look at

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
Support value

#### getAccuracy

Prediction accuracy for `category`.

##### Parameters

- `category`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Class/category considered as positive

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
(TP + TN) / (TP + TN + FP + FN)

#### getMicroAccuracy

Micro-average of accuracy.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
(TP0 + ... + TPn + TN0 + ... + TNn) / (TP0 + ... + TPn + TN0 + ... + TNn + FP0 +
... + FPn + FN0 + ... + FNn)

#### getMacroAccuracy

Macro-average of accuracy.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
(A0 + ...+ An_1) / n

#### getWeightedAccuracy

Weighted accuracy.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
(A0 _ s0 + ... + An _ sn) / Total

#### getTotalPositiveRate

Predicition recall.

##### Parameters

- `category`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Class/category considered as positive

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
TP / (TP + FN)

#### getMicroRecall

Micro-average of recall.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
(TP0 + ... + TPn) / (TP0 + ... + TPn + FN0 + ... + FNn)

#### getMacroRecall

Macro-average of recall.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
(R0 + R1 + ... + Rn-1) / n

#### getWeightedRecall

Weighted recalll.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
(R0 _ s0 + ... + Rn _ sn) / Total

#### getPositivePredictiveValue

Prediction precision for `category`.

##### Parameters

- `category`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Class/category considered as positive

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
TP / (TP + FP)

#### getPositivePredictiveValue

Prediction F1 score for `category`.

##### Parameters

- `category`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Class/category considered as positive

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
2 _ (Pr _ R) / (Pr + R)

#### getMicroPrecision

Micro-average of the precision.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
(TP0 + ... + TPn) / (TP0 + ... + TPn + FP0 + ... FPn)

#### getMacroPrecision

Macro-average of the precsion.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
(Pr0 + Pr1 + ... + Pr_n-1) / n

#### getWeightedPrecision

Weighted precision.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
(Pr0 _ s0 + ... + Prn _ sn) / Total

#### getMicroF1

Micro-average of the F1 score.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
2 _ (TP0 + ... + TPn) / (2 _ (TP0 + ... + TPn) + (FN0 + ... + FNn) + (FP0 +
... + FPn))

#### getMacroF1

Macro-average of the F1 score.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
(F0_1 + F1_1 + ... + F_n-1_1) / n

#### getWeightedF1

Weighted F1.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
(F0*1 * s0 + ... + Fn*1 * sn) / Total

#### getFalseNegativeRate

Miss rates on predictions for `category`.

##### Parameters

- `category`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Class/category considered as positive

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
FN / (TP + FN)

#### getMicroMissRate

Micro-average of the miss rate.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
(FN0 + ... + FNn) / (TP0 + ... + TPn + FN0 + ... FNn)

#### getMacroMissRate

Macro-average of the miss rate.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
(M0 + M1 + ... + Mn) / n

#### getWeightedMissRate

Weighted miss rate.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
(M0 _ s0 + ... + Mn _ sn) / Total

#### getFalsePositiveRate

Fall out (false alarm) on predictions for `category`.

##### Parameters

- `category`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Class/category considered as positive

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
FP / (FP + TN)

#### getMicroFallOut

Micro-average of the fall out.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
(FP0 + ... + FPn) / (FP0 + ... + FPn + TN0 + ... TNn)

#### getMacroFallOut

Macro-average of the fall out.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
(Fo0 + Fo1 + ... + Fo_n) / n

#### getWeightedFallOut

Weighted fall out.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
(Fo0 _ s0 + ... + Fon _ sn) / Total

#### getTrueNegativeRate

Specificity on predictions for `category`.

##### Parameters

- `category`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Class/category considered as positive

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
TN / (FP + TN)

#### getMicroSpecificity

Micro-average of the specificity.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
(TN0 + ... + TNn) / (FP0 + ... + FPn + TN0 + ... TNn)

#### getMacroSpecificity

Macro-average of the specificity.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
(S0 + S1 + ... + Sn) / n

#### getWeightedSpecificity

Weighted specificity.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
(S0 _ s0 + ... + Sn _ sn) / Total

#### getPrevalence

Prevalence on predictions for `category`.

##### Parameters

- `category`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Class/category considered as positive

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
(TP + FN) / (TP + TN + FP + FN)

#### getMicroPrevalence

Micro-average of the prevalence.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
(TP0 + ... + TPn + FN0 + ... + FNn) / (TP0 + ... + TPn + TN0 + ... + TNn + FP0 +
... + FPn + FN0 + ... + FNn)

#### getMacroPrevalence

Macro-average of the prevalence.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
(Pe0 + Pe1 + ... + Pen) / n

#### getWeightedPrevalence

Weighted prevalence.

Returns
**[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
(Pe0 _ s0 + ... + Pen _ sn) / Total

#### toString

Textual tabular representation of the confusion matrix.

##### Parameters

- `opt`
  **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**
  Options (optional, default `{}`)
  - `opt.split`
    **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**
    Split the classes in half (→ 2 matrices) (optional, default `false`)
  - `opt.clean`
    **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**
    Remove empty column/row pairs (optional, default `false`)
  - `opt.colours`
    **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**
    Colourize cells (optional, default `true`)
  - `opt.maxValue` (optional, default `100`)

##### Examples

Example output (cf. /src/**tests**/confusionMatrix.js)

````javascript
```
Actual \\ Predicted  bug   code  other
------------------  ----  ----  -----
bug                 5.00  0.00  1.00
code                1.00  2.00  0.00
other               0.00  3.00  8.00
````

Returns
**[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
String representation

#### toTable

`console.table` version of `confusionMatrix.toString()`.

##### Parameters

- `opt`
  **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**
  Options (optional, default `{}`)
  - `opt.split`
    **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**
    Split the classes in half (→ 2 matrices) (optional, default `false`)
  - `opt.clean`
    **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**
    Remove empty column/row pairs (optional, default `false`)
  - `opt.colours`
    **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**
    Colourize cells (optional, default `true`)
  - `opt.maxValue` (optional, default `100`)

#### getShortStats

##### Parameters

- `type`
  **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
  Type of stats (`micro`/`macro`/`weighted` average) (optional, default
  `'micro'`)

Returns
**[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
Short statistics (total, true, false, accuracy, precision, recall and f1)

#### getStats

Returns **{total:
[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number),
correctPredictions:
[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number),
incorrectPredictions:
[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number),
classes:
[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>,
microAvg:
[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object),
macroAvg:
[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object),
results:
[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)}**
(Long) statistics

#### fromData

Creates a confusion matrix from the `actual` and `predictions` classes.

##### Parameters

- `actual`
  **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>**
  Actual classes
- `predictions`
  **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>**
  Predicted classes
- `classes`
  **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>**
  Classes/categories to use (optional, default `[]`)

Returns **[ConfusionMatrix](#confusionmatrix)** Filled confusion matrix

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center"><a href="http://maxcubing.wordpress.com"><img src="https://avatars0.githubusercontent.com/u/8260834?v=4?s=100" width="100px;" alt="Maximilian Berkmann"/><br /><sub><b>Maximilian Berkmann</b></sub></a><br /><a href="https://github.com/all-contributors/ac-learn/commits?author=Berkmann18" title="Code">💻</a> <a href="https://github.com/all-contributors/ac-learn/commits?author=Berkmann18" title="Documentation">📖</a> <a href="#ideas-Berkmann18" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-Berkmann18" title="Maintenance">🚧</a> <a href="#platform-Berkmann18" title="Packaging/porting to new platform">📦</a> <a href="#infra-Berkmann18" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/all-contributors/ac-learn/commits?author=Berkmann18" title="Tests">⚠️</a> <a href="#security-Berkmann18" title="Security">🛡️</a></td>
      <td align="center"><a href="https://tenshiamd.com"><img src="https://avatars.githubusercontent.com/u/13580338?v=4?s=100" width="100px;" alt="Angel Aviel Domaoan"/><br /><sub><b>Angel Aviel Domaoan</b></sub></a><br /><a href="https://github.com/all-contributors/ac-learn/commits?author=tenshiAMD" title="Code">💻</a> <a href="#maintenance-tenshiAMD" title="Maintenance">🚧</a> <a href="https://github.com/all-contributors/ac-learn/pulls?q=is%3Apr+reviewed-by%3AtenshiAMD" title="Reviewed Pull Requests">👀</a></td>
      <td align="center"><a href="https://github.com/features/security"><img src="https://avatars.githubusercontent.com/u/27347476?v=4?s=100" width="100px;" alt="Dependabot"/><br /><sub><b>Dependabot</b></sub></a><br /><a href="#security-dependabot" title="Security">🛡️</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the
[all-contributors](https://github.com/all-contributors/all-contributors)
specification. Contributions of any kind welcome!
