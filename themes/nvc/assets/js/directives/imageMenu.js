// jumplink.cms.directive('imageMenu', function($window, $dropdown) {
//   return {
//     restrict: 'A',
//     // replace: false,
//     // template: '<i ng-if="$root.authenticated" bs-dropdown="dropdown" data-template="bootstrap/dropdown" data-placement="bottom" data-html="true" class="fa fa-ellipsis-v img-dropdown"></i>',
//     link: function(scope, element, attributes) {
//       scope.dropdown = [
//         {
//           "text": "<i class=\"fa fa-download\"></i>&nbsp;Another action",
//           "href": "#anotherAction"
//         },
//         {
//           "text": "<i class=\"fa fa-globe\"></i>&nbsp;Display an alert",
//           "click": "$alert(\"Holy guacamole!\")"
//         },
//         {
//           "text": "<i class=\"fa fa-external-link\"></i>&nbsp;External link",
//           "href": "/auth/facebook",
//           "target": "_self"
//         },
//         {
//           "divider": true
//         },
//         {
//           "text": "Separated link",
//           "href": "#separatedLink"
//         }
//       ];
//       var elem_0 = angular.element(element[0]);
//       console.log(elem_0);
//       // var myDropdown = $dropdown(element, {template:"bootstrap/dropdown", dropdown:dropdown, placement:"bottom", html:true});
//       // console.log(myDropdown);
//       // elem_0.append(myDropdown);
//       // elem_0.append('<i ng-if="$root.authenticated" bs-dropdown="dropdown" data-template="bootstrap/dropdown" data-placement="bottom" data-html="true" class="fa fa-ellipsis-v img-dropdown"></i>');
//     }
//   };
// });
