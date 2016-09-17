import { Meteor } from 'meteor/meteor';

import Utils from '../../../lib/utils';

/**
 * 
 * KMTrack
 * Custom library for mouse tracking in Javascript
 * (adapted as AngularJS Service)
 * 
 * Created by Daniel Gacitua <daniel.gacitua@usach.cl>
 * 
 * License: MIT 
 * http://opensource.org/licenses/MIT
 * 
 * Based on Denis Papathanasiou's buckabuckaboo
 * https://github.com/dpapathanasiou/buckabuckaboo
 * 
 */

export default class KMTrackService {
  constructor($window, $document, $location) {
    'ngInject';

    this.$window = $window;
    this.$document = $document;
    this.$location = $location;

    this.isTracking = false;
  }


  bindEvent(evt, fn) {
    angular.element(this.$window).on(evt, fn);
    console.log('BIND!', evt);
  }

  unbindEvent(evt, fn) {
    angular.element(this.$window).off(evt, fn);
    console.log('UNBIND!', evt);
  }

  mouseMoveListener(evt) {
    // From http://stackoverflow.com/a/23323821
    var w = angular.element(window),
        d = angular.element(document)[0],
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = evt.pageX,
        y = evt.pageY,
        w = window.innerWidth  || e.clientWidth  || g.clientWidth,
        h = window.innerHeight || e.clientHeight || g.clientHeight,
      src = window.location.href,   //this.$location.absUrl(),
     time = Utils.getTimestamp();

    if (x == null && evt.clientX != null) {
      x = evt.clientX + (e && e.scrollLeft || g && g.scrollLeft || 0)
      - (e && e.clientLeft || g && g.clientLeft || 0);
    }

    if (y == null && evt.clientY != null) {
      y = evt.clientY + (e && e.scrollTop  || g && g.scrollTop  || 0)
      - (e && e.clientTop  || g && g.clientTop  || 0);
    }

    if (Meteor.user()) {
      //Utils.logToConsole('Mouse Movement! X:' + x + ' Y:' + y + ' W:' + w + ' H:' + h + ' TIME:' + time + ' SRC:' + src);

      var movement_output = {
        type: 'mouse_movement',
        x_pos: x,
        y_pos: y,
        w_scr: w,
        h_scr: h,
        local_time: time,
        src_url: src,
        owner: Meteor.userId(),
        username: Meteor.user().emails[0].address
      };

      //Meteor.call('storeMouseCoordinates', movement_output, function(err, result) {});
    }
  }

  mouseClickListener(evt) {
    // From http://stackoverflow.com/a/11744120/1319998
    var w = angular.element(window),
        d = angular.element(document)[0],
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = evt.pageX,
        y = evt.pageY,
        w = window.innerWidth  || e.clientWidth  || g.clientWidth,
        h = window.innerHeight || e.clientHeight || g.clientHeight,
      src = window.location.href,   //this.$location.absUrl(),
     time = Utils.getTimestamp();

    if (x == null && evt.clientX != null) {
      x = evt.clientX + (e && e.scrollLeft || g && g.scrollLeft || 0)
      - (e && e.clientLeft || g && g.clientLeft || 0);
    }

    if (y == null && evt.clientY != null) {
      y = evt.clientY + (e && e.scrollTop  || g && g.scrollTop  || 0)
      - (e && e.clientTop  || g && g.clientTop  || 0);
    }

    if (Meteor.user()) {
      Utils.logToConsole('Mouse Click! X:' + x + ' Y:' + y + ' W:' + w + ' H:' + h + ' TIME:' + time + ' SRC:' + src);

      var click_output = {
        type: 'mouse_click',
        x_pos: x,
        y_pos: y,
        w_scr: w,
        h_scr: h,
        local_time: time,
        src_url: src,
        owner: Meteor.userId(),
        username: Meteor.user().emails[0].address
      };

      Meteor.call('storeMouseClicks', click_output, function(err, result) {});
    }
  }

  keystrokeListener(evt) {
    evt = evt || event;
      
    var t = Utils.getTimestamp(),
       kc = evt.keyCode,
        w = evt.which,
      chc = evt.charCode,
      chr = String.fromCharCode(kc || chc),
      src = window.location.href;

    if (Meteor.user()) {
      Utils.logToConsole('Key Pressed!   ' + 
        ' timestamp:' + t + 
        ' keyCode:' + kc + 
        ' which:' + w + 
        ' charCode:' + chc +
        ' char:' + chr +
        (evt.shiftKey ? ' +SHIFT' : '') +
        (evt.ctrlKey ? ' +CTRL' : '') +
        (evt.altKey ? ' +ALT' : '') +
        (evt.metaKey ? ' +META' : '') +
        ' src:' + src
      );

      var key_output = {
        type: 'key_press',
        keyCode: kc,
        which: w,
        charCode: chc,
        chr: chr,
        local_time: t,
        src_url: src,
        owner: Meteor.userId(),
        username: Meteor.user().emails[0].address
      };

      Meteor.call('storeKeystrokes', key_output, function(err, result) {});
    }
  }

  startTrack() {
    this.bindEvent('mousemove', this.mouseMoveListener);
    this.bindEvent('click', this.mouseClickListener);
    this.bindEvent('keydown', this.keystrokeListener);
    this.isTracking = true;
  }

  stopTrack() {
    this.unbindEvent('mousemove', this.mouseMoveListener);
    this.unbindEvent('click', this.mouseClickListener);
    this.unbindEvent('keydown', this.keystrokeListener);
    this.isTracking = false;
  }

  service() {
    if (!this.isTracking) {
      this.startTrack();
    }
  }

  antiService() {
    if (this.isTracking) {
      this.stopTrack();
    }
  }
}