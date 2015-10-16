var git = require('gitty');
var Repository = git.Repository;

var Promise = require('bluebird');

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
    repo.reset('', function(err) {
      if (err) {
        reject(err)
      } else {
        resolve();
      }
    });
  });
}


function updateRepo(repoName, baseUrl, repoPath) {
  var repository;
  log.info("Updating '" + repoName + "' ...");

  var repo = new Repository(repoPath);

  repo
    .reset()
    .then(()=> {
    
     });

  return Repository.open(repoPath)
    .then(function(repo) {
      repository = repo;
      return repository.fetch('origin', credCb);
    })
    .then(function() {
      return repository.getBranchCommit('origin/master');
    })
    .then(function(originMaster) {
      return Reset.reset(repository, originMaster, Reset.TYPE.HARD);
    });
}

exports.clone = clone;
