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

var Infinite = require('react-infinite');

var ListItem = React.createClass({
  getDefaultProps: function() {
    return {
      height: 100,
      lineHeight: "100px"
    };
  },
  render: function() {
    return (
      <div className="infinite-list-item"
           style={{height: this.props.height,
                   lineHeight: this.props.lineHeight}}>
          {this.props.acg.nameTW}
      </div>
    );
  }
});

var InfiniteList = React.createClass({
  getInitialState: function() {
    return {
      numPage: 0,
      elements: [],
      isInfiniteLoading: false
    };
  },

  componentDidMount: function() {
    rp.get('/api/lastACGs/pages/1')
      .set('Accept', 'application/json')
      .end()
      .then(function(res) {
        var elements = [];
        res.body.forEach(function(v, index) {
          elements.push(<ListItem key={v.id} acg={v} />);
        });
        this.setState({
          elements: elements,
          numPage: 1
        });
      }.bind(this));
  },

  buildElements: function(start, end) {
    var elements = [];
    for (var i = start; i < end; i++) {
      elements.push(<ListItem key={i} index={i}/>);
    }
    return elements;
  },

  handleInfiniteLoad: function() {
    this.setState({
      isInfiniteLoading: true
    });
    rp.get('/api/lastACGs/pages/' + (this.state.numPage + 1))
      .set('Accept', 'application/json')
      .end()
      .then(function(res) {
        var elements = [];
        res.body.forEach(function(v, index) {
          elements.push(<ListItem key={v.id} acg={v} />);
        });
        elements = this.state.elements.concat(elements);
        this.setState({
          isInfiniteLoading: false,
          elements: elements,
          numPage: this.state.numPage + 1
        });
      }.bind(this));
    /* var elemLength = that.state.elements.length,
       newElements = that.buildElements(elemLength, elemLength + 100);
       that.setState({
       isInfiniteLoading: false,
       elements: that.state.elements.concat(newElements)
       }); */
  },

  elementInfiniteLoad: function() {
    return <div className="infinite-list-item">
          Loading...
    </div>;
  },

  render: function() {
    if (this.state.elements.length > 0) {
      return (
        <Infinite elementHeight={100}
                  containerHeight={this.props.containerHeight}
                  infiniteLoadBeginBottomOffset={200}
                  onInfiniteLoad={this.handleInfiniteLoad}
                  loadingSpinnerDelegate={this.elementInfiniteLoad()}
                  isInfiniteLoading={this.state.isInfiniteLoading}
                  timeScrollStateLastsForAfterUserScrolls={1500}
                  >
            {this.state.elements}
        </Infinite>
      );
    }
    return (
      <CircularProgress mode="indeterminate" size={2}
                        style={{display: 'block', marginLeft: 'auto', marginRight: 'auto'}} />
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
    if (path === '/about') {
      state.initialSelectedIndex = 2;
    } else if(path === '/') {
      state.initialSelectedIndex = 0;
    } else if(path === '/search') {
      state.initialSelectedIndex = 1;
    }
    if (state.initialSelectedIndex === 0) {
      state.title = 'News';
    } else if(state.initialSelectedIndex === 1) {
      state.title = 'Search';
    } else if(state.initialSelectedIndex === 2) {
      state.title = 'About';
    }
    state.title = state.title + ' - acgDB';
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
    $('#content').height(this.state.containerHeight);
  },

  _onActive: function(tab){
    var Router = require('../router');
    this.setState({title: tab.props.label + ' - acgDB'});
    Router.show(tab.props.route,  null, false);
  },

  handleLeftNav: function() {
    this.refs.leftNav.toggle();
  },

  render: function() {
    document.title = this.state.title;
    return (
      <div>
          <AppBar title='acgDB' onLeftIconButtonTouchTap={this.handleLeftNav} />
          <LeftNav ref="leftNav" docked={false} menuItems={_menuItems} />
          <Tabs initialSelectedIndex={this.state.initialSelectedIndex} >
              <Tab label="News"
                   route="/"
                   onActive={this._onActive} >
                  <div id="content">
                      <InfiniteList containerHeight={this.state.containerHeight} />
                  </div>
              </Tab>
              <Tab label="Search"
                   route="/search"
                   onActive={this._onActive} >
                  <div>
                      <TextField hintText="I will find a search icon..." />
                      <div>
                          <h2>Tab One Template Example</h2>
                          <p>
                              This is an example of a tab template!
                          </p>
                          <p>
                              You can put any sort of HTML or react component in here.
                          </p>
                          <h2>Tab Two Template Example</h2>
                          <p>
                              This is another example of a tab template!
                          </p>
                          <p>
                              Fair warning - the next tab routes to home!
                          </p>
                      </div>
                  </div>
              </Tab>
              <Tab label="About"
                   route="/about"
                   onActive={this._onActive} >
                  <div>
                      <h2>可能會換成別的界面</h2>
                  </div>
              </Tab>
          </Tabs>
      </div>
    );
  }
});
