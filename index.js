var Promise = require('bluebird');
var logger = require('hw-logger');
var builder = require('./builder');
var git = require('./node-git');


var log = logger.log;
var baseUrl = "https://github.com/aurelia";
var baseDir = "C:/Users/shuhel/Workspace/aurelia";
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
  'logging',
  'dialog',
  'i18n',
  'ui-virtualization',
  'validation',
  'animator-velocity',
  'animator-css',
  'pal',
  'pal-browser',
  'pal-nodejs'
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
    log.info('Now start jumping!! The mighty script is finished building...');
  });
*/

builder
  .buildAll(repoNames, baseUrl, baseDir)
  .then(function() {
    log.info('Now start jumping!! The mighty script is finished building...');
  });
