/* global $ */
'use strict';

angular.module('dmxTimelineApp')
  .factory('moveHelper', function ($rootScope, selectionHelper, locationUtils) {

    var moving = false;
    var startX;

    function updateEvents(x) {
      var element = $('.track:first')[0];
      selectionHelper.getSelection().forEach(function (event) {
        var time = locationUtils.percentOnTrackRaw(x, element);
        event.start.time = time + event.startOffset;
        event.end.time = time + event.endOffset;
      });
      $rootScope.$broadcast('seq-update');
    }

    $rootScope.$on('mousemove', function (e, event) {
      if (moving) {
        updateEvents(event.clientX);
      }
    });
    $rootScope.$on('mouseup', function (e, event) {
      if (moving) {
        moving = false;
        updateEvents(event.clientX);
      }
    });

    return {
      isMoving: function () {
        return moving;
      },
      startMove: function (event) {
        moving = true;
        var time = locationUtils.percentOnTrackRaw(event.clientX, $('.track:first')[0]);
        selectionHelper.getSelection().forEach(function (event) {
          event.startOffset = event.start.time - time;
          event.endOffset = event.end.time - time;
        });
      }
    };
  });
