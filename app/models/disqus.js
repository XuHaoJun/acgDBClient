var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var rp = require('superagent-promise')(require('superagent'), window.Promise);

var CHANGE_EVENT = 'change';

var _shortname = '';

var DisqusModel = module.exports = assign({}, EventEmitter.prototype, {
  getShortname: function() {
    return _shortname;
  },

  fetchShortname: function() {
    return (
      rp('GET', '/api/disqusShortname')
        .set('Accept', 'application/json')
        .end()
        .then(function(res) {
          if (_shortname == res.body) {
            return _shortname;
          }
          _shortname = res.body;
          this.emitChange();
          return _shortname;
        }.bind(this))
        .catch(function(err) {
          console.log('fetchShortname', err);
        })
    );
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
});
