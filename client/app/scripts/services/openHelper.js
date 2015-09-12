/* global $ */
'use strict';

angular.module('dmxTimelineApp')
  .factory('openHelper', function ($modal, seedData) {

    return {
      open: function () {
        var modal = $modal.open({
          templateUrl: 'views/modal/open.html',
          size: 'lg'
        });

        return modal.result.then(function (data) {
          return {
            sequence: seedData.sequences[0],
            tracks: seedData.trackLists[0]
          };
        });
      }
    };
  });
