var Game = {} ;

Game.numderOfQuestions = 5 ;
Game.numberOfParts = 8 ;
Game.$robot = null ;
Game.timeMultiplier = 1000 ;
Game.showPartsArray = [] ;
Game.score = 0 ;
Game.answersRecieved = 0;

Game.action = function (xml, handler) {
    var action = xml.getAttribute("action") ;
    console.log("Game.action", action) ;
    switch (action) {
        case "intro" : Game.intro(xml, handler) ; break ;
        case "studentAnswer" : Game.studentAnswer(xml, handler) ; break ;
        case "result" : Game.showResult(xml, handler) ; break ;
        default : handler() ;
    }

} ;

Game.intro = function (xml, handler) {
    //Effects.switchFxAnimation(false) ;
    Game.numderOfQuestions = parseInt(xml.getAttribute("questions")) ;
    Game.$robot = $("#robot") ;
    Game.timeMultiplier = parent.Main.timeMultiplier ;
    var $wheel = $("#wheel") ;
    Game.setZindex(1000) ;
    Game.$robot.append($wheel) ;

    $wheel.css("left", "-200px") ;
    $wheel.css("top", "-800px") ;

    var dt = 0.4 * Game.timeMultiplier ;
    setTimeout(Effects.cloud, 0.5 * Game.timeMultiplier, $wheel, {left:-40, top:0}) ;
    setTimeout(Effects.rotate, dt, $wheel, 720, {queue:false, duration:1500, easing:"easeOutCubic", complete:complete}) ;
    $wheel.show() ;
    $wheel.animate({left:-46}, {queue:false, duration:1500, easing:"easeOutCubic"}) ;
    $wheel.animate({top:-93}, {queue:false, duration:1500, easing:"easeOutBounce"}) ;

    function complete() {
        Game.setZindex(-1) ;
        handler() ;
    }
} ;

Game.studentAnswer = function (xml, handler) {
    var node = xml.cloneNode() ;
    node.setAttribute("if", xml.getAttribute("correct")) ;
    var correct = parent.StepManager.checkCondition(node) ;
    var answersLeft = Game.numderOfQuestions - Game.answersRecieved ;
    var actionsLeft = Game.showPartsArray.length ;
    Game.answersRecieved ++ ;

    var count = Math.ceil((Game.numberOfParts / Game.numderOfQuestions) * Game.answersRecieved)
                - Math.ceil((Game.numberOfParts / Game.numderOfQuestions) * (Game.answersRecieved - 1)) ;

    var actionsList = [] ;


    if (correct) {
        Game.score ++ ;
    }

    if (correct) {
        Game.setZindex(1000) ;
        for (var i=0; i<count; i++) {
            actionsList.push(Game.showPartsArray.shift()) ;
        }
        executeNextAction() ;
    } else {
        handler() ;
    }

    function executeNextAction() {
        var f = actionsList.shift() ;
        if (f) {
            setTimeout(f, Game.timeMultiplier*0.3,correct, executeNextAction) ;
        } else {
            Game.setZindex(-1) ;
            handler() ;
        }
    }
} ;

Game.showPart01 = function (correct, handler) {
    var $obj = $("#part01") ;
    Game.$robot.append($obj) ;
    $obj.css("left", "-13px") ;
    $obj.css("top", "-400px") ;

    setTimeout(Effects.cloud, 0.9 * Game.timeMultiplier, $obj) ;
    $obj.show( "clip", {}, 500 ).animate({top:-140},{duration:500, easing:"easeInOutBack", complete:handler});
} ;

Game.showPartsArray.push(Game.showPart01) ;

Game.showPart02 = function (correct, handler) {
    var $obj = $("#part02") ;
    var $par = $("#part01") ;
    $par.append($obj) ;
    $obj.css("left", "350px") ;
    $obj.css("top", "-300px") ;
    $obj.show() ;
    setTimeout(Effects.rotate, 0.5*Game.timeMultiplier, $obj, -720, {queue:false, duration:1.9*Game.timeMultiplier, easing:"easeOutCubic"}) ;
    $obj.animate({left:100}, {queue:false, duration:1500, easing:"easeOutCubic"}) ;
    $obj.animate({top:60}, {queue:false, duration:1500, easing:"easeOutBounce", complete:step2}) ;

    function step2() {
        $obj.animate({left:-28}, {queue:false, duration:500, easing:"easeOutCubic"}) ;
        $obj.animate({top:-30}, {queue:false, duration:500, easing:"easeOutBack", complete:handler}) ;
    }
} ;

Game.showPartsArray.push(Game.showPart02) ;

Game.showPart03 = function (correct, handler) {
    var $obj = $("#part03") ;
    var $par = $("#part02") ;
    var $part01 = $("#part01") ;
    $par.append($obj) ;
    $obj.css("left", "-22px") ;
    $obj.css("top", "-500px") ;
    setTimeout(Effects.cloud, 0.9 * Game.timeMultiplier, $obj) ;
    $obj.show( "clip", {}, 500 ).animate({top:-10},{duration:500, easing:"easeInOutBack", complete:step2});

    function step2() {
        $part01.css("transform-origin", "50% 88%") ;
        Effects.rotate($part01, -80, {queue:false, duration:1000, easing:"easeOutBounce", complete:handler}) ;
    }
} ;

Game.showPartsArray.push(Game.showPart03) ;

Game.showPart04 = function (correct, handler) {
    var $obj = $("#part04") ;
    var $par = $("#part03") ;
    var $part01 = $("#part01") ;

    //$part01.css('transform', 'rotate(0deg)') ;
    var $wheel = $("#wheel") ;
    Effects.rotate($wheel, 720, {queue:false, duration:0.5*Game.timeMultiplier, easing:"easeInQuad"}) ;
    Game.$robot.animate({left:"+=100"}, {duration:0.5*Game.timeMultiplier}) ;
    setTimeout(Effects.rotate, 0.3*Game.timeMultiplier, $part01, 80, {queue:false, duration:1*Game.timeMultiplier, easing:"easeOutBack", complete:step2}) ;

    function step2() {
        $par.append($obj) ;
        $obj.css("left", "-40px") ;
        $obj.css("top", "-500px") ;
        $obj.show( "clip", {}, 500 ).animate({top:-80},{duration:500, easing:"easeInOutBack", complete:step3});
    }
    
    function step3() {
        Effects.rotate($wheel, -720, {queue:false, duration:0.5*Game.timeMultiplier, easing:"easeInQuad"}) ;
        Game.$robot.animate({left:"-=100"}, {duration:0.5*Game.timeMultiplier}) ;
        setTimeout(Effects.rotate, 0.1*Game.timeMultiplier, $part01, 63, {queue:false, duration:1*Game.timeMultiplier, easing:"easeOutBounce", complete:handler}) ;
    }

} ;

Game.showPartsArray.push(Game.showPart04) ;


Game.showPart05 = function (correct, handler) {
    var $part01 = $("#part01") ;
    var $part03 = $("#part03") ;
    var $part04 = $("#part04") ;
    var $part05 = $("#part05") ;

//    $part01.css('transform', 'rotate(0deg)') ;

    $part04.before($part05) ;
    $part05.css("left", "500px") ;
    $part05.css("top", "-60px") ;
    $part05.show( ).animate({left:-75},{duration:500, easing:"easeOutBack"});
    setTimeout(Effects.rotate, 0.2*Game.timeMultiplier, $part01, -63, {queue:false, duration:1*Game.timeMultiplier, easing:"easeOutBack", complete:handler}) ;
} ;

Game.showPartsArray.push(Game.showPart05) ;


Game.showRightHand = function (correct, handler) {
    var $rightHand01 = $("#righthand01") ;
    var $rightHand02 = $("#righthand02") ;
    var $rightHand03 = $("#righthand03") ;
    var $part05 = $("#part05") ;
    var $wheel = $("#wheel") ;
    $part05.append($rightHand01) ;

    $rightHand01.css("left", "-300px") ;
    $rightHand01.css("top", "-600px") ;
    $rightHand01.show().animate({left:260, top:-10}, {queue:false, duration:500, easing:"easeInQuad", complete:step2}) ;
    Effects.rotate($rightHand01, -360, {queue:false, duration:500}) ;

    function step2() {
        $rightHand01.css("transform-origin", "35% 15%") ;
        Effects.rotate($rightHand01, -60, {queue:false, duration:300, easing:"easeOutSine", complete:step3}) ;
        Game.$robot.animate({left:"+=25"}, {queue:false, duration:300, easing:"easeOutSine"}) ;
        Effects.rotate2($wheel, 60, 0, {queue:false, duration:300, easing:"easeOutSine"}) ;
    }

    function step3() {
        Effects.rotate($rightHand01, 60, {queue:false, duration:500, easing:"easeOutBack", complete:step4}) ;
    }

    function step4() {
        $rightHand01.append($rightHand02) ;
        $rightHand02.css("left", "-300px") ;
        $rightHand02.css("top", "-500px") ;
        Effects.rotate($rightHand02, -360, {queue:false, duration:500}) ;
        $rightHand02.show().animate({left:-22, top:73}, {queue:false, duration:500, easing:"easeInQuad", complete:step5}) ;
    }

    function step5() {
        Effects.rotate($rightHand01, -60, {queue:false, duration:300, easing:"easeOutSine", complete:step6}) ;
        Game.$robot.animate({left:"+=25"}, {queue:false, duration:300, easing:"easeOutSine"}) ;
        Effects.rotate2($wheel, 120, 60, {queue:false, duration:300, easing:"easeOutSine"}) ;
    }

    function step6() {
        Effects.rotate($rightHand01, 60, {queue:false, duration:500, easing:"easeOutBack", complete:step7}) ;
        Effects.rotate2($wheel, 0, 120, {queue:false, duration:300, easing:"easeInOutSine"}) ;
        Game.$robot.animate({left:"-=50"}, {queue:false, duration:300, easing:"easeInOutSine"}) ;
    }

    function step7() {
        $rightHand01.append($rightHand03) ;
        $rightHand03.css("left", "-5px") ;
        $rightHand03.css("top", "60px") ;
        $rightHand03.show( "clip", {complete:handler}, 500 ) ;
    }

} ;

Game.showPartsArray.push(Game.showRightHand) ;

Game.showLeftHand = function (correct, handler) {
    var $part01 = $("#part01") ;
    var $leftHand01 = $("#lefthand01") ;
    var $leftHand02 = $("#lefthand02") ;
    var $leftHand03 = $("#lefthand03") ;
    var $part05 = $("#part05") ;
    $part05.append($leftHand01) ;
    $leftHand01.css("left", "-22px") ;
    $leftHand01.css("top", "-10px") ;
    $leftHand01.show() ;

    $leftHand01.append($leftHand02) ;
    $leftHand02.css("left", "-1px") ;
    $leftHand02.css("top", "72px") ;
    $leftHand02.show() ;

    $leftHand01.append($leftHand03) ;
    $leftHand03.css("left", "-5px") ;
    $leftHand03.css("top", "60px") ;
    $leftHand03.show() ;

    $leftHand01.css("left", "500px") ;
    $leftHand01.css("top", "-600px") ;
    $leftHand01.show().animate({left:-22, top:-10}, {queue:false, duration:500, easing:"easeInQuad", complete:step2}) ;
    Effects.rotate($leftHand01, 360, {queue:false, duration:500}) ;
    
    function step2() {
        $leftHand01.css("transform-origin", "65% 15%") ;
        Effects.rotate($leftHand01, 360, {queue:false, duration:1000, easing:"easeOutSine"}) ;
        Effects.rotate($part01, -50, {queue:false, duration:1000, easing:"easeOutSine", complete:step3}) ;
    }
    
    function step3() {
        //Effects.rotate($leftHand01, 360, {queue:false, duration:1000, easing:"easeOutBack"}) ;
        Effects.rotate($part01, 50, {queue:false, duration:1000, easing:"easeOutBack", complete:handler}) ;
    }

} ;

Game.showPartsArray.push(Game.showLeftHand) ;

Game.showHead = function (correct, handler) {
    //Effects.switchFxAnimation(true);
    var $part02 = $("#part02") ;
    var $part04 = $("#part04") ;
    var $head = $("#head") ;
    var $eyebrow= $("#eyebrow") ;
    var $mouth= $("#mouth") ;

    $part04.append($head) ;
    $head.css("left", "400px") ;
    $head.css("top", "-500px") ;

    $head.show().animate({left:0}, {queue:false, easing:"easeOutCubic", duration:1000}) ;
    Effects.rotate2($head, -420, 0, {queue:false, duration:1000, easing:"easeOutSine"}) ;
    $head.animate({top:-75}, {queue:false, easing:"easeOutBounce", duration:1000}) ;
    $part02.delay(Game.timeMultiplier * 0.4).animate({top:"+=50"},{easing:"easeOutSine", duration:500}).animate({top:"-=50"},{easing:"easeOutBack", duration:300, complete:step2}) ;

    function step2() {
        Effects.rotate2($part02, 15, 0, {queue:false, duration:1000, easing:"easeOutSine"}) ;
        $head.animate({left:70}, {queue:false, easing:"easeInOutCubic", duration:1000}) ;
        Effects.rotate2($head, 0, -60, {queue:false, duration:1000, easing:"easeInOutCubic", complete:step3}) ;
    }

    function step3() {
        Effects.rotate2($part02, 0, 15, {queue:false, duration:1000, easing:"easeOutSine", complete:step4}) ;
    }

    function step4() {
        $eyebrow.show( "clip", {}, 500 );
        $mouth.delay(500).show( "explode", {}, 500, handler );
    }
} ;

Game.showPartsArray.push(Game.showHead) ;

Game.showResult = function(xml, handler) {
    //Effects.switchFxAnimation(true);
    var $incorrectScore = $("#incorrectscore")  ;
    $incorrectScore.html(String(Game.answersRecieved - Game.score)) ;
    var $correctScore = $("#correctscore")  ;
    $correctScore.html(String(Game.score)) ;
    $correctScore.show('drop', {direction:"left"}, 500) ;
    $incorrectScore.show('drop', {direction:"right"}, 500) ;
    Game.setZindex(1000) ;

    if (Game.score != Game.answersRecieved) {
        Game.looserAnimation(complete) ;
    } else {
        Game.rewardAnimation(complete) ;
    }

    function complete() {
        Game.setZindex(-1) ;
        handler() ;
    }
} ;

Game.looserAnimation = function (handler) {
    var $wheel = $("#wheel") ;
    Effects.rotate2($wheel, 720, 0, {duration:2000, easing:"easeInOutCubic"}) ;
    Game.$robot.animate({left:"+=200"}, {duration:2000, easing:"easeInOutCubic", complete:step2}) ;

    function step2() {
        Effects.rotate2($wheel, -720, 0, {duration:2000, easing:"easeInOutCubic"}) ;
        Game.$robot.animate({left:"-=200"}, {duration:2000, easing:"easeInOutCubic", complete:complete}) ;
    }

    function complete() {
        showReplayButton() ;
        handler();
    }

    function showReplayButton() {
        var $replay = $("#replay") ;
        $replay.show("scale", 500, rotateArrow) ;

        function rotateArrow() {
            var $arrow = $("#replayarrow") ;
            $arrow.show("fade");
            Effects.rotate2($arrow, 0, 360, {queue:false, duration:1000, easing:"easeOutSine"}) ;
        }

        $replay.click(function () {
            parent.parent.location.reload() ;
        }) ;

    }
} ;

Game.rewardAnimation = function (handler) {
    var $wheel = $("#wheel") ;
    var $part01 = $("#part01") ;
    var $part02 = $("#part02") ;
    var $part04 = $("#part04") ;
    var $head = $("#head") ;
    var $leftHand = $("#lefthand01") ;
    var $rightHand = $("#righthand01") ;
    var $hooray = $("#hooray") ;


    $part02.animate({top:"+=20"}, {easing:"easeInOutSine", duration:150}).animate({top:"-=20"}, {easing:"easeOutSine", duration:150}) ;
    setTimeout(jumpRight, 150) ;

    function jumpRight() {
        Effects.rotate2($leftHand, 150, 0, {duration:300}) ;
        Effects.rotate2($rightHand, -150, 0, {duration:300}) ;
        Game.$robot.animate({left:"+=200"}, {duration:800, easing:"easeOutSine", queue:false}) ;
        Game.$robot.animate({top:"-=400"}, {duration:400, easing:"easeOutSine"}).animate({top:"+=400"}, {duration:400, easing:"easeInSine", complete:squat}) ;
    }
    
    function squat() {
        $part02.animate({top:"+=20"}, {easing:"easeOutSine", duration:150}).animate({top:"-=20"}, {easing:"easeInOutSine", duration:150, complete:moveRight}) ;
        Effects.rotate2($leftHand, 0, 150, {duration:150}) ;
        Effects.rotate2($rightHand, 0, -150, {duration:150}) ;
    }

    function moveRight() {
        Effects.rotate2($wheel, 720, 0, {duration:500, easing:"easeInOutSine"}) ;
        Game.$robot.animate({left:"+=100"}, {duration:500, easing:"easeInOutSine", queue:false}) ;
        Effects.rotate2($part01, 30, 0, {duration:500, easing:"easeInOutSine", complete:moveLeft}) ;
    }

    function moveLeft() {
        Effects.rotate2($wheel, -720, 0, {duration:500, easing:"easeInOutSine"}) ;
        Game.$robot.animate({left:"-=200"}, {duration:500, easing:"easeInOutSine", queue:false}) ;
        Effects.rotate2($part01, -30, 30, {duration:500, easing:"easeInOutSine", complete:hurray}) ;
    }

    function hurray() {
        Effects.rotate2($part01, 0, -30, {duration:500, easing:"easeInOutSine"}) ;
        Effects.rotate2($rightHand, -180, 0, {duration:150}) ;
        setTimeout(Effects.rotate2, 250, $rightHand, -150, -180, {duration:150}) ;
        setTimeout(Effects.rotate2, 500, $rightHand, -180, -150, {duration:150}) ;
        setTimeout(Effects.rotate2, 750, $rightHand, 0, -180, {duration:150}) ;
        $hooray.delay(750).toggle({ effect: "scale", easing:"easeOutBack", complete:handler, origin:[ "bottom", "left" ] }) ;
    }
} ;

Game.setZindex = function (i) {
   parent.$("#speedgame").css("z-index", i) ;
} ;

var Effects = {} ;

Effects.rotate = function ($obj, angle, tween) {
    curAngle = getRotationFromMatrix() ;
    var $div = $('<div/>') ;
    $div.css("opacity", 0) ;
    tween.step = step ;
    var handler = tween.complete ;
    tween.complete = complete ;
    $div.animate({opacity:1}, tween) ;

    function step() {
        $obj.css('transform', 'rotate('+ String(curAngle + angle * Number($div.css("opacity"))) +'deg)') ;
    }

    function complete() {
        $obj.css('transform', 'rotate('+ String(curAngle + angle) +'deg)') ;
        if (handler) handler() ;
    }

    // See https://css-tricks.com/get-value-of-css-rotation-through-javascript/
    function getRotationFromMatrix() {
        var tr = $obj.css("transform") ;
        if (tr === "none")
            return 0 ;
        var values = tr.split('(')[1];
        values = values.split(')')[0];
        values = values.split(',');
        var a = values[0];
        var b = values[1];
        //var c = values[2];
        //var d = values[3];
        var scale = Math.sqrt(a*a + b*b);

        //var sin = b/scale;
        return Math.round(Math.atan2(b, a) * (180/Math.PI));
    }
} ;

Effects.rotate2 = function($obj, angle, start,tween) {
    // caching the object for performance reasons
    tween.step = function(now) {
        $obj.css({
            transform: 'rotate(' + now + 'deg)'
        });
    } ;
    var handler = tween.complete ;
    tween.complete = complete ;


    $({deg: start}).animate({deg: angle}, tween);

    function complete() {
        $obj.css('transform', 'rotate('+ String(angle) +'deg)') ;
        if (handler) handler() ;
    }
} ;

Effects.cloud = function ($obj, point) {
    var size = Math.max($obj.width(),$obj.height()) ;
    var $img = $('<div class="cloud"/>') ;
    $obj.before($img) ;
    $img.width(size) ;
    $img.height(size) ;
    if (point) {
        $img.css("left", point.left + "px") ;
        $img.css("top", point.top + "px") ;
    } else {
        $img.position({my:"center", at:"center", of:$obj}) ;
    }


    $img.effect({effect:"scale", duration:300, percent:250, queue:false}) ;
    $img.animate({opacity:0}, {duration:300, complete:complete}) ;

    function complete() {
        $img.remove() ;
    }
} ;

Effects.switchFxAnimation = function(enabled) {
    $.fx.off = !enabled ;
    Game.timeMultiplier = enabled ? 1000 : 0 ;
} ;
