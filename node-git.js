var Promise = require('bluebird');
var git = require('gitty');
var Repository = git.Repository;
var Command = git.Command;

var logger = require('hw-logger');
var log = logger.log;

logger.init({
  colors: true
});


Repository.prototype.reset = function(hash, callback) {
  var self = this;
  var done = callback || function() {};
  var cmd = new Command(self.path, 'reset', ['--hard'], hash);

  cmd.exec(function(err, stdout, stderr) {
    if (err) {
      return done(err);
    }

    done(null, stdout);
  });
}

function cloneRepo(repoName, baseUrl, baseDir) {
  log.info("Cloneing '" + repoName + "' ...");

  var url = `${baseUrl}/${repoName}`;
  var repoPath = `${baseDir}/${repoName}`;

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
  cloneRepo: cloneRepo,
  updateRepo: updateRepo,
  pull: pull,
  reset: reset,
  openRepo: openRepo
};
