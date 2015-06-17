var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var Autosuggest = require('react-autosuggest');

var ACGModel = require('../models/acg');

var SearchBar = module.exports = React.createClass({
  mixins: [PureRenderMixin],

  getSuggestions: function(input, callback) {
    Router.show('/search?q='+input, null, false);
    ACGModel.fetchSearchSuggest(input, 'nameTW', 5).then(function(v) {
      callback(null, v);
    });
  },

  render: function() {
    return (
      <Autosuggest {...this.props}
                   suggestions={this.getSuggestions}
      />
    );
}
});
