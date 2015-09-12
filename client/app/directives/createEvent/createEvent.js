'use strict';

angular.module('dmxTimelineApp')
  .directive('dmxCreateEvent', function ($rootScope, locationUtils) {
    return {
      restrict: 'EA',
      require: 'ngModel',
      link: function (scope, element, attrs, modelCtrl) {

        var trackElement = $(element).closest('.track');

        var start = 0;
        $rootScope.$on('mousedown', function (e, event) {
          start = locationUtils.posOnTrack(event.clientX, trackElement);
          element.css('left', start);
          element.css('width', 1);
        });
        $rootScope.$on('mousemove', function (e, event) {
          var posX = locationUtils.posOnTrack(event.clientX, trackElement);
          var left = Math.min(start, posX);
          var width = Math.abs(start - posX);

          element.css('left', left);
          element.css('width', width);
        });
        $rootScope.$on('mouseup', function (e, event) {
          if (scope.adding) {
            var end = locationUtils.posOnTrack(event.clientX, trackElement);
            var obj = {
              start: locationUtils.percentOnTrack(Math.min(start, end), trackElement),
              end:   locationUtils.percentOnTrack(Math.max(start, end), trackElement)
            };
            modelCtrl.$setViewValue(obj, 'create-event');
            scope.$emit('create-event', obj);
          }
        });

      }
    };
  });
