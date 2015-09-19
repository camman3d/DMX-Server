/* global $ */
'use strict';

angular.module('dmxTimelineApp')
  .factory('openHelper', function ($modal, $rootScope, $http, seedData) {

    return {
      open: function (url) {
        return $http.get(url)
          .then(function (response) {
            var scope = $rootScope.$new();
            scope.items = response.data;

            var modal = $modal.open({
              templateUrl: 'views/modal/open.html',
              size: 'lg',
              scope: scope
            });

            return modal.result;
          });
      }
    };
  });
