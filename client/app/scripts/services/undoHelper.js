/* global $ */
'use strict';

angular.module('dmxTimelineApp')
  .factory('undoHelper', function () {

    var undoStack = [];

    return {
      reset: function () {
        undoStack = [];
      },

      saveAdd: function (track, event) {
        undoStack.push({
          track: track,
          event: event,
          type: 'add'
        })
      },
      saveMove: function (events) {
        undoStack.push({
          events: events.map(function (event) {
            return {
              event: event,
              start: event.start.time,
              end: event.end.time
            }
          }),
          type: 'move'
        });
      },
      saveDelete: function (events) {
        undoStack.push({
          events: events,
          type: 'delete'
        });
      },
      saveAddTrack: function() {

      },
      saveDeleteTrack: function () {

      },

      undo: function (tracks) {
        var action = undoStack.pop();
        if (action.type === 'move') {
          action.events.forEach(function (event) {
            event.event.start.time = event.start;
            event.event.end.time = event.end;
          });
        } else if (action.type === 'add') {
          var index = action.track.indexOf(action.event);
          action.track.splice(index, 1);
        } else if (action.type === 'delete') {
          action.events.forEach(function (event) {
            tracks[event.trackIdx].push(event);
          });
        }
      }
    };
  });
