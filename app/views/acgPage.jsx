var rp = require('superagent-promise');
var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var ThemeManager = require('material-ui/lib/styles/theme-manager')();
var Colors = require('material-ui/lib/styles/colors');
var mui = require('material-ui');
var CircularProgress = mui.CircularProgress;
var AppBar = mui.AppBar;
var FontIcon = mui.FontIcon;
var IconButton = mui.IconButton;
var Paper = mui.Paper;
var Disqus = require('./disqus');

var ACGModel = require('../models/acg');

var _showACGAttributeTypes = ['nameTW', 'nameJP', 'nameEN',
                              'platform', 'type',
                              'officalSite', 'description'];

var ACG = React.createClass({
  mixins: [PureRenderMixin],

  _attributeTypeCH_TW: function(at) {
    switch (at) {
      case 'nameTW':
        return '中文名稱';
      case 'nameEN':
        return '英文名稱';
      case 'nameJP':
        return '日文名稱';
      case 'platform':
        return '平台';
      case 'type':
        return '類型';
      case 'description':
        return '介紹';
      case 'officalSite':
        return '官方網站';
      case 'officalSite':
        return '官方網站';
      default:
        return null;
    }
  },

  _renderListItem: function(attributeType, value, arrayIndex) {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    var attributeTypeDisaply = this._attributeTypeCH_TW(attributeType);
    if (attributeType === 'officalSite') {
      value = (<a href={value}>{value}</a>);
    }
    return (
      <li key={arrayIndex}>
          {attributeTypeDisaply} {attributeTypeDisaply ? ':' : null} {value}
      </li>
    );
  },

  render: function() {
    var acgAttributes = [];
    _showACGAttributeTypes.forEach(function(at, index) {
      acgAttributes.push(this._renderListItem(at, this.props.acg.get(at), index));
    }, this);
    var currentPath = require('../router').current;
    var url = window.location.origin + currentPath;
    return (
      <div>
          <Paper zDepth={1}>
              <ul>
                  {acgAttributes}
              </ul>
          </Paper>
          <Disqus identifier={currentPath}
                  url={url}
                  title={this.props.acg.get('nameTW')} />
      </div>
    );
  }
});

var ACGPage = module.exports = React.createClass({
  mixins: [PureRenderMixin],

  getInitialState: function() {
    return {
      acg: ACGModel.getById(this.props.acgId)
    };
  },

  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getChildContext: function() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },

  componentDidMount: function() {
    ACGModel.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    ACGModel.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    this.setState(this.getInitialState());
  },

  componentWillMount: function() {
    ThemeManager.setPalette({
      accent1Color: Colors.deepOrange500
    });
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

  handleRouteToHome: function() {
    Router.show('/');
  },

  handleHistoryBack: function() {
    if (this._hasHistory()) {
      window.history.back();
    } else {
      var Router = require('../router');
      Router.show('/');
    }
  },

  _renderAppBarLeft: function() {
    var styles = this.getStyles();
    return (
      <IconButton touch onClick={this.handleHistoryBack} >
          <FontIcon className="material-icons"
                    style={styles.iconButton}>keyboard_arrow_left</FontIcon>
      </IconButton>
    );
  },

  _renderAppBarRight: function() {
    var styles = this.getStyles();
    return (
      <IconButton touch onClick={this.handleRouteToHome} >
          <FontIcon className="material-icons"
                    style={styles.iconButton}>home</FontIcon>
      </IconButton>
    );
  },

  render: function() {
    var title = this.state.acg ? this.state.acg.get('nameTW') : '讀取中...';
    document.title = title + ' - acgDB';
    return (
      <div>
          <AppBar title={title}
                  iconElementLeft={this._renderAppBarLeft()}
                  iconElementRight={this._renderAppBarRight()}
                  zDepth={0} />
          {this.state.acg === null ?
           <CircularProgress mode="indeterminate" size={2}
           style={{display: 'block', marginLeft: 'auto', marginRight: 'auto', marginTop: '20px'}} /> :
           <ACG acg={this.state.acg} />
           }
      </div>
    );
  }
});
