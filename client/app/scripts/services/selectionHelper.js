/* global $ */
'use strict';

angular.module('dmxTimelineApp')
  .factory('selectionHelper', function ($rootScope) {

    var selected = [];
    var multi = {};
    var tracks = [];

    return {
      cacheTracks: function (t) {
        tracks = t;
      },
      getSelection: function () {
        return selected;
      },
      select: function (obj) {
        obj.selected = true;
        selected.push(obj);
      },
      deselect: function (obj) {
        if (obj.selected) {
          obj.selected = false;
          selected.splice(selected.indexOf(obj), 1);
        }
      },
      selectAll: function (arr) {
        [].push.apply(selected, arr);
        arr.forEach(function (obj) {
          obj.selected = true;
        });
      },
      deselectAll: function () {
        selected.forEach(function (obj) {
          obj.selected = false;
        });
        selected = [];
      },
      multiSelectStart: function (track, percent) {
        multi.track = track;
        multi.start = percent;
      },
      multiSelectEnd: function (trackIdx, time) {
        var startIdx = Math.min(multi.track, trackIdx);
        var endIdx = Math.max(multi.track, trackIdx);
        var startP = Math.min(multi.start, time);
        var endP = Math.max(multi.start, time);

        tracks.forEach(function (track, idx) {
          track.forEach(function (event) {
            if (idx >= startIdx && idx <= endIdx) { // In the selected track range
              if (event.start.time >= startP && event.start.time <= endP) { // Event start is in time range
                event.selected = true;
                selected.push(event);
              } else if (event.end.time >= startP && event.end.time <= endP) { // Event end is in time range
                event.selected = true;
                selected.push(event);
              }
            }
          });
          $rootScope.$broadcast("seq-update");
        });
      }
    };
  });
