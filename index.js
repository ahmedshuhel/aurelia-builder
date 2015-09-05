var Promise = require('bluebird');
var logger = require('hw-logger');
var builder = require('./builder');

Promise.longStackTraces();

var log = logger.log;
var baseUrl = "https://github.com/aurelia";
var baseDir = "../";
var repoNames = [
  'templating',
  'templating-router',
  'html-import-template-loader',
  'skeleton-navigation',
  'bootstrapper',
  'framework',
  'templating-resources',
  'templating-binding',
  'router',
  'binding',
  'route-recognizer',
  'task-queue',
  'event-aggregator',
  'loader',
  'loader-default',
  'html-template-element',
  'fetch-client',
  'http-client',
  'path',
  'history-browser',
  'history',
  'dependency-injection',
  'metadata',
  'logging-console',
  'logging'
];

logger.init({
  colors: true
});

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
    log.info('Now start jumping!! The mighty script is finished building...');
  });

/*
builder.runGulpBuild('../aurelia-libs/path/', 'path')
  .then(function(){
    log.info('Yey!');
  })


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
 */
