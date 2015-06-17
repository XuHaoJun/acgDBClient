var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var Autosuggest = require('react-autosuggest');

var ACGModel = require('../models/acg');

var SearchBar = module.exports = React.createClass({
  mixins: [PureRenderMixin],

  getSuggestions: function(input, callback) {
    ACGModel.fetchSearchSuggest(input, 'nameTW', 5).then(function(v) {
      callback(null, v);
    });
  },

  getAutosuggest: function() {
    return this.refs.autoSuggest;
  },

  render: function() {
    return (
      <Autosuggest {...this.props}
                   ref="autoSuggest"
                   suggestions={this.getSuggestions}
      />
    );
}
});
