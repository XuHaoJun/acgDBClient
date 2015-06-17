var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var Infinite = require('react-infinite');

var ACGModel = require('../models/acg');

var SearchBar = require('./searchBar');
var ListItem = require('./ACGListItem');

var Search= module.exports = React.createClass({
  mixins: [PureRenderMixin],

  getInitialState: function() {
    return {
      searchAcgs: ACGModel.getLastSearch()
    };
  },

  _onChange: function() {
    this.setState(this.getInitialState());
  },

  componentDidMount: function() {
    ACGModel.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    ACGModel.removeChangeListener(this._onChange);
  },

  handleSearchSend: function(e) {
    if (e.nativeEvent.keyCode === 13) {
      ACGModel.search(e.target.value);
    }
  },

  render: function() {
    return (
      <div>
          <SearchBar inputAttributes={{onKeyPress: this.handleSearchSend}} />
          <Infinite ref="infinite"
                    elementHeight={100}
                    containerHeight={this.props.containerHeigt ? this.props.containerHeigt : 500}
                    infiniteLoadBeginBottomOffset={200}
                    isInfiniteLoading={false}
                    timeScrollStateLastsForAfterUserScrolls={10}
                    >
              {
                this.state.searchAcgs.map(function(acg, i) {
                  return (<ListItem key={i} acg={acg} />);
                })
               }
          </Infinite>
      </div>
    );
  }
});
