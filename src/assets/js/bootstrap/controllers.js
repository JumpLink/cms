jumplink.cms.controller('AppController', function($rootScope, $scope, $state, $window, $timeout, Fullscreen, toaster) {

  $scope.mainStyle = {};
  $scope.toasterPositionClass = 'toast-bottom-right';

  // http://stackoverflow.com/questions/18608161/angularjs-variable-set-in-ng-init-undefined-in-scope
  $scope.$watch('authenticated', function () {
    console.log("authenticated: "+$scope.authenticated);
    if($scope.authenticated) {
      $scope.mainStyle = {'padding-bottom':'50px'};
      $scope.toasterPositionClass = 'toast-bottom-right-with-toolbar';
    }
  });



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


  // fix resizes TODO wait until image is loaded
  $timeout(function() {
    // http://stackoverflow.com/questions/23637834/how-can-i-trigger-resize-event-in-angularjs
    angular.element($window).triggerHandler('resize')
  }, 3000)

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

  //AngularJS Toaster - AngularJS Toaster is a customized version of "toastr" non-blocking notification javascript library: https://github.com/jirikavi/AngularJS-Toaster
  $rootScope.pop = function(type, title, body, timeout, bodyOutputType, clickHandler) {
    toaster.pop(type, title, body, timeout, bodyOutputType, clickHandler);
  };

  console.log($rootScope.pop);

  $rootScope.pop('success', "title", "text");
  $timeout(function() {
    $rootScope.pop('success', "title", "text");
  }, 1000);
  $timeout(function() {
    $rootScope.pop('success', "title", "text");
  }, 2000);
  $timeout(function() {
    $rootScope.pop('success', "title", "text");
  }, 3000);
  $timeout(function() {
    $rootScope.pop('success', "title", "text");
  }, 4000);
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

jumplink.cms.controller('AdminController', function($scope) {
});

jumplink.cms.controller('UsersController', function($scope, $sailsSocket) {
  var getUsers = function () {
    $sailsSocket.get('/user').success(function(users, status, headers, config) {
      if(users != null && typeof(users) !== "undefined") {
        if(angular.isUndefined($scope.users))
          $scope.users = {};
        $scope.users = users;
      } else {
        // TODO redirect
        console.error ("Can't load users");
      }
    });
  }
  getUsers();
});

jumplink.cms.controller('UserController', function($scope, $sailsSocket, $stateParams) {
  var getUser = function () {
    $sailsSocket.get('/user'+'/'+$stateParams.index).success(function(user, status, headers, config) {
      if(user != null && typeof(user) !== "undefined") {
        if(angular.isUndefined($scope.user))
          $scope.user = {};
        $scope.user = user;
      } else {
        // TODO redirect
        console.error ("Can't load user");
      }
    });
  }
  getUser();
});

// Aufnahmeantrag
jumplink.cms.controller('ApplicationController', function($scope, $sailsSocket) {

  $scope.member = {
    datum: ''
    , name: ''
    , vorname: ''
    , geburtstag: ''
    , geburtsort: ''
    , email: ''
    , telefon: ''
    , beruf: ''
    , strasse: ''
    , plz: ''
    , ort: ''
    , bank: {
      name: ''
      , iban: ''
      , bic: ''
    }
  }

  $scope.member = {
    datum: ''
    , name: 'Garber'
    , vorname: 'Pascal'
    , geburtstag: '15.09.86'
    , geburtsort: 'Cuxhaven'
    , email: 'pascal@jumplink.eu'
    , telefon: '123456'
    , beruf: 'Softwareentwickler'
    , strasse: 'Bei der Kirche 12'
    , plz: '27476'
    , ort: 'Cuxhaven'
    , bank: {
      name: 'Volskank'
      , iban: '1234'
      , bic: '124'
    }
  }

  // $scope.$watch('invoice.date', function(newVal) {
  //   $scope.invoice.dateHuman = $filter('amDateFormat')(newVal, 'dddd, Do MMMM YYYY');
  // });

  // $scope.$watch('invoice.duedate', function(newVal) {
  //   $scope.invoice.duedateHuman = $filter('amDateFormat')(newVal, 'dddd, Do MMMM YYYY');
  // });


  $scope.upload = function() {
    $scope.webodf.upload(function(error, response ) {
      if(error) console.log(error);
      console.log(response);
      var odtFilename = response.files[0].uploadedAs;
      var odtPath = response.files[0].fd;
      $sailsSocket.put("/document/convert/", {filename: odtFilename, extension: 'pdf'}).success(function(data, status, headers, config){
        console.log(data);
         var pdfPath = data.target;
        $sailsSocket.put("/document/convert/", {filename: odtFilename, extension: 'html'}).success(function(data, status, headers, config){
          console.log(data);
           var htmlPath = data.target;
          // callback(null, resInfo, data, status, headers, config);
          var attachmentFilename = 'aufnahmeantrag_'+$scope.member.vorname+'_'+$scope.member.name;
          attachmentFilename = attachmentFilename.toLowerCase();
          $sailsSocket.post('/email/send', {from: $scope.member.email, subject:'Aufnahmeantrag von '+$scope.member.vorname+' '+$scope.member.name, text: '', htmlPath: htmlPath, attachments: [{filename: attachmentFilename+".pdf", path:pdfPath}, {filename: attachmentFilename+".html", path:htmlPath}, {filename: attachmentFilename+".odt", path:odtPath}]}).success(function(data, status, headers, config){
            console.log(data);
          });
        });
      });
    });
  }

  $scope.download = function() {
    $scope.webodf.download();
  }

  $scope.refresh = function() {
    $scope.webodf.refresh();
  }

  var onWebODFReady = function() {
    console.log("ready");
    $scope.refresh();
  }

  $scope.webodf = {
    ready: onWebODFReady
  };

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

  angular.extend($scope, {
    nvc: {
      lat: 53.86411893791266,
      lng: 8.70941162109375,
      zoom: 14
    },
    markers: {
      main_marker: {
        lat: 53.86682040225137,
        lng: 8.706825971603394,
        focus: true,
        //message: "Hey, drag me if you want",
        title: "Nautischer Verein Cuxhaven e.V.",
        draggable: true,
        label: {
          message: "<a target='_blank' title='Anfahrt' href='https://www.google.de/maps/dir//Kapit%C3%A4n-Alexander-Stra%C3%9Fe+40,+27472+Cuxhaven/@53.8668035,8.7066221,17z/data=!4m13!1m4!3m3!1s0x47b4040e075eaf1f:0xfaba82b12994a2e!2sKapit%C3%A4n-Alexander-Stra%C3%9Fe+40,+27472+Cuxhaven!3b1!4m7!1m0!1m5!1m1!1s0x47b4040e075eaf1f:0xfaba82b12994a2e!2m2!1d8.7066221!2d53.8668035?hl=de'>Nautischer Verein Cuxhaven e.V.</a>",
          options: {
            noHide: true
          }
        }
      }
    }
  });

});
