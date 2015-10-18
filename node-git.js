var Promise = require('bluebird');
var git = require('gitty');
var Repository = git.Repository;

var logger = require('hw-logger');
var log = logger.log;

logger.init({
  colors: true
});


function clone(repoName, baseUrl, repoPath) {
  log.info("Cloneing '" + repoName + "' ...");
  var url = `${baseUrl}/${repoName}`;

  return new Promise((resolve, reject) => {
    git.clone(repoPath, url, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}


function reset(repo) {
  return new Promise((resolve, reject) => {
    repo.reset('origin/master', function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function pull(repo) {
  return new Promise((resolve, reject) => {
    repo.pull('origin', 'master', (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

function openRepo(repoName, baseDir) {
  var repoPath = `${baseDir}/${repoName}`;
  return new Repository(repoPath);
}

function updateRepo(repoName, baseUrl, baseDir) {
  var repository;
  var repoPath = `${baseDir}/${repoName}`;

  log.info(`Updating '${repoName}' ...`);

  var repo = new Repository(repoPath);

  return reset(repo)
    .then(() => {
      return pull(repo);
    });
}

module.exports = {
  clone: clone,
  updateRepo: updateRepo,
  pull: pull,
  reset: reset,
  openRepo: openRepo
};
