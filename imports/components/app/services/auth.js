import Utils from '../../globalUtils';
import Configs from '../../globalConfigs';

class AuthService {
  constructor($rootScope, $translate, FlowService, SessionTrackService) {
    'ngInject';

    this.$rootScope = $rootScope;
    this.$translate = $translate;
    this.fs = FlowService;
    this.sts = SessionTrackService;

    this.threshold = Utils.sec2millis(Configs.idleThreshold);
    this.interval = Utils.sec2millis(Configs.idleCheckInterval);
    this.idleOnBlur = Configs.idleOnBlur;
  }

  login(user, password, callback) {
    Meteor.loginWithPassword(user, password, (err) => {
      if (err) {
        console.error('Login Error!', err);
        callback(err);
      }
      else {
        this.sts.saveLogin();

        /*
        this.$rootScope.maxBookmarks = Meteor.user().profile.maxBookmarks;
        this.$rootScope.snippetsPerPage = Meteor.user().profile.snippetsPerPage;
        this.$rootScope.snippetLength = Meteor.user().profile.snippetLength;

        this.$rootScope.$broadcast('sessionRefresh', Meteor.userId());
        */

        var msg = { message: 'Login successful!' };  // TODO: Translate message
        callback(null, msg);
      }
    });
  }

  logout(callback) {
    this.sts.saveLogout();
    
    Accounts.logout((err) => {
      if (err) {
        console.error('Logout error!', err);
        callback(err);
      }
      else {
        /*
        this.$rootScope.maxBookmarks = 0;
        this.$rootScope.snippetsPerPage = 0;
        this.$rootScope.snippetLength = 0;

        this.$rootScope.$broadcast('sessionRefresh', null);
        */
    
        var msg = { message: 'Logout successful!' };  // TODO: Translate message
        callback(null, msg);
      }
    });
  }

  register(credentials, callback) {
    Accounts.createUser(credentials, (err) => {
      if (err) {
        console.error('Register Error!', err);
        callback(err);
      }
      else {
        var msg = { message: 'Register successful!' };  // TODO: Translate message
        callback(null, msg);
      }
    });
  }

  resetPassword(credentials, callback) {
    Accounts.forgotPassword(credentials, (err) => {
      if (err) {
        console.error('Reset password Error!', err);
        callback(err);
      }
      else {
        var msg = { message: 'Reset password successful!' };  // TODO: Translate message
        callback(null, msg);
      }
    });
  }
}

const name = 'authService';

export default angular.module(name, [])
.service('AuthService', AuthService);
