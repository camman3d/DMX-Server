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
      audio: function (url) {
        var audio = new Audio();

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            var objUrl = window.URL.createObjectURL(this.response);
            console.log(objUrl);
            audio.src = objUrl;
          }
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();

        //audio.src = url;
        return audio;
      }
    };
  });
