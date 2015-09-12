/* global $ */
'use strict';

angular.module('dmxTimelineApp')
  .factory('locationUtils', function () {
    var pxPerSec = 10;

    return {
      trackWidth: function (sequence) {
        return sequence.duration * pxPerSec * sequence.zoom;
      },

      posOnTrack: function (xPos, element) {
        var offset = $(element).offset();
        return xPos - offset.left;
      },

      percentOnTrack: function (pos, element) {
        var width = $(element).width();
        return (pos / width) * 100;
      },

      percentOnTrackRaw: function (pos, element) {
        var $element = $(element);
        var width = $element.width();
        var offset = $element.offset();
        return ((pos - offset.left) / width) * 100;
      }
    };
  });
