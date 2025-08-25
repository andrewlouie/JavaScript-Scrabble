// create a new module called 'myAppModule' and save
// a reference to it in a variable called myAppModule
var myAppModule = angular.module('myAppModule', []);
// use the myAppModule variable to
// configure the module with a controller
/*
myAppModule.controller('MyFilterDemoCtrl', function ($scope) {
 var someData = {
 firstName: 'JENNA',
 surname: 'GRANT',
 dateJoined: new Date(2010, 2, 23),
 consumption: 123.659855,
 plan: 'super-basic-plan',
 // Last 12 months of data usage
 monthlyUsageHistory:
 [123.659855,
 89.645222,
 97.235644,
 129.555555,
 188.699855,
 65.652545,
 123.659855,
 89.645222,
 97.235644,
 129.555555,
 188.699855,
 65.652545]
 };
 $scope.data = someData.monthlyUsageHistory;
}
);*/
/*
angular.module('myAppModule').controller('myProductDetailCtrl', function ($scope) {

// Hide colors by default
$scope.isHidden = true;
  $scope.showHideColors = function () {
$scope.isHidden = !$scope.isHidden;
}

}
);*/
/*// use the myAppModule variable to
// configure the module with a filter
myAppModule.filter('stripDashes', function () {
// the function we are in returns
// the function below
return function(txt) {
return txt.split('-').join(' ');
};

});
myAppModule.filter("toTitleCase", function () {
return function (str) {
*/
//return str.replace(/\w\S*/g, function(txt){ return txt.charAt(0).toUpperCase() + txt.
/*substr(1).toLowerCase();});
};
});
*/
myAppModule.controller('myDemoCtrl', function ($scope) {
$scope.colorsArray = ['red', 'green', 'blue', 'purple', 'olive','skyblue']
}
);
myAppModule.directive('colorList', function () {

return {

restrict: 'AE',
template:
"<button ng-click='showHideColors()' type='button'>"
+ "{{isHidden ? 'Show Available Colors' : 'Hide Available Colors'}}"
+ "</button><div ng-hide='isHidden' id='colorContainer'>"
+ "</div>",
link: function ($scope, $element) {

// set default state of hide/show
$scope.isHidden = false;
// add function to manage hide/show state
$scope.showHideColors = function () {
$scope.isHidden = !$scope.isHidden;
}

// DOM manipulation
var colorContainer = $element.find('div');
angular.forEach($scope.colorsArray, function (color) {
var appendString = "<div style='background-color:" + color + "'>" + color + "</div>";
colorContainer.append(appendString);
});

}
}
});
