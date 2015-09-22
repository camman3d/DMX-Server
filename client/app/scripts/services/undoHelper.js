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
      saveMoveResize: function (events) {
        undoStack.push({
          events: events.map(function (event) {
            return {
              event: event,
              start: event.start.time,
              end: event.end.time
            }
          }),
          type: 'moveResize'
        });
      },
      saveDelete: function (events) {
        undoStack.push({
          events: events,
          type: 'delete'
        });
      },
      saveDuplicate: function (duplicates) {
        undoStack.push({
          duplicates: duplicates,
          type: 'duplicate'
        });
      },
      saveEditValues: function (events) {
        undoStack.push({
          events: events.map(function (event) {
            return {
              event: event,
              start: event.start.value,
              end: event.end.value
            }
          }),
          type: 'editValues'
        });
      },
      saveAddTrack: function() {
        undoStack.push({
          type: 'addTrack'
        })
      },
      saveDeleteTrack: function (track, index) {
        undoStack.push({
          track: track,
          index: index,
          type: 'deleteTrack'
        });
      },

      undo: function (tracks) {
        var action = undoStack.pop();
        if (action.type === 'moveResize') {
          action.events.forEach(function (event) {
            event.event.start.time = event.start;
            event.event.end.time = event.end;
          });
        } else if (action.type === 'add') {
          var index = action.track.indexOf(action.event);
          action.track.splice(index, 1);
        } else if (action.type === 'delete') {
          action.events.forEach(function (event) {
            tracks[event.trackIndex].push(event);
          });
        } else if (action.type === 'duplicate') {
          action.duplicates.forEach(function (duplicate) {
            var track = tracks[duplicate.trackIndex];
            track.splice(track.indexOf(duplicate.event), 1);
          });
        } else if (action.type === 'editValues') {
          action.events.forEach(function (event) {
            event.event.start.value = event.start;
            event.event.end.value = event.end;
          });
        } else if (action.type === 'addTrack') {
          tracks.pop();
        } else if (action.type === 'deleteTrack') {
          tracks.splice(action.index, 0, action.track);
        }
      }
    };
  });
