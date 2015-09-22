/* global $ */
'use strict';

angular.module('dmxTimelineApp')
  .factory('duplicationHelper', function (selectionHelper, undoHelper) {

    var selected = [];

    return {
      getTimeOffset: function () {
        var start = Infinity;
        var end = 0;
        selectionHelper.getSelection().forEach(function (event) {
          start = Math.min(event.start.time, start);
          end = Math.max(event.end.time, end);
        });
        return end - start;
      },

      getTrackOffset: function (tracks) {
        var start = Infinity;
        for (var i = 0; i < tracks.length; i++) {
          for (var j = 0; j < tracks[i].length; j++) {
            if (tracks[i][j].selected) {
              return i;
            }
          }
        }
        return 0;
      },

      duplicate: function (tracks) {
        var duplication = [];
        tracks.forEach(function (track, index) {
          track.forEach(function (event) {
            if (event.selected) {
              duplication.push({
                trackIndex: index,
                event: {
                  start: {
                    time: event.start.time,
                    value: event.start.value
                  },
                  end: {
                    time: event.end.time,
                    value: event.end.value
                  }
                }
              });
            }
          });
        });
        return duplication;
      },

      placeDuplicates: function (duplicates, tracks, timeOffset, trackOffset) {
        duplicates.forEach(function (duplicate) {
          duplicate.event.start.time += timeOffset;
          duplicate.event.end.time += timeOffset;
          duplicate.trackIndex += trackOffset;
          tracks[duplicate.trackIndex].push(duplicate.event);
        });
        undoHelper.saveDuplicate(duplicates);
      },

      selectDuplicates: function (duplicates) {
        selectionHelper.deselectAll();
        duplicates.forEach(function (duplicate) {
          selectionHelper.select(duplicate.event);
        });
      }
    };
  });
