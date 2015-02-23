jumplink.cms.controller('AppController', function($rootScope, $scope, $state, $window, $timeout, Fullscreen, toaster, $sailsSocket, $location, $anchorScroll, $log) {

  // fix scroll to top on route change
  $scope.$on("$stateChangeSuccess", function () {
    $anchorScroll();
  });

  //AngularJS Toaster - AngularJS Toaster is a customized version of "toastr" non-blocking notification javascript library: https://github.com/jirikavi/AngularJS-Toaster
  $rootScope.pop = function(type, title, body, timeout, bodyOutputType, clickHandler) {
    toaster.pop(type, title, body, timeout, bodyOutputType, clickHandler);
  };

  var generalSubscribes = function () {

    $sailsSocket.post('/session/subscribe', {}).success(function(data, status, headers, config){

      // react to subscripe from server: http://sailsjs.org/#/documentation/reference/websockets/sails.io.js/io.socket.on.html
      $sailsSocket.subscribe('connect', function(msg){
        $log.debug('socket.io is connected');
      });

      $sailsSocket.subscribe('disconnect', function(msg){
        $rootScope.pop('error', 'Verbindung zum Server verloren', "");
        $rootScope.authenticated = false;
      });

      $sailsSocket.subscribe('reconnect', function(msg){
        $rootScope.pop('info', 'Sie sind wieder mit dem Server verbunden', "");
      });

    });

  }

  var adminSubscribes = function() {
    // subscripe on server
    $sailsSocket.post('/session/subscribe', {}).success(function(data, status, headers, config){

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

      // admin room
      $sailsSocket.subscribe('admins', function(msg){
        $log.debug(msg);
      });

    });
  }

  // http://stackoverflow.com/questions/18608161/angularjs-variable-set-in-ng-init-undefined-in-scope
  $rootScope.$watch('authenticated', function () {
    $log.debug("authenticated: "+$rootScope.authenticated);
    if($rootScope.authenticated) {
      $rootScope.mainStyle = {'padding-bottom':'50px'};
      $rootScope.toasterPositionClass = 'toast-bottom-right-with-toolbar';
      adminSubscribes();
    } else {
      $rootScope.mainStyle = {'padding-bottom':'0px'};
      $rootScope.toasterPositionClass = 'toast-bottom-right';
    }
  });
  generalSubscribes();

  $rootScope.fullscreenIsSupported = Fullscreen.isSupported();
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
    return { 'height': angular.element($window).height(), 'width': angular.element($window).width() };
  };

  angular.element($window).bind('resize', function () {
    // $timeout(function(){
    //   $rootScope.$apply();
    // });
    // $rootScope.$apply();
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
    $rootScope.windowHeight = newValue.height;
    $rootScope.windowWidth = newValue.width;
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

  $scope.adminSettingDropdown = [
    {
      "text": "<i class=\"fa fa-list\"></i>&nbsp;Übersicht",
      "click": "goToState('bootstrap-layout.administration')"
    },
    {
      "text": "<i class=\"fa fa-users\"></i>&nbsp;Benutzer",
      "click": "goToState('bootstrap-layout.users')"
    },
    {
      "text": "<i class=\"fa fa-sign-out\"></i>&nbsp;Abmelden",
      "click": "$root.logout()"
    }
  ];

  $scope.goToState = function (to, params, options) {
    $state.go(to, params, options)
  }

});

jumplink.cms.controller('LayoutController', function($scope) {


});

jumplink.cms.controller('ToolbarController', function($scope) {


});

jumplink.cms.controller('FooterController', function($scope) {

});

jumplink.cms.controller('HomeContentController', function($scope, $sailsSocket, $location, $anchorScroll, $timeout, $window, about, goals, $log) {

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
        $log.debug (data);
      } else {
        $log.debug ("Can't save site");
      }
    });

    $sailsSocket.put('/content/replace', {name: 'goals', content: $scope.goals}).success(function(data, status, headers, config) {
      if(data != null && typeof(data) !== "undefined") {
        $log.debug (data);
      } else {
        $log.debug ("Can't save site");
      }
    });
  }

  // called on content changes
  $sailsSocket.subscribe('content', function(msg){
    $log.debug(msg);
    switch(msg.verb) {
      case 'updated':
        switch(msg.id) {
          case 'about':
            $scope.about = msg.data.content;;
            if($rootScope.authenticated) {
              $rootScope.pop('success', '"Wir über uns" wurde aktualisiert', "");
            }
          break;
          case 'goals':
            $scope.goals = msg.data.content;;
            if($rootScope.authenticated) {
              $rootScope.pop('success', '"Ziele" wurde aktualisiert', "");
            }
          break;
        }
      break;
    }
  });

});


jumplink.cms.controller('GalleryContentController', function($rootScope, $scope, Fullscreen, $sailsSocket, $stateParams, images, FileUploader, $modal, $log, $location) {
  $scope.images = images;
  // $log.debug(images[0]);
  $scope.uploader = new FileUploader({url: 'gallery/upload', removeAfterUpload: true});
  $scope.uploader.filters.push({
    name: 'imageFilter',
    fn: function(item /*{File|FileLikeObject}*/, options) {
      var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
      return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
    }
  });
  var uploadImagesModal = $modal({scope: $scope, title: 'Bilder hinzufügen', uploader: $scope.uploader, template: 'bootstrap/gallery/uploadimagesmodal', show: false});
  var editImageModal = $modal({scope: $scope, title: 'Bild bearbeiten', template: 'bootstrap/gallery/editimagemodal', show: false});

  $scope.aspect = function (image, width)  {
    var height, scale, aspectRatio, win, paddingTopBottom = 0, paddingLeftRight = 0;
    if($scope.isFullScreen(image)) {
      // customised jQuery Method of http://css-tricks.com/perfect-full-page-background-image/
      aspectRatio = image.original.width / image.original.height;
      win = $rootScope.getWindowDimensions();
      if(win.width / win.height < aspectRatio) {
        width = win.width; // width 100%
        scale = image.original.width / width;
        height = image.original.height / scale;
        paddingTopBottom = (win.height - height) / 2;
        height = win.height;
      } else {
        height = win.height;  // height 100%
        scale = image.original.height / height;
        width = image.original.width / scale;
        paddingLeftRight = (win.width - width) / 2;
        width = win.width;
      }
      return {width: width+'px', height: height+'px', 'padding-right': paddingLeftRight+"px", 'padding-left': paddingLeftRight+"px", 'padding-top': paddingTopBottom+"px", 'padding-bottom': paddingTopBottom+"px" };
    } else {
      scale = image.original.width / width;
      height =  image.original.height / scale;
      return {width: width+'px', height: height+'px'};
    }
  }

  $scope.setFullScreen = function(image) {
    // http://stackoverflow.com/questions/21702375/angularjs-ng-click-over-ng-click
    $scope.fullscreenImage = image;
  }

  $scope.closeFullScreen = function(image) {
    Fullscreen.cancel();
  }

  Fullscreen.$on('FBFullscreen.change', function(evt, isFullscreenEnabled){
    if(!isFullscreenEnabled) {
      delete $scope.fullscreenImage;
    }
    $scope.$apply();
  });

  $scope.isFullScreen = function(image) {
    if(angular.isDefined($scope.fullscreenImage) && angular.isDefined($scope.fullscreenImage.original) && angular.isDefined($scope.fullscreenImage.original.name) && $scope.fullscreenImage.original.name == image.original.name) {
      return true;
    } else {
      return false;
    }
  }

  $scope.edit = function(image) {
    $log.debug("edit", image);
    if($rootScope.authenticated) {
      editImageModal.$scope.image = image;
      //- Show when some event occurs (use $promise property to ensure the template has been loaded)
      editImageModal.$promise.then(editImageModal.show);
    }
  }

  $sailsSocket.subscribe('gallery', function(msg){
    $log.debug(msg);

    switch(msg.verb) {
      case 'updated':
        if($rootScope.authenticated)
          $rootScope.pop('success', 'Ein Bild wurde aktualisiert', msg.data.original.name);
      break;
      case 'created':
        if($rootScope.authenticated)
          $rootScope.pop('success', 'Ein Bild wurde hochgeladen', msg.data.original.name);
        $scope.images.push(msg.data);
      break;
      case 'removedFrom':
        if($rootScope.authenticated)
          $rootScope.pop('success', 'Ein Bild wurde entfernt', "");
        $log.debug(msg.data);
      break;
      case 'destroyed':
        if($rootScope.authenticated)
          $rootScope.pop('success', 'Ein Bild wurde gelöscht', "");
        $log.debug(msg.data);
      break;
      case 'addedTo':
        if($rootScope.authenticated)
          $rootScope.pop('success', 'Ein Bild wurde hinzugefügt', "");
        $log.debug(msg.data);
      break;
    }
  });

  var removeFromClient = function (image) {
    var index = $scope.images.indexOf(image);
    $log.debug("removeFromClient", image, index);
    if (index > -1) {
      $scope.images.splice(index, 1);
    }
  }

  $scope.remove = function(image) {
    if($rootScope.authenticated) {
      removeFromClient(image);
      if(image.id) {
        $log.debug(image);
        // WORKAROUND
        image.original.name = image.original.name.replace("Undefined ", "");
        $sailsSocket.delete('/gallery/'+image.id+"?filename="+image.original.name, {id:image.id, filename:image.original.name}).success(function(data, status, headers, config) {
          $log.debug(data);
        });
      }
    }
  }

  $scope.add = function() {
    $log.debug("add");
    uploadImagesModal.$promise.then(uploadImagesModal.show);
  }

  var saveImage = function(image) {
    $sailsSocket.put('/gallery/'+image.id, image).success(function(data, status, headers, config) {
      if(data != null && typeof(data) !== "undefined") {
        $log.debug (data);
      } else {
        $log.debug ("Can't save image");
      }
    });
  }

  $scope.save = function(image) {
    if($rootScope.authenticated) {
      if(angular.isUndefined(image)) {  // save all image
        angular.forEach($scope.images, function(image, index) {
          saveImage(image);
        });
      } else { // save just this member
        saveImage(image);
      }
    }
  }

  $scope.upload = function(fileItem, image) {
    fileItem.image = image;
    fileItem.upload();
  }

  // http://stackoverflow.com/questions/21702375/angularjs-ng-click-over-ng-click
  $scope.stopPropagation = function (event) {
     event.stopPropagation();
  }


  $scope.uploader.onCompleteItem = function(fileItem, response, status, headers) {
    // fileItem.member.image = response.files[0].uploadedAs;
  };

  // image is set in ng-repeat, this is working :)
  $scope.dropdown = [
    {
      "text": "<i class=\"fa fa-edit\"></i>&nbsp;Bearbeiten",
      "click": "edit(image)"
    },
    {
      "text": "<i class=\"fa fa-trash\"></i>&nbsp;Löschen",
      "click": "remove(image)"
    },
    {
      "text": "<i class=\"fa fa-floppy-o\"></i>&nbsp;Speichern",
      "click": "save(image)"
    }
  ];

});

jumplink.cms.controller('GalleryFullscreenController', function($scope, $rootScope, $sailsSocket, $stateParams, image, $log) {
  $scope.image = image;
});
jumplink.cms.controller('GallerySlideController', function($scope, $sailsSocket, $stateParams, $timeout, images, $log) {
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

jumplink.cms.controller('TimelineController', function($rootScope, $scope, events, moment, $sailsSocket, $modal, $datepicker, eventService, FileUploader, $log) {
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
  };

  var saveEvent = function (event, eventName) {
    if(angular.isUndefined(event.id)) {
      $sailsSocket.post('/timeline', event).success(function(data, status, headers, config) {
        $log.debug("event created", event, data);
        var index = $scope.events[eventName].indexOf(event);
        if (index > -1) {
          $scope.events[eventName][index] = data;
          $log.debug($scope.events[eventName][index]);
        }
      });
    } else {
      $sailsSocket.put('/timeline/'+event.id, event).success(function(data, status, headers, config) {
        $log.debug("event updated", event, data);
        event = data;
      });
    }
  };

  $scope.save = function(event, eventName) {
    if($rootScope.authenticated) {
      // save just this event if defined
      if(angular.isDefined(event)) {
        saveEvent(event, eventName);
      } else { // save all events
        angular.forEach(['after', 'before', 'unknown'], function(eventPart, index) {
          angular.forEach($scope.events[eventPart], function(event, index) {
            saveEvent(event, eventName);
          });
        });
      }
    }
  };

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
        $log.debug("Es gibt keine anstehenden Veranstaltungen zum duplizieren: ");
        $log.debug($scope.events.after);
      }
    }
  };

  var removeFromClient = function (event, eventName) {
    $log.debug("removeFromClient", event, eventName);
    var index = $scope.events[eventName].indexOf(event);
    if (index > -1) {
      $scope.events[eventName].splice(index, 1);
    } else {
      $log.debug("not found");
    }
  };

  // TODO use async "not found"-callback is fired after value was found
  var findEvent = function(id, callback) {
    $log.debug("findEvent", id);
    angular.forEach(['after', 'before', 'unknown'], function(eventPart, index) {
      if(eventPart === 'unknown' && $scope.events[eventPart].length <= 0) {
        return callback("not found");
      }
      angular.forEach($scope.events[eventPart], function(event, index) {
        $log.debug("event.id", event.id);
        if(event.id == id) {
          return callback(null, event, eventPart, index);
        }
        if(eventPart === 'unknown' && index === $scope.events[eventPart].length - 1 &&  event.id != id) {
          return callback("not found");
        }
      });
    });
  };

  $scope.remove = function(event, eventName) {
    $log.debug("$scope.remove", event, eventName);
    if($rootScope.authenticated) {
      if(eventName == "after" && $scope.events["after"].length <= 1) {
        $log.debug("Das letzte noch anstehende Ereignis kann nicht gelöscht werden.");
      } else {
        if(event.id) {
          $log.debug(event);
          $sailsSocket.delete('/timeline/'+event.id).success(function(users, status, headers, config) {
            removeFromClient(event, eventName);
          });
        } else {
          removeFromClient(event, eventName);
        }
      }
    }
  };

  $scope.refresh = function() {
    var allEvents = eventService.merge(events.unknown, events.before, events.after);

    $log.debug("allEvents.length", allEvents.length);
    $scope.events = eventService.split(allEvents);
    $log.debug("refreshed");
  };

  $scope.edit = function(event, eventName) {
    if($rootScope.authenticated) {
      editEventModal.$scope.event = event;
      editEventModal.$scope.eventName = eventName;
      //- Show when some event occurs (use $promise property to ensure the template has been loaded)
      editEventModal.$promise.then(editEventModal.show);
    }
  };

  $scope.openTypeChooserModal = function(event) {
    if($rootScope.authenticated) {
      typeChooserModal.$scope.event = event;
      //- Show when some event occurs (use $promise property to ensure the template has been loaded)
      typeChooserModal.$promise.then(typeChooserModal.show);
    }
  };

  $scope.chooseType = function(event, type, hide) {
    event.type = type;
    hide();
  };

  $sailsSocket.subscribe('timeline', function(msg){
    $log.debug(msg);

    switch(msg.verb) {
      case 'updated':
        if($rootScope.authenticated) {
          $rootScope.pop('success', 'Ein Ereignis wurde aktualisiert', msg.data.title);
        }
        findEvent(msg.id, function(error, event, eventPart, index) {
          if(error) $log.debug(error);
          else event = msg.data;
          $scope.refresh();
        });
      break;
      case 'created':
        if($rootScope.authenticated) {
          $rootScope.pop('success', 'Ein Ereignis wurde erstellt', msg.data.title);
        }
        $scope.events['before'].push(msg.data);
        $scope.refresh();
      break;
      case 'removedFrom':
        if($rootScope.authenticated) {
          $rootScope.pop('success', 'Ein Ereignis wurde entfernt', msg.data.title);
        }
        findEvent(msg.id, function(error, event, eventPart, index) {
          if(error) $log.debug(error);
          else removeFromClient(event, eventPart);
        });
      break;
      case 'destroyed':
        if($rootScope.authenticated) {
          $rootScope.pop('success', 'Ein Ereignis wurde gelöscht', msg.data.title);
        }
        findEvent(msg.id, function(error, event, eventPart, index) {
          if(error) $log.debug(error);
          else removeFromClient(event, eventPart);
        });
      break;
      case 'addedTo':
        if($rootScope.authenticated) {
          $rootScope.pop('success', 'Ein Ereignis wurde hinzugefügt', msg.data.title);
        }
      break;
    }
  });

});

jumplink.cms.controller('MembersController', function($rootScope, $scope, members, $sailsSocket, $filter, $modal, FileUploader, $log) {
  $scope.uploader = new FileUploader({url: 'member/upload', removeAfterUpload: true});
  $scope.uploader.filters.push({
    name: 'imageFilter',
    fn: function(item /*{File|FileLikeObject}*/, options) {
      var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
      return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
    }
  });
  var editMemberModal = $modal({scope: $scope, title: 'Person bearbeiten', uploader: $scope.uploader, template: 'bootstrap/members/editmembermodal', show: false});

  $scope.upload = function(fileItem, member) {
    fileItem.member = member;
    fileItem.upload();
  }

  $scope.uploader.onCompleteItem = function(fileItem, response, status, headers) {
    fileItem.member.image = response.files[0].thumb;
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
          $log.debug(member);
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
        // $log.debug(data);
      });
    } else {
      // update member
      $sailsSocket.put('/member/'+member.id, member).success(function(data, status, headers, config) {
        // $log.debug(data);
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
        $log.debug(newPosition+" <-> "+oldPosition);
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
        $log.debug(newPosition+" <-> "+oldPosition);
        $scope.members[index].position = newPosition;
        $scope.members[index-1].position = oldPosition;
        $scope.members = $filter('orderBy')($scope.members, 'position');
      } else {
        $rootScope.pop('error', member.name, "Kann nicht verschoben werden.");
      }
    }
  }

  $sailsSocket.subscribe('member', function(msg){
    $log.debug(msg);

    switch(msg.verb) {
      case 'updated':
        if($rootScope.authenticated)
          $rootScope.pop('success', 'Eine Person wurde aktualisiert', msg.data.name);
      break;
      case 'created':
        if($rootScope.authenticated)
          $rootScope.pop('success', 'Eine Person wurde erstellt', msg.data.name);
      break;
      case 'removedFrom':
        if($rootScope.authenticated)
          $rootScope.pop('success', 'Eine Person wurde entfernt', msg.id);
      break;
      case 'destroyed':
        if($rootScope.authenticated)
          $rootScope.pop('success', 'Eine Person wurde gelöscht', msg.id);
      break;
      case 'addedTo':
        if($rootScope.authenticated)
          $rootScope.pop('success', 'Eine Person wurde hinzugefügt', msg.data.name);
      break;
    }
  });

});

jumplink.cms.controller('AdminController', function($scope, themeSettings, $log, themeService) {
  $scope.themeSettings = themeSettings;
  
  $scope.save = function() {
    themeService.save($scope.themeSettings.available, function(data) {
      // $scope.themeSettings = data;
      $log.debug(data);
    });
  }
  
});

jumplink.cms.controller('UsersController', function($scope, $rootScope, $sailsSocket, users, $log, userService) {
  $scope.users = users;

  $scope.remove = function(user) {
    userService.remove($scope.users, user);
  }

  userService.subscribe();

});

jumplink.cms.controller('UserController', function($scope, userService, user, $state, $log) {
  $scope.user = user;
  $scope.save = function(user) {
    if(angular.isUndefined(user))
      user = $scope.user;
    userService.save(user, function(data) {
      // $scope.user = data;
      $state.go('bootstrap-layout.users');
    });
  }

  userService.subscribe();
});

jumplink.cms.controller('UserNewController', function($scope, userService, $state, $log) {
  $scope.user = {};
  $scope.save = function(user) {
    if(angular.isUndefined(user))
      user = $scope.user;
    userService.save(user, function(data) {
      // $scope.user = data;
      $state.go('bootstrap-layout.users');
    });
  }

  userService.subscribe();
});

// Aufnahmeantrag
jumplink.cms.controller('ApplicationController', function($rootScope, $scope, $sailsSocket, moment, $filter, application, $log) {

  var date = moment(); // now
  $scope.html = false;
  $scope.application = application;

  $scope.member = {
    datum: $filter('amDateFormat')(date, 'dddd, Do MMMM YYYY')
    , name: null
    , vorname: null
    , geburtstag: null
    , geburtsort: null
    , email: null
    , telefon: null
    , beruf: null
    , strasse: null
    , plz: null
    , ort: null
    , bank: {
      name: null
      , iban: null
      , bic: null
    }
  }
  $scope.minYearsOld = 10;
  $scope.minBirthdayDate = moment().subtract($scope.minYearsOld, 'years');
  // $log.debug("$scope.minBirthdayDate", $scope.minBirthdayDate);
  $scope.maxYearsOld = 100;
  $scope.maxBirthdayDate = moment().subtract($scope.maxYearsOld, 'years');
  // $log.debug("$scope.maxBirthdayDate)", $scope.maxBirthdayDate);

  $scope.upload = function() {
    $rootScope.pop('info', 'Aufnahmeantrag wird bearbeitet');
    $scope.webodf.refresh(function() {
      $scope.webodf.upload(function(error, response ) {
        if(error) $log.debug(error);
        $log.debug(response);
        var odtFilename = response.files[0].uploadedAs;
        var odtPath = response.files[0].fd;
        $sailsSocket.put("/document/convert/", {filename: odtFilename, extension: 'pdf'}).success(function(data, status, headers, config){
          $log.debug(data);
           var pdfPath = data.target;
          $sailsSocket.put("/document/convert/", {filename: odtFilename, extension: 'html'}).success(function(data, status, headers, config){
            // $log.debug(data);
            $rootScope.pop('success', 'Aufnahmeantrag erfolgreich erzeugt');
             var htmlPath = data.target;
            // callback(null, resInfo, data, status, headers, config);
            var attachmentFilename = 'aufnahmeantrag_'+$scope.member.vorname+'_'+$scope.member.name;
            attachmentFilename = attachmentFilename.toLowerCase();

            var to = $scope.member.email+',nvcux@t-online.de';
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
    // $log.debug("ready");
  }

  $scope.webodf = {
    ready: onWebODFReady
  };

  // called on content changes
  $sailsSocket.subscribe('content', function(msg){
    $log.debug(msg);
    switch(msg.verb) {
      case 'updated':
        switch(msg.id) {
          case 'application':
            $scope.application = msg.data.content;
            if($rootScope.authenticated) {
              $rootScope.pop('success', 'Aufnahmeantrags-Text wurde aktualisiert', "");
            }
          break;
        }
      break;
    }
  });

  $scope.toogleHtml = function() {
    $scope.html = !$scope.html;
  }

  $scope.save = function() {
    $sailsSocket.put("/content/replace", {name: 'application', content: $scope.application}, function (response) {
      if(response != null && typeof(response) !== "undefined") {
        $log.debug (response);
      } else {
        $log.debug ("Can't save site");
      }
    });
  }

});

jumplink.cms.controller('LinksController', function($rootScope, $scope, $sailsSocket, links, $location, $anchorScroll, $log) {
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
        $log.debug (response);
      } else {
        $log.debug ("Can't save site");
      }
    });
  }

  // called on content changes
  $sailsSocket.subscribe('content', function(msg){
    $log.debug(msg);
    switch(msg.verb) {
      case 'updated':
        switch(msg.id) {
          case 'links':
            $scope.links = msg.data.content;;
            if($rootScope.authenticated) {
              $rootScope.pop('success', 'Links-Text wurde aktualisiert', "");
            }
          break;
        }
      break;
    }
  });

});

jumplink.cms.controller('ImprintController', function($rootScope, $scope, $sailsSocket, imprint, $location, $anchorScroll, $log) {
  $scope.imprint = imprint;

  $scope.email = {
    from: null
    , name: null
    , subject: null
    , content: null
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
        $log.debug (response);
      } else {
        $log.debug ("Can't save site");
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

    $sailsSocket.post('/email/send', {from: $scope.email.from, to: $scope.email.from+',nvcux@t-online.de', subject:'Kontaktanfrage von '+$scope.email.name+': '+$scope.email.subject, text: text, html: html}).success(function(data, status, headers, config){
      if(!$rootScope.authenticated) {
        $rootScope.pop('success', 'E-Mail wurde versendet.');
      }
      $log.debug(data);
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

  // called on content changes
  $sailsSocket.subscribe('content', function(msg){
    $log.debug(msg);
    switch(msg.verb) {
      case 'updated':
        switch(msg.id) {
          case 'imprint':
            $scope.imprint = msg.data.content;;
            if($rootScope.authenticated) {
              $rootScope.pop('success', 'Impressums-Text wurde aktualisiert', "");
            }
          break;
        }
      break;
    }
  });

});
