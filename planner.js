var Task = require('./task'),
    Promise = require('bluebird');

var Planner = function(model) {
  this._tasks = {}; // a bunch of resolvers
  this._views = [];
  this._model = model
}

Planner.prototype._runSingle = function(task, rerun) {
  if (!rerun) {
    var saved = this._model.getFacts(task.id);
    if (saved)
      // It's already run previously
      return Promise.fulfilled(saved);
    if (this._tasks[task.id])
      // It's already scheduled/running
      return this._tasks[task.id].promise;
  }

  var resolver = Promise.pending();
  this._tasks[task.id] = resolver;

  console.log(task.id + ' ' + task.isView);

  if (task.isView) {
    this._views.push(task);
    console.log('now has ' + this._views.length + ' views');
    return resolver.promise; // Return a promise that will never be fulfilled
  }
  
  var scope = new Scope(task, this);
  var planner = this;

  console.log('Running task ' + task.id);
  var result = task.run(scope);
  if (!(result instanceof Promise))
    result = Promise.resolve(result);

  result.then(function(result) {
    console.log('Got results from ' + task.id + ': ' + JSON.stringify(result));
    planner._model.saveFacts(task.id, result);
    resolver.resolve(result);
  });

  return resolver.promise;
}

Planner.prototype.run = function(task) {
  this._runSingle(task);
  console.log('got ' + this._views.length + ' views');
}

Planner.prototype.getViews = function() {
  return this._views;
}

Planner.prototype.getFacts = function(task) {
  return this._model.getFacts(task.id);
}

Planner.prototype.getTasks = function(tasks) {
  // Return a promise binding all the requirements together
  var planner = this;
  var taskPromises = tasks.map(function(task) { return planner._runSingle(task); });
  return Promise.all(taskPromises);
}

Planner.prototype.cancel = function() {
  for (id in this._tasks) {
    this._tasks[id].cancel();
  }
}

var Scope = function(task, planner) {
  this._task = task;
  this._planner = planner;
}

Scope.prototype.require = function() {
  var reqs = [];
  if (arguments.length == 1 && Array.isArray(arguments[0])) {
    reqs = arguments[0];
  } else {
    for (var i = 0; i < arguments.length; i++)
      reqs.push(arguments[i]);
  }
  
  console.log(this._task.id + ' needs ' + reqs.map(function(task) { return task.id; }));
  var results = this._planner.getTasks(reqs);
  console.log('got result promises');
  return results;
}

module.exports = Planner;
