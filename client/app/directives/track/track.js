'use strict';

angular.module('dmxTimelineApp')
  .directive('dmxTrack', function ($rootScope, locationUtils) {
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
          }
        });
        $rootScope.$on('mouseup', function () {
          scope.$apply(function () {
            scope.adding = false;
          });
        });

        scope.$on('create-event', function () {
          scope.$apply(function () {
            scope.track.push({
              start: {time: scope.createEvent.start, value: 100},
              end: {time: scope.createEvent.end, value: 100}
            });
          });
        });

      }
    };
  });
