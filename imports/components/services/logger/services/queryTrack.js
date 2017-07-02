import { Meteor } from 'meteor/meteor';

import Utils from '../../../globalUtils';
import LogUtils from '../../../logUtils';
import LoggerConfigs from '../../../globalConfigs';

export default class QueryTrackService {
  constructor($state, $rootScope) {
    'ngInject';

    this.$state = $state;
    this.$rootScope = $rootScope;
  }

  saveQuery(queryText) {
    if (Meteor.user() && !Utils.isEmpty(queryText)) {
      var pageTitle = this.$rootScope.documentTitle,
            pageUrl = this.$state.href(this.$state.current.name, this.$state.params, {absolute: false});

      var queryObject = {
        userId: Meteor.userId(),
        username: Meteor.user().username || Meteor.user().emails[0].address,
        query: queryText,
        title: (pageTitle ? pageTitle : document.title),
        url: (pageUrl ? pageUrl : window.location.href),
        localTimestamp: Utils.getTimestamp()
      };

      Meteor.call('storeQuery', queryObject, (err, result) => {
        if (!err) {
          LogUtils.logToConsole('Query Saved!', queryObject.query, queryObject.userId, queryObject.username, queryObject.localTimestamp);
        }
        else {
          LogUtils.logToConsole('Error!', err);
        }
      });
    }
  }
}