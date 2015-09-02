var Promise = require('bluebird');
var logger = require('hw-logger');
var log = logger.log;
var jspm = require('jspm');
var fs = Promise.promisifyAll(require('fs'));

var NodeGit = require('nodegit');
var Clone = NodeGit.Clone;
var Repository = NodeGit.Repository;
var Reset = NodeGit.Reset;

logger.init({
  colors: true
});

var npm = require('npm');

npm.on("log", function(message) {
  log.info(message);
});


exports.buildAll = function(repoNames, baseUrl, localLibFolder) {
  var tasks = [];

  repoNames
    .forEach(function(repoName) {
      tasks.push(doRepo(repoName, baseUrl, localLibFolder));
    });

  return Promise.all(tasks);
}


function doRepo(repoName, baseUrl, localLibFolder) {
  var repoPath = localLibFolder + repoName;

  return fs.existsAsync(repoPath)
    .then((exists) => {
      var promise;
      if (exists) {
        promise = cloneRepo(repoName, baseUrl, repoPath);
      } else {
        promise = checkoutRepo(repoName, baseUrl, repoPath);
      }

      return promise.then(function() {
          return getNPMDependencies(repoPath);
        })
        .then(function(npmDeps) {
          return npmInstall(repoPath, npmDeps, repoName);
        })
        .then(function() {
          return jspmInstall(repoPath, repoName);
        })
        .then(function() {
          return runGulpBuild(repoPath, repoName);
        });
    });
}

function runGulpBuild(repoPath, repoName) {
  log.info('Building '+ repoName +' ...');
  var gulp = repoPath + '/node_modules/gulp/bin/gulp.js';
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



function cloneRepo(repoName, baseUrl, repoPath) {
  log.info("Cloneing '" + repoName + "' ...");
  return Clone.clone(baseUrl + "/" + repoName, repoPath, null);
}

function resetRepo(repoName, baseUrl, repoPath) {
  log.info("Checking out '" + repoName + "' ...");
  return clone(baseUrl + "/" + repoName, repoPath, null);
}

function npmInstall(repoPath, packages, repoName) {
  log.info('Installing node modules for '+ repoName +' ...');

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

function jspmInstall(repoPath, repoName) {
  log.info('Installing JSPM packages for '+ repoName + '...');

  jspm.setPackagePath(repoPath);
  return jspm.install(true, {
    lock: true
  });
}
