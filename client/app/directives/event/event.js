'use strict';

angular.module('dmxTimelineApp')
  .directive('dmxEvent', function ($rootScope, selectionHelper, moveHelper) {
    return {
      restrict: 'EA',
      templateUrl: 'directives/event/event.html',
      scope: {
        event: '=dmxEvent',
        sequence: '=dmxSequence'
      },
      link: function (scope, element, attrs, modelCtrl) {
        scope.message = "foo";

        function update() {
          // Set the position
          var left = (scope.event.start.time / scope.sequence.duration) * 100;
          var width = ((scope.event.end.time - scope.event.start.time) / scope.sequence.duration) * 100;
          element.css("left", left + "%").css("width", width + "%");

          // Set selected
          if (scope.event.selected) {
            element.addClass("selected");
          } else {
            element.removeClass("selected");
          }

          // Set background gradient according to value
          var startBlueVal = Math.round(scope.event.start.value * 2.55);
          var startRedVal = 255 - startBlueVal;
          var endBlueVal = Math.round(scope.event.end.value * 2.55);
          var endRedVal = 255 - endBlueVal;
          var bg = '-webkit-linear-gradient(left,  rgb('+startRedVal+',0,'+startBlueVal+') 0%,rgb('+endRedVal+',0,'+endBlueVal+') 100%)';
          element.css('background', bg);
        }
        update();

        element.on('click', function (event) {
          if (scope.sequence.tool === 'select') {
            if (scope.event.selected) {
              selectionHelper.deselect(scope.event);
            } else {
              selectionHelper.select(scope.event);
            }
            update();
          }
        });
        element.on('mousedown', function (event) {
          if (scope.sequence.tool === 'move' && scope.event.selected && !moveHelper.isMoving()) {
            moveHelper.startMove(event);
          }
        });

        $rootScope.$on('seq-update', update);

      }
    };
  });
