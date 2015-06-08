var React = require('react');

var HomeController = module.exports = function(ctx) {
  var Router = require('../router');
  var Home = require('../views/home');
  // force update by time
  Router.render(<Home key={new Date()} />);
};
