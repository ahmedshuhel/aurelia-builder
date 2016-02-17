var Promise = require('bluebird');
var logger = require('hw-logger');
var builder = require('./builder');
var git = require('./node-git');


var log = logger.log;
var baseUrl = "https://github.com/aurelia";
var baseDir = "C:/Users/shuhel/Workspace/aurelia";
var repoNames = [
  'animator-css',
  'animator-velocity',
  'app-contacts',
  'app-documentation',
  'beginner-kits',
  'binding',
  'bootstrapper',
  'cache',
  'dependency-injection',
  'dialog',
  'documentation',
  'event-aggregator',
  'fetch-client',
  'framework',
  'history',
  'history-browser',
  'html-import-template-loader',
  'html-template-element',
  'http-client',
  'i18n',
  'loader',
  'loader-default',
  'loader-webpack',
  'logging',
  'logging-console',
  'metadata',
  'pal',
  'pal-browser',
  'pal-nodejs',
  'path',
  'polyfills',
  'registry',
  'route-recognizer',
  'router',
  'skeleton-navigation',
  'skeleton-plugin',
  'task-queue',
  'templating',
  'templating-binding',
  'templating-resources',
  'templating-router',
  'templating-validation',
  'testing',
  'tools',
  'ui-virtualization',
  'validation',
  'web-components',
  'webpack-plugin',
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
