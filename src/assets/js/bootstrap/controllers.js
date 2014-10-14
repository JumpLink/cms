jumplink.cms.controller('AppController', function($rootScope, $scope, $state, $window, $timeout, Fullscreen, toaster, $sailsSocket, $location, $anchorScroll) {

  // fix scroll to top on route change
  $scope.$on("$stateChangeSuccess", function () {
    $anchorScroll();
  });

  //AngularJS Toaster - AngularJS Toaster is a customized version of "toastr" non-blocking notification javascript library: https://github.com/jirikavi/AngularJS-Toaster
  $rootScope.pop = function(type, title, body, timeout, bodyOutputType, clickHandler) {
    toaster.pop(type, title, body, timeout, bodyOutputType, clickHandler);
  };

  var generalSubscribes = function () {
    // react to subscripe from server: http://sailsjs.org/#/documentation/reference/websockets/sails.io.js/io.socket.on.html
    $sailsSocket.subscribe('connect', function(msg){
      console.log('socket.io is connected');
    });

    $sailsSocket.subscribe('disconnect', function(msg){
      $rootScope.pop('error', 'Verbindung zum Server verloren', "");
    });


    $sailsSocket.subscribe('reconnect', function(msg){
      $rootScope.pop('info', 'Sie sind wieder mit dem Server verbunden', "");
    });
  }

  var adminSubscribes = function() {
    // subscripe on server
    $sailsSocket.post('/session/subscribe', {}).success(function(data, status, headers, config){
      console.log("subscribe content");

      // called on content changes
      $sailsSocket.subscribe('content', function(msg){
        console.log(msg);
        switch(msg.verb) {
          case 'updated':
            switch(msg.id) {
              case 'about':
                $rootScope.pop('success', '"Wir über uns" wurde aktualisiert', "");
              break;
              case 'goals':
                $rootScope.pop('success', '"Unsere Ziele" wurde aktualisiert', "");
              break;
              case 'links':
                $rootScope.pop('success', '"Links" wurde aktualisiert', "");
              break;
              case 'imprint':
                $rootScope.pop('success', '"Impressum" wurde aktualisiert', "");
              break;
            }
          break;
        }
      });

      // called on any sended email from server
      $sailsSocket.subscribe('email', function(email){

        var body = ''
          +'<dl>'
            +'<dt>Absender</dt>'
            +'<dd>'+email.from+'</dd>'
            +'<dt>Betreff</dt>'
            +'<dd>'+email.subject+'</dd>';
            if(email.attachments) {
              body += ''
              +'<dt>Anhänge</dt>'
              +'<dd>'+email.attachments.length+'</dd>';
            }
            body += ''
          +'</dl>';

        $rootScope.pop('info', 'Eine E-Mail wurde versendet.', body, null, 'trustedHtml');
      });

      // admin room
      $sailsSocket.subscribe('admins', function(msg){
        console.log(msg);
      });

    });
  }

  // http://stackoverflow.com/questions/18608161/angularjs-variable-set-in-ng-init-undefined-in-scope
  $rootScope.$watch('authenticated', function () {
    console.log("authenticated: "+$rootScope.authenticated);
    if($rootScope.authenticated) {
      $rootScope.mainStyle = {'padding-bottom':'50px'};
      $rootScope.toasterPositionClass = 'toast-bottom-right-with-toolbar';
      adminSubscribes();
    } else {
      $rootScope.mainStyle = {'padding-bottom':'0px'};
      $rootScope.toasterPositionClass = 'toast-bottom-right';
    }
    generalSubscribes();
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

  // TODO loading animation on $stateChangeStart
    $rootScope.$on('$stateChangeStart',
  function(event, toState, toParams, fromState, fromParams){
     $rootScope.loadclass = 'loading';
  });

  // on new url
  $rootScope.$on('$stateChangeSuccess',
  function(event, toState, toParams, fromState, fromParams){
    $rootScope.loadclass = 'finish';
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

  $rootScope.getWindowDimensions = function () {
    return { 'h': angular.element($window).height(), 'w': angular.element($window).width() };
  };

  angular.element($window).bind('resize', function () {
    // $timeout(function(){
    //   $rootScope.$apply();
    // });
    $rootScope.$apply();
  });

  // http://stackoverflow.com/questions/641857/javascript-window-resize-event
  if(angular.element($window).onresize) { // if jQuery is used
    angular.element($window).onresize = function(event) {
      $timeout(function(){
        $rootScope.$apply();
      });
    };
  }

  // http://stackoverflow.com/questions/22991481/window-orientationchange-event-in-angular
  angular.element($window).bind('orientationchange', function () {
    $timeout(function(){
      $rootScope.$apply();
    });
  });

  angular.element($window).bind('deviceorientation', function () {
    $timeout(function(){
      $rootScope.$apply();
    });
  });

  $rootScope.$watch($rootScope.getWindowDimensions, function (newValue, oldValue) {
    $rootScope.windowHeight = newValue.h;
    $rootScope.windowWidth = newValue.w;
    $timeout(function(){
      $rootScope.$apply();
    });
  }, true);

  $rootScope.logout = function() {
    $sailsSocket.post("/session/destroy", {}).success(function(data, status, headers, config) {
      $rootScope.authenticated = false;
      $rootScope.pop('success', 'Erfolgreich abgemeldet', "");
    });
  }

});

jumplink.cms.controller('LayoutController', function($scope) {


});

jumplink.cms.controller('ToolbarController', function($scope) {


});

jumplink.cms.controller('FooterController', function($scope) {

});

jumplink.cms.controller('HomeContentController', function($scope, $sailsSocket, $location, $anchorScroll, $timeout, $window, about, goals) {

  $scope.about = about;
  $scope.goals = goals;

  // WORKAROUND wait until image is loaded to fix bs-sidebar
  angular.element($window).imagesLoaded(function() {
    angular.element($window).triggerHandler('resize');
  });

  $scope.goTo = function (hash) {
    $location.hash(hash);
    $anchorScroll();
  }

  $scope.toogleHtml = function() {
    $scope.html = !$scope.html;
  }

  $scope.save = function() {
    $sailsSocket.put('/content/replace', {name: 'about', content: $scope.about}).success(function(data, status, headers, config) {
      if(data != null && typeof(data) !== "undefined") {
        console.log (data);
      } else {
        console.log ("Can't save site");
      }
    });

    $sailsSocket.put('/content/replace', {name: 'goals', content: $scope.goals}).success(function(data, status, headers, config) {
      if(data != null && typeof(data) !== "undefined") {
        console.log (data);
      } else {
        console.log ("Can't save site");
      }
    });
  }
});


jumplink.cms.controller('GalleryContentController', function($scope, $sailsSocket, $stateParams, images) {

  $scope.images = images;

});

jumplink.cms.controller('GallerySlideController', function($scope, $sailsSocket, $stateParams, $timeout, images) {

  $scope.images = images;

  var setSlide = function () {
    if(typeof $stateParams.slideIndex !== 'undefined') {
      if($scope.slideIndex != $stateParams.slideIndex)
        $scope.slideIndex = $stateParams.slideIndex
    } else {
      if($scope.slideIndex != 0)
        $scope.slideIndex = 0;
    }
  }

  // workaround
  $timeout(function() {
    setSlide();
  }, 1000);




});

jumplink.cms.controller('TimelineController', function($scope) {
});

jumplink.cms.controller('MembersController', function($scope, members, $sailsSocket) {

  var removeFromClient = function (member) {
    var index = $scope.members.indexOf(member);
    if (index > -1) {
      $scope.members.splice(index, 1);
    }
  }

  $scope.members = members;
  $scope.remove = function(member) {
    if($scope.members.length > 2) {
      if(member.id) {
        console.log(member);
        $sailsSocket.delete('/member', member).success(function(users, status, headers, config) {
          removeFromClient(member);
        });
      } else {
        removeFromClient(member);
      }
    }
  }
  $scope.add = function() {
    if($scope.members.length > 0) {
      var newMember = angular.copy($scope.members[$scope.members.length - 1]);
      delete newMember.id;
      $scope.members.push(newMember);
    } else {
      $scope.members.push({position: 1, name:"Hier Name eingeben", job: "Hier Beruf eingeben", image: 'photo.png'});
    }
  }
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

jumplink.cms.controller('LinksController', function($scope, $sailsSocket, links) {
  $scope.links = links;

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

jumplink.cms.controller('ImprintController', function($scope, $sailsSocket, imprint) {
  $scope.imprint = imprint;

  $scope.email = {
    from: ''
    , name: ''
    , subject: ''
    , content: ''
  }

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

  $scope.sendMail = function() {
    $sailsSocket.post('/email/send', {from: $scope.email.from, subject:'Kontaktanfrage von '+$scope.email.name+': '+$scope.email.subject, text: String($scope.email.content).replace(/<[^>]+>/gm, ''), html: $scope.email.content}).success(function(data, status, headers, config){
      console.log(data);
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
