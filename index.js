var logger = require('hw-logger');
var builder = require('./builder');


var log = logger.log;
var baseUrl = "https://github.com/aurelia";
var localLibFolder = "../aurelia-libs/";
var repoNames = [
  'http-client',
  'bootstrapper',
];

logger.init({
  colors: true
});


builder.buildAll(repoNames, baseUrl, localLibFolder)
  .then(function() {
    log.info('Successfully built the following repos: ', repoNames);
  }).catch(function(err) {
    log.error(err);
  });
