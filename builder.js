var npmi = require('npmi');
var path = require('path');
var npm = require('npm');
var Promise = require('bluebird');
var logger = require('hw-logger');
var fs = require('fs');
var spawn = require('child-process-promise').spawn;
var NodeGit = require('nodegit');

////////////////////////

var log = logger.log;
var Clone = NodeGit.Clone;
var Repository = NodeGit.Repository;
var Reset = NodeGit.Reset;

////CONFIGURE MODULE/////
logger.init({
  colors: true
});

if (!('endsWith' in String.prototype)) {
  String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
  };
}

if (!('startsWith' in String.prototype)) {
  String.prototype.startsWith = function(prefix) {
    return this.substr(0, prefix.length) === prefix;
  };
}

var credCb = {
  credentials: function(url, userName) {
    return NodeGit.Cred.sshKeyFromAgent(userName);
  },
  certificateCheck: function() {
    return 1;
  }
};


npm.on("log", function(message) {
  log.info(message);
});

///////////////////////////

module.exports = {
  buildAll: buildAll,
  buildRepo: buildRepo,
  updateRepo: updateRepo,
  npmInstall: npmInstall,
  jspmInstall: jspmInstall,
  cloneRepo: cloneRepo,
  getNPMDependencies: getNPMDependencies,
  getJSPMDependencies: getJSPMDependencies,
  runGulpBuild: runGulpBuild,
  updateOwnDep: updateOwnDep
};


function buildAll(repoNames, baseUrl, baseDir) {
  log.info('Building ', repoNames);

  var tasks = [];
  repoNames.forEach(function(repoName) {
    tasks.push(buildRepo(repoName, baseUrl, baseDir));
  });

  return Promise.all(tasks);
}

function existsAsync(path) {
  return new Promise(function(resolve, reject) {
    fs.exists(path, function(res) {
      resolve(res);
    });
  });
}

function buildRepo(repoName, baseUrl, baseDir) {
  log.info('Building %s', repoName);

  var repoPath = baseDir + repoName;

  return existsAsync(repoPath)
    .then(function(exists) {
      if (!exists) {
        return cloneRepo(repoName, baseUrl, repoPath);
      } else {
        return updateRepo(repoName, baseUrl, repoPath);
      }
    })
    .then(function() {
      return npmInstall(repoPath, repoName);
    })
    .then(function() {
      return jspmInstall(repoPath, repoName);
    })
    .then(function() {
      return runGulpBuild(repoPath, repoName);
    });
}

function runGulpBuild(repoPath, repoName) {
  log.info('Gulp is building ' + repoName + ' ...');

  var cmd = process.platform === 'win32' ? 'gulp.cmd' : 'gulp';
  var gulp = path.resolve(repoPath, 'node_modules', '.bin', cmd);
  var gulpfile = path.resolve(repoPath, 'gulpfile.js');

  return spawn(gulp, ['--gulpfile', gulpfile, 'build'])
    .progress(function(cp) {
      cp.stdout.on('data', function(data) {
        log.info(data.toString());
      });
      cp.stderr.on('data', function(data) {
        log.warn(data.toString());
      });
    });
}

function getNPMDependencies(repoPath, repoName) {
  log.info("Extracting NPM dependencies for '" + repoName + "' ...");

  var pkg = require(repoPath + '/package.json');
  var allDeps = [];
  var devDeps = pkg.devDependencies || {};
  var deps = pkg.dependencies || {};

  Object.keys(devDeps).forEach(function(key) {
    allDeps.push({
      pkg: key,
      ver: devDeps[key]
    });
  });

  Object.keys(deps).forEach(function(key) {
    allDeps.push({
      pkg: key,
      ver: deps[key]
    });
  });

  return Promise.resolve(allDeps);
}

function getJSPMDependencies(repoPath, repoName) {
  log.info("Extracting Aurelia dependencies for " + repoName + " ...");

  var pkg = require(repoPath + '/package.json');
  var allDeps = [];

  var deps = pkg.jspm.dependencies || {};
  var devDeps = pkg.jspm.dependencies || {};

  Object.keys(deps).forEach(function(key) {
    allDeps.push({
      name: key,
      fullName: deps[key]
    });
  });

  Object.keys(devDeps).forEach(function(key) {
    allDeps.push({
      name: key,
      fullName: deps[key]
    });
  });

  return Promise.resolve(allDeps);
}


function cloneRepo(repoName, baseUrl, repoPath) {
  log.info("Cloneing '" + repoName + "' ...");
  return Clone.clone(baseUrl + "/" + repoName, repoPath, null);
}

function updateRepo(repoName, baseUrl, repoPath) {
  var repository;
  log.info("Updating '" + repoName + "' ...");

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


function installNPMpackage(installPath, name, version) {

  var absInstallPath = path.resolve(installPath);
  var nodeModulesFolder = absInstallPath + path.sep + 'node_modules';
  var packagePath = absInstallPath + path.sep + 'node_modules' + path.sep + name;

  var options = {
    name: name,
    version: version,
    path: absInstallPath,
    forceInstall: false,
    npmLoad: {
      loglevel: 'silent' // [default: {loglevel: 'silent'}]
    }
  };

  return existsAsync(packagePath)
    .then(function(exists) {
      if (exists) {
        return Promise.resolve(options.name + 'is already installed');
      } else {

        return doNpmi();
      }
    });

  function doNpmi() {
    return new Promise(function(resolve, reject) {
      npmi(options, function(err, result) {

        if (err) {
          log.error('Error occured while installing %s@%s :  %s', name, installPath, err);

          if (err.code === npmi.LOAD_ERR) reject('npm load error');
          else if (err.code === npmi.INSTALL_ERR) reject('npm install error');
        }

        resolve('installed ' + options.name + '@' + options.version);

      });
    });

  }
}


function npmInstall(repoPath, repoName) {
  log.info('Installing node modules for ' + repoName + ' ...');

  return getNPMDependencies(repoPath, repoName)
    .then(function(deps) {
      var tasks = [];

      deps.forEach(function(dep) {
        tasks.push(installNPMpackage(repoPath, dep.pkg, dep.ver));
      });

      return Promise.all(tasks);
    });
}


function jspmInstall(repoPath, repoName) {
  log.info('Installing JSPM packages for ' + repoName + '...');

  return getJSPMDependencies(repoPath, repoName)
    .then(function(deps) {
      var tasks = [];
      deps.forEach(function(dep) {
        tasks.push(installJSPMPackage(repoPath, dep.name, dep.fullName));
      });
      return Promise.all(tasks);
    });
}

function installJSPMPackage(repoPath, name, fullName) {
  var subFolder = fullName.substring(0, fullName.indexOf(':'));
  var pkgName =  fullName.substring(fullName.indexOf(':') + 1);
  var pkgPath = path.join(path.resolve(repoPath), 'jspm_packages', subFolder, pkgName.replace(/\//g, path.sep)).replace(/\^/g, '') + '.js'; 

  return existsAsync(pkgPath)
    .then(function(exists){
       if(exists){
         return Promise.resolve();
       } else {
         return doInstall();
       }
    });

  function doInstall() {
    log.info('Installing %s', fullName);

    delete require.cache[require.resolve('jspm')];
    var jspm = require('jspm');

    jspm.setPackagePath(repoPath);
    return jspm.install(name, fullName);
  }
}

function updateOwnDep(repoName, baseDir) {

  log.info('Updating aurelia dependency for ' + repoName);

  var dependencyPath = path.resolve(baseDir, repoName, 'jspm_packages', 'github', 'aurelia');
  var baseDir = path.resolve(baseDir);

  fs.readdirSync(dependencyPath)
    .filter(function(name) {
      return name.endsWith('.js');
    })
    .map(function(name) {
      return [
        baseDir + path.sep + name.substring(0, name.indexOf('@')) + path.sep + 'dist' + path.sep + 'amd',
        dependencyPath + path.sep + name.substring(0, name.indexOf('.js'))
      ];
    }).forEach(function(value) {
      if (fs.existsSync(value[0])) {
        copyDir(value[0], value[1]);
      }
    });

  log.info('Updated aurelia dependency for %s', repoName);
  return Promise.resolve();
}


function copyDir(src, dest) {
  try {
    mkdir(dest);
    var files = fs.readdirSync(src);
    for (var i = 0; i < files.length; i++) {
      var current = fs.lstatSync(path.join(src, files[i]));
      if (current.isDirectory()) {
        copyDir(path.join(src, files[i]), path.join(dest, files[i]));
      } else if (current.isSymbolicLink()) {
        var symlink = fs.readlinkSync(path.join(src, files[i]));
        fs.symlinkSync(symlink, path.join(dest, files[i]));
      } else {
        copy(path.join(src, files[i]), path.join(dest, files[i]));
      }
    }
  } catch (error) {
    log.error(error);
  }
}

function copy(src, dest) {
  var oldFile = fs.createReadStream(src);
  var newFile = fs.createWriteStream(dest);
  oldFile.pipe(newFile);
};
