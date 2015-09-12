/* global $ */
'use strict';

angular.module('dmxTimelineApp')
  .factory('selectionHelper', function () {

    var selected = [];

    return {
      getSelection: function () {
        return selected;
      },
      select: function (obj) {
        obj.selected = true;
        selected.push(obj);
      },
      deselect: function (obj) {
        obj.selected = false;
        selected.splice(selected.indexOf(obj), 1);
      },
      selectAll: function (arr) {
        [].push.apply(selected, arr);
        arr.forEach(function (obj) {
          obj.selected = true;
        });
      },
      deselectAll: function () {
        selected.forEach(function (obj) {
          obj.selected = false;
        });
        selected = [];
      }
    };
  });
