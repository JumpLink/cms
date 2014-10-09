jumplink.cms.controller('AppController', function($rootScope, $state, $window, $timeout, Fullscreen) {

  $rootScope.isFullscreen = false;
  Fullscreen.$on('FBFullscreen.change', function(evt, isFullscreenEnabled){
    $rootScope.isFullscreen = isFullscreenEnabled == true;
    $rootScope.$apply();
  });

  $rootScope.toggleFullscreen = function () {
    if (Fullscreen.isEnabled()) {
      Fullscreen.cancel();
    } else {
      Fullscreen.all();
    }
  };

  // on new url
  $rootScope.$on('$stateChangeStart',
  function(event, toState, toParams, fromState, fromParams){
    switch(toState.name) {
      case "bootstrap-layout.home":
        $rootScope.bodyclass = 'home';
      break;
      case "bootstrap-layout.gallery":
        $rootScope.bodyclass = 'gallery';
      break;
      case "bootstrap-layout.gallery-slider":
        $rootScope.bodyclass = 'gallery-slider';
      break;
      default:
        $rootScope.bodyclass = toState.name;
      break;
    }
  });


  // fix resizes
  $timeout(function() {
    // http://stackoverflow.com/questions/23637834/how-can-i-trigger-resize-event-in-angularjs
    angular.element($window).triggerHandler('resize')
  }, 1000)

  $rootScope.getWindowDimensions = function () {
    return { 'h': angular.element($window).height(), 'w': angular.element($window).width() };
  };

  angular.element($window).bind('resize', function () {
    $rootScope.$apply();
  });

  // http://stackoverflow.com/questions/641857/javascript-window-resize-event
  if(angular.element($window).onresize) { // if jQuery is used
    angular.element($window).onresize = function(event) {
      $rootScope.$apply();
    };
  }

  // http://stackoverflow.com/questions/22991481/window-orientationchange-event-in-angular
  angular.element($window).bind('orientationchange', function () {
    $rootScope.$apply();
  });

  angular.element($window).bind('deviceorientation', function () {
    $rootScope.$apply();
  });

  $rootScope.$watch($rootScope.getWindowDimensions, function (newValue, oldValue) {
    $rootScope.windowHeight = newValue.h;
    $rootScope.windowWidth = newValue.w;
    $timeout(function(){
      $rootScope.$apply();
    });
  }, true);

});

jumplink.cms.controller('LayoutController', function($scope) {


});

jumplink.cms.controller('ToolbarController', function($scope) {


});

jumplink.cms.controller('FooterController', function($scope) {


});

jumplink.cms.controller('HomeContentController', function($scope, $sailsSocket, $location, $anchorScroll, $timeout, $window) {

  $scope.about = 'Lade..';
  $scope.goals = 'Lade..';

  $sailsSocket.post('/content/get', {name: 'about'}).success(function(data, status, headers, config){
    console.log(data);
    console.log(status);
    $scope.about = data[0].content;
    $scope.about = html_beautify($scope.about);
  });

  $sailsSocket.post('/content/get', {name: 'goals'}).success(function(data, status, headers, config){
    console.log(data);
    console.log(status);
    $scope.goals = data[0].content;
    $scope.goals = html_beautify($scope.goals);
  });

  $scope.goTo = function (hash) {
    $location.hash(hash);
    $anchorScroll();
  }

  $scope.toogleHtml = function() {
    $scope.html = !$scope.html;
  }

  $scope.save = function() {
    $sailsSocket.put("/content/replace", {name: 'about', content: $scope.about}, function (response) {
      if(response != null && typeof(response) !== "undefined") {
        console.log (response);
      } else {
        console.log ("Can't save site");
      }
    });

    $sailsSocket.put("/content/replace", {name: 'goals', content: $scope.goals}, function (response) {
      if(response != null && typeof(response) !== "undefined") {
        console.log (response);
      } else {
        console.log ("Can't save site");
      }
    });
  }
});


jumplink.cms.controller('GalleryContentController', function($scope, $sailsSocket, $stateParams) {

  var getImages = function (callback) {
    if(!$scope.images) {
      $sailsSocket.get('/gallery/get').success(function(data, status, headers, config){
        console.log(data);
        $scope.images = data.files;
        callback();
      });
    }
  }

  getImages(function() {

  });

});

jumplink.cms.controller('GallerySlideController', function($scope, $sailsSocket, $stateParams, $timeout) {

  var getImages = function (callback) {
    if(!$scope.images) {
      $sailsSocket.get('/gallery/get').success(function(data, status, headers, config){
        console.log(data);
        $scope.images = data.files;
        callback();
      });
    }
  }

  var setSlide = function () {
    if(typeof $stateParams.slideIndex !== 'undefined') {
      if($scope.slideIndex != $stateParams.slideIndex)
        $scope.slideIndex = $stateParams.slideIndex
    } else {
      if($scope.slideIndex != 0)
        $scope.slideIndex = 0;
    }
  }

  getImages(function() {
    // workaround
    $timeout(function() {
      setSlide();
    }, 1000);

  });


});

jumplink.cms.controller('TimelineController', function($scope) {
});

jumplink.cms.controller('MembersController', function($scope) {
});

jumplink.cms.controller('ApplicationController', function($scope) {
});

jumplink.cms.controller('LinksController', function($scope, $sailsSocket) {
  $scope.links = 'Lade..';

  $sailsSocket.post('/content/get', {name: 'links'}).success(function(data, status, headers, config){
    console.log(data);
    console.log(status);
    $scope.links = data[0].content;
    $scope.links = html_beautify($scope.links);
  });

  $scope.goTo = function (hash) {
    $location.hash(hash);
    $anchorScroll();
  }

  $scope.toogleHtml = function() {
    $scope.html = !$scope.html;
  }

  $scope.save = function() {
    $sailsSocket.put("/content/replace", {name: 'links', content: $scope.links}, function (response) {
      if(response != null && typeof(response) !== "undefined") {
        console.log (response);
      } else {
        console.log ("Can't save site");
      }
    });
  }
});

jumplink.cms.controller('ImprintController', function($scope, $sailsSocket) {
  $scope.imprint = 'Lade..';

  $sailsSocket.post('/content/get', {name: 'imprint'}).success(function(data, status, headers, config){
    console.log(data);
    console.log(status);
    $scope.imprint = data[0].content;
    $scope.imprint = html_beautify($scope.imprint);
  });

  $scope.goTo = function (hash) {
    $location.hash(hash);
    $anchorScroll();
  }

  $scope.toogleHtml = function() {
    $scope.html = !$scope.html;
  }

  $scope.save = function() {
    $sailsSocket.put("/content/replace", {name: 'imprint', content: $scope.imprint}, function (response) {
      if(response != null && typeof(response) !== "undefined") {
        console.log (response);
      } else {
        console.log ("Can't save site");
      }
    });
  }
});
