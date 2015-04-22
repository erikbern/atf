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
  return {'definition': data['definition']};
});

var Evaluate = Task.backend('Evaluate', ['symbol'], function(scope) {
  var task = this;
  return scope.require(new Define(task.symbol)).spread(function (define) {
    var def = define.definition;
    
    // Let's first extract all tokens from this string
    var tokens = def.match(/[A-Za-z]+/g);

    // If no tokens, just return the value
    if (tokens == null) {
      var result = eval(def);
      return {'result': result}
    }

    return scope.require(tokens.map(function(token) { return new Evaluate(token); })).then(function (results) {
      // Insert all tokens into the definition
      for (var i = 0; i < results.length; i++)
	def = def.replace(tokens[i], results[i].result);

      // Evaluate everything
      var result = eval(def);
      return {'result': result}
    });
  });
});

var goalTask = new Evaluate('x');
var server = new Server(goalTask);
