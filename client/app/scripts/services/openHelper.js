/* global $ */
'use strict';

angular.module('dmxTimelineApp')
  .factory('openHelper', function ($modal, $rootScope, $http, seedData) {

    return {
      open: function () {
        return $http.get('http://localhost:9001/api/sequences')
          .then(function (response) {
            var scope = $rootScope.$new();
            scope.shows = response.data;

            var modal = $modal.open({
              templateUrl: 'views/modal/open.html',
              size: 'lg',
              scope: scope
            });

            return modal.result;
          }).then(function (name) {
            return $http.get('http://localhost:9001/api/sequences/' + name);
          }).then(function (response) {
            return response.data;
          });
      }
    };
  });
