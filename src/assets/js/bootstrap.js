jumplink.cms = angular.module('jumplink.cms', [
  'ui.router'                 // AngularUI Router: https://github.com/angular-ui/ui-router
  , 'ngAnimate'               // ngAnimate: https://docs.angularjs.org/api/ngAnimate
  , 'ngSanitize'              // ngSanitize: https://docs.angularjs.org/api/ngSanitize
  , 'sails.io'                // angularSails: https://github.com/balderdashy/angularSails
  , 'webodf'                  // custom module
  , 'FBAngular'               // angular-fullscreen: https://github.com/fabiobiondi/angular-fullscreen
  , 'mgcrea.ngStrap'          // AngularJS 1.2+ native directives for Bootstrap 3: http://mgcrea.github.io/angular-strap/
  , 'angularMoment'           // Angular.JS directive and filters for Moment.JS: https://github.com/urish/angular-moment
  , 'wu.masonry'              // A directive to use masonry with AngularJS: http://passy.github.io/angular-masonry/
  , 'angular-carousel'        // An AngularJS carousel implementation optimised for mobile devices: https://github.com/revolunet/angular-carousel
  // , 'textAngular'             // A radically powerful Text-Editor/Wysiwyg editor for Angular.js: https://github.com/fraywing/textAngular
  , 'angular-medium-editor'   // AngularJS directive for Medium.com editor clone: https://github.com/thijsw/angular-medium-editor
  , 'ui.ace'                  // This directive allows you to add ACE editor elements: https://github.com/angular-ui/ui-ace
]);

jumplink.cms.config( function($stateProvider, $urlRouterProvider, $locationProvider) {

  // use the HTML5 History API
  $locationProvider.html5Mode(false);

  $urlRouterProvider.otherwise('/bootstrap/home');

  $stateProvider
  // LAYOUT
  .state('bootstrap-layout', {
    url: '/bootstrap'
    , abstract: true
    , templateUrl: "bootstrap/layout"
    , controller: 'LayoutController'
  })
  // HOME
  .state('bootstrap-layout.home', {
    url: '/home'
    , views: {
      'content' : {
        templateUrl: 'bootstrap/home/content'
        , controller: 'HomeContentController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/toolbar'
        , controller: 'ToolbarController'
      }
      , 'footer' : {
        templateUrl: 'bootstrap/footer'
        , controller: 'FooterController'
      }
    }
  })
  // gallery
  .state('bootstrap-layout.gallery', {
    url: '/gallery'
    , views: {
      'content' : {
        templateUrl: 'bootstrap/gallery/view'
        , controller: 'GalleryContentController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  // gallery slideshow
  .state('bootstrap-layout.gallery-slider', {
    url: '/slider/:slideIndex'
    , views: {
      'content' : {
        templateUrl: 'bootstrap/gallery/slider'
        , controller: 'GallerySlideController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/gallery/toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  // events timeline
  .state('bootstrap-layout.timeline', {
    url: '/events'
    , views: {
      'content' : {
        templateUrl: 'bootstrap/events/timeline'
        , controller: 'TimelineController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  // members
  .state('bootstrap-layout.members', {
    url: '/members'
    , views: {
      'content' : {
        templateUrl: 'bootstrap/members/content'
        , controller: 'MembersController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  // application
  .state('bootstrap-layout.application', {
    url: '/application'
    , views: {
      'content' : {
        templateUrl: 'bootstrap/application/content'
        , controller: 'ApplicationController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  // imprint
  .state('bootstrap-layout.imprint', {
    url: '/imprint'
    , views: {
      'content' : {
        templateUrl: 'bootstrap/imprint/content'
        , controller: 'ImprintController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  // links
  .state('bootstrap-layout.links', {
    url: '/links'
    , views: {
      'content' : {
        templateUrl: 'bootstrap/links/content'
        , controller: 'ImprintController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  ;
});
