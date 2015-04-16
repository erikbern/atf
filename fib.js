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
  scope.require(new AskUserForN()).spread(function(t) {
    return t.n;
  }).then(function(n) {
    return scope.require(new Fib(n));
  }).spread(function(f) {
    console.log('result is: ' + f.result);
  });
});

var planner = new Planner();
planner.run(new TellUserFib());
