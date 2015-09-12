'use strict';

angular.module('dmxTimelineApp')
  .factory('seedData', function () {

    return {
      sequences: [
        {
          duration: 100,
          zoom: 1,
          tool: 'add'
        }
      ],
      trackLists: [
        [
          [
            { start: {time: 2, value: 50}, end: {time: 4, value: 25} },
            { start: {time: 10, value: 0}, end: {time: 20, value: 100} }
          ],
          [
            { start: {time: 15, value: 0}, end: {time: 20, value: 100} },
            { start: {time: 0, value: 50}, end: {time: 7, value: 25} }
          ]
        ]
      ]
    };
  });
