var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var DisqusThread = require('react-disqus-thread');

var DisqusModel = require('../models/disqus');

var Disqus = module.exports = React.createClass({
  mixins: [PureRenderMixin],

  getDefaultProps: function() {
    return {
      identifier: null
    };
  },

  getInitialState: function() {
    return {
      shortname: DisqusModel.getShortname()
    };
  },

  _onChange: function() {
    this.setState(this.getInitialState());
  },

  componentDidMount: function() {
    if (this.state.shortname === '') {
      DisqusModel.fetchShortname();
    }
    DisqusModel.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    DisqusModel.removeChangeListener(this._onChange);
  },

  render: function() {
    var isPhantomEnv = /PhantomJS/.test(window.navigator.userAgent);
    if (this.state.shortname === '' || this.props.identifier === null || isPhantomEnv) {
      return null;
    }
    return (
      <DisqusThread {...this.props} shortname={this.state.shortname} />
    );
  }
});
