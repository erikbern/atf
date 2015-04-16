var Task = require('./task'),
    Planner = require('./planner'),
    readline = require('./readline');

var Define = Task.createClass('Define', ['symbol'], function(scope) {
  var task = this;
  return readline(this.symbol).then(function(line) { return line[task.symbol]; });
});

var Evaluate = Task.createClass('Evaluate', ['symbol'], function(scope) {
  var task = this;
  return scope.require(new Define(task.symbol)).spread(function (input) {
    if (!isNaN(parseInt(input)))
      return {'result': parseInt(input)};

    console.log(input);
    var tokens = input.split(' ');
    return scope.require(tokens.map(function(token) { return new Evaluate(token); })).then(function (results) {
      var sum = results.reduce(function(x, y) { return x + y.result; }, 0);
      return {'result': sum}
    });
  });
});

var planner = new Planner();
planner.run(new Evaluate('x'));
