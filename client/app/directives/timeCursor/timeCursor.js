'use strict';

angular.module('dmxTimelineApp')
  .directive('dmxTimeCursor', function ($rootScope, locationUtils) {
    return {
      restrict: 'EA',
      scope: {
        sequence: '=dmxSequence'
      },
      link: function (scope, element, attrs) {

        var lastTime;
        function update(time) {
          lastTime = time;
          var percent = time / scope.sequence.duration;
          var pos = locationUtils.trackWidth(scope.sequence) * percent;
          $(element).css('left', pos);
        }
        update(0);

        $rootScope.$on('time-update', function (e, time) {
          update(time);
        });
        $rootScope.$on('seq-update', function (e) {
          update(lastTime);
        });

      }
    };
  });
