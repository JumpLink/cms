jumplink.cms.controller('AppController', function($rootScope, $state, Fullscreen) {

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
});

jumplink.cms.controller('LayoutController', function($scope) {


});

jumplink.cms.controller('ToolbarController', function($scope) {


});

jumplink.cms.controller('FooterController', function($scope) {


});

jumplink.cms.controller('HomeContentController', function($scope, $sailsSocket) {

  $scope.about = 'Lade..';

  console.log(html_beautify());

  // TODO move to custom service
  $scope.beautify = function () {
    $scope.about = html_beautify($scope.about);
  }

  $sailsSocket.post('/content/get', {name: 'about'}).success(function(data, status, headers, config){
    console.log(data);
    console.log(status);
    $scope.about = data[0].content;
  });



  // medium editor save button
  function Saver() {
    this.button = document.createElement('button');
    this.button.className = 'medium-editor-action';
    this.button.innerText = 'Speichern';
    this.button.onclick = this.onClick.bind(this);
    this.save = function() {
      // save about html
      $sailsSocket.put("/content/replace", {name: 'about', content: $scope.about}, function (response) {
        if(response != null && typeof(response) !== "undefined") {
          console.log (response);
        } else {
          console.log ("Can't save site");
        }
      });
    }
  }
  Saver.prototype.onClick = function() {
    this.save();
  };
  Saver.prototype.getButton = function() {
    return this.button;
  };
  Saver.prototype.checkState = function(node) {};

  // medium editor show / hide html button
  function Htmler() {
    this.button = document.createElement('button');
    this.button.className = 'medium-editor-action';
    this.button.innerText = 'HTML';
    this.button.onclick = this.onClick.bind(this);
    this.toogleHtml = function() {
      $scope.html = !$scope.html;
      $scope.$apply();
    }
  }
  Htmler.prototype.onClick = function() {
    this.toogleHtml();
  };
  Htmler.prototype.getButton = function() {
    return this.button;
  };
  Htmler.prototype.checkState = function(node) {
    if ($scope.html) {
      // this.button.classList.add('medium-editor-button-active');
    }
  };

  $scope.mediumBindOptions = {
    extensions: {
      'save': new Saver()
      , 'html' : new Htmler()
    }
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

jumplink.cms.controller('LinksController', function($scope) {
});

jumplink.cms.controller('ImprintController', function($scope) {
});
