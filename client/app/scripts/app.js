'use strict';

/**
 * @ngdoc overview
 * @name dmxTimelineApp
 * @description
 * # dmxTimelineApp
 *
 * Main module of the application.
 */
angular
  .module('dmxTimelineApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.bootstrap'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .when('/edit', {
        templateUrl: 'views/editor.html',
        controller: 'EditorCtrl',
        controllerAs: 'editor'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
