(function(){
  "use strict";

  angular.module("toolDir",[])
  .directive("toolDir", directive);

  function directive(){
    return {
      restrict : "A",
      replace : true,
      controller : "toolCtrl",
      templateUrl : "app/components/tool/tool.html"
    };
  }

})();
