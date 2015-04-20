var Model = function() {
  this._facts = {}; // task -> fact -> value
}

Model.prototype.saveFacts = function(taskId, facts) {
  this._facts[taskId] = facts;
  console.log('facts are now: ' + JSON.stringify(this._facts));
}

Model.prototype.getFacts = function(taskId) {
  return this._facts[taskId];
}

module.exports = Model;
