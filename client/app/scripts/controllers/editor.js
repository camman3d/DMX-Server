/* global $ */
'use strict';

angular.module('dmxTimelineApp')
  .controller('EditorCtrl', function ($scope, $rootScope, $window, $interval, $modal, $http, selectionHelper,
                                      duplicationHelper, mediaFactory, openHelper, trackTimeConverter, $timeout, undoHelper) {

    $scope.mySeq = {
      duration: 30,
      zoom: 1,
      tool: 'add'
    };
    $scope.tracks = [];
    selectionHelper.cacheTracks($scope.tracks);

    $scope.save = function () {
      if (!$scope.mySeq.name.trim()) {
        alert('Sequence needs a name.');
        return;
      }
      var payload = {
        sequence: $scope.mySeq,
        tracks: trackTimeConverter.fromPercent($scope.tracks, $scope.mySeq.duration)
      };
      console.log(payload);
      $http.post("http://localhost:9001/api/sequences", payload)
        .success(function () {
          alert("Saved");
        });
    };

    $scope.open = function () {
      openHelper.open('http://localhost:9001/api/sequences')
        .then(function (name) {
          return $http.get('http://localhost:9001/api/sequences/' + name);
        }).then(function (response) {
          undoHelper.reset();
          $scope.mySeq = response.data.sequence;
          $scope.mySeq.zoom = 1;
          $scope.mySeq.tool = 'add';
          $scope.tracks = trackTimeConverter.toPercent(response.data.tracks, $scope.mySeq.duration);
          selectionHelper.cacheTracks($scope.tracks);
          if ($scope.mySeq.media) {
            loadMedia($scope.mySeq.media);
          }
          $rootScope.$broadcast('seq-update');
        });
    };

    $scope.durationUpdate = function () {
      $rootScope.$broadcast("seq-update");
    };

    $scope.zoom = function (factor) {
      if (factor === 0) {
        $scope.mySeq.zoom = 1;
      } else {
        $scope.mySeq.zoom *= 1 + (0.25 * factor);
      }
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
        var events = [];

        $scope.tracks.forEach(function (track, trackIdx) {
          track.forEach(function (event) {
            if (event.selected) {
              selectionHelper.deselect(event);
              event.trackIndex = trackIdx;
              events.push(event);
            }
          });
        });
        events.forEach(function (event) {
          var track = $scope.tracks[event.trackIndex];
          track.splice(track.indexOf(event), 1);
        });

        undoHelper.saveDelete(events);
        //selectionHelper.cacheTracks($scope.tracks);
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
            undoHelper.saveEditValues(selectionHelper.getSelection());
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

    function resize(side, amount) {
      undoHelper.saveMoveResize(selectionHelper.getSelection());
      selectionHelper.getSelection().forEach(function (event) {
        event[side].time += amount;
      });
      $rootScope.$broadcast("seq-update");
    }

    $scope.startDmx = function () {
      $http.get('http://localhost:9001/api/start/' + $scope.mySeq.name);
    };

    $scope.addTrack = function () {
      $scope.tracks.push([]);
      undoHelper.saveAddTrack();
    };

    $scope.deleteTrack = function (index) {
      var track = $scope.tracks.splice(index, 1)[0];
      undoHelper.saveDeleteTrack(track, index);
    };

    $scope.undo = function () {
      undoHelper.undo($scope.tracks);
      $rootScope.$broadcast("seq-update");
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
      if (code >= 0 && code <= 9 && !keyboardRecord[code] && $scope.mediaPlaying) {
        keyboardRecord[code] = media.currentTime;
      }
    });
    $(window).on('keyup', function (event) {
      var code = event.keyCode - 48; // '0' has a key code of 48
      if (code >= 0 && code <= 9 && keyboardRecord[code] && $scope.mediaPlaying) {
        $scope.$apply(function () {
          $scope.recordingKeys.forEach(function (key, trackIndex) {
            if (key == code) {
              console.log(key + " - " + trackIndex);
              var newEvent = {
                start: {
                  time: (keyboardRecord[code] / $scope.mySeq.duration) * 100,
                  value: $scope.recordingValuesStart[trackIndex]
                },
                end: {
                  time: (media.currentTime / $scope.mySeq.duration) * 100,
                  value: $scope.recordingValuesEnd[trackIndex]
                }
              };
              $scope.tracks[trackIndex].push(newEvent);
              undoHelper.saveAdd($scope.tracks[trackIndex], newEvent);
            }
          });
        });
        keyboardRecord[code] = 0;
      }
    });

    // Simulation
    function updateSim(time) {
      var simValues = [];
      var pTime = (time / $scope.mySeq.duration) * 100;
      $scope.tracks.forEach(function (track, index) {
        var value = 0;
        for (var i = 0; i < track.length; i++) {
          var event = track[i];
          if (event.start.time <= pTime && event.end.time >= pTime) {
            var percent = (pTime - event.start.time) / (event.end.time - event.start.time);
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

    function loadMedia(file) {
      var url = "http://localhost:9001/api/media/" + file;
      media = mediaFactory.audio(url);
      $scope.audioName = file;
    }

    $scope.getAudio = function () {
      openHelper.open('http://localhost:9001/api/media').then(function (file) {
        $scope.mySeq.media = file;
        loadMedia(file);
        $rootScope.$broadcast('seq-update');

        $timeout(function () {
          $scope.mySeq.mediaDuration = media.duration;
          $rootScope.$broadcast('seq-update');
        }, 100);
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
      var $focus = $(':focus');
      if ($focus.length) {
        var nodeName = $focus[0].nodeName;
        if (nodeName === 'BUTTON' || nodeName === 'INPUT') {
          return;
        }
      }

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
        } else if (code === 122) { // z
          resize('start', -0.1);
        } else if (code === 120) { // x
          resize('start', 0.1);
        } else if (code === 99) { // c
          resize('end', -0.1);
        } else if (code === 118) { // v
          resize('end', 0.1);
        }
        //console.log(code);
      });
    });

  });
