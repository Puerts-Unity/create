#!/usr/bin/env node

import * as fse from 'fs-extra';
import * as path from 'path';
import * as cp from 'child_process';

const cwd = process.cwd();

async function isDirEmpty(dirname) {
  const files = await fse.readdir(dirname);
  return files.length === 0;
}


async function create() {
  const newProjectPath = path.join(cwd, 'react');
  await fse.mkdirp(newProjectPath);

  const empty = await isDirEmpty(newProjectPath);

  if (!empty) {
    throw new Error('The directory `react` already exist and is not empty.');
  }

  // Copy project template
  await fse.copy(path.join(__dirname, 'scaffold'), newProjectPath, { recursive: true });


  // Workaround for npm deleting .gitignore file
  const gitignoreSrcPath = path.join(newProjectPath, 'gitignore');
  const gitignoreDestPath = path.join(newProjectPath, '.gitignore');
  await fse.move(gitignoreSrcPath, gitignoreDestPath);

  console.log('Successfully scaffolded the react project at ' + newProjectPath);

  // Install npm modules
  var npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  try {
    console.log("Starting NPM install");
    run_script(npm, ['install'], {
      cwd: newProjectPath,
    }, () => {
      console.log('Successfully created react-unity project at ' + newProjectPath);
      process.exit();
    });
  } catch (err) {
    console.error('Could not install node modules. You need to manually go to the project folder and run `npm install`.');
    console.error(err);
  }
}

create().catch(err => {
  console.error(err);
});

function run_script(command: string, args: string[], options: cp.SpawnOptionsWithoutStdio, callback: (string, number) => any) {
  var child = cp.spawn(command, args, options);

  var scriptOutput = "";

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', function (data) {
    console.log(data);

    data = data.toString();
    scriptOutput += data;
  });

  child.stderr.setEncoding('utf8');
  child.stderr.on('data', function (data) {
    console.error(data);

    data = data.toString();
    scriptOutput += data;
  });

  child.on('close', function (code) {
    callback(scriptOutput, code);
  });
}
