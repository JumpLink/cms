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
  , 'leaflet-directive'       // AngularJS directive to embed an interact with maps managed by Leaflet library: https://github.com/tombatossals/angular-leaflet-directive
  , 'toaster'                 // AngularJS-Toaster - AngularJS Toaster is a customized version of "toastr" non-blocking notification javascript library: https://github.com/jirikavi/AngularJS-Toaster
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
    , resolve:{
      about: function($sailsSocket) {
        return $sailsSocket.post('/content/get', {name: 'about'}).then (function (data) {
          return html_beautify(data.data[0].content);
        });
      }
      , goals: function($sailsSocket, $timeout) {
        return $sailsSocket.post('/content/get', {name: 'goals'}).then (function (data) {
          return html_beautify(data.data[0].content);
        });
      }
    }
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
    , resolve:{
      images: function($sailsSocket) {
        return $sailsSocket.get('/gallery/get').then (function (data) {
          return data.data.files;
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'bootstrap/gallery/view'
        , controller: 'GalleryContentController'
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
  // gallery slideshow
  .state('bootstrap-layout.gallery-slider', {
    url: '/slider/:slideIndex'
    , resolve:{
      images: function($sailsSocket) {
        return $sailsSocket.get('/gallery/get').then (function (data) {
          return data.data.files;
        });
      }
    }
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
      , 'footer' : {
        templateUrl: 'bootstrap/footer'
        , controller: 'FooterController'
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
      , 'footer' : {
        templateUrl: 'bootstrap/footer'
        , controller: 'FooterController'
      }
      // 'adminbar': {
      //   templateUrl: 'bootstrap/adminbar'
      // }
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
      , 'footer' : {
        templateUrl: 'bootstrap/footer'
        , controller: 'FooterController'
      }
    }
  })
  // imprint
  .state('bootstrap-layout.imprint', {
    url: '/imprint'
    , resolve:{
      imprint: function($sailsSocket) {
        return $sailsSocket.post('/content/get', {name: 'imprint'}).then (function (data) {
          return html_beautify(data.data[0].content);
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'bootstrap/imprint/content'
        , controller: 'ImprintController'
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
  // links
  .state('bootstrap-layout.links', {
    url: '/links'
    , resolve:{
      links: function($sailsSocket) {
        return $sailsSocket.post('/content/get', {name: 'links'}).then (function (data) {
          return html_beautify(data.data[0].content);
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'bootstrap/links/content'
        , controller: 'LinksController'
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
  // links
  .state('bootstrap-layout.administration', {
    url: '/admin'
    , views: {
      'content' : {
        templateUrl: 'bootstrap/administration/settings'
        , controller: 'AdminController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/toolbar'
        , controller: 'ToolbarController'
      }
      // , 'footer' : {
      //   templateUrl: 'bootstrap/footer'
      //   , controller: 'FooterController'
      // }
    }
  })
  .state('bootstrap-layout.users', {
    url: '/users'
    , views: {
      'content' : {
        templateUrl: 'bootstrap/administration/users'
        , controller: 'UsersController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/toolbar'
        , controller: 'ToolbarController'
      }
      // , 'footer' : {
      //   templateUrl: 'bootstrap/footer'
      //   , controller: 'FooterController'
      // }
    }
  })
  .state('bootstrap-layout.user', {
    url: '/user/:index'
    , views: {
      'content' : {
        templateUrl: 'bootstrap/administration/user'
        , controller: 'UserController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/toolbar'
        , controller: 'ToolbarController'
      }
      // , 'footer' : {
      //   templateUrl: 'bootstrap/footer'
      //   , controller: 'FooterController'
      // }
    }
  })
  ;
});
