var Task = require('./task'),
    Promise = require('bluebird');

var Planner = function() {
  this._facts = {}; // task -> fact -> value
  this._tasks = {}; // a bunch of resolvers
}

Planner.prototype._runSingle = function(task, rerun) {
  /* Possibilities for a task
     - It's already run 
       - Then just return the results
     - It throws another task
       - Schedule this task
       - 
  */

  if (!rerun && this._tasks[task.id]) {
    // It's already scheduled/running/finished
    return this._tasks[task.id].promise;
  }

  var resolver = Promise.pending();
  this._tasks[task.id] = resolver;
  
  var scope = new Scope(task, this);
  var planner = this;

  console.log('Running task ' + task.id);
  var result = task.run(scope);
  if (result instanceof Promise) {
    result.then(function(result) {
      console.log('Got results from ' + task.id + ': ' + JSON.stringify(result));
      planner._facts[task.id] = result;
      resolver.resolve(result);
    });
  } else {
    console.log('Got results from ' + task.id);
    this._facts[task.id] = result;
    resolver.resolve(result);
  }

  return resolver.promise;
}

Planner.prototype.run = function(task) {
  this._runSingle(task);
}

Planner.prototype.getFacts = function(task) {
  if (this._facts[task.id])
    return this._facts[task.id];
  else
    throw task;
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

  return this._planner.getTasks(reqs);
}

module.exports = Planner;
