/* eslint-disable no-console */

const glob = require('glob');
const chalk = require('chalk');
const { writeFileSync } = require('fs');
const { basename, resolve } = require('path');
const camelCase = require('camelcase');

const { findRepeated } = require('../../utils/array.utils');
const { toRelativePath } = require('../../utils/file.utils');

const { commons, store } = require('../../utils/redux/file-parts.json');

const { getFiles } = require('../../utils/file.utils');

const createStore = async () => {

  // First we need to read files from two origins.

  const filesFromWeb = await getFiles(`${resolve('src')}/**/*.reducer.js`);
  const filesFromCommons = await getFiles(`${resolve('node_modules', '@openbank', 'mb-ui-commons', 'dist')}/**/*.reducer.js`);

  const files = [...filesFromWeb, ...filesFromCommons];

  if (files.length <= 0) throw new Error('There are no reducer.');

  // Once we get all the reducers from "src", now we create dynamically
  // the store.js file with all the imports as strings (due to WebPack
  // import strategy).

  const fileNames = files.map(file => basename(file, '.reducer.js'));

  try {

    // First we need to find duplicates. We are not going to admit
    // duplicates to avoid errors.

    let repeated = findRepeated(fileNames);

    if (repeated > 0) {
      throw new Error(`Repeated reducer name ${fileNames[repeated]}.`);
    }

    const { flowLabel, returnJSONOut } = commons;
    const { importLibraries, combineReducers, declareMiddleware, createStore } = store;

    let structure = `${flowLabel}${importLibraries}`;

    fileNames.map((fileName, index) => structure = `${structure}${`import ${camelCase(fileName)} from '${toRelativePath(files[index], '', '../..')}';`}\n`);

    structure = `${structure}\n${combineReducers}`;

    fileNames.map(fileName => structure = `${structure}  ${camelCase(fileName)},\n`);

    structure = `${structure}${returnJSONOut}${declareMiddleware}${createStore}`;

    // And finally we write the file structure in a real file in the store folder.

    const storePath = resolve('src', 'store', 'store.js');

    writeFileSync(storePath, structure, 'utf-8');

  } catch (error) {
    // If there are duplicates we will show an error to the user.
    console.log(chalk.bold.red('ERROR!'), chalk.yellowBright(error.message), '\n');
  }
};

createStore();
