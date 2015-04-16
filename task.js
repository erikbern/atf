var Task = function() { }

Task.createClass = function(name, params, run) {
  var Subclass = function() {
    this.requirements = [];
    this.id = name + '(';
    for (var i = 0; i < params.length; i++) {
      this[params[i]] = arguments[i];
      this.id += params[i] + '=' + arguments[i];
      if (i < params.length - 1) this.id += ', ';
    }
    this.id += ')';
    this.run = run;
  }

  Subclass.prototype = new Task();
  return Subclass;
};

module.exports = Task;

