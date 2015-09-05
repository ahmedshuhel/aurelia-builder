var Promise = require('bluebird');
var logger = require('hw-logger');
var builder = require('./builder');

Promise.longStackTraces();

var log = logger.log;
var baseUrl = "https://github.com/aurelia";
var baseDir = "../";
var repoNames = [
  'templating-router',
  'http-client',
  'path',
  'bootstrapper'
];

logger.init({
  colors: true
});

/*

builder
  .buildAll(repoNames, baseUrl, baseDir)
  .then(function() {
    var tasks = [];
    repoNames.forEach(function(repo) {
      tasks.push(builder.updateOwnDep(repo, baseDir));
    });

    return Promise.all(tasks);
  })
  .then(function() {
    log.info('Yey!')
  });



builder.runGulpBuild('../aurelia-libs/path/', 'path')
  .then(function(){
    log.info('Yey!');
  })

 */

builder
  .buildRepo('templating-router', baseUrl, baseDir)
  .then(function() {
    return builder.updateOwnDep('templating-router', baseDir)
  })
  .then(function() {
    log.info('Yey!')
  })
  .catch(function(err){
    log.error(err);
  })
