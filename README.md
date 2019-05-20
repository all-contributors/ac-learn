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

TBC once its deployed

```bash
yarn add ac-learn --save
#or
npm i -D ac-learn
```

## Documentation

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

- [Learner](#learner)
  - [train](#train)
    - [Parameters](#parameters)
  - [eval](#eval)
  - [serializeClassifier](#serializeclassifier)
  - [serializeAndSaveClassifier](#serializeandsaveclassifier)
    - [Parameters](#parameters-1)
  - [deserializeClassifier](#deserializeclassifier)
    - [Parameters](#parameters-2)
  - [loadAndDeserializeClassifier](#loadanddeserializeclassifier)
    - [Parameters](#parameters-3)
  - [classify](#classify)
    - [Parameters](#parameters-4)
  - [crossValidate](#crossvalidate)
    - [Parameters](#parameters-5)
  - [backClassify](#backclassify)
    - [Parameters](#parameters-6)
  - [toJSON](#tojson)
  - [fromJSON](#fromjson)
    - [Parameters](#parameters-7)
  - [getCategoryPartition](#getcategorypartition)
  - [getStats](#getstats)
- [ConfusionMatrix](#confusionmatrix)
  - [addEntry](#addentry)
    - [Parameters](#parameters-8)
  - [setEntry](#setentry)
    - [Parameters](#parameters-9)
  - [getEntry](#getentry)
    - [Parameters](#parameters-10)
  - [getTotal](#gettotal)
  - [getTP](#gettp)
    - [Parameters](#parameters-11)
  - [getFP](#getfp)
    - [Parameters](#parameters-12)
  - [getFN](#getfn)
    - [Parameters](#parameters-13)
  - [getTN](#gettn)
    - [Parameters](#parameters-14)
  - [getDiagonal](#getdiagonal)
  - [getTrue](#gettrue)
  - [getFalse](#getfalse)
  - [getPositive](#getpositive)
    - [Parameters](#parameters-15)
  - [getNegative](#getnegative)
    - [Parameters](#parameters-16)
  - [getPredPositive](#getpredpositive)
    - [Parameters](#parameters-17)
  - [getPredNegative](#getprednegative)
    - [Parameters](#parameters-18)
  - [getAccuracy](#getaccuracy)
    - [Parameters](#parameters-19)
  - [getMicroAccuracy](#getmicroaccuracy)
  - [getMacroAccuracy](#getmacroaccuracy)
  - [getTotalPositiveRate](#gettotalpositiverate)
    - [Parameters](#parameters-20)
  - [getMicroRecall](#getmicrorecall)
  - [getMacroRecall](#getmacrorecall)
  - [getPositivePredictiveValue](#getpositivepredictivevalue)
    - [Parameters](#parameters-21)
  - [getPositivePredictiveValue](#getpositivepredictivevalue-1)
    - [Parameters](#parameters-22)
  - [getMicroPrecision](#getmicroprecision)
  - [getMacroPrecision](#getmacroprecision)
  - [getMicroF1](#getmicrof1)
  - [getMacroF1](#getmacrof1)
  - [getFalseNegativeRate](#getfalsenegativerate)
    - [Parameters](#parameters-23)
  - [getMicroMissRate](#getmicromissrate)
  - [getMacroMissRate](#getmacromissrate)
  - [getFalsePositiveRate](#getfalsepositiverate)
    - [Parameters](#parameters-24)
  - [getMicroFallOut](#getmicrofallout)
  - [getMacroFallOut](#getmacrofallout)
  - [getTrueNegativeRate](#gettruenegativerate)
    - [Parameters](#parameters-25)
  - [getMicroSpecificity](#getmicrospecificity)
  - [getMacroSpecificity](#getmacrospecificity)
  - [getPrevalence](#getprevalence)
    - [Parameters](#parameters-26)
  - [getMicroPrevalence](#getmicroprevalence)
  - [getMacroPrevalence](#getmacroprevalence)
  - [toString](#tostring)
    - [Parameters](#parameters-27)
  - [getShortStats](#getshortstats)
  - [getStats](#getstats-1)
  - [fromData](#fromdata)
    - [Parameters](#parameters-28)

### Learner

NodeJS Classification-based learner.

#### train

##### Parameters

- `trainSet` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)>** Training set (optional, default `this.trainSet`)

#### eval

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** Statistics from a confusion matrix

#### serializeClassifier

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Serialized classifier

#### serializeAndSaveClassifier

##### Parameters

- `file` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Filename (optional, default `'classifier.json'`)

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error))>** Serialized classifier

#### deserializeClassifier

##### Parameters

- `serializedClassifier` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** .

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** Deserialized classifier

#### loadAndDeserializeClassifier

##### Parameters

- `file` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Filename (optional, default `'classifier.json'`)

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error))>** Deserialized classifier

#### classify

##### Parameters

- `data` **{input: any, output: any}** Data to classify

Returns **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>** Classes

#### crossValidate

##### Parameters

- `numOfFolds` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Cross-validation folds (optional, default `5`)
- `verboseLevel` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Verbosity (optional, default `0`)
- `log` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** Pre-training logging (optional, default `false`)

Returns **{microAvg: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object), macroAvg: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)}** Averages

#### backClassify

##### Parameters

- `category` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Category name.

Returns **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>** Labels associated with `category`

#### toJSON

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** JSON representation

#### fromJSON

##### Parameters

- `json` **([JSON](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/JSON) \| [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object))** JSON form

Returns **[Learner](#learner)** Generated learner from `json`

#### getCategoryPartition

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), {overall: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number), test: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number), train: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)}>** Partitions

#### getStats

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** Statistics

### ConfusionMatrix

Multi-class focused confusion matrix.

#### addEntry

##### Parameters

- `actual` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Actual class
- `predicted` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Predicted class

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Updated entry

#### setEntry

##### Parameters

- `actual` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Actual class
- `predicted` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Predicted class
- `val` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** New entry

#### getEntry

##### Parameters

- `actual` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Actual class
- `predicted` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Predicted class

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Entry

#### getTotal

Get the total count of **all** entries.

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Total count

#### getTP

Number of elements _in_ the `category` class correctly predicted.

##### Parameters

- `category` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Class/category considered as positive

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** True Positives

#### getFP

Number of elements that _aren't in_ the `category` class but predicted as such.

##### Parameters

- `category` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Class/category considered as positive

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** False Positives

#### getFN

Number of elements _in_ the `category` class but predicted as not being in it.

##### Parameters

- `category` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Class/category considered as positive

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** False Negatives

#### getTN

Number of elements that _aren't in_ the `category` class correctly predicted.

##### Parameters

- `category` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Class/category considered as positive

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** True Negatives

#### getDiagonal

Diagonal of truth (top-left → bottom-right)

Returns **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)>** Numbers in the diagonal

#### getTrue

Number of correct (truthful) predictions.

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** TP

#### getFalse

Number of incorrect predictions.

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** FP + FN

#### getPositive

Number of real (actual) "positive" elements (i.e. elements that belong to the `category` class).

##### Parameters

- `category` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Class/category considered as positive

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** TP + FN

#### getNegative

Number of real (actual) "negative" elements (i.e. elements that don't belong to the `category` class).

##### Parameters

- `category` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Class/category considered as positive

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** TN + FP

#### getPredPositive

Number of predicted "positive" elements (i.e. elements guessed as belonging to the `category` class).

##### Parameters

- `category` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Class/category considered as positive

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** TP + FN

#### getPredNegative

Number of predicted "negative" elements (i.e. elements guessed as not belonging to the `category` class).

##### Parameters

- `category` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Class/category considered as positive

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** TN + FP

#### getAccuracy

Prediction accuracy for `category`.

##### Parameters

- `category` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Class/category considered as positive

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** (TP + TN) / (TP + TN + FP + FN)

#### getMicroAccuracy

Micro-average of accuracy.

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** (TP0 + ... + TPn + TN0 + ... + TNn) / (TP0 + ... + TPn + TN0 + ... + TNn + FP0 + ... + FPn + FN0 + ... + FNn)

#### getMacroAccuracy

Macro-average of accuracy.

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** (A0 + ... An_1) / n

#### getTotalPositiveRate

Predicition recall.

##### Parameters

- `category` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Class/category considered as positive

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** TP / (TP + FN)

#### getMicroRecall

Micro-average of recall.

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** (TP0 + ... + TPn) / (TP0 + ... + TPn + FN0 + ... + FNn)

#### getMacroRecall

Macro-average of recall.

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** (R0 + R1 + ... + Rn-1) / n

#### getPositivePredictiveValue

Prediction precision for `category`.

##### Parameters

- `category` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Class/category considered as positive

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** TP / (TP + FP)

#### getPositivePredictiveValue

Prediction F1 score for `category`.

##### Parameters

- `category` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Class/category considered as positive

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 2 _ (Pr _ R) / (Pr + R)

#### getMicroPrecision

Micro-average of the precision.

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** (TP0 + ... + TPn) / (TP0 + ... + TPn + FP0 + ... FPn)

#### getMacroPrecision

Macro-average of the precsion.

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** (Pr0 + Pr1 + ... + Pr_n-1) / n

#### getMicroF1

Micro-average of the F1 score.

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 2 _ (TP0 + ... + TPn) / (2 _ (TP0 + ... + TPn) + (FN0 + ... + FNn) + (FP0 + ... + FPn))

#### getMacroF1

Macro-average of the precision.

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** (F0_1 + F1_1 + ... + F_n-1_1) / n

#### getFalseNegativeRate

Miss rates on predictions for `category`.

##### Parameters

- `category` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Class/category considered as positive

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** FN / (TP + FN)

#### getMicroMissRate

Micro-average of the miss rate.

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** (FN0 + ... + FNn) / (TP0 + ... + TPn + FN0 + ... FNn)

#### getMacroMissRate

Macro-average of the miss rate.

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** (M0 + M1 + ... + Mn) / n

#### getFalsePositiveRate

Fall out (false alarm) on predictions for `category`.

##### Parameters

- `category` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Class/category considered as positive

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** FP / (FP + TN)

#### getMicroFallOut

Micro-average of the fall out.

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** (FP0 + ... + FPn) / (FP0 + ... + FPn + TN0 + ... TNn)

#### getMacroFallOut

Macro-average of the fall out.

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** (Fo0 + Fo1 + ... + Fo_n) / n

#### getTrueNegativeRate

Specificity on predictions for `category`.

##### Parameters

- `category` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Class/category considered as positive

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** TN / (FP + TN)

#### getMicroSpecificity

Micro-average of the specificity.

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** (TN0 + ... + TNn) / (FP0 + ... + FPn + TN0 + ... TNn)

#### getMacroSpecificity

Macro-average of the specificity.

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** (S0 + S1 + ... + Sn) / n

#### getPrevalence

Prevalence on predictions for `category`.

##### Parameters

- `category` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Class/category considered as positive

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** (TP + FN) / (TP + TN + FP + FN)

#### getMicroPrevalence

Micro-average of the prevalence.

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** (TP0 + ... + TPn + FN0 + ... + FNn) / (TP0 + ... + TPn + TN0 + ... + TNn + FP0 + ... + FPn + FN0 + ... + FNn)

#### getMacroPrevalence

Macro-average of the prevalence.

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** (S0 + S1 + ... + Sn) / n

#### toString

##### Parameters

- `opt` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** Options (optional, default `{}`)
  - `opt.split` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** Split the classes in half (→ 2 matrices) (optional, default `false`)
  - `opt.clean` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** Remove empty column/row pairs (optional, default `false`)
  - `opt.colours` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** Colourize cells (optional, default `true`)
  - `opt.maxValue` (optional, default `100`)

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** String representation

#### getShortStats

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Short statistics (total, true, false, accuracy, precision, recall and f1)

#### getStats

Returns **{total: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number), correctPredictions: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number), incorrectPredictions: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number), classes: [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>, microAvg: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object), macroAvg: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object), results: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)}** (Long) statistics

#### fromData

Creates a confusion matrix from the `actual` and `predictions` classes.

##### Parameters

- `actual` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>** Actual classes
- `predictions` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>** Predicted classes
- `classes` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>** Classes/categories to use (optional, default `[]`)

Returns **[ConfusionMatrix](#confusionmatrix)** Filled confusion matrix

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->

<!-- prettier-ignore -->
Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<table><tr><td align="center"><a href="http://maxcubing.wordpress.com"><img src="https://avatars0.githubusercontent.com/u/8260834?v=4" width="100px;" alt="Maximilian Berkmann"/><br /><sub><b>Maximilian Berkmann</b></sub></a><br /><a href="https://github.com/Berkmann18/json-fixer/commits?author=Berkmann18" title="Code">💻</a> <a href="https://github.com/Berkmann18/json-fixer/commits?author=Berkmann18" title="Documentation">📖</a> <a href="#ideas-Berkmann18" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-Berkmann18" title="Maintenance">🚧</a></td></tr></table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
