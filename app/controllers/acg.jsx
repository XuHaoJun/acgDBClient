var React = require('react');

var ACGModel = require('../models/acg');

var ACGController = module.exports = function(ctx) {
  var Router = require('../router');
  var ACGPage = require('../views/acgPage');
  // force update by time
  var id = parseInt(ctx.params.acgId);
  var acg = ACGModel.getById(id);
  if (acg === null) {
    ACGModel.fetchOneById(id);
  }
  Router.render(<ACGPage key={id} acgId={id} />);
};
