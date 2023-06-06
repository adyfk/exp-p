/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
const path = require("path");
const fse = require("fs-extra");
const glob = require("fast-glob");

const packagePath = process.cwd();
const buildPath = path.join(packagePath, "./dist");
const srcPath = path.join(packagePath, "./src");

async function createModulePackages({ from, to }) {
  const directoryPackages = glob
    .sync("*/index.{js,ts,tsx}", { cwd: from })
    .map(path.dirname);

  await Promise.all(
    directoryPackages.map(async (directoryPackage) => {
      const packageJsonPath = path.join(to, directoryPackage, "package.json");

      const packageJson = {
        sideEffects: false,
        module: "./index.js",
        main: "./index.js",
        types: "./index.d.ts",
      };

      const [typingsEntryExist, moduleEntryExists, mainEntryExists] = await Promise.all([
        fse.pathExists(
          path.resolve(path.dirname(packageJsonPath), packageJson.types),
        ),
        fse.pathExists(
          path.resolve(path.dirname(packageJsonPath), packageJson.module),
        ),
        fse.pathExists(
          path.resolve(path.dirname(packageJsonPath), packageJson.main),
        ),
        fse.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2)),
      ]);

      const manifestErrorMessages = [];
      if (!typingsEntryExist) {
        manifestErrorMessages.push(
          `'types' entry '${packageJson.types}' does not exist`,
        );
      }
      if (!moduleEntryExists) {
        manifestErrorMessages.push(
          `'module' entry '${packageJson.module}' does not exist`,
        );
      }
      if (!mainEntryExists) {
        manifestErrorMessages.push(
          `'main' entry '${packageJson.main}' does not exist`,
        );
      }
      if (manifestErrorMessages.length > 0) {
        // TODO: AggregateError
        throw new Error(
          `${packageJsonPath}:\n${manifestErrorMessages.join("\n")}`,
        );
      }

      return packageJsonPath;
    }),
  );
}

// add package here
const packageIncludes = [
];

async function includeFileInBuild(file) {
  const sourcePath = path.resolve(packagePath, file);
  const targetPath = path.resolve(buildPath, path.basename(file));
  await fse.copy(sourcePath, targetPath);
}

async function createPackageFile() {
  const packageData = await fse.readFile(
    path.resolve(packagePath, "./package.json"),
    "utf8",
  );
  const {
    nyc,
    scripts,
    devDependencies,
    workspaces,
    ...packageDataOther
  } = JSON.parse(packageData);

  const { dependencies } = packageDataOther;
  const newPackageData = {
    ...packageDataOther,
    dependencies: packageIncludes.reduce((acc, item) => {
      acc[item] = dependencies[item];
      return acc;
    }, {}),
    private: false,
    ...(packageDataOther.main
      ? {
        main: "./index.js",
        module: "./index.js",
      }
      : {}),
    types: "./index.d.ts",
  };

  delete newPackageData.files;

  const targetPath = path.resolve(buildPath, "./package.json");

  await fse.writeFile(
    targetPath,
    JSON.stringify(newPackageData, null, 2),
    "utf8",
  );
  console.log(`Created package.json in ${targetPath}`);

  return newPackageData;
}

async function prepend(file, string) {
  const data = await fse.readFile(file, "utf8");
  await fse.writeFile(file, string + data, "utf8");
}

async function addLicense(packageData) {
  const license = `/** @license React Expression Parser v${packageData.version}
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
`;
  await Promise.all(
    ["./index.js"].map(async (file) => {
      try {
        await prepend(path.resolve(buildPath, file), license);
      } catch (err) {
        if (err.code === "ENOENT") {
          console.log(`Skipped license for ${file}`);
        } else {
          throw err;
        }
      }
    }),
  );
}

async function run() {
  try {
    const packageData = await createPackageFile();

    await Promise.all(
      [
        "./README.md",
        // './CHANGELOG.md',
        // './LICENSE',
      ].map((file) => includeFileInBuild(file)),
    );

    await addLicense(packageData);

    // TypeScript
    // await typescriptCopy({ from: './types', to: buildPath });
    await createModulePackages({ from: srcPath, to: buildPath });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();