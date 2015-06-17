var assign = require('object-assign');
var Router = require('../router');
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

var Search = require('./search');

var Infinite = require('react-infinite');

var ListItem = require('./ACGListItem');

var ACGModel = require('../models/acg');

var _lastACGsListScrollTop = 0;

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
    return assign(modelState, viewState);
  },

  _onChange: function() {
    var modelState = this.getStateFromModel();
    this.setState(modelState);
  },

  componentDidMount: function() {
    if (this.state.numPage === 0) {
      this.handleInfiniteLoad();
    }
    if (this.refs.infinite) {
      var dom = React.findDOMNode(this.refs.infinite);
      if (dom.scrollHeight >= _lastACGsListScrollTop) {
        dom.scrollTop = _lastACGsListScrollTop;
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
    ACGModel.fetchLastACGs(this.state.numPage + 1)
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
    _lastACGsListScrollTop = list.scrollTop;
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
                .map(function(acg, i) {
                  return (<ListItem key={i} acg={acg} />);
                })
           }
      </Infinite>
    );
  }
});

var _menuItems = [
  { text: 'Settings' },
  { text: 'About' },
  {
    type: MenuItem.Types.LINK,
    payload: '/acgs/pages/1',
    text: 'ACGs'
  },
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

/* import Autosuggest from 'react-autosuggest';

   const suburbs = ['Cheltenham', 'Mill Park', 'Mordialloc', 'Nunawading'];

   function getSuggestions(input, callback) {
   const regex = new RegExp('^' + input, 'i');
   const suggestions = suburbs.filter(suburb => regex.test(suburb));

   setTimeout(() => callback(null, suggestions)), 300); // Emulate API call
   } */

var Home = module.exports = React.createClass({
  mixins: [PureRenderMixin],

  getInitialState: function() {
    var state = {
      initialSelectedIndex: 0,
      containerHeight: 0
    };
    var path = this.props.routerContext.pathname;
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
    if (dom) {
      $(dom).height(this.state.containerHeight);
    }
  },

  _onActive: function(tab){
    if (tab.props.title === this.state.title) {
      return;
    }
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
    var options = [
      { value: '火影', label: '火影' },
      { value: 'two', label: 'Two' }
    ];
    var appBarRight = (
      <IconButton touch onClick={this.handleLeftNav} >
          <FontIcon className="material-icons"
                    style={styles.iconButton}>keyboard_arrow_down</FontIcon>
      </IconButton>
    );
    return (
      <div>
          <AppBar title={this.state.title} onLeftIconButtonTouchTap={this.handleLeftNav}
                  iconElementRight={appBarRight}
                  zDepth={0} />
          <LeftNav ref="leftNav" docked={false} menuItems={_menuItems} />
          <Tabs ref="tabs" initialSelectedIndex={this.state.initialSelectedIndex} >
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
                  <Search />
              </Tab>
              <Tab label={<FontIcon className="material-icons md-36">supervisor_account</FontIcon>}
                   title="聊天"
                   route="/chat"
                   onActive={this._onActive} >
                  <div>
                      <h2>預計放留言板</h2>
                  </div>
              </Tab>
          </Tabs>
      </div>
    );
  }
});
