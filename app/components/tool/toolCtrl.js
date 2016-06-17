(function(){
  "use strict";

  angular
  .module("toolCtrl",["dndLists"])
  .controller("toolCtrl", controller);

  controller.$inject = ["$scope"];

  $(".canvas-group").css('width', "20%");

  function controller($scope){

    var widthCanvas = $(".canvas-group").width(),
        heightCanvas =$(".canvas-group").height(),
        c = document.getElementById("colorSpectre");

        c.width = widthCanvas;
        c.height = heightCanvas;

    var cw = c.width,
        ch = c.height,
        ctx = c.getContext("2d");

    var cP = document.getElementById("colorPins");
    cP.width = widthCanvas;
    cP.height = heightCanvas;
    var ctxPins = cP.getContext("2d");

    var cC        = document.getElementById("colorCourbe");
    cC.width      = widthCanvas;
    cC.height     = heightCanvas;
    var ctxCourbe = cC.getContext("2d");

    $scope.pin               = [];
    $scope.amplitude         = 90;
    $scope.etendu            = 0.018;
    // function
    $scope.initCanvas        = initCanvas;
    $scope.addAnotherPin     = addAnotherPin;
    $scope.modifySin         = modifySin;
    $scope.changePinPosition = changePinPosition;
    $scope.removePin         = removePin;


    $scope.$watch("amplitude", function(data, old){
      if(typeof data != undefined){
        $scope.amplitude = Number(data);
      }
    });

    $scope.$watch("etendu", function(data, old){
      if(typeof data != undefined){
        $scope.etendu = Number(data);
      }
    });


    function getMousePos(canvas, evt) {
       var rect = cP.getBoundingClientRect();
       return {
         x: evt.clientX - rect.left,
         y: evt.clientY - rect.top
       };
     }



     var itemSelected = undefined;
     var itemIsSelected = false;

    cP.addEventListener('mousedown', cpEventTri,false);
    cP.addEventListener('mousemove',cPEventBis,false);
    cP.addEventListener('mouseup', cpEvent,false);
    cP.addEventListener('dblclick', eventQuad,false);
    cP.addEventListener('touchstart', cpEventTri,false);
    cP.addEventListener('touchmove',cPEventBis,false);
    cP.addEventListener('touchend', cpEvent,false);


    function cPEventBis(evt) {
      if(itemIsSelected){
        var mousePos = getMousePos(cP, evt);
        var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;

        var target = $scope.pin[itemSelected];
        // check difference la poisition sourie et la courbe
        var y = target.y,
            x = target.x,
            mX = mousePos.x,
            mY = f(mX),
            ym = y-10,
            yM = y+10,
            xm = x-10,
            xM = x+10;

        var yCheck = mY <= yM && mY >= ym ? true : false;
        var xCheck = mX <= xM && mX >= xm ? true : false;

        if(yCheck){
            target.stuck = true;
        }else{
            $scope.pin[itemSelected].stuck = false;
            $scope.pin[itemSelected].y = mousePos.y;
        }

        target.pourcent = mousePos.x / cw * 100;
        changePinPosition(target);
      }
    };


    function cpEvent(evt) {
      if(itemIsSelected){
        itemSelected = undefined;
        itemIsSelected = false;
      }
    };


    function eventQuad(evt) {
      var mousePos = getMousePos(cP, evt);
      var x = mousePos.x,
          y = mousePos.y,
          pourcent = x / cw * 100;
          addFreePin(x,y,pourcent);
    }


    function cpEventTri(evt) {
      var mousePos = getMousePos(cP, evt);
      var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;

      var mY = mousePos.y,
          mX = mousePos.x;

      $scope.pin.forEach(function(el,index){
        var y = el.y,
            x = el.x,
            ym = y-10,
            yM = y+10,
            xm = x-10,
            xM = x+10;

        var yCheck = mY <= yM && mY >= ym ? true : false;
        var xCheck = mX <= xM && mX >= xm ? true : false;

        if(yCheck && xCheck){
            itemIsSelected = true;
            itemSelected = index;
        }
      });

    }

    //

    function initCanvas(){
      var base_image = document.getElementById("spectre");
      base_image.onload = function(){
        ctx.drawImage(base_image, 0, 0,cw,ch);
        setTimeout(function(){
          $("#spectre").hide();
            var tt = [10.022181042228212,21.073393980233604,22.87033917340521,35.089566486972146,54.49657457322552];
            tt.forEach(function(el){
              var x = el / 100 * cw;
              var pin = {
                x : x,
                y : f(x),
                stuck : true,
                pourcent : el,
              };
              $scope.pin.push(pin);
            });
            drawPins();
        },7)
      }
    }



    function f(x) {
        var amp = $scope.amplitude || 100,
            etd = $scope.etendu || 0.01;

        return amp * Math.cos(etd * x) + 100;
    }


    function modifySin(){
      ctxCourbe.clearRect(0, 0, cw, ch);
      ctxCourbe.globalAlpha = .3;
      ctxCourbe.lineWidth = 4;
      var points  = {},
          counter = 0,
          x       = 0,
          y       = f(0);

      for (var i =0; i < cw; i++){
          ctxCourbe.beginPath();
          ctxCourbe.moveTo(x, y);
          x += 1;
          y = f(x);
          points[x] = y;
          ctxCourbe.lineTo(x, y);
          ctxCourbe.stroke();
      }


      $scope.pin.forEach(function(pin, index) {
        var x = pin.pourcent * cw / 100;
        pin.x = x;
        pin.y = pin.stuck ? f(pin.x) : pin.y;
      });

      drawPins();
    }



    function addFreePin(x,y,pourcent){
      var pin = {
        x : x,
        y : y,
        stuck : false,
        pourcent : pourcent,

      };
      $scope.pin.push(pin);
      drawPins();
    }


    function addAnotherPin(x){
      var tt = x == undefined ? cw/2 : x;
      var pin = {
        x : cw/2,
        y : f(cw/2),
        stuck : true,
        pourcent : 50,

      };
      $scope.pin.push(pin);
      drawPins();
    }



    function changePinPosition(pin) {
      var x = pin.pourcent * cw / 100;
      pin.x = x;
      pin.y = pin.stuck ? f(pin.x) : pin.y;
      drawPins();
    }



    function drawPins(){
      var pins = $scope.pin;

      ctxPins.clearRect(0, 0, cw, ch);

      pins.forEach(function(el,index) {

        var rgb = findColor(el,index);
        var pinX = el.x,
            pinY = el.y;

        setTimeout(function(){
          $scope.pin[index].rgb = rgb;
          $scope.$apply();
        },0)

        // create
        ctxPins.beginPath();
        ctxPins.arc(pinX,pinY, 8, 0, 2 * Math.PI, false);
        ctxPins.fillStyle = "rgb("+rgb.r+","+rgb.g+","+rgb.b+")";
        ctxPins.fill();
        ctxPins.lineWidth = 1;
        ctxPins.strokeStyle = '#666';
        ctxPins.stroke();
      });
    }






    function findColor(pin, index){
      var newCanvas = document.createElement("canvas");
      var context = newCanvas.getContext('2d');

      var tt = document.getElementById("colorSpectre");
      newCanvas.width = 4;
      newCanvas.height = 4;
      var y = pin.stuck ? f(pin.x-2) : pin.y;
      context.drawImage(tt,pin.x-4,y,4,4, 0,0,4,4);

    var blockSize = 1, // only visit every 5 pixels
        defaultRGB = {r:0,g:0,b:0}, // for non-supporting envs
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = {r:0,g:0,b:0},
        count = 0;

    if (!context) {
        return defaultRGB;
    }
    height = canvas.height = newCanvas.naturalHeight || newCanvas.offsetHeight || newCanvas.height;
    width = canvas.width = newCanvas.naturalWidth || newCanvas.offsetWidth || newCanvas.width;
    context.drawImage(newCanvas, 0, 0);
    try {
        data = context.getImageData(0, 0, width, height);
    } catch(e) {
        /* security error, img on diff domain */alert('x');
        return defaultRGB;
    }

    length = data.data.length;

    while ( (i += blockSize * 4) < length ) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i+1];
        rgb.b += data.data[i+2];
    }
    // ~~ used to floor values
    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);

    return rgb;
}


  function removePin($index){
    $scope.pin.splice($index,1);
    drawPins();
  }


  $(window).on("resize", function(){

    var widthCanvas = $(".canvas-group").width(),
        heightCanvas =$(".canvas-group").height();


        c.width = widthCanvas;
        c.height = heightCanvas;

        cw = c.width;
        ch = c.height;

        cP.width = widthCanvas;
        cP.height = heightCanvas;

        cC.width      = widthCanvas;
        cC.height     = heightCanvas;

        var base_image = document.getElementById("spectre");
        ctx.drawImage(base_image, 0, 0,cw,ch);
        modifySin();
  });

  }// end controller

})();
