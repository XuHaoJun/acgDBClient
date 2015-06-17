var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var moment = require('moment');

var ACGListItem = module.exports = React.createClass({
  mixins: [PureRenderMixin],

  getDefaultProps: function() {
    return {
      height: 100
    };
  },

  render: function() {
    var date = (
      this.props.acg.get('commonLastDate', null) ?
      moment(this.props.acg.get('commonLastDate')).locale('zh-tw').fromNow() :
      null
    );
    return (
      <div className="infinite-list-item"
           id={this.props.acg.get('id')}
           style={{height: this.props.height}}>
          <span style={{fontSize: '24px'}}>
              <a href={"/acg/"+this.props.acg.get('id')}>
                  {this.props.acg.get('nameTW')}
              </a>
          </span>
          <p>
              <small style={{marginLeft: '10px'}}>
                  {date}{date ? ',' : null} {this.props.acg.get('acgType')}
              </small>
          </p>
      </div>
    );
  }
});
