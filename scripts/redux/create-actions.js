/* eslint-disable no-console */

const glob = require('glob');
const chalk = require('chalk');
const { writeFileSync } = require('fs');
const { basename, resolve } = require('path');
const camelCase = require('camelcase');

const { findRepeated } = require('../../utils/array.utils');
const { toRelativePath } = require('../../utils/file.utils');

const { commons } = require('../../utils/redux/file-parts.json');

const { getFiles } = require('../../utils/file.utils');

const createActions = async () => {

  // First we need to read files from two origins.

  const filesFromWeb = await getFiles(`${resolve('src')}/**/*.actions.js`);
  const filesFromCommons = await getFiles(`${resolve('node_modules', '@openbank', 'mb-ui-commons', 'dist')}/**/*.actions.js`);

  const files = [...filesFromWeb, ...filesFromCommons];

  if (files.length <= 0) throw new Error('There are no actions.');

  // Once we get all the actions from "src" and "dist", now we create
  // dynamically the action file, where we have all the actions groups
  // under the reducer name (same as the component).

  const fileNames = files.map(file => basename(file, '.actions.js'));

  try {

    // First we need to find duplicates. We are not going to admit
    // duplicates to avoid errors.

    let repeated = findRepeated(fileNames);

    if (repeated > 0) {
      throw new Error(`Repeated actions file ${fileNames[repeated]}.`);
    }

    const { exportIn, exportOut } = commons;

    let structure = '';

    fileNames.map((fileName, index) => structure = `${structure}${`import * as ${camelCase(fileName)} from '${toRelativePath(files[index], '', '../..')}';`}\n`);

    structure = `${structure}\n${exportIn}`;

    fileNames.map(fileName => structure = `${structure}  ${camelCase(fileName)},\n`);

    structure = `${structure}${exportOut}`;

    // And finally we write the file structure in a real file in the store folder.

    const actionsFilePath = resolve('src', 'store', 'actions.js');

    writeFileSync(actionsFilePath, structure, 'utf-8');

  } catch (error) {
    // If there are duplicates we will show an error to the user.
    console.log(chalk.bold.red('ERROR!'), chalk.yellowBright(error.message), '\n');
  }
};

createActions();
