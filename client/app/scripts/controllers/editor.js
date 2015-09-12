/* global $ */
'use strict';

angular.module('dmxTimelineApp')
  .controller('EditorCtrl', function ($scope, $rootScope, $window, $interval, $modal, $http, selectionHelper, duplicationHelper, mediaFactory, openHelper) {

    $scope.mySeq = {};
    $scope.tracks = []; //seedData.trackLists[0];

    $scope.save = function () {
      var payload = {
        sequence: $scope.mySeq,
        tracks: $scope.tracks
      };
      // TODO: make http call to save
      console.log(payload);
    };

    $scope.open = function () {
      openHelper.open().then(function (data) {
        $scope.mySeq = data.sequence;
        $scope.tracks = data.tracks;
        // TODO: Load media
      });
    };

    $scope.zoom = function (factor) {
      $scope.mySeq.zoom *= 1 + (0.25 * factor);
      $rootScope.$broadcast("seq-update");
    };

    // Share global mouse events with children
    $($window).on('mousedown', function (event) {
      $rootScope.$broadcast("mousedown", event);
    });
    $($window).on('mouseup', function (event) {
      $rootScope.$broadcast("mouseup", event);
    });
    $($window).on('mousemove', function (event) {
      $rootScope.$broadcast("mousemove", event);
    });

    // Commands
    $scope.allSelect = function (val) {
      if (val) {
        $scope.tracks.forEach(selectionHelper.selectAll);
      } else {
        selectionHelper.deselectAll();
      }
      $rootScope.$broadcast("seq-update");
    };

    $scope.deleteSelected = function () {
      if (confirm('Are you sure?')) {
        $scope.tracks = $scope.tracks.map(function (track) {
          return track.filter(function (event) {
            return !event.selected;
          });
        });
      }
    };

    $scope.editValues = function () {
      if (selectionHelper.getSelection().length) {
        var modal = $modal.open({
          size: 'sm',
          templateUrl: 'views/modal/editValues.html'
        });
        modal.result.then(function (data) {
          if (data) {
            selectionHelper.getSelection().forEach(function (event) {
              event.start.value = data[0];
              event.end.value = data[1];
            });
            $rootScope.$broadcast("seq-update");
          }
        });
      }
    };

    $scope.duplicateAfter = function () {
      if (selectionHelper.getSelection().length) {
        var timeOffset = duplicationHelper.getTimeOffset();
        var duplicates = duplicationHelper.duplicate($scope.tracks);
        duplicationHelper.placeDuplicates(duplicates, $scope.tracks, timeOffset, 0);
        duplicationHelper.selectDuplicates(duplicates);
        $rootScope.$broadcast("seq-update");
      }
    };

    $scope.duplicateOnto = function () {
      if (selectionHelper.getSelection().length) {
        var modal = $modal.open({
          size: 'sm',
          templateUrl: 'views/modal/targetTrack.html'
        });
        modal.result.then(function (data) {
          if (data !== undefined || data !== null) {
            var trackOffset = data - duplicationHelper.getTrackOffset($scope.tracks);
            var duplicates = duplicationHelper.duplicate($scope.tracks);
            duplicationHelper.placeDuplicates(duplicates, $scope.tracks, 0, trackOffset);
            duplicationHelper.selectDuplicates(duplicates);
            $rootScope.$broadcast("seq-update");
          }
        });
      }
    };

    // Recording
    $scope.recordingKeys = [];
    $scope.recordingValuesStart = [];
    $scope.recordingValuesEnd = [];
    $scope.recording = false;
    $scope.resetRecord = function () {
      $scope.recordingKeys = [];
      $scope.recordingValuesStart = [];
      $scope.recordingValuesEnd = [];
    };
    var keyboardRecord = {};
    $(window).on('keydown', function (event) {
      var code = event.keyCode - 48; // '0' has a key code of 48
      if (code >=0 && code <= 9 && !keyboardRecord[code] && $scope.mediaPlaying) {
        keyboardRecord[code] = media.currentTime;
      }
    });
    $(window).on('keyup', function (event) {
      var code = event.keyCode - 48; // '0' has a key code of 48
      if (code >=0 && code <= 9 && keyboardRecord[code] && $scope.mediaPlaying) {
        $scope.$apply(function () {
          $scope.recordingKeys.forEach(function (key, trackIndex) {
            if (key == code) {
              console.log(key + " - " + trackIndex);
              $scope.tracks[trackIndex].push({
                start: {
                  time: (keyboardRecord[code] / $scope.mySeq.duration) * 100,
                  value: $scope.recordingValuesStart[trackIndex]
                },
                end: {
                  time: (media.currentTime / $scope.mySeq.duration) * 100,
                  value: $scope.recordingValuesEnd[trackIndex]
                }
              });
            }
          });
        });
        keyboardRecord[code] = 0;
      }
    });

    // Simulation
    function updateSim(time) {
      var simValues = [];
      $scope.tracks.forEach(function (track, index) {
        var value = 0;
        for (var i = 0; i < track.length; i++) {
          var event = track[i];
          if (event.start.time <= time && event.end.time >= time) {
            var percent = (time - event.start.time) / (event.end.time - event.start.time);
            value = ((1 - percent) * event.start.value) + (percent * event.end.value);
            break;
          }
        }
        simValues[index] = value;
      });
      $('.dmx-sim-icon').each(function (idx, e) {
        $(e).css('opacity', simValues[idx] / 100);
      });
    }

    // Media
    var media = mediaFactory.basic();
    $scope.mediaPlaying = false;
    $scope.selectAudio = function () {
      $("#audioFileInput").click();
    };
    $scope.getAudio = function (f) {
      var file = f.files[0];
      // TODO: Make call to server and upload the file and get url back
      media = mediaFactory.audio(file);
      $scope.$apply(function () {
        $scope.audioName = file.name;
      });
    };

    $interval(function () {
      if ($scope.mediaPlaying) {
        var time = media.currentTime;
        $rootScope.$broadcast('time-update', time);
        updateSim(time);
      }
    }, 50);

    $scope.rewind = function () {
      media.currentTime = 0;
    };
    $scope.play = function () {
      media.play();
      $scope.mediaPlaying = true;
    };
    $scope.pause = function () {
      media.pause();
      $scope.mediaPlaying = false;
    };

    $rootScope.$on('seek', function (e, time) {
      media.currentTime = time;
      $rootScope.$broadcast('time-update', time);
      updateSim(time);
    });

    // Keyboard shortcuts
    $(window).on('keypress', function (event) {
      $scope.$apply(function () {
        var code = event.keyCode;
        if (code === 32) { // Space
          $scope.mediaPlaying ? $scope.pause() : $scope.play();
        } else if (code === 97) { // a
          $scope.mySeq.tool = 'add';
        } else if (code === 115) { // s
          $scope.mySeq.tool = 'select';
        } else if (code === 100) { // d
          $scope.mySeq.tool = 'move';
        } else if (code === 113) { // q
          $scope.allSelect(true);
        } else if (code === 119) { // w
          $scope.allSelect(false);
        } else if (code === 101) { // e
          $scope.deleteSelected();
        } else if (code === 114) { // r
          $scope.editValues();
        } else if (code === 43) { // +
          $scope.zoom(1);
        } else if (code === 95) { // -
          $scope.zoom(-1);
        }

        console.log(code);
      });
    });

  });