var Task = require('./task'),
    Server = require('./server');

var Define = Task.view('Define', ['symbol'], function(scope) {
  var str = [];
  str.push('<form method="post" action="' + this.uri() + '">');
  str.push('Define ' + this.symbol + ': <input name="definition"/>');
  str.push('<input type="submit"/>');
  str.push('</form>');
  return str.join('');
},
function(data) {
  // console.log(data);
  return {'definition': data['definition']};
});

var Evaluate = Task.backend('Evaluate', ['symbol'], function(scope) {
  var task = this;
  return scope.require(new Define(task.symbol)).spread(function (define) {
    if (!isNaN(parseInt(define.definition)))
      return {'result': parseInt(define.definition)};

    var tokens = define.definition.split(' ');
    return scope.require(tokens.map(function(token) { return new Evaluate(token); })).then(function (results) {
      var sum = results.reduce(function(x, y) { return x + y.result; }, 0);
      return {'result': sum}
    });
  });
});

var goalTask = new Evaluate('x');
var server = new Server(goalTask);
