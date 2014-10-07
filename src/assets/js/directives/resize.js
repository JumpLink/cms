//nhttp://stackoverflow.com/questions/14703517/angular-js-set-element-height-on-page-load
jumplink.cms.directive('resize', function ($window) {
  return function (scope, element) {
    var w = angular.element($window);
    scope.getWindowDimensions = function () {
      return { 'h': w.height(), 'w': w.width() };
    };
    scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
      scope.windowHeight = newValue.h;
      scope.windowWidth = newValue.w;

      scope.style = function (style) {
        if(typeof style === 'undefined') {
          var style = {};
        }
        style.height = (newValue.h) + 'px';
        style.width = (newValue.w) + 'px';
        // style['background-size'] = (newValue.h) + 'px' + (newValue.w) + 'px';
        return style;
      };

    }, true);

    w.bind('resize', function () {
      scope.$apply();
    });
  }
})
