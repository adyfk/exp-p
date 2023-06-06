const childProcess = require("child_process");
const path = require("path");
const { promisify } = require("util");
const yargs = require("yargs");

const exec = promisify(childProcess.exec);

const validBundles = ["stable"];

async function run(argv) {
  const { bundle, largeFiles, outDir: relativeOutDir, verbose } = argv;

  if (validBundles.indexOf(bundle) === -1) {
    throw new TypeError(
      `Unrecognized bundle '${bundle}'. Did you mean one of "${validBundles.join(
        "\", \"",
      )}"?`,
    );
  }

  const env = {
    NODE_ENV: "production",
    BABEL_ENV: bundle,
    MUI_BUILD_VERBOSE: verbose,
  };
  const babelConfigPath = path.resolve(__dirname, "../babel-build.config.js");
  const srcDir = path.resolve("./src");
  const extensions = [".js", ".ts", ".tsx"];
  const ignore = [
    "**/*.test.js",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "**/*.d.ts",
    "**/__stories__/*",
    "**/*.stories.ts",
    "**/*.stories.js",
    "**/*.stories.tsx",
    "**/*.stories.jsx",
  ];

  const outDir = path.resolve(
    relativeOutDir,
    {
      stable: "./",
    }[bundle],
  );

  const babelArgs = [
    "--config-file",
    babelConfigPath,
    "--extensions",
    `"${extensions.join(",")}"`,
    srcDir,
    "--out-dir",
    outDir,
    "--ignore",
    // Need to put these patterns in quotes otherwise they might be evaluated by the used terminal.
    `"${ignore.join("\",\"")}"`,
  ];
  if (largeFiles) {
    babelArgs.push("--compact false");
  }

  const command = ["npx babel", ...babelArgs].join(" ");

  if (verbose) {
    // eslint-disable-next-line no-console
    console.log(`running '${command}' with ${JSON.stringify(env)}`);
  }

  const { stderr, stdout } = await exec(command, {
    env: { ...process.env, ...env },
  });
  if (stderr) {
    throw new Error(`'${command}' failed with \n${stderr}`);
  }

  if (verbose) {
    // eslint-disable-next-line no-console
    console.log(stdout);
  }
}

yargs
  .command({
    command: "$0 <bundle>",
    description: "build package",
    builder: (command) => command
      .positional("bundle", {
        description: `Valid bundles: "${validBundles.join("\" | \"")}"`,
        type: "string",
      })
      .option("largeFiles", {
        type: "boolean",
        default: false,
        describe:
            "Set to `true` if you know you are transpiling large files.",
      })
      .option("out-dir", { default: "./dist", type: "string" })
      .option("verbose", { type: "boolean" }),
    handler: run,
  })
  .help()
  .strict(true)
  .version(false)
  .parse();