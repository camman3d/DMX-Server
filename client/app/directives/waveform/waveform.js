'use strict';

angular.module('dmxTimelineApp')
  .directive('dmxWaveform', function ($rootScope, locationUtils) {
    return {
      restrict: 'EA',
      templateUrl: 'directives/waveform/waveform.html',
      scope: {
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

        element.on('click', function (event) {
          var percent = locationUtils.percentOnTrackRaw(event.clientX, element);
          var time = percent * scope.sequence.duration / 100;
          $rootScope.$broadcast('seek', time);
        });

      }
    };
  });
