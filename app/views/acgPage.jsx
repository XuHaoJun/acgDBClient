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

var ACGModel = require('../models/acg');

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

  handleHistoryBack: function() {
    console.log('back');
    console.log(window.history.length);
    if (window.history.length > 3) {
      window.history.back();
    } else {
      console.log('Router');
      var Router = require('../router');
      Router.show('/');
    }
  },

  render: function() {
    var styles = this.getStyles();
    var backButton = (
      <IconButton touch onClick={this.handleHistoryBack} >
          <FontIcon className="material-icons md-36"
                    style={styles.iconButton}>keyboard_arrow_left</FontIcon>
      </IconButton>
    );
    console.log(this.state);
    var title = this.state.acg ? this.state.acg.get('nameTW') : '讀取中...';
    return (
      <div>
          <AppBar title={title}
                  iconElementLeft={backButton}
                  zDepth={0} />
          {this.state.acg === null ?
           <CircularProgress mode="indeterminate" size={2}
           style={{display: 'block', marginLeft: 'auto', marginRight: 'auto'}} />
           : null
           }
      </div>
    );
  }
});
