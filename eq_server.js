var express = require('express'),
    Task = require('./task'),
    Planner = require('./planner');

var Define = Task.view('Define', ['symbol'], function(scope) {
  var str = [];
  str.push('<form method="post" action="' + this.uri() + '">');
  str.push('Define ' + this.symbol + ': <input name="definition"/>');
  str.push('<input type="submit"/>');
  str.push('</form>');
  return str.join('');
},
function(data) {
  console.log('controller!');
  return {'definition': data['definition']};
});

var Evaluate = Task.backend('Evaluate', ['symbol'], function(scope) {
  var task = this;
  return scope.require(new Define(task.symbol)).spread(function (input) {
    if (!isNaN(parseInt(input)))
      return {'result': parseInt(input)};

    var tokens = input.split(' ');
    return scope.require(tokens.map(function(token) { return new Evaluate(token); })).then(function (results) {
      var sum = results.reduce(function(x, y) { return x + y.result; }, 0);
      return {'result': sum}
    });
  });
});

//////// glue stuff

function nextTask(res) {
  var planner = new Planner();
  var views = planner.run(new Evaluate('x'));
  var view = views[0]; // For now just pick an arbitrary view
  var uri = view.uri();
  res.redirect(uri);
  planner.cancel();
}

//////// server stuff

var app = express();

app.get('/', function (req, res) {
  nextTask(res);
});

app.get('/task/*', function (req, res) {
  var view = Task.viewFromUrl(req.url);
  res.send(view.view());
});

app.post('/task/*', function (req, res) {
  var view = Task.viewFromUrl(req.url);
  view.controller(req);
  nextTask(res);
});

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
