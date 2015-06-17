var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var Infinite = require('react-infinite');
var Immutable = require('immutable');
var mui = require('material-ui');
var CircularProgress = mui.CircularProgress;

var Router = require('../router');
var ACGModel = require('../models/acg');

var SearchBar = require('./searchBar');
var ListItem = require('./ACGListItem');

var _lastACGsListScrollTop = 0;

var Search= module.exports = React.createClass({
  mixins: [PureRenderMixin],

  getInitialState: function() {
    return {
      searchACGs: ACGModel.getLastSearch(),
      searching: false
    };
  },

  _onChange: function() {
    this.setState(this.getInitialState());
  },

  focusSearchBar: function() {
    var autoSuggest =  this.refs.searchBar.getAutosuggest();
    React.findDOMNode(autoSuggest.refs.input).focus();
  },

  componentDidMount: function() {
    ACGModel.addChangeListener(this._onChange);
    if (this.props.routerContext && this.props.routerContext.query.q) {
      var autoSuggest =  this.refs.searchBar.getAutosuggest();
      ACGModel.search(this.props.routerContext.query.q);
      autoSuggest.setState({value: this.props.routerContext.query.q});
      this.setState({searchACGs: Immutable.fromJS([]),
                     searching: true});
    } else {
      this.focusSearchBar();
    }
    if (this.refs.infinite) {
      var dom = React.findDOMNode(this.refs.infinite);
      if (dom.scrollHeight >= _lastACGsListScrollTop) {
        dom.scrollTop = _lastACGsListScrollTop;
      }
    }
  },

  componentWillUnmount: function() {
    ACGModel.removeChangeListener(this._onChange);
  },

  handleSearchSend: function(e) {
    if (e.nativeEvent.keyCode === 13) {
      ACGModel.search(e.target.value);
      Router.show('/search?q='+e.target.value);
    }
  },

  handleScroll: function(list) {
    _lastACGsListScrollTop = list.scrollTop;
  },

  render: function() {
    var content;
    if (this.state.searchACGs.count() === 0 && this.state.searching) {
      content = (
        <center>
            <CircularProgress mode="indeterminate"
                              style={{display: 'block', marginLeft: 'auto',
                                      marginRight: 'auto'}} />
        </center>
      );
    } else {
      content = (
        <Infinite ref="infinite"
                  elementHeight={100}
                  handleScroll={this.handleScroll}
                  containerHeight={this.props.containerHeigt ? this.props.containerHeigt : 500}
                  infiniteLoadBeginBottomOffset={200}
                  isInfiniteLoading={false}
                  timeScrollStateLastsForAfterUserScrolls={10}
                  >
            {
              this.state.searchACGs.map(function(acg, i) {
                return (<ListItem key={i} acg={acg} />);
              })
             }
        </Infinite>
      );
    }
    return (
      <div>
          <SearchBar ref="searchBar"
                     inputAttributes={{onKeyPress: this.handleSearchSend}} />
          {content}
      </div>
    );
  }
});
