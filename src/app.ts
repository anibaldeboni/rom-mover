import AdmZip from 'adm-zip';
import glob from 'glob';
import path from 'path';
import fs from 'fs';

const mv = async (oldPath: string, newPath: string) => {
  try {
    await fs.promises.mkdir(path.dirname(newPath), { recursive: true });
    await fs.promises.rename(oldPath, newPath);
    // Handle success
    console.log('File moved successfully: ' + oldPath + ' -> ' + newPath);
  } catch (error) {
    // Handle the error
    console.error(error);
  }
};

const romsContainingFiletype = (zipFilesPath: string, fileExt: string) => {
  return glob.sync(`${zipFilesPath}/**/*.zip`).reduce((acc, zipFile) => {
    const files = new AdmZip(zipFile).getEntries().filter((entry) => entry.entryName.endsWith(fileExt));
    return files.length > 0 ? [...acc, zipFile] : acc;
  }, [] as string[]);
};

const moveRomsAndThumbs = async (romsPaths: string[], destination: string, thumbDir?: string) => {
  const romsToMovePromises = romsPaths.map((file) => mv(file, `${destination}/${path.basename(file)}`));
  await Promise.all(romsToMovePromises);
  if (thumbDir) {
    const thumbsToMove = romsPaths
      .map((file) => `${path.dirname(file)}/${thumbDir}/${path.basename(file, '.zip')}.png`)
      .filter((thumb) => fs.existsSync(thumb));

    const thumbsToMovePromises = thumbsToMove.map((thumb) =>
      mv(thumb, `${destination}/${thumbDir}/${path.basename(thumb)}`),
    );
    await Promise.all(thumbsToMovePromises);
  }
};

(async () => {
  await moveRomsAndThumbs(
    romsContainingFiletype('/media/anibal/MIYOO/Roms/GB', '.gbc'),
    '/media/anibal/MIYOO/Roms/GBC',
    'Imgs',
  );
})();
