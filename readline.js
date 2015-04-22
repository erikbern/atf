var Promise = require('bluebird'),
    prompt = require('prompt');

// This is a stupid way to read lines sequentially from stdin by chaining promises.
// Without doing this, two concurrently run readline will try to read from stdin at the same time

prompt.start();
var readline = Promise.promisify(prompt.get);
var nextLinePromise = Promise.resolve(undefined);

function readNextLine(arg) {
  nextLinePromise = nextLinePromise.then(function() {
    return readline(arg).then(function(r) {
      return r[arg];
    });
  });
  return nextLinePromise;
}

module.exports = readNextLine;
