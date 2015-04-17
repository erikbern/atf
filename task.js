var Task = function() { }

Task._createSubclass = function(name, params) {
  var Subclass = function() {
    this.requirements = [];
    this.id = name + '(';
    for (var i = 0; i < params.length; i++) {
      this[params[i]] = arguments[i];
      this.id += params[i] + '=' + arguments[i];
      if (i < params.length - 1) this.id += ', ';
    }
    this.id += ')';
  }

  Subclass.prototype = new Task();
  return Subclass;
}

Task.backend = function(name, params, run) {
  var taskClass = Task._createSubclass(name, params);
  taskClass.prototype.run = run;
  return taskClass;
};

module.exports = Task;

