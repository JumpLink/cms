// http://stackoverflow.com/questions/14703517/angular-js-set-element-height-on-page-load
jumplink.cms.directive('resize', function ($rootScope, $window, $timeout) {
  return function (scope, element) {

    var setStyle = function (newValue) {
      scope.style = function (style) {
        if(typeof style === 'undefined') {
          var style = {};
        }
        style.height = (newValue.h) + 'px';
        style.width = (newValue.w) + 'px';
        return style;
      };
    }

    // $rootScope.getWindowDimensions is defined in bootstrap/controllers.js !
    scope.$watch($rootScope.getWindowDimensions, function (newValue, oldValue) {
      setStyle(newValue);
      $timeout(function(){
        scope.$apply();
      });
    }, true);
  }
});
