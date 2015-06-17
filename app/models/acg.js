var EventEmitter = require('events').EventEmitter;
var Immutable = require('immutable');
var assign = require('object-assign');
var rp = require('superagent-promise')(require('superagent'), window.Promise);

var CHANGE_EVENT = 'change';

var _acgs = Immutable.fromJS({});

var _lastACGs = Immutable.fromJS({});

var _lastSearch = Immutable.fromJS([]);

var _acgsPage = Immutable.fromJS({});

var ACGModel = module.exports = assign({}, EventEmitter.prototype, {
  getById: function(id) {
    return _acgs.get(id, null);
  },

  getACGsByPage: function(numPage) {
    return _acgsPage.get(numPage, null);
  },

  empty: function() {
    return _acgs.count() === 0;
  },

  getACGsPage: function() {
    return _acgsPage;
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
      rp('GET', '/api/lastACGs/pages/'+numPage)
        .set('Accept', 'application/json')
        .end()
        .then(function(res) {
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

  fetchACGsByPage: function(numPage) {
    return (
      rp('GET', '/api/acgs/pages/'+numPage)
        .set('Accept', 'application/json')
        .end()
        .then(function(res) {
          var acgs = Immutable.fromJS(res.body);
          _acgsPage = _acgsPage.set(numPage, acgs);
          acgs.forEach(function(acg) {
            _acgs = _acgs.set(acg.get('id'), acg);
          }, this);
          this.emitChange();
          return acgs;
        }.bind(this))
    );
  },

  fetchSearchSuggest: function(q, field, limit) {
    return this.search(q,
                       {fields: [field], limit: limit, pluck: field},
                       false);
  },

  search: function(q, options, storeIt) {
    storeIt = storeIt === undefined ? true : storeIt;
    var url = '/api/acgs/search?q=' + q;
    var k, v;
    for(k in options) {
      v = options[k];
      if (k !== 'pluck') {
        v = JSON.stringify(v);
      }
      url += '&' + k + '=' + v;
    }
    return (
      rp.get(url)
        .set('Accept', 'application/json')
        .end()
        .then(function(res) {
          if (!storeIt) {
            return res.body;
          }
          var acgs = Immutable.fromJS(res.body);
          _lastSearch = acgs;
          acgs.forEach(function(acg) {
            _acgs = _acgs.set(acg.id, acg);
          }, this);
          this.emitChange();
          return acgs;
        }.bind(this))
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
