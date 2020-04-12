const fs = require('fs');
const path = require('path');
const SUCCESS_STATE_CODE = 0;
const ERROR_STATE_CODE = 1;

// Starts on 2 because process.argv contains the whole command-line invocation
const processArguments = process.argv.slice(2);
const romsDirectory = processArguments[0];

/***
 * Return if file exits or not.
 * @param {string} filePath
 * @returns <boolean>
 */
const isFileExists = async (filePath) => {
  try {
    return await fs.existsSync(filePath);
  } catch(err) {
    return false;
  }
}

/***
 * Return all '.nes' files from specified directory
 * @param {string} romsDirectory
 * @returns {Promise<Array<File>>}
 */
const getNesRomFiles = async (romsDirectory) => {
  const nesFiles = [];
  const filesInRomsDirectory = await fs.readdirSync(romsDirectory);
  for(const file of filesInRomsDirectory) {
    if(path.extname(file) === ".nes") {
      nesFiles.push(file);
    }
  }
  return nesFiles;
}

/**
 * Generate JSON Object that contains for each rom :
 * - Rom name
 * - Preview picture file name
 * @param {Array<File>} romFiles
 * @returns {Promise<{roms: Array<Object>}>}
 */
const generateRomsList = async (romsDirectory, romFiles) => {
  const RomsList = {roms: []};
  for(const rom of romFiles){
    const fileName = rom;
    const filePath = `${romsDirectory}/${fileName}`;
    const previewImageFilePath = filePath.replace('.nes', '.png');
    const romDescription = { fileName, previewImageFilePath };
    if(!(await isFileExists(previewImageFilePath))) {
      romDescription.previewImageFilePath = null;
    }
    RomsList.roms.push(romDescription);
  }
  return RomsList;
}

/**
 * Generate .json file that contains the list of all available roms.
 * @param {string} romsDirectory
 * @param {string} targetFilePath
 * @returns {Promise<void>}
 */
const generateRomsListJsonFile = async (romsDirectory, targetFilePath) => {
  const romFiles = await getNesRomFiles(romsDirectory);
  const RomsList =  await generateRomsList(romsDirectory, romFiles);
  const RomsListFileContent = JSON.stringify(RomsList);
  await fs.writeFileSync(targetFilePath, RomsListFileContent);
}

(async () => {
  try {
    const targetRomsListFilePath = `${romsDirectory}/roms.json`;
    await generateRomsListJsonFile(romsDirectory, targetRomsListFilePath);
    process.exit(SUCCESS_STATE_CODE);
  } catch (exception) {
    process.exit(ERROR_STATE_CODE);
  }
})();
