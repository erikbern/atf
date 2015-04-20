var express = require('express'),
    Planner = require('./planner'),
    Task = require('./task'),
    Model = require('./model'),
    bodyParser = require('body-parser'),
    Promise = require('bluebird');

var Server = function(goalTask) {
  this.app = express();
  this.app.use(bodyParser.urlencoded({ extended: false }));
  
  var server = this;
  this.goalTask = goalTask;
  this.model = new Model();

  console.log('server goaltask: ' + this.goalTask.id);

  this.app.get('/', function (req, res) {
    server.nextTask(res);
  });

  this.app.get('/task/*', function (req, res) {
    var view = Task.viewFromUrl(req.url);
    res.send(view.view());
  });

  this.app.post('/task/*', function (req, res) {
    var view = Task.viewFromUrl(req.url);
    var data = req.body;
    var result = view.controller(data);
    console.log('result: ' + JSON.stringify(result));
    server.model.saveFacts(view.id, result);
    server.nextTask(res);
  });

  this.app.listen(3000, function () {
    console.log('Server running...');
  });
}

Server.prototype.nextTask = function(res) {
  var planner = new Planner(this.model);
  planner.run(this.goalTask);
  Promise.delay(100).then(function() {
    var views = planner.getViews();
    var view = views[0]; // For now just pick an arbitrary view
    var uri = view.uri();
    res.redirect(uri);
    planner.cancel();
  });
}

module.exports = Server;
