var assign = require('object-assign');
var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var ThemeManager = require('material-ui/lib/styles/theme-manager')();
var Colors = require('material-ui/lib/styles/colors');
var mui = require('material-ui');
var AppBar = mui.AppBar;
var CircularProgress = mui.CircularProgress;
var FontIcon = mui.FontIcon;
var IconButton = mui.IconButton;
var Infinite = require('react-infinite');

var ACGModel = require('../models/acg');

var ListItem = React.createClass({
  mixins: [PureRenderMixin],
  getDefaultProps: function() {
    return {
      height: 100
    };
  },
  render: function() {
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
                  id {this.props.acg.get('id')}, {this.props.acg.get('acgType')}
              </small>
          </p>
      </div>
    );
  }
});

var _scrollTop = 0;

var InfiniteList = React.createClass({
  mixins: [PureRenderMixin],

  getStateFromModel: function() {
    var acgs = ACGModel.getACGsPage();
    var numPage = acgs.keySeq().max();
    numPage = numPage ? numPage : 0;
    return {
      acgs: acgs,
      numPage:numPage
    };
  },

  getInitialState: function() {
    var modelState = this.getStateFromModel();
    var viewState = {
      isInfiniteLoading: false,
    };
    return assign(modelState, viewState);
  },

  _onChange: function() {
    var modelState = this.getStateFromModel();
    this.setState(modelState);
  },

  componentDidMount: function() {
    if (this.refs.infinite) {
      var dom = React.findDOMNode(this.refs.infinite);
      if (dom.scrollHeight >= _scrollTop) {
        dom.scrollTop = _scrollTop;
      }
    }
    ACGModel.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    ACGModel.removeChangeListener(this._onChange);
  },

  handleInfiniteLoad: function(numCount) {
    numCount = numCount ? numCount : 0;
    if (!this.state.isInfiniteLoading) {
      this.setState({
        isInfiniteLoading: true
      });
    }
    ACGModel.fetchACGsByPage(this.state.numPage + 1)
             .then(function(lastACGs) {
               var count = lastACGs.count();
               if (numCount < 5 && count < 5) {
                 numCount += count;
                 this.handleInfiniteLoad(numCount);
                 return;
               }
               this.setState({
                 isInfiniteLoading: false
               });
             }.bind(this));
  },

  elementInfiniteLoad: function() {
    return (
      <center>
          <CircularProgress mode="indeterminate"
                            style={{display: 'block', marginLeft: 'auto',
                                    marginRight: 'auto'}} />
      </center>
    ) ;
  },

  handleScroll: function(list) {
    _scrollTop = list.scrollTop;
  },

  render: function() {
    if (this.state.numPage === 0) {
      return (
        <CircularProgress mode="indeterminate" size={2}
                          style={{display: 'block', marginLeft: 'auto', marginRight: 'auto'}} />
      );
    }
    var bottomOffset = Math.floor(this.props.containerHeight * (1.0/5.0));
    return (
      <Infinite ref="infinite"
                elementHeight={100}
                handleScroll={this.handleScroll}
                containerHeight={this.props.containerHeight}
                infiniteLoadBeginBottomOffset={bottomOffset}
                onInfiniteLoad={this.handleInfiniteLoad}
                loadingSpinnerDelegate={this.elementInfiniteLoad()}
                isInfiniteLoading={this.state.isInfiniteLoading}
                timeScrollStateLastsForAfterUserScrolls={10}
                >
          {
            this.state.acgs.toList().flatten(1)
                .map(function(acg, i) {
                  return (<ListItem key={i} acg={acg} />);
                })
           }
      </Infinite>
    );
  }
});

var ACGs = module.exports = React.createClass({
  mixins: [PureRenderMixin],

  componentDidMount: function() {
    var head = document.getElementsByTagName('head')[0];
    var nextLink = document.createElement('link');
    nextLink.rel = 'next';
    nextLink.href = '/acgs/pages/'+(this.props.numPage+1);
    head.appendChild(nextLink);
    if (this.props.numPage > 1) {
      var prevLink = document.createElement('link');
      prevLink.rel = 'prev';
      prevLink.href = '/acgs/pages/'+(this.props.numPage-1);
      head.appendChild(prevLink);
    }
  },

  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getChildContext: function() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },

  getStyles: function() {
    var darkWhite = Colors.darkWhite;
    return {
      iconButton: {
        color: darkWhite
      }
    };
  },

  _hasHistory: function() {
    return (window.history.length > 3);
  },

  handleHistoryBack: function() {
    if (this._hasHistory()) {
      window.history.back();
    } else {
      var Router = require('../router');
      Router.show('/');
    }
  },

  render: function() {
    var title = 'ACG大全 - acgDB';
    document.title = title;
    var styles = this.getStyles();
    var appBarLeft = (
      <IconButton touch onClick={this.handleHistoryBack} >
          <FontIcon className="material-icons"
                    style={styles.iconButton}>keyboard_arrow_left</FontIcon>
      </IconButton>
    );
    return (
      <div>
          <AppBar title={title}
                  iconElementLeft={appBarLeft}
                  zDepth={0} />
          <InfiniteList containerHeight={window.innerHeight - 64} />
      </div>
    );
  }
});
