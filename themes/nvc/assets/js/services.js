jumplink.cms.service('historyService', function ($window) {
  var back = function () {
    $window.history.back();
  }

  return {
    back: back
  };
});

jumplink.cms.service('eventService', function (moment) {

  var split = function(events) {
    var unknown = [], before = [], after = [];
    for (var i = 0; i < events.length; i++) {

      if(angular.isDefined(events[i].to)) {
        events[i].to = moment(events[i].to);
      }

      if(angular.isDefined(events[i].from)) {
        events[i].from = moment(events[i].from);
        if(events[i].from.isAfter())
          after.push(events[i]);
        else
          before.push(events[i]);
      } else {
        unknown.push(events[i]);
      }
    };
    return {unknown:unknown, before:before, after:after};
  }

  var merge = function(unknown, before, after) {
    if(angular.isUndefined(unknown))
      unknown = [];
    if(angular.isUndefined(before))
      before = [];
    if(angular.isUndefined(after))
      after = [];
    return unknown.concat(before).concat(after);
  }

  return {
    split: split
    , merge: merge
  };
});

jumplink.cms.service('$async', function () {

  // https://github.com/caolan/async/issues/374#issuecomment-27498818
  async.objectMap = function ( obj, func, cb ) {
    var i, arr = [], keys = Object.keys( obj );
    for ( i = 0; i < keys.length; i += 1 ) {
      var wrapper = {};
      wrapper[keys[i]] = obj[keys[i]];
      arr[i] = wrapper;
    }
    this.map( arr, func, function( err, data ) {
      if ( err ) { return cb( err ); }
      var res = {};
      for ( i = 0; i < data.length; i += 1 ) {
          res[keys[i]] = data[i];
      }
      return cb( err, res );
    });
  }

  return async;
});

jumplink.cms.service('userService', function ($rootScope, $sailsSocket, $log) {
  var isSubscribed = false;

  var save = function(user, callback) {
    // update user
    if(angular.isDefined(user.id)) {
      $log.debug("update user: sailsSocket.put('/user/"+user.id+"..'");
      $sailsSocket.put('/user/'+user.id, user).success(function(data, status, headers, config) {
        $log.debug(data, status, headers, config);
        if(angular.isDefined(data.password))
          delete data.password;
        callback(data, status, headers, config)
      });
    } else {
      // create user
      $log.debug("create user: sailsSocket.post('/user..");
      $sailsSocket.post('/user', user).success(function(data, status, headers, config) {
        $log.debug(data, status, headers, config);
        if(angular.isDefined(data.password))
          delete data.password;
        callback(data, status, headers, config)
      });
    }
  }

  var subscribe = function () {
    if(!isSubscribed) {
      $sailsSocket.subscribe('user', function(msg){
        if($rootScope.authenticated)
          $log.debug(msg);
        switch(msg.verb) {
          case 'updated':
            if($rootScope.authenticated)
              $rootScope.pop('success', 'Ein Benutzer wurde aktualisiert', msg.data.name);
          break;
          case 'created':
            if($rootScope.authenticated)
              $rootScope.pop('success', 'Ein Benutzer wurde erstellt', msg.data.name);
          break;
          case 'removedFrom':
            if($rootScope.authenticated)
              $rootScope.pop('success', 'Ein Benutzer wurde entfernt', "");
          break;
          case 'destroyed':
            if($rootScope.authenticated)
              $rootScope.pop('success', 'Ein Benutzer wurde gelöscht', "");
          break;
          case 'addedTo':
            if($rootScope.authenticated)
              $rootScope.pop('success', 'Ein Benutzer wurde hinzugefügt', "");
          break;
        }
      });
      isSubscribed = true;
    }
  }

  var removeFromClient = function (users, user) {
    var index = users.indexOf(user);
    $log.debug("removeFromClient", user, index);
    if (index > -1) {
      users.splice(index, 1);
    }
  }

  var remove = function(users, user) {
    $log.debug("$scope.remove", user);

    if($rootScope.authenticated) {
      if(users.length <= 1) {
        $log.error('Der letzte Benutzer kann nicht gelöscht werden.')
      } else {
        removeFromClient(users, user);
        if(user.id) {
          $sailsSocket.delete('/user/'+user.id, {id:user.id}).success(function(data, status, headers, config) {
            $log.debug("user delete request", data, status, headers, config);
          });
        }
      }
    }
  }

  return {
    save: save
    , subscribe: subscribe
    , remove: remove
  };
});


jumplink.cms.service('themeService', function ($rootScope, $sailsSocket, $log, $async) {
  var isSubscribed = false;

  var save = function (themes, callback) {
    updateOrCreateEach(themes, function (err, result) {
      if(angular.isDefined(callback)) callback(err, result);
    });
  }
  
  var updateOrCreateEach = function(themes, callback) {
    $log.debug(themes);
    // $sailsSocket.put('/Theme/updateOrCreateEach', themes).success(function(data, status, headers, config) {
    //   $log.debug(data, status, headers, config);
    //   if(angular.isDefined(callback)) callback(data, status, headers, config)
    // });
    var iterator = function (theme, cb) {
      $sailsSocket.put('/Theme/updateOrCreate', theme).success(function(data, status, headers, config) {
        $log.debug(data, status, headers, config);
        // TODO set error
        
      });
    }
    $async.each(themes, iterator, callback)
    $sailsSocket.put('/Theme/updateOrCreateEach', themes).success(function(data, status, headers, config) {
      $log.debug(data, status, headers, config);
      callback(data, status, headers, config)
    });
  }

  // TODO
  var subscribe = function () {
    if(!isSubscribed) {
      $sailsSocket.subscribe('theme', function(msg){
        if($rootScope.authenticated)
          $log.debug(msg);
        switch(msg.verb) {
          case 'updated':
            if($rootScope.authenticated)
              $rootScope.pop('success', 'Themeeinstellungen wurdne aktualisiert', msg.data);
          break;
          case 'created':
            if($rootScope.authenticated)
              $rootScope.pop('success', 'Themeeinstellungen wurden erstellt', msg.data);
          break;
          case 'removedFrom':
            if($rootScope.authenticated)
              $rootScope.pop('success', 'Themeeinstellungen wurden entfernt', "");
          break;
          case 'destroyed':
            if($rootScope.authenticated)
              $rootScope.pop('success', 'Themeeinstellungen wurden gelöscht', "");
          break;
          case 'addedTo':
            if($rootScope.authenticated)
              $rootScope.pop('success', 'Themeeinstellungen wurden hinzugefügt', "");
          break;
        }
      });
      isSubscribed = true;
    }
  }

  return {
    save: save
    , updateOrCreateEach: updateOrCreateEach
   ,  subscribe: subscribe
  };
});
