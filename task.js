var Task = function() { }

Task._subclasses = {};

Task._createSubclass = function(name, params) {
  var Subclass = function() {
    this.name = name;
    this.params = params;
    this.args = Array.prototype.slice.call(arguments); // cast to array
    this.id = name + '(';
    for (var i = 0; i < params.length; i++) {
      this[params[i]] = arguments[i];
      this.id += params[i] + '=' + arguments[i];
      if (i < params.length - 1) this.id += ', ';
    }
    this.id += ')';
  }
  Task._subclasses[name] = Subclass;
  Subclass.prototype = new Task();
  return Subclass;
}

Task.backend = function(name, params, run) {
  var taskClass = Task._createSubclass(name, params);
  taskClass.prototype.run = run;
  taskClass.prototype.isView = false;
  return taskClass;
};

Task.view = function(name, params, view, controller) {
  var taskClass = Task._createSubclass(name, params);
  taskClass.prototype.view = view;
  taskClass.prototype.controller = controller;
  taskClass.prototype.isView = true;
  taskClass.prototype.uri = function() {
    return '/task/' + this.name + '/' + this.args.join('/');
  }
  return taskClass;
}

Task.viewFromUrl = function(url) {
  // Instantiate a Task from the uri
  var items = url.split('/');
  var taskName = items[2];
  var args = items.slice(3);

  var viewClass = Task._subclasses[taskName];
  console.log(viewClass.prototype);
  // TODO: assert it's a view...

  // weird code i found somewhere
  function construct(constructor, args) {
    function F() {
      return constructor.apply(this, args);
    }
    F.prototype = constructor.prototype;
    return new F();
  }
  return construct(viewClass, args);
}

module.exports = Task;

