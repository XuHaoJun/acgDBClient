var React = require('react');

var ACGModel = require('../models/acg');

var ACGsController = module.exports = function(ctx) {
  var Router = require('../router');
  var ACGs = require('../views/acgs');
  var numPage = 1;
  if (ctx.params.numPage) {
    numPage = parseInt(ctx.params.numPage);
  }
  var acgs = ACGModel.getACGsByPage(numPage);
  if (acgs === null) {
    ACGModel.fetchACGsByPage(numPage);
  }
  Router.render(<ACGs key={'acgs.'+numPage} numPage={numPage} />);
};
