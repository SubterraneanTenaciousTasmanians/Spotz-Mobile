angular.module('app.directives', [])

.directive('donateForm', function () {
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: 'templates/donation.html',
  };
});
