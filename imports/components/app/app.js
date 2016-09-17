import { Meteor } from 'meteor/meteor';

import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';

import template from './app.html';

import { name as Auth } from './auth/auth';
import { name as Home } from './views/home';
import { name as Navigation } from './views/navigation';

import { name as Search } from '../search/search';

/*
import { name as Search } from '../search/search';
import { name as DocumentsList } from '../documents/documentsList';
import { name as DocumentDetails } from '../documents/documentDetails';
import { name as SnippetsList } from '../snippets/snippetsList';
import { name as VisitedLinksList } from '../visitedLinks/visitedLinksList';
*/

//import SnippetTrackService from '../logger/services/snippetTrack';
import LinkTrackService from '../logger/services/linkTrack';
import KMTrackService from '../logger/services/kmTrack';

class App {}

const name = 'app';

// create a module
export default angular.module(name, [
  angularMeteor,
  uiRouter,
  Home,
  Auth,
  Navigation,
  Search
  /*DocumentsList,
  DocumentDetails,
  SnippetsList,
  VisitedLinksList,*/
])
.component(name, {
  template,
  controllerAs: name,
  controller: App
})
.service('KMTrackService', KMTrackService)
.service('LinkTrackService', LinkTrackService)
.config(config)
.run(run)
.run(setTrackers);

function config($locationProvider, $urlRouterProvider) {
  'ngInject';
 
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/home');
};

function run($rootScope, $state) {
  'ngInject';

  $rootScope.$on('$stateChangeError',
   (event, toState, toParams, fromState, fromParams, error) => {
      if (error === 'AUTH_REQUIRED') {
        $state.go('login');
      }
    }
  );
};

function setTrackers($rootScope, KMTrackService, LinkTrackService) {
  'ngInject';

  lts = LinkTrackService;
  kmts = KMTrackService;

  $rootScope.$on('$viewContentLoading', function(event, viewConfig) {
    //console.log('Exiting');
    if (Meteor.user()) {
      var state = 'END';
      lts.saveVisitedLink(state);
      kmts.service();
    } else {
      kmts.antiService();
    }
  });

  $rootScope.$on('$viewContentLoaded', function(event) {
    //console.log('Entering!');
    if (Meteor.user()) {
      var state = 'BEGIN';
      lts.saveVisitedLink(state);
      kmts.service();
    }
  });
};