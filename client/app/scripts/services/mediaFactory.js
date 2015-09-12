/* global $ */
'use strict';

angular.module('dmxTimelineApp')
  .factory('mediaFactory', function ($rootScope, $timeout) {

    function BasicMediaManager() {
      this.currentTime = 0;
      this.playing = false;
    }

    BasicMediaManager.prototype.play = function () {
      var _this = this;
      var prevTime = new Date().getTime();
      this.playing = true;

      function step() {
        $timeout(function () {
          var time = new Date().getTime();
          var dt = time - prevTime;
          prevTime = time;
          _this.currentTime += dt / 1000;
          if (_this.playing) {
            step();
          }
        }, 50);
      }
      step();
    };

    BasicMediaManager.prototype.pause = function () {
      this.playing = false;
    };




    return {
      basic: function () {
        return new BasicMediaManager();
      },
      audio: function (file) {
        // TODO: Differentiate file and URL
        var url = URL.createObjectURL(file);
        var audio = new Audio();
        audio.src = url;
        return audio;
      }
    };
  });
