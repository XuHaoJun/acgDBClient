window.$ = require('jquery');
window.jQuery = require('jquery');
window.React = require('react');
require('moment/locale/zh-tw');
require('es6-promise').polyfill();

window.prerenderReady = false;
setTimeout(function() {
  window.prerenderReady = true;
}, 3000);

var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var VelocityTransitionGroup = require('react-velocitytransitiongroup');

var Router = require('./router');

var injectTapEventPlugin = require("react-tap-event-plugin");

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

var App = React.createClass({
  mixins: [PureRenderMixin],

  getInitialState: function() {
    return {
      page: null,
      enableTransition: false
    };
  },

  componentWillMount: function() {
    Router.render = function(component, enableTransition) {
      this.setState({
        page: component,
        enableTransition: enableTransition ? enableTransition : this.state.enableTransition
      });
    }.bind(this);
    Router({
      dispatch: false
    });
  },

  componentDidMount: function() {
    if (window && window._routerInitPath) {
      Router(window._routerInitPath);
    } else {
      Router('/');
    }
  },

  render: function() {
    if (this.state.enableTransition) {
      var enterTransition = [[
        'transition.whirlIn'
      ]];
      var leaveTransition = [[
        'transition.whirlOut'
      ]];
      return (
        <VelocityTransitionGroup enterTransition={enterTransition}
                                 leaveTransition={leaveTransition}
                                 >
            {this.state.page}
        </VelocityTransitionGroup>
      );
    }
    return this.state.page;
  }
});


if (window.applicationCache) {
  applicationCache.addEventListener('updateready', function() {
    if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
      window.applicationCache.swapCache();
      window.location.reload();
    }
  });
}

React.render(
  <App />,
  document.getElementById('reactContainer')
);
