'use strict';

angular.module('dmxTimelineApp')
  .factory('trackTimeConverter', function () {

    return {
      fromPercent: function (tracks, duration) {
        return tracks.map(function (track) {
          return track.map(function (event) {
            return {
              start: {
                time: event.start.time * duration / 100,
                value: event.start.value
              },
              end: {
                time: event.end.time * duration / 100,
                value: event.end.value
              }
            };
          });
        });
      },
      toPercent: function (tracks, duration) {
        return tracks.map(function (track) {
          return track.map(function (event) {
            return {
              start: {
                time: event.start.time * 100 / duration,
                value: event.start.value
              },
              end: {
                time: event.end.time * 100 / duration,
                value: event.end.value
              }
            };
          });
        });
      }
    };
  });
