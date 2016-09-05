import { Meteor } from 'meteor/meteor';

import { Snippets } from '../../imports/api/snippets/index';
import { VisitedLinks } from '../../imports/api/visitedLinks/index';

import Utils from './utils';
import LinkTrack from './linktrack';

getSnippet = function() {
	var snippetObject = LinkTrack.saveSnippet();

	if (Meteor.user() && snippetObject != null) {
    snippetObject.owner = Meteor.userId();
    snippetObject.username = Meteor.user().username;
	  Snippets.insert(snippetObject);
	  Utils.logToConsole('Snippet Saved!');
	}
	else {
	  Utils.logToConsole('Error while saving snippet');
	}
};

getLink = function(state) {
	var linkObject = LinkTrack.savePage();

	if (Meteor.user() && linkObject != null) {
    linkObject.owner = Meteor.userId();
    linkObject.username = Meteor.user().username;
    linkObject.state = state;
	  VisitedLinks.insert(linkObject);
    Utils.logToConsole('Page Saved! ' + state);
	}
};