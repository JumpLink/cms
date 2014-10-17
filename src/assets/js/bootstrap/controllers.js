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
      $rootScope.authenticated = false;
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
            +'<dd><a href="mailto:'+email.from+'">'+email.from+'</a></dd>'
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

      $sailsSocket.subscribe('member', function(msg){
        console.log(msg);

        switch(msg.verb) {
          case 'updated':
            $rootScope.pop('success', msg.data.name+' wurde aktualisiert', "");
          break;
          case 'created':
            $rootScope.pop('success', msg.data.name+' wurde erstellt', "");
          break;
          case 'removedFrom':
            $rootScope.pop('success', msg.data.name+' wurde entfernt', "");
          break;
          case 'destroyed':
            $rootScope.pop('success', msg.data.name+' wurde gelöscht', "");
          break;
          case 'addedTo':
            $rootScope.pop('success', msg.data.name+' wurde hinzugefügt', "");
          break;
        }
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

jumplink.cms.controller('TimelineController', function($rootScope, $scope, events, moment, $sailsSocket, $modal, $datepicker, eventService, FileUploader) {
  $scope.events = events;
  $scope.uploader = new FileUploader({url: 'timeline/upload', removeAfterUpload: true});
  var typeChooserModal = $modal({scope: $scope, title: 'Typ wählen', template: 'bootstrap/events/typechoosermodal', show: false});
  var editEventModal = $modal({scope: $scope, title: 'Ereignis bearbeiten', uploader: $scope.uploader, template: 'bootstrap/events/editeventmodal', show: false});
  var types = ['lecture', 'panel discussion', 'travel', 'info', 'food', 'other'];

  $scope.uploader.onCompleteItem = function(fileItem, response, status, headers) {
    fileItem.event.download = response.files[0].uploadedAs;
  };

  $scope.uploader.onProgressItem = function(fileItem, progress) {
    console.info('onProgressItem', fileItem, progress);
  };

  $scope.upload = function(fileItem, event) {
    fileItem.event = event;
    fileItem.upload();
  }

  var saveEvent = function (event) {
    if(angular.isUndefined(event.id)) {
      $sailsSocket.post('/timeline', event).success(function(data, status, headers, config) {
        console.log("event created");
        console.log(data);
      });
    } else {
      $sailsSocket.put('/timeline/'+event.id, event).success(function(data, status, headers, config) {
        console.log("event updated");
        console.log(data);
      });
    }
  }

  $scope.save = function(event) {
    if($rootScope.authenticated) {
      // save just this event if defined
      if(angular.isDefined(event)) {
        saveEvent(event);
      } else { // save all events
        angular.forEach(['after', 'before', 'unknown'], function(eventPart, index) {
          angular.forEach($scope.events[eventPart], function(event, index) {
            saveEvent(event);
          });
        });
      }
    }
  }

  $scope.add = function() {
    if($rootScope.authenticated) {
      if($scope.events.after.length > 0) {
        var newEvent = angular.copy($scope.events.after[0]);
        newEvent.from = moment();
        newEvent.from.add(1, 'hours');
        newEvent.from.minutes(0);
        delete newEvent.to;
        delete newEvent.id;
        $scope.events.after.push(newEvent);
        $scope.edit(newEvent);
      } else {
        console.log("Es gibt keine anstehenden Veranstaltungen zum duplizieren: ");
        console.log($scope.events.after);
      }
    }
  }

  var removeFromClient = function (event, eventName) {
    var index = $scope.events[eventName].indexOf(event);
    if (index > -1) {
      $scope.events[eventName].splice(index, 1);
    }
  }

  $scope.remove = function(event, eventName) {
    if($rootScope.authenticated) {
      if(eventName == "after" && $scope.events[eventName].length > 2) {
        if(event.id) {
          console.log(event);
          $sailsSocket.delete('/timeline/'+event.id).success(function(users, status, headers, config) {
            removeFromClient(event, eventName);
          });
        } else {
          removeFromClient(event, eventName);
        }
      } else {
        console.log("Das letzte noch anstehende Ereignis kann nicht gelöscht werden.");
      }
    }
  }

  $scope.refresh = function() {
    var allEvents = eventService.merge(events.unknown, events.before, events.after);
    $scope.events = eventService.split(allEvents);
    delete allEvents;
    console.log("refreshed");
  }

  $scope.edit = function(event) {
    if($rootScope.authenticated) {
      editEventModal.$scope.event = event;
      //- Show when some event occurs (use $promise property to ensure the template has been loaded)
      editEventModal.$promise.then(editEventModal.show);
    }
  }

  $scope.openTypeChooserModal = function(event) {
    if($rootScope.authenticated) {
      typeChooserModal.$scope.event = event;
      //- Show when some event occurs (use $promise property to ensure the template has been loaded)
      typeChooserModal.$promise.then(typeChooserModal.show);
    }
  }

  $scope.chooseType = function(event, type, hide) {
    event.type = type;
    hide();
  }


});

jumplink.cms.controller('MembersController', function($rootScope, $scope, members, $sailsSocket, $filter, $modal, FileUploader) {
  $scope.uploader = new FileUploader({url: 'member/upload', removeAfterUpload: true});
  var editMemberModal = $modal({scope: $scope, title: 'Person bearbeiten', uploader: $scope.uploader, template: 'bootstrap/members/editmembermodal', show: false});

  $scope.upload = function(fileItem, member) {
    fileItem.member = member;
    fileItem.upload();
  }

  $scope.uploader.onCompleteItem = function(fileItem, response, status, headers) {
    fileItem.member.image = response.files[0].uploadedAs;
  };


  var removeFromClient = function (member) {
    var index = $scope.members.indexOf(member);
    if (index > -1) {
      $scope.members.splice(index, 1);
    }
  }

  $scope.members = members;
  $scope.remove = function(member) {
    if($rootScope.authenticated) {
      if($scope.members.length > 2) {
        if(member.id) {
          console.log(member);
          $sailsSocket.delete('/member/'+member.id).success(function(users, status, headers, config) {
            removeFromClient(member);
          });
        } else {
          removeFromClient(member);
        }
      }
    }
  }

  $scope.add = function() {
    if($rootScope.authenticated) {
      if($scope.members.length > 0) {
        var newMember = angular.copy($scope.members[$scope.members.length - 1]);
        delete newMember.id;
        delete newMember.position++;
        $scope.members.push(newMember);
      } else {
        $scope.members.push({position: 1, name:"Hier Name eingeben", job: "Hier Beruf eingeben", image: 'photo.png'});
      }
      $scope.edit(newMember);
    }
  }

  var saveMember = function (member) {
    if(angular.isUndefined(member.id)) {
      // create member
      $sailsSocket.post('/member', member).success(function(data, status, headers, config) {
        // console.log(data);
      });
    } else {
      // update member
      $sailsSocket.put('/member/'+member.id, member).success(function(data, status, headers, config) {
        // console.log(data);
      });
    }
  }

  $scope.save = function(member) {
    if($rootScope.authenticated) {
      if(angular.isUndefined(member)) {  // save all members
        angular.forEach($scope.members, function(member, index) {
          saveMember(member);
        });
      } else { // save just this member
        saveMember(member);
      }
    }
  }

  $scope.edit = function(member) {
    if($rootScope.authenticated) {
      editMemberModal.$scope.member = member;
      //- Show when some event occurs (use $promise property to ensure the template has been loaded)
      editMemberModal.$promise.then(editMemberModal.show);
    }
  }

  $scope.moveForward = function(member) {
    if($rootScope.authenticated) {
      var index = $scope.members.indexOf(member);
      if(index < $scope.members.length && angular.isDefined($scope.members[index+1])) {
        var newPosition = $scope.members[index+1].position;
        var oldPosition = $scope.members[index].position;
        console.log(newPosition+" <-> "+oldPosition);
        $scope.members[index].position = newPosition;
        $scope.members[index+1].position = oldPosition;
        $scope.members = $filter('orderBy')($scope.members, 'position');
      } else {
        $rootScope.pop('error', member.name, "Kann nicht verschoben werden.");
      }
    }
  }
  $scope.moveBackward = function(member) {
    if($rootScope.authenticated) {
      var index = $scope.members.indexOf(member);
      if(index > 0 && angular.isDefined($scope.members[index-1])) {
        var newPosition = $scope.members[index-1].position;
        var oldPosition = $scope.members[index].position;
        console.log(newPosition+" <-> "+oldPosition);
        $scope.members[index].position = newPosition;
        $scope.members[index-1].position = oldPosition;
        $scope.members = $filter('orderBy')($scope.members, 'position');
      } else {
        $rootScope.pop('error', member.name, "Kann nicht verschoben werden.");
      }
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
jumplink.cms.controller('ApplicationController', function($rootScope, $scope, $sailsSocket, moment, $filter) {

  var date = moment(); // now

  $scope.member = {
    datum: $filter('amDateFormat')(date, 'dddd, Do MMMM YYYY')
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

  // $scope.$watch('invoice.date', function(newVal) {
  //   $scope.invoice.dateHuman = $filter('amDateFormat')(newVal, 'dddd, Do MMMM YYYY');
  // });

  // $scope.$watch('invoice.duedate', function(newVal) {
  //   $scope.invoice.duedateHuman = $filter('amDateFormat')(newVal, 'dddd, Do MMMM YYYY');
  // });


  $scope.upload = function() {
    $rootScope.pop('info', 'Aufnahmeantrag wird bearbeitet');
    $scope.webodf.refresh(function() {
      $scope.webodf.upload(function(error, response ) {
        if(error) console.log(error);
        console.log(response);
        var odtFilename = response.files[0].uploadedAs;
        var odtPath = response.files[0].fd;
        $sailsSocket.put("/document/convert/", {filename: odtFilename, extension: 'pdf'}).success(function(data, status, headers, config){
          console.log(data);
           var pdfPath = data.target;
          $sailsSocket.put("/document/convert/", {filename: odtFilename, extension: 'html'}).success(function(data, status, headers, config){
            // console.log(data);
            $rootScope.pop('success', 'Aufnahmeantrag erfolgreich erzeugt');
             var htmlPath = data.target;
            // callback(null, resInfo, data, status, headers, config);
            var attachmentFilename = 'aufnahmeantrag_'+$scope.member.vorname+'_'+$scope.member.name;
            attachmentFilename = attachmentFilename.toLowerCase();

            var to = $scope.member.email+',pascal@jumplink.eu';
            var subject = 'Aufnahmeantrag von '+$scope.member.vorname+' '+$scope.member.name;
            var from = $scope.member.email;

            var html = ''
            +'<dl>'
              +'<dt>Absender</dt>'
              +'<dd><a href="mailto:'+from+'">'+from+'</a></dd>'
              +'<dt>Betreff</dt>'
              +'<dd>'+subject+'</dd>'
            +'</dl>'
            +'<br>'
            +'Bitte drucken Sie den Aufnahmeantrag aus und schicken Sie ihn an den Nautischen Verein Cuxhaven e.V.';

            var text = String(html).replace(/<[^>]+>/gm, '');

            $sailsSocket.post('/email/send', {from: from, to: to, subject: subject, text: text, html: html, attachments: [{filename: attachmentFilename+".pdf", path:pdfPath}, {filename: attachmentFilename+".html", path:htmlPath}, {filename: attachmentFilename+".odt", path:odtPath}]}).success(function(data, status, headers, config){
              if(!$rootScope.authenticated) {
                $rootScope.pop('success', 'E-Mail wurde versendet.');
              }
            });
          });
        });
      });
    });
  }

  $scope.download = function() {
    $scope.webodf.refresh(function() {
      $scope.webodf.download("Aufnahmeantrag.odt");
    });
  }

  $scope.refresh = function() {
    $scope.webodf.refresh(function() {
      $rootScope.pop('success', 'Aufnahmeantrag wurde aktualisiert');
    });
  }

  var onWebODFReady = function() {
    console.log("ready");
  }

  $scope.webodf = {
    ready: onWebODFReady
  };

});

jumplink.cms.controller('LinksController', function($scope, $sailsSocket, links, $location, $anchorScroll) {
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

jumplink.cms.controller('ImprintController', function($rootScope, $scope, $sailsSocket, imprint, $location, $anchorScroll) {
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

    var html = ''
    +'<dl>'
      +'<dt>Absender</dt>'
      +'<dd><a href="mailto:'+$scope.email.from+'">'+$scope.email.from+'</a></dd>'
      +'<dt>Betreff</dt>'
      +'<dd>'+$scope.email.subject+'</dd>'
    +'</dl>'
    +'<br>'
    +$scope.email.content;

    var text = String(html).replace(/<[^>]+>/gm, '');

    $sailsSocket.post('/email/send', {from: $scope.email.from, to: $scope.email.from+',pascal@jumplink.eu', subject:'Kontaktanfrage von '+$scope.email.name+': '+$scope.email.subject, text: text, html: html}).success(function(data, status, headers, config){
      if(!$rootScope.authenticated) {
        $rootScope.pop('success', 'E-Mail wurde versendet.');
      }
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
          message: "<a target='_blank' title='Anfahrt' href='https://www.google.de/maps/dir//Kapit%C3%A4n-Alexander-Stra%C3%9Fe+40,+27472+Cuxhaven/@53.8668035,8.7066221,17z/data=!4m13!1m4!3m3!1s0x47b4040e075eaf1f:0xfaba82b12994a2e!2sKapit%C3%A4n-Alexander-Stra%C3%9Fe+40,+27472+Cuxhaven!3b1!4m7!1m0!1m5!1m1!1s0x47b4040e075eaf1f:0xfaba82b12994a2e!2m2!1d8.7066221!2d53.8668035?hl=de'>Nautischer Verein Cuxhaven e.V.<br>Kapitän­-Alexander­-Str. 40<br>27472 Cuxhaven</a>",
          options: {
            noHide: true
          }
        }
      }
    }
  });

});
