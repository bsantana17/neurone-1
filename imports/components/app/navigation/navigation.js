import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './navigation.html';

import { name as Login } from '../auth/login';
import { name as Register } from '../auth/register';
import { name as Password } from '../auth/password';

import { UserBookmarks, UserSnippets } from '../../userCollections';
//import { UserData } from '../../../api/_userData/index';

import { name as ModalService } from '../../modules/modal';

//import { name as Logger } from '../../logger/logger';
import Utils from '../../globalUtils';

/*
    dgacitua

    Module Dependencies:
        angularTranslate
        ModalService
        Login
        Register
        Password
        clientUtils
*/

const name = 'navigation';

class Navigation {
  constructor($scope, $rootScope, $window, $auth, $reactive, $state, $translate, $filter, $q, $timeout, $promiser, AuthService, UserDataService, BookmarkTrackService, SnippetTrackService, SessionTrackService, FlowService, ModalService) {
    'ngInject';

    this.$state = $state;
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$translate = $translate;
    this.$filter = $filter;
    this.$window = $window;
    this.$timeout = $timeout;

    this.fs = FlowService;
    this.sts = SnippetTrackService;
    this.bms = BookmarkTrackService;
    this.ses = SessionTrackService;
    this.uds = UserDataService;
    this.auth = AuthService;
    this.modal = ModalService;

    $reactive(this).attach($scope);

    this.autorun(() => {
      var isLoggedIn = !!Meteor.userId();

      if (isLoggedIn) {
        //this.sub0 = {} //this.uds.check();
        this.sub1 = $promiser.subscribe('userBookmarks');
        this.sub2 = $promiser.subscribe('userSnippets');
        console.log('Subscription AUTORUN!');
      }
    });

    this.navbarMessageId = 'navbarMessage';

    // dgacitua: https://github.com/xamfoo/reactive-obj
    this._counters = new ReactiveObj();
    
    $q.all([this.sub1, this.sub2]).then((res) => {
      this._counters.set('bookmarks', 0);
      this._counters.set('words', 0);

      // dgacitua: Set snippet button
      this.$rootScope.$on('updateSnippetButton', (event, data) => {
        this.checkSnippetStatus();
      });

      // dgacitua: Set bookmark button
      this.$rootScope.$on('updateBookmarkButton', (event, data) => {
        this.checkBookmarkStatus();
      });

      this.$rootScope.$on('updateNavigation', (event, data) => {
        var stageNumber = this.uds.getSession().currentStageNumber, 
           currentStage = this.uds.getSession().currentStageName,
           currentState = this.uds.getSession().currentStageState;

        //var stage = this.uds.getSession().stageNumber;
        Utils.notificationHide(this.navbarMessageId);

        if (currentState === 'stage0') {
          // TODO
        }
        else if (currentState === 'search') {
          //this._counters.set('bookmarks', (this.uds.getSession().bookmarkCount || 0));
          this._counters.set('bookmarks', (UserBookmarks.find().count() || 0));
        }
        else if (currentState === 'collection') {
          this.checkSnippetStatus();
        }
        else if (currentState === 'criticalEval') {
          // TODO
        }
        else if (currentState === 'synthesis') {
          // TODO
        }
        else {
          // TODO
        }

        Session.set('lockButtons', false);
      });

      this.$rootScope.$on('timeoutModal', (event, data) => {
        var currentStage = this.uds.getSession().currentStageName,
             stageNumber = this.uds.getSession().currentStageNumber;

        Utils.notificationHide(this.navbarMessageId);Utils.notificationHide(this.navbarMessageId);
      });

      this.helpers({
        isLoggedIn: () => {
          return !!Meteor.userId();
        },
        currentUser: () => {
          return Meteor.user();
        },
        counters: () => {
          return this._counters.get();
        },
        statusMessage: () => {
          return this.uds.getSession().statusMessage;
        },
        bookmarkList: () => {
          return UserBookmarks.find();
        },
        enableBookmark: () => {
          return this.uds.getSession().bookmarkButton;
        },
        enableUnbookmark: () => {
          return this.uds.getSession().unbookmarkButton;
        },
        enableBookmarkList: () => {
          return this.uds.getSession().bookmarkList;
        },
        enableSnippet: () => {
          return this.uds.getSession().snippetButton;
        },
        enableSnippetCounter: () => {
          return this.uds.getSession().snippetCounter;
        },
        enableReady: () => {
          return this.uds.getSession().readyButton;
        },
        enableBack: () => {
          return this.uds.getSession().backButton;
        },
        stageHome: () => {
          return this.uds.getSession().stageHome;
        },
        stageNumber: () => {
          return this.uds.getSession().stageNumber;
        },
        standbyMode: () => {
          return this.uds.getSession().standbyMode;
        },
        lockButtons: () => {
          return Session.get('lockButtons');
        }
      });
    });
  }

  saveSnippet() {
    this.sts.saveSnippet((err, res) => {
      this._counters.set('words', (this.uds.getSession().wordCount || 0));
      this.checkSnippetStatus();
      this.uds.setSession({ statusMessage: (res || err) });
      Utils.notificationFadeout(this.navbarMessageId);
      this.$scope.$apply();
    });
  }

  checkBookmarkStatus() {
    if (!!Meteor.userId()) {
      var limit = this.uds.getConfigs().maxBookmarks,
       required = this.uds.getConfigs().minBookmarks;

      this.uds.setSession({ bookmarkCount: UserBookmarks.find().count() });
      this._counters.set('bookmarks', (UserBookmarks.find().count() || 0));
      //this._counters.bookmarks = UserBookmarks.find().count();
      var setReady = !!(UserBookmarks.find().count() >= required);
      this.uds.setSession({ readyButton: setReady });
      
      this.bms.isBookmarked((err, res) => {
        if (!err) {
          //console.log('checkBookmarkStatus', res, this.$rootScope._counters.bookmarks, limit);
          if (this._counters.get('bookmarks') > limit || this.$state.current.name !== 'displayPage') {
            this.uds.setSession({ bookmarkButton: false });
            this.uds.setSession({ unbookmarkButton: false });
          }
          else if (this._counters.get('bookmarks') === limit) {
            if (res === true) {
              this.uds.setSession({ bookmarkButton: false });
              this.uds.setSession({ unbookmarkButton: true });
            }
            else {
              this.uds.setSession({ bookmarkButton: false });
              this.uds.setSession({ unbookmarkButton: false });
            }
          }
          else {
            if (res === true) {
              this.uds.setSession({ bookmarkButton: false });
              this.uds.setSession({ unbookmarkButton: true });
            }
            else {
              this.uds.setSession({ bookmarkButton: true });
              this.uds.setSession({ unbookmarkButton: false });
            }
          }
        }
      });
    }
  }

  checkSnippetStatus() {
    if (!!Meteor.userId()) {
      var snippets = UserSnippets.find().count(),
       minSnippets = this.uds.getConfigs().minSnippetsPerPage,
              bkms = UserBookmarks.find(),
            maxBkm = bkms.count(),
             docId = Session.get('docId'),//this.uds.getSession().docId,
        snippetCnt = UserSnippets.find({ docId: docId }).count(),
       snippetCond = !!(snippetCnt < this.uds.getConfigs().maxSnippetsPerPage);

      // dgacitua: Set Snippet button
      this.uds.setSession({ snippetButton: snippetCond });
      console.log('EnableSnippet', snippetCnt, snippetCond, docId);

      // dgacitua: Set ready button
      var setReady = true;

      bkms.forEach((bm) => {
        if (UserSnippets.find({ docId: bm.docId }).count() < minSnippets) setReady = false;
      });

      this.uds.setSession({ readyButton: setReady });
    }
  }

  saveBookmark() {
    if (!!Meteor.userId()) {
      this.bms.saveBookmark((err, res) => {
        this.uds.setSession({ statusMessage: (res || err) });
        Utils.notificationFadeout(this.navbarMessageId);
        this.$scope.$apply();
        
        if (!err) this.checkBookmarkStatus();
      });
      /*
      this.bookmarkAction((err, res) => {
        if (!err && res !== false) {
          this.bms.saveBookmark(res.answers[0].answer, res.answers[1].answer, (err, res) => {
            //this.$rootScope._navbarMessage.set(res || err);
            this.uds.setSession({ statusMessage: (res || err) });
            Utils.notificationFadeout(this.navbarMessageId);
            this.$scope.$apply();
            
            if (!err) this.checkBookmarkStatus();
          });
        }
      });
      */
    }
  }

  removeBookmark() {
    if (!!Meteor.userId()) {
      this.bms.removeBookmark((err, res) => {
        //this.$rootScope._navbarMessage.set(res || err);
        this.uds.setSession({ statusMessage: (res || err) });
        Utils.notificationFadeout(this.navbarMessageId);
        this.$scope.$apply();

        if (!err) this.checkBookmarkStatus();
      });
    }
  }

  removeNonRelevantBookmarks() {
    if (!!Meteor.userId()) {
      var docs = UserBookmarks.find({ relevant: false }).fetch();
      console.log('NonRelevant', docs);

      this.bms.removeNonRelevantBookmarks(docs, (err, res) => {
        if (!err) this.checkBookmarkStatus();
      });
    } 
  }

  logout() {
    var modalObject = {
      title: this.$translate.instant('modal.logout.title'),
      templateAsset: 'modals/logout.html',
      buttonType: 'okcancel',
      fields: {}
    };

    this.modal.openModal(modalObject, (err, res) => {
      if (!err) {
        if (res.message === 'ok') {
          this.auth.logout((err, res) => {
            if (!err) {
              this.$state.go('home');
            }
          });
        }
      }
    });
  }

  taskModal() {
    var locale = this.uds.getConfigs().locale,
      template = '';

    if (locale === 'fi') template = 'modals/taskAssignment_fi.html';
    else template = 'modals/taskAssignment_en.html';

    // dgacitua: Modal template location is relative to NEURONE's Asset Path
    var modalObject = {
      title: 'My Email',
      templateAsset: template,
      fields: {
        to: (Meteor.user() ? (Meteor.user().username || Meteor.user().emails[0].address) : 'you'),
        subject: ''
      }
    };

    this.modal.openModal(modalObject, (err, res) => {});
  }

  tipsModal(stageNumber) {
    var stageNumber = this.uds.getSession().currentStageNumber, 
       currentStage = this.uds.getSession().currentStageName,
       currentState = this.uds.getSession().currentStageState,
          stageData = this.uds.getConfigs().stages[stageNumber];

    if (currentState === 'stage0') {
      // dgacitua: Modal template location is relative to NEURONE's Asset Path
      var modalObject = {
        title: this.$translate.instant('nav.tipsButton'),
        templateAsset: 'modals/tips_stage0.html',
        fields: {}
      };

      this.modal.openModal(modalObject, (err, res) => {});
    }
    /*
    else if (currentState === 'search') {
      // dgacitua: Modal template location is relative to NEURONE's Asset Path
      var modalObject = {
        title: this.$translate.instant('nav.tipsButton'),
        templateAsset: 'modals/tips_stage1.html',
        fields: {}
      };

      this.modal.openModal(modalObject, (err, res) => {});
    }
    else if (currentState === 'stage2') {
      // dgacitua: Modal template location is relative to NEURONE's Asset Path
      var modalObject = {
        title: this.$translate.instant('nav.tipsButton'),
        templateAsset: 'modals/tips_stage2.html',
        fields: {}
      };

      this.modal.openModal(modalObject, (err, res) => {});
    }
    else if (currentState === 'stage3') {
      // dgacitua: Modal template location is relative to NEURONE's Asset Path
      var modalObject = {
        title: this.$translate.instant('nav.tipsButton'),
        templateAsset: 'modals/tips_stage3.html',
        fields: {}
      };

      this.modal.openModal(modalObject, (err, res) => {});
    }
    */
    else if (currentState === 'search' || currentState === 'collection' || currentState === 'criticalEval' || currentState === 'synthesis') {
      var modalObject = {
        title: this.$translate.instant('nav.tipsButton'),
        templateAsset: stageData.tips,
        fields: {}
      };

      this.modal.openModal(modalObject, (err, res) => {});
    }

    else {
      // dgacitua: Modal template location is relative to NEURONE's Asset Path
      var modalObject = {
        title: this.$translate.instant('nav.tipsButton'),
        templateAsset: 'modals/tips_general.html',
        fields: {}
      };

      this.modal.openModal(modalObject, (err, res) => {});
    }
  }

  tutorialModal(stageNumber) {
    var stageNumber = this.uds.getSession().currentStageNumber, 
       currentStage = this.uds.getSession().currentStageName,
       currentState = this.uds.getSession().currentStageState,
          stageData = this.uds.getConfigs().stages[stageNumber];

    if (currentState === 'stage0') {
      // dgacitua: Modal template location is relative to NEURONE's Asset Path
      var modalObject = {
        title: this.$translate.instant('nav.tutorialButton'),
        templateAsset: 'modals/tutorial_stage0.html',
        fields: {}
      };

      this.modal.openModal(modalObject, (err, res) => {});
    }
    else if (currentState === 'search' || currentState === 'collection' || currentState === 'criticalEval' || currentState === 'synthesis') {
      // dgacitua: Modal template location is relative to NEURONE's Asset Path
      var modalObject = {
        title: this.$translate.instant('nav.tutorialButton'),
        templateAsset: 'modals/tutorial_stages.html',
        fields: {
          slides: stageData.tutorial
        }
      };

      this.modal.openModal(modalObject, (err, res) => {});
    }
    else {
      // dgacitua: Modal template location is relative to NEURONE's Asset Path
      var modalObject = {
        title: this.$translate.instant('nav.tutorialButton'),
        templateAsset: 'modals/tutorial_general.html',
        fields: {}
      };

      this.modal.openModal(modalObject, (err, res) => {});
    }
  }

  /*
  bookmarkAction(callback) {
    // dgacitua: Modal template location is relative to NEURONE's Asset Path
    this.call('getForm', 'stage1-fi', (err, res) => { // TODO change hardcoded value
      if (!err) {
        var myQuestions = res.questions;

        var modalObject = {
          title: this.$translate.instant('nav.bookmarkButton'),
          templateAsset: 'modals/bookmark_stage1.html',
          buttonType: 'okcancel',
          fields: {
            url: '',
            questions: myQuestions
          }
        };

        this.modal.openModal(modalObject, (err, res) => {
          if (!err) {
            if (res.message === 'ok' && res.answers) callback(null, res);
            else callback(null, false);
          }
        });
      }
      else {
        console.error('Error while loading Stage2 forms', err);
      }
    });    
  }
  */

  timeoutModal() {
    // TODO
    var stageNumber = this.uds.getSession().currentStageNumber, 
       currentStage = this.uds.getSession().currentStageName,
       currentState = this.uds.getSession().currentStageState;

    if (currentState === 'search') {
      var maximumStars = 3,
         userBookmarks = UserBookmarks.find().fetch(),
              goodDocs = this.$filter('filter')(userBookmarks, { relevant: true }).length,
                 stars = goodDocs,    // TODO Make score formula
           timeWarning = false,       // TODO Enable time warning
          minBookmarks = this.uds.getConfigs().minBookmarks;

      console.log(userBookmarks);

      var modalObject = {
        title: this.$translate.instant('nav.taskResults'),
        templateAsset: 'modals/ready_stage1.html',
        buttonType: (goodDocs >= minBookmarks ? 'okcancel' : 'back'),
        fields: {
          stars: stars,
          maxStars: maximumStars,
          goodPages: goodDocs,
          timeWarning: timeWarning,
          bookmarks: userBookmarks,
          keepSearching: (goodDocs < minBookmarks)
        }
      };

      this.modal.openModal(modalObject, (err, res) => {
        if (!err) {
          if (res.message === 'ok' && goodDocs >= minBookmarks) {
            this.$rootScope.$broadcast('endStage', stageNumber);
          }
          else {
            this.removeNonRelevantBookmarks();
          }
        }
      });
    }
    else {
      var modalObject = {
        title: this.$translate.instant('nav.bookmarkButton'),
        templateAsset: 'modals/ready_stage2.html',
        buttonType: 'nextstage',
        fields: {}
      };

      this.modal.openModal(modalObject, (err, res) => {});
    }
  }


  backAction() {
    this.$rootScope.$broadcast('goBack');
  }

  readyAction(stage) {
    var stageNumber = this.uds.getSession().currentStageNumber, 
       currentStage = this.uds.getSession().currentStageName,
       currentState = this.uds.getSession().currentStageState;

    if (currentState === 'stage0') {
      var modalObject = {
        title: this.$translate.instant('nav.bookmarkButton'),
        templateAsset: 'modals/ready_stage0.html',
        buttonType: 'okcancel',
        fields: {}
      };

      this.modal.openModal(modalObject, (err, res) => {
        if (!err) {
          if (res.message === 'ok') {
            this.$rootScope.$broadcast('readyStage0');
            this.$rootScope.$broadcast('endStage', stageNumber);
          }
        }
      });
    }
    else if (currentState === 'search') {
      // dgacitua: Modal template location is relative to NEURONE's Asset Path
      var maximumStars = 3,
         userBookmarks = UserBookmarks.find().fetch(),
              goodDocs = this.$filter('filter')(userBookmarks, { relevant: true }).length,
                 stars = goodDocs,    // TODO Make score formula
           timeWarning = false,       // TODO Enable time warning
          minBookmarks = this.uds.getConfigs().minBookmarks;

      console.log(userBookmarks);

      var modalObject = {
        title: this.$translate.instant('nav.taskResults'),
        templateAsset: 'modals/ready_stage1.html',
        buttonType: (goodDocs >= minBookmarks ? 'okcancel' : 'back'),
        fields: {
          stars: stars,
          maxStars: maximumStars,
          goodPages: goodDocs,
          timeWarning: timeWarning,
          bookmarks: userBookmarks,
          keepSearching: (goodDocs < minBookmarks)
        }
      };

      this.modal.openModal(modalObject, (err, res) => {
        if (!err) {
          if (res.message === 'ok' && goodDocs >= minBookmarks) {
            this.$rootScope.$broadcast('endStage', stageNumber);
          }
          else {
            this.removeNonRelevantBookmarks();
          }
        }
      });
    }
    else if (currentState === 'collection' || currentState === 'criticalEval') {
      var modalObject = {
        title: this.$translate.instant('nav.bookmarkButton'),
        templateAsset: 'modals/ready_stage2.html',
        buttonType: 'okcancel',
        fields: {}
      };

      this.modal.openModal(modalObject, (err, res) => {
        if (!err) {
          if (res.message === 'ok') {
            this.$rootScope.$broadcast('readyStage2');
            this.$rootScope.$broadcast('endStage', stageNumber);
          }
        }
      });
    }
    else if (currentState === 'synthesis') {
      var modalObject = {
        title: this.$translate.instant('nav.bookmarkButton'),
        templateAsset: 'modals/ready_stage3.html',
        buttonType: 'okcancel',
        fields: {}
      };

      this.modal.openModal(modalObject, (err, res) => {
        if (!err) {
          if (res.message === 'ok') {
            this.$rootScope.$broadcast('readyStage3');
            this.$rootScope.$broadcast('endStage', stageNumber);
          }
        }
      });
    }
    else if (currentState === 'taskQuestions') {
      var modalObject = {
        title: this.$translate.instant('nav.bookmarkButton'),
        templateAsset: 'modals/ready_confirm.html',
        buttonType: 'okcancel',
        fields: {}
      };

      this.modal.openModal(modalObject, (err, res) => {
        if (!err) {
          if (res.message === 'ok') {
            this.$rootScope.$broadcast('readyTaskQuestions');
            this.$rootScope.$broadcast('endStage', stageNumber);
          }
        }
      });
    }
    else {
      this.$rootScope.$broadcast('endStage', stageNumber);
    }
  }
}

// create a module
export default angular.module(name, [
  angularMeteor,
  //Logger,
  Login,
  Register,
  Password,
  ModalService
])
.component(name, {
  template,
  controllerAs: name,
  controller: Navigation
})
.config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider.state('navigation', {
    url: '/navigation',
    template: '<navigation></navigation>',
    resolve: {}
  });
};