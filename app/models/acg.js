var EventEmitter = require('events').EventEmitter;
var Immutable = require('immutable');
var assign = require('object-assign');
var rp = require('superagent-promise');

var CHANGE_EVENT = 'change';

var _acgs = Immutable.fromJS({});

var _lastACGs = Immutable.fromJS({});

var _lastSearch = Immutable.fromJS([]);

var ACGModel = module.exports = assign({}, EventEmitter.prototype, {
  getById: function(id) {
    return _acgs.get(id, null);
  },

  getLastACGs: function() {
    return _lastACGs;
  },

  getLastSearch: function() {
    return _lastSearch;
  },

  fetchOneById: function(id) {
    return (
      rp.get('/api/acg/'+id)
        .set('Accept', 'application/json')
        .end()
        .then(function(res) {
          if (res.status === 304) {
            return null;
          }
          var acg = Immutable.fromJS(res.body);
          _acgs = _acgs.set(id, acg);
          this.emitChange();
          return acg;
        }.bind(this))
    );
  },

  fetch: {
    lastACGs: this.fetchLastACGs,
    oneById: this.fetchOneById
  },

  fetchLastACGs: function(numPage) {
    return (
      rp.get('/api/lastACGs/pages/'+numPage)
        .set('Accept', 'application/json')
        .end()
        .then(function(res) {
          if (res.status === 304) {
            return null;
          }
          var acgs = Immutable.fromJS(res.body);
          _lastACGs = _lastACGs.set(numPage, acgs);
          acgs.forEach(function(acg) {
            _acgs = _acgs.set(acg.get('id'), acg);
          }, this);
          this.emitChange();
          return acgs;
        }.bind(this))
    );
  },

  search: function(q) {
    rp.get('/api/acgs/search?q=' + q)
      .set('Accept', 'application/json')
      .end()
      .then(function(res) {
        if (res.status === 304) {
          return;
        }
        var acgs = Immutable.fromJS(res.body);
        _lastSearch = acgs;
        acgs.forEach(function(acg) {
          _acgs = _acgs.set(acg.id, acg);
        }, this);
        this.emitChange();
      });
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
