var Promise = require('bluebird');
var logger = require('hw-logger');
//var builder = require('./builder');
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
  'logging'
];

logger.init({
  colors: true
});



git.clone('bootstrapper', baseUrl, baseDir)
  .then(() => {
    log.info('Now start jumping!! The mighty script is finished cloning...');
  })
  .catch((err) => {
    log.error(err);
  })

/*
var repo = git.openRepo('binding', baseDir);
git.reset(repo)
  .then(() => {
    log.info('Now start jumping!! The mighty script is finished cloning...');
  })
  .catch((err) => {
    log.error(err);
  });


git.updateRepo('binding', baseUrl, baseDir)
  .then(() => {
    log.info('Now start jumping!! The mighty script is finished cloning...');
  })
  .catch((err) => {
    log.error(err);
  });

git.clone('binding', baseUrl, `${baseDir}binding`)
  .then(() => {
    log.info('Now start jumping!! The mighty script is finished cloning...');
  })
  .catch((err) => {
    log.error(err);
  })

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
