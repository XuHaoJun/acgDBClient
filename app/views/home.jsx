var _ = require('lodash');
var rp = require('superagent-promise');
var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var ThemeManager = require('material-ui/lib/styles/theme-manager')();
var Colors = require('material-ui/lib/styles/colors');
var mui = require('material-ui');
var RaisedButton = mui.RaisedButton;
var AppBar = mui.AppBar;
var Tabs = mui.Tabs;
var Tab = mui.Tab;
var LeftNav = mui.LeftNav;
var TextField = mui.TextField;
var MenuItem = mui.MenuItem;
var CircularProgress = mui.CircularProgress;
var FontIcon = mui.FontIcon;
var IconButton = mui.IconButton;
var DropDownIcon = mui.DropDownIcon;
var Paper = mui.Paper;

var Infinite = require('react-infinite');
var moment = require('moment');
require('moment/locale/zh-tw');

var ListItem = React.createClass({
  mixins: [PureRenderMixin],
  getDefaultProps: function() {
    return {
      height: 100,
      lineHeight: "100px"
    };
  },
  render: function() {
    var date = moment(this.props.acg.get('commonLastDate')).locale('zh-tw').fromNow();
    return (
      <div className="infinite-list-item"
           id={this.props.acg.get('id')}
           style={{height: this.props.height,
                   lineHeight: this.props.lineHeight}}>
          <span style={{fontSize: '24px'}}>
              <a href={"/acg/"+this.props.acg.get('id')}>
                  {this.props.acg.get('nameTW')}
              </a>
          </span>
          <small style={{marginLeft: '10px'}}>{date}</small>
      </div>
    );
  }
});

var ACGModel = require('../models/acg');

var _lastScrollTop = 0;

var InfiniteList = React.createClass({
  mixins: [PureRenderMixin],
  getStateFromModel: function() {
    var lastACGs = ACGModel.getLastACGs();
    return {
      lastACGs: lastACGs,
      numPage: lastACGs.count()
    };
  },

  getInitialState: function() {
    var modelState = this.getStateFromModel();
    var viewState = {
      isInfiniteLoading: false,
    };
    return _.merge(modelState, viewState);
  },

  _onChange: function() {
    var modelState = this.getStateFromModel();
    this.setState(modelState);
  },

  componentDidMount: function() {
    if (this.state.numPage === 0) {
      ACGModel.fetchLastACGs(1);
    }
    if (this.refs.infinite) {
      var dom = React.findDOMNode(this.refs.infinite);
      if (dom.scrollHeight >= _lastScrollTop) {
        dom.scrollTop = _lastScrollTop;
      }
    }
    ACGModel.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    ACGModel.removeChangeListener(this._onChange);
  },

  handleInfiniteLoad: function() {
    this.setState({
      isInfiniteLoading: true
    });
    ACGModel.fetchLastACGs(this.state.numPage + 1)
            .then(function() {
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
    _lastScrollTop = list.scrollTop;
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
            this.state.lastACGs.toList().flatten(1)
                .map(function(acg) {
                  return (<ListItem key={acg.get('id')} acg={acg} />);
                })
           }
      </Infinite>
    );
  }
});

var _menuItems = [
  { text: 'Settings' },
  { text: 'About' },
  { type: MenuItem.Types.SUBHEADER, text: 'Resources' },
  {
    type: MenuItem.Types.LINK,
    payload: 'https://github.com/xuhaojun/acgDB',
    text: 'APIs'
  },
  {
    type: MenuItem.Types.LINK,
    payload: 'https://github.com/xuhaojun/acgDB',
    text: 'GitHub'
  }
];

var Home = module.exports = React.createClass({
  mixins: [PureRenderMixin],

  getInitialState: function() {
    var state = {
      initialSelectedIndex: 0,
      containerHeight: 0
    };
    var Router = require('../router');
    var path = Router.getRoute();
    if (path === '/chat') {
      state.initialSelectedIndex = 2;
    } else if(path === '/') {
      state.initialSelectedIndex = 0;
    } else if(path === '/search') {
      state.initialSelectedIndex = 1;
    }
    if (state.initialSelectedIndex === 0) {
      state.title = '最新資訊';
    } else if(state.initialSelectedIndex === 1) {
      state.title = '搜尋';
    } else if(state.initialSelectedIndex === 2) {
      state.title = '聊天';
    }
    /* state.title = state.title + ' - acgDB'; */
    return state;
  },

  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getChildContext: function() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },

  componentWillMount: function() {
    ThemeManager.setPalette({
      accent1Color: Colors.deepOrange500
    });
  },

  componentDidMount: function() {
    this.setState({containerHeight: $(window).height() - 112});
    var dom = React.findDOMNode(this.refs.infiniteContent);
    $(dom).height(this.state.containerHeight);
  },

  _onActive: function(tab){
    var Router = require('../router');
    this.setState({title: tab.props.title});
    Router.show(tab.props.route,  null, false);
  },

  getStyles: function() {
    var darkWhite = Colors.darkWhite;
    return {
      iconButton: {
        color: darkWhite
      }
    };
  },

  handleLeftNav: function() {
    this.refs.leftNav.toggle();
  },

  render: function() {
    document.title = this.state.title + '- acgDB';
    var styles = this.getStyles();
    var otherButton = (
      <DropDownIcon menuItems={_menuItems}>
          <FontIcon className="material-icons md-36"
                    style={styles.iconButton}>keyboard_arrow_down</FontIcon>
      </DropDownIcon>
    );
    return (
      <div>
          <AppBar title={this.state.title} onLeftIconButtonTouchTap={this.handleLeftNav}
                  zDepth={0}
                  iconElementRight={otherButton} />
          <LeftNav ref="leftNav" docked={false} menuItems={_menuItems} />
          <Tabs initialSelectedIndex={this.state.initialSelectedIndex} >
              <Tab label={<FontIcon className="material-icons md-36">access_time</FontIcon>}
                   title="最新資訊"
                   route="/"
                   onActive={this._onActive} >
                  <div ref="infiniteContent">
                      <InfiniteList containerHeight={this.state.containerHeight} />
                  </div>
              </Tab>
              <Tab label={<FontIcon className="material-icons md-36">search</FontIcon>}
                   title="搜尋"
                   route="/search"
                   onActive={this._onActive} >
                  <div style={{display: 'block', marginLeft: 'auto', marginRight: 'auto', width: '100vw'}}>
                      <center>
                          <TextField hintText="Search......."
                                     autoFocus
                                     ref="searchBar"
                                     style={{width: '40vw', marginTop: '20px'}} />
                      </center>
                  </div>
              </Tab>
              <Tab label={<FontIcon className="material-icons md-36">supervisor_account</FontIcon>}
                   title="聊天"
                   route="/chat"
                   onActive={this._onActive} >
                  <div>
                      <i className="material-icons">face</i>
                      <h2>可能會換成別的界面</h2>
                  </div>
              </Tab>
          </Tabs>
      </div>
    );
  }
});
