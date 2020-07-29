var currentTopicNumber = 0 ;
var totalBBsCount = 1 ;
var aspectRatio = 768/954 ;
var currentBB = null ;
var nextBB = null ;
var finalBB = null ;
var bbZIndex = 100 ;
var progressBar ;

var $loadingIcon ;

var topicColors = [
    "#737BFB",
    "#00DFDA",
    "#FFBC00",
    "#FF7733",
    "#9557FF"
] ;

var progressBarColors = [
    "#00DFDA",
    "#FFBC00",
    "#9657FF",
    "#737BFB",
    "#FF7733"
] ;



$(function () {
    $('body').on("animationCompleted", onAnimationCompleted) ;
    createLoadingIcon() ;
    progressBar = new ProgressBar() ;

    totalBBsCount = bbs.length ;

    if (location.hash) {
        var curUrl = location.hash.split("#")[1] ;
        currentTopicNumber = bbs.indexOf(curUrl) ;
        bbs = bbs.slice(currentTopicNumber) ;
    }
    appendBBOnStage(new BB(bbs.shift())) ;
}) ;

function appendBBOnStage(bb) {
    currentBB = bb ;
    currentBB.$wrap.css("display", "block") ;
    location.hash = currentBB.url ;

    currentBB.start(preloadNextBB);

    if (currentTopicNumber > 0) {
        progressBar.updateProgress(currentTopicNumber, totalBBsCount) ;
    }
    currentTopicNumber ++ ;
}

function preloadNextBB() {
    var nextUrl = bbs.shift() ;
    nextBB = nextUrl ? new BB(nextUrl) : null ;
    if (!nextBB && typeof window.finalScreen !== "undefined") {
        finalBB = new BB(window.finalScreen) ;
    }
}


function onAnimationCompleted(showFinal) {
    if (nextBB) {
        if (!window.disableTransitionAnimation) {
            currentBB.$wrap.hide( "drop", { direction: "left" }, "slow", hideComplete );
        } else {
            currentBB.$wrap.hide( 300 , hideComplete );
        }

        appendBBOnStage(nextBB);
    } else if (finalBB) {
        showFinalScreen() ;
    } else {
        progressBar.updateProgress(totalBBsCount, totalBBsCount) ;
        API.sendEndOfAnimationMessage() ;
    }

    function hideComplete() {
        $(this).remove() ;
    }
}

function createLoadingIcon() {
    $loadingIcon = $('<div id="loadingIcon"/>') ;
    $('body').append($loadingIcon) ;
    $loadingIcon.css("top", $(window).height()/2-75 + "px") ;
}

function setTopicColors(main) {
    if (typeof window.topicColor === "undefined") {
        window.topicColor = topicColors[0] ;
        console.warn("topicColor is not set!") ;
    }

    main.setTopicFooterColor(window.topicColor);
    var i = topicColors.indexOf(window.topicColor.toUpperCase()) ;
    if (i < 0) {
        i = 0 ;
        console.warn("Progress bar color not found!") ;
    }

    progressBar.setColor(progressBarColors[i]);
}

function BB(url) {
    this.$frame = null ;
    this.$wrap = null ;
    this.main = null ;
    this.url = url ;

    var bb = this ;
    var autoStart = false ;
    var onStartHandler = null;


    function createFrame(url) {
        var arr = url.split("/") ;
        var folder = arr[0] + "/" ;
        var path = arr[1] ;
        bb.$frame = $('<iframe src="../../../../player/player/bb-ar.html" name="iframe" class="frame" id="' + arr.join("#") + '"></iframe>') ;
        bb.$wrap = $('<div class="wrap" id="wrap_' + arr.join("#") + '"></div>') ;
        $("body").append(bb.$wrap) ;
        bb.$wrap.append(bb.$frame) ;
        //bb.$wrap.css("display", "none") ;
        bb.$wrap.css("z-index", bbZIndex) ;
        bbZIndex-- ;
        $("body").one("frameInitialised", onFrameInitialised) ;
        setSize() ;
        //location.hash = url ;

        function onFrameInitialised() {
            var main = bb.main = bb.$frame[0].contentWindow.Main ;
            setTopicColors(main) ;
            main.setBaseUrl(location.pathname.replace("index.html","") + folder) ;
            main.$viewer.one("contentready", onContentReady) ;
            main.$viewer.on("answerAccepted", API.sendAnswerToApp) ;
            main.loadXML(path) ;
            main.setAspectRatio(aspectRatio) ;
        }
    }

    function onContentReady() {
        $loadingIcon.stop() ;
        $loadingIcon.hide() ;
        bb.$frame.css("opacity", "1") ;
        bb.$wrap.css("background-color", bb.main.getBackgroundColor()) ;

        if (autoStart) {
            bb.main.startAnimation() ;
        }

        if (onStartHandler) {
            onStartHandler();
            onStartHandler = null ;
        }
    }

    function setSize() {
        var h = $(window).height() ;
        var w = $(window).width() ;
        var w0 = 768 ;
        var h0 = 954 ;
        var scale = Math.min(h/h0,w/w0) ;
        aspectRatio = w/h ;

        if (aspectRatio > 768/954) {
            bb.$frame.css("width", aspectRatio * 954) ;
        } else {
            var dh = (h - h0*scale) / 2 ;
            bb.$wrap.css("padding-top", dh + 'px') ;
            bb.$frame.css("height", String(954 + 2*dh) + 'px') ;
            //progressBar.$bar.css('top', -dh + 'px');
        }
        bb.$frame.css({
            '-webkit-transform' : 'scale(' + scale + ')',
            '-moz-transform'    : 'scale(' + scale + ')',
            '-ms-transform'     : 'scale(' + scale + ')',
            '-o-transform'      : 'scale(' + scale + ')',
            'transform'         : 'scale(' + scale + ')'
        });

    }

    this.start = function (handler) {
        if (this.main && this.main.status === "contentready") {
            this.main.startAnimation() ;
            if (handler)
                handler() ;
        }
        else {
            autoStart = true ;
            onStartHandler = handler ;
            $loadingIcon.show("fade") ;
            bb.$frame.css("opacity", "0.2") ;
        }
    } ;

    createFrame(url) ;
}

var API = {
    sendAnswerToApp : function(e) {
        var answer = {} ;
        answer.question_id = e.mainID + "-" + e.ID ;
        answer.correct = e.correct ;
        answer.answer = {} ;
        answer.time = e.time ;

        for (var s in e.answer) {
            answer.answer[s] = e.answer[s].studentAnswer ;
        }
        answer = JSON.stringify(answer);

        console.log("send answer to App", answer) ;
        try {
            JSInterface.sendScoreForMath(answer) ;
        } catch (err) {console.log("No JSInterface found.") ;}

        try {
            webkit.messageHandlers.callback.postMessage(answer);
        } catch (err) {console.log('Can not reach native code');}
    },

    sendEndOfAnimationMessage : function() {
        console.log("send the end to App") ;
        try {
            JSInterface.mathLearnEnd() ;
        } catch (err) {console.log("No JSInterface.mathLearnEnd found.") ;}
    }
} ;

function showFinalScreen() {
    $('body').off("animationCompleted") ;
    $('body').one("animationCompleted", fsComplete) ;
    progressBar.updateProgress(totalBBsCount, totalBBsCount) ;
    progressBar.fillScreen(barComplete) ;


    function barComplete() {
        $('body').css('background', progressBar.color) ;
        //finalBB.$wrap.css("display", "block") ;
        currentBB.$wrap.remove() ;
        //window.topicColor = progressBar.color ;
        finalBB.main.setTopicFooterColor(progressBar.color);
        progressBar.$bar.remove();
        finalBB.start() ;
        //onAnimationCompleted(true) ;
    }

    function fsComplete() {
        API.sendEndOfAnimationMessage() ;
    }

}

function ProgressBar() {
    this.$bar = $('<div id="progressbar"> </div>') ;
    this.color = "#00DFDA" ;
    $('body').append(this.$bar) ;
    var $bar = this.$bar ;
    var me = this ;

    this.setColor = function (color) {
        this.color = color ;
        this.$bar.css('background', color) ;
        this.$bar.show();
    } ;

    this.updateProgress = function (value, total) {
        var ww = $(window).width() ;
        var dx = ww / total ;
        this.$bar.animate({width: value*dx}, {duration:500}) ;
    } ;

    this.fillScreen = function (handler) {
        var hh = $(window).height() ;
        this.$bar.animate({height: hh}, {duration:500, easing:"easeInOutSine", complete:handler}) ;
    }
}