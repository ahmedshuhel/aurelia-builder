var Promise = require('bluebird');
var logger = require('hw-logger');
var builder = require('./builder');

Promise.longStackTraces();

var log = logger.log;
var baseUrl = "https://github.com/aurelia";
var baseDir = "../";
var repoNames = [
  'http-client',
  'path',
];

logger.init({
  colors: true
});



builder
   .buildAll(repoNames, baseUrl, baseDir)
  .then(function() {
    repoNames.forEach(function(repo) {
      builder.updateOwnDep(repo, baseDir);
    });

    log.info('Successfully built the following repos: %s', repoNames);
  });
