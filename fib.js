var Task = require('./task'),
    Planner = require('./planner'),
    Promise = require('bluebird'),
    prompt = require('prompt');

prompt.start();
var readline = Promise.promisify(prompt.get);

var Fib = Task.createClass('Fib', ['n'], function(scope) {
  if (this.n > 2)
    return scope.require(new Fib(this.n-1), new Fib(this.n-2)).spread(function (a, b) {
      return Promise.delay({'result': a.result + b.result}, 100.0);
    });
  else
    return {'result': 1};
});

var AskUserForN = Task.createClass('AskUserForN', [], function(scope) {
  return readline('n');
});

var TellUserFib = Task.createClass('TellUserFib', [], function(scope) {
  return scope.require(new AskUserForN()).spread(function(t) {
    return scope.require(new Fib(t.n));
  }).spread(function(f) {
    return {'result': f.result};
  });
});

var planner = new Planner();
planner.run(new TellUserFib());
planner.cancel();
