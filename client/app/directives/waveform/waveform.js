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

        var $waveform = element.children(".waveform");

        // Sizing
        function update() {
          var width = locationUtils.trackWidth({
            duration: scope.sequence.mediaDuration || scope.sequence.duration,
            zoom: scope.sequence.zoom
          });
          element.css("width", width + "px");
          if (scope.sequence.media) {
            var waveformUrl = "http://localhost:9001/api/waveforms/" + scope.sequence.media.replace('.mp3', '.png');
            $waveform.css('background-image', 'url("' + waveformUrl + '")');
          }
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
