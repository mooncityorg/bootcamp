// Exports the interface for the plugin
var convert = require('./lib/convert.js'),
  fs = require('fs'),
  validate = require('./lib/validate.js');

module.exports = {
  convert: function(input, options, cb) {
    try {
      var data;
      if (input.type === 'string') {
        return convert(input.data, cb);
      }
      else if (input.type === 'json') {
        return convert(input.data, cb);
      }
      else if (input.type === 'file') {
        data = fs.readFileSync(input.data).toString();
        return convert(data, cb);
      }
      return cb(null, {
        result: false,
        reason: 'input type is not valid'
      });
    }
    catch (e) {
      return cb(e);
    }

  },
  validate: function(input) {
    try {
      var data;
      if (input.type === 'string') {
        return validate(input.data);
      }
      else if (input.type === 'json') {
        return validate(input.data);
      }
      else if (input.type === 'file') {
        data = fs.readFileSync(input.data).toString();
        return validate(data);
      }
      return {
        result: false,
        reason: 'input type is not valid'
      };
    }
    catch (e) {
      return {
        result: false,
        reason: e.toString()
      };
    }
  }
};
