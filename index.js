var Promise = require('bluebird');
var clone = require('nodegit').Clone.clone;
var logger = require('hw-logger');
var log = logger.log;
var jspm = require('jspm');
var gulp = require('gulp');

logger.init({
  colors: true
});

var npm = require('npm');

npm.on("log", function(message) {
  log.info(message);
});


var baseUrl = "https://github.com/aurelia";
var libPath = "../";

var repoNames = [
  'http-client',
  'bootstrapper',
  'framework'
];

var tasks = [];

repoNames
  .forEach(function(repoName) {
    tasks.push(doRepo(repoName));
  });


Promise.all(tasks)
  .then(function() {
    log.info('Successfully built the following repos: ', repoNames);
  }).catch(function(err) {
    log.error(err);
  })

function doRepo(repoName) {
  var repoPath = libPath + repoName;

  // If the repo alrady exists locally:
  // - Hard reset
  // - Pull/Checkout latest
  // Other wise Clone.

  return cloneRepo(repoName, repoPath)
    .then(function() {
      return getNPMDependencies(repoPath);
    })
    .then(function(npmDeps) {
      return npmInstall(repoPath, npmDeps);
    })
    .then(function() {
      return jspmInstall(repoPath);
    })
    .then(function() {
      return runGulpBuild();
    });
}

function runGulpBuild() {
  return Promise.resolve();
}

function getNPMDependencies(repoPath) {
  log.info('Extracting NPM dependencies..');

  var pkg = require(repoPath + '/package.json');
  var allDeps = [];
  var devDeps = pkg.devDependencies || {};
  var deps = pkg.dependencies || {};

  Object.keys(devDeps).forEach(function(key) {
    var dep = key + '@' + devDeps[key];
    allDeps.push(dep);
  });

  Object.keys(deps).forEach(function(key) {
    var dep = key + '@' + deps[key];
    allDeps.push(dep);
  });

  return Promise.resolve(allDeps);
}



function cloneRepo(repoName, repoPath) {
  log.info("Cloneing '" + repoName + "' ...");
  return clone(baseUrl + "/" + repoName, repoPath, null);
}

function npmInstall(repoPath, packages) {
  log.info('Installing npm modules.');

  return new Promise(function(resolve, reject) {
    npm.load(function(err, npm) {
      npm.commands.install(repoPath, packages, function(er, data) {
        if (er !== undefined && er !== null) {
          reject(er);
        } else {
          resolve(data);
        }
      });
    });
  });
}

function jspmInstall(repoPath) {
  log.info('Installing JSPM packages..');

  jspm.setPackagePath(repoPath);
  return jspm.install(true, {
    lock: true
  });
}
