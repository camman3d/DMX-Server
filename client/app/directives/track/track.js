'use strict';

angular.module('dmxTimelineApp')
  .directive('dmxTrack', function ($rootScope, locationUtils, selectionHelper, undoHelper) {
    return {
      restrict: 'EA',
      templateUrl: 'directives/track/track.html',
      scope: {
        track: '=dmxTrack',
        sequence: '=dmxSequence'
      },
      link: function (scope, element, attrs) {

        // Sizing
        function update() {
          var width = locationUtils.trackWidth(scope.sequence);
          element.css("width", width + "px");
        }
        update();
        $rootScope.$on('seq-update', update);

        // Mouse behavior
        scope.createEvent = {
          foo: 'bar'
        };
        element.on('mousedown', function (event) {
          if (scope.sequence.tool === 'add') {
            scope.$apply(function () {
              scope.adding = true;
            });
          } else if (scope.sequence.tool === 'select') {
            var trackIdx = element.index() - 1;
            var percent = locationUtils.percentOnTrackRaw(event.clientX, element);
            selectionHelper.multiSelectStart(trackIdx, percent);
          }
        });
        element.on('mouseup', function (event) {
          if (scope.sequence.tool === 'select') {
            var trackIdx = element.index() - 1;
            var percent = locationUtils.percentOnTrackRaw(event.clientX, element);
            selectionHelper.multiSelectEnd(trackIdx, percent);
          }
        });
        $rootScope.$on('mouseup', function (e, event) {
          scope.$apply(function () {
            scope.adding = false;
          });
        });

        scope.$on('create-event', function () {
          scope.$apply(function () {
            var event = {
              start: {time: scope.createEvent.start, value: 100},
              end: {time: scope.createEvent.end, value: 100}
            };
            scope.track.push(event);
            undoHelper.saveAdd(scope.track, event);
          });
        });

      }
    };
  });
