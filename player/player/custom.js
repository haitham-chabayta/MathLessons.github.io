var Main = {
        xml: void 0,
        status: "none",
        autoStart: !1,
        $viewer: void 0,
        $systemContainer: void 0,
        $nextButton: void 0,
        $subtitlesPopup: void 0,
        $customNextButton: void 0,
        $submitButton: void 0,
        globalDictionary: {},
        isMobile: !1,
        baseUrl: "",
        timeMultiplier: 1e3,
        UID: "",
        init: function() {
            Main.createSystemElements(), Main.$viewer.on(PlayerEvents.CONTENT_READY, Main.onContentReady), Main.$viewer.on(PlayerEvents.SHOW_NEXT_BUTTON, Main.showNextButton), Main.$viewer.on(PlayerEvents.SHOW_SUBMIT_BUTTON, Main.showSubmitButton), Main.$viewer.on(PlayerEvents.ANIMATION_COMPLETED, Main.onAnimationCompleted), $("body").keydown(Main.onKeyDown), Main.controls = {}, Main.soundManager = new SoundManager, Main.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent), Main.isTouchDevice = function() {
                var t = " -webkit- -moz- -o- -ms- ".split(" ");
                if ("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch) return !0;
                var e = ["(", t.join("touch-enabled),("), "heartz", ")"].join("");
                return n = e, window.matchMedia(n).matches;
                var n
            }()
        },
        switchFxAnimation: function(t) {
            $.fx.off = !t, Main.timeMultiplier = t ? 1e3 : 1
        },
        switchSound: function(t) {
            Main.soundManager.enabled = t
        },
        updateProgressBar: function(t, e) {},
        createSystemElements: function() {
            var t = $("body");
            t.append('<div id="content"></div>'), t.append('<div id="topicfooter"/>');
            var e = $('<div id="system-container"/>');
            t.append(e), Main.$systemContainer = $('<div id="relative-system-container"/>'), e.append(Main.$systemContainer), Main.$systemContainer.append('<div id="next-button" />'), Main.$systemContainer.append('<div id="submit-button" />'), Main.$systemContainer.append('<div id="correct-bubble" />'), Main.$systemContainer.append('<div id="incorrect-bubble" />'), Main.$systemContainer.append('<div id="noresponse-bubble">Please&nbsp;complete&nbsp;your&nbsp;answer.</div>'), Main.$viewer = $("#content"), Main.$nextButton = $("#next-button"), Main.$submitButton = $("#submit-button"), Main.$subtitlesPopup = $('<div id="subtitlesPopup"/>'), Main.$subtitlesPopup.append("<div/>"), t.append(Main.$subtitlesPopup), Main.$subtitlesPopup.click(Main.hideSubtitles)
        },
        setBaseUrl: function(t) {
            Main.baseUrl = t, "" !== Main.baseUrl && $("base").attr("href", Main.baseUrl)
        },
        setAspectRatio: function(t) {
            if (768 / 954 < t) {
                var e = 954 * t,
                    n = (e - 768) / 2;
                $("#topicfooter").css("width", e + "px"), Main.$viewer.css("left", n + "px"), Main.$systemContainer.css("left", n + "px")
            } else {
                var i = (768 / t - 954) / 2;
                $("#topicfooter").css("top", String(945 + i) + "px"), Main.$systemContainer.css("top", i + "px")
            }
        },
        setTopicHeader: function(t, e) {},
        setTopicFooter: function(t) {},
        setTopicFooterColor: function(t) {
            $("#topicfooter").css("background", t)
        },
        watchInputs: function() {
            function n(t) {
                var e = $(this);
                $hiddenSpan.html("");
                var n, i, a = e.css("font-size"),
                    r = e.prop("maxlength"),
                    o = e.prop("lastvalue");
                if (e.val().length > r) return e.val(o), !1;
                i = (i = (n = e).val()).replace("-", "−"), n.val(i), e.prop("lastvalue", e.val()), $hiddenSpan.css("font-size", a), $hiddenSpan.append("<p>" + e.val() + "</p>");
                var s = Math.max($hiddenSpan.width(), parseInt(a)) + 6;
                $(this).css("width", s)
            }
            Main.$viewer.append('<span id="hidden_span"></span>'), $hiddenSpan = $("#hidden_span"), Main.$viewer.find("input[type=number]").each(function() {
                var t = $(this);
                t.wrap('<span class="inputWrapper"/>'), t.on("input", n), t.prop("autocomplete", "off");
                t.prop("maxlength");
                t.prop("maxlength") < 0 && t.prop("maxlength", "5");
                var e = t.css("font-size");
                t.css("width", parseInt(e) + 6), t.prop("lastvalue", ""), Main.isMobile || t.prop("type", "text")
            })
        },
        prepareFractions: function() {
            $("span.frac").each(function() {
                var t = new CommonFraction($(this));
                "" !== t.id && (Main.controls[t.id] = t)
            })
        },
        prepareRadioButtons: function() {
            $("input[type=radio]").wrap('<div class="radioContainer"></div>'), $("input[type=radio]").before('<div class="radioSkinUpDisabled"/>'), $("input[type=checkbox]").wrap('<div class="radioContainer"></div>'), $("input[type=checkbox]").before('<div class="checkboxSkinUpDisabled"/>')
        },
        prepareListboxes: function() {
            $("select").wrap('<div class="listboxContainer"/>')
        },
        prepareWTD: function() {
            $("div.wtdPopup").each(function() {
                var t = $('<div class="wtdPencil"/>'),
                    e = $(this);
                e.append(t), t.position({
                    my: "left top",
                    at: "left+28 top+45",
                    of: e
                })
            })
        },
        prepareCounters: function() {
            $("counter").each(function() {
                var t = $(this),
                    e = $('<div class="counter">1</div>');
                e.html(t.html()), e[0].style = t[0].getAttribute("style"), e[0].id = t[0].getAttribute("id");
                var n = t[0].getAttribute("size");
                n && (n = parseInt(n), e.css("font-size", String(n) + "px")), t.replaceWith(e)
            })
        },
        onKeyDown: function(t) {
            13 == t.which && (t.preventDefault(), Main.$nextButton.is(":visible") ? Main.$nextButton.trigger("click") : Main.$submitButton.is(":visible") && Main.$submitButton.trigger("click"))
        },
        loadXML: function(t) {
          
            console.log("Start loading ", t), $.get(t, function(t) {
                console.log("XML loaded"), console.log(t), Main.xml = t, Main.parseContent()
            }).fail(function() {
                console.log("Loading error")
            })
        },
        parseContent: function() {
            var t = new XMLSerializer;
            ! function() {
                for (var t = Main.xml.getElementsByTagName("select"), e = 0; e < t.length; e++) {
                    var n = t[e],
                        i = Main.xml.createElement("option");
                    i.setAttribute("value", ""), i.setAttribute("selected", "true"), i.setAttribute("disabled", "true"), i.setAttribute("hidden", "true"), i.appendChild(Main.xml.createTextNode("...")), n.insertBefore(i, n.childNodes[0])
                }
            }(),
            function() {
                for (var t = Main.xml.getElementsByTagName("choose"), e = [], n = 0; n < t.length; n++) e.push(t[n]);
                e.forEach(function(t) {
                    var e = o(t, "span");
                    e.className = "chooseUpDisabled choose"
                })
            }(),
            function() {
                for (var t = Main.xml.getElementsByTagName("frac"), e = [], n = 0; n < t.length; n++) e.push(t[n]);
                e.forEach(function(t) {
                    var e = o(t, "span");
                    t.hasAttribute("maxlength") && e.setAttribute("maxlength", t.getAttribute("maxlength")), e.className = "frac"
                })
            }(), $(Main.xml).find("dndTarget").each(function() {
                    var t = $(this),
                        e = t.attr("style") ? t.attr("style") : "",
                        n = $('<span class="dndTargetDisabled dndTarget" style="' + e + '"/>');
                    t.prop("id") && n.prop("id", t.prop("id")), t.attr("width") && n.css("width", t.attr("width") + "px"), t.attr("height") && n.css("height", t.attr("height") + "px"), $(this).replaceWith(n)
                }), $(Main.xml).find("dndCard").each(function() {
                    var t = $(this),
                        e = t.attr("style") ? t.attr("style") : "",
                        n = $('<span class="dndCardDisabled dndCard" style="' + e + '">' + t.html() + "</span>");
                    t.prop("id") && n.prop("id", t.prop("id")), t.attr("width") && n.css("width", t.attr("width") + "px"), $(this).replaceWith(n)
                }),
                function() {
                    var t = Main.xml.getElementsByTagName("content")[0],
                        e = "white";
                    t.hasAttribute("bgcolor") && (e = t.getAttribute("bgcolor"));
                    $("body").css("background-color", e)
                }();
            for (var e = Main.xml.getElementsByTagName("content")[0].childNodes, n = "", i = 0; i < e.length; i++) n += t.serializeToString(e[i]);
            document.getElementById("content").innerHTML = n.trim(), Main.prepareFractions(), Main.watchInputs(), Main.prepareRadioButtons(), Main.prepareListboxes(), Main.prepareCounters(), Main.prepareWTD();
            var a, r = new TotalComplete(function() {
                Main.status = PlayerEvents.CONTENT_READY, Main.$viewer.trigger(PlayerEvents.CONTENT_READY)
            });

            function o(t, e) {
                for (var n, i = Main.xml.createElement(e), a = t.firstChild; a;) n = a.nextSibling, i.appendChild(a), a = n;
                return t.hasAttribute("id") && (i.id = t.id), t.hasAttribute("style") && i.setAttribute("style", t.getAttribute("style")), t.parentNode.replaceChild(i, t), i
            }
            Main.soundManager.preloadSounds(Main.xml.getElementsByTagName("soundEffects")[0], r.onComplete(), "effect_"), Main.soundManager.preloadSounds(Main.xml.getElementsByTagName("sounds")[0], r.onComplete(), ""), r.start(), (a = $(Main.xml).find("attributes").find("UID")).length ? (Main.UID = a[0].textContent, console.log(Main.UID)) : console.warn("UID is not set!!!")
        },
        getBackgroundColor: function() {
            return $("body").css("background-color")
        },
        onContentReady: function(t) {
            Main.marker = new Marker, $("#content :input").prop("disabled", !0), Main.autoStart && Main.startAnimation()
        },
        startAnimation: function() {
            StepManager.start(Main.xml.getElementsByTagName("steps")[0])
        },
        onAnimationCompleted: function() {
            console.log("Animation completed"), Main.status = PlayerEvents.ANIMATION_COMPLETED, parent.$("body").trigger(PlayerEvents.ANIMATION_COMPLETED)
        },
        onNextButtonPressed: function(changeURL) {
            Main.soundManager.playSystemSound("radiotoggle"), Main.soundManager.hideReplayButton(), Main.soundManager.lastSound = null, Main.$customNextButton ? (Main.$customNextButton.off("click"), Main.$customNextButton.hide(), Main.$customNextButton = null, StepManager.nextStep()) : Main.hideNextButton(StepManager.nextStep)
        },
        showNextButton: function(t) {
            t.changeURL && changeXML(t.changeURL)
            t.customID ? 
            (Main.$customNextButton = $("#" + t.customID), 
            Main.$customNextButton.one("click", Main.onNextButtonPressed), Main.$customNextButton.show()) 
            : 
            (Main.$nextButton.one("click", Main.onNextButtonPressed), Main.rotateNavigationButton(Main.$nextButton)), t.disableReplay || Main.soundManager.showReplayButton(t.customReplayID)
        },
        hideNextButton: function(t) {
            Main.rotateNavigationButton(Main.$nextButton, !0, t)
        },
        showSubmitButton: function(t) {
            Main.rotateNavigationButton(Main.$submitButton), t.disableReplay || Main.soundManager.showReplayButton()
        },
        hideSubmitButton: function(t) {
            Main.rotateNavigationButton(Main.$submitButton, !0, t)
        },
        rotateNavigationButton: function(e, t, n) {
            if (e.show(), $.fx.off) a();
            else {
                var i = {
                    queue: !1,
                    easing: "easeInSine",
                    duration: .2 * Main.timeMultiplier,
                    complete: a
                };
                i.step = function(t) {
                    e.css({
                        transform: "rotateX(" + t + "deg)"
                    })
                }, e.css("transform-origin", "50% 100%"), Main.soundManager.playSystemSound("showbutton"), t ? $({
                    deg: 0
                }).animate({
                    deg: 90
                }, i) : $({
                    deg: 90
                }).animate({
                    deg: 0
                }, i)
            }

            function a() {
                e.css("transform-origin", ""), e.css("transform", ""), t && e.hide(), n && n()
            }
        },
        showSubtitles: function(t) {
            var e = Main.$subtitlesPopup,
                n = $(Main.xml).find('sound[id="' + t + '"]').find("ttsText").html();
            if (n && n.length) {
                e.find("p").remove(), e.append("<p>" + n + "</p>"), e.show(), e.position({
                    my: "center",
                    at: "center",
                    of: Main.$viewer
                });
                var i = {
                    left: Main.$subtitlesPopup.css("left"),
                    top: Main.$subtitlesPopup.css("top"),
                    opacity: 1
                };
                e.position({
                    my: "center",
                    at: "center",
                    of: Main.soundManager.$replayButton
                }), e.css("opacity", "0");
                var a = {
                    queue: !1,
                    easing: "easeOutBack",
                    complete: function() {
                        e.css("transform", ""), e.position({
                            my: "center",
                            at: "center",
                            of: Main.$viewer
                        })
                    },
                    duration: 300,
                    step: function(t) {
                        e.css({
                            transform: "scale(" + t + ")"
                        })
                    }
                };
                $({
                    deg: .1
                }).animate({
                    deg: 1
                }, a), e.animate(i, {
                    queue: !1,
                    easing: "easeOutCubic",
                    duration: 300
                })
            }
        },
        hideSubtitles: function() {
            Main.$subtitlesPopup.hide()
        }
    },
    PlayerEvents = {
        SOUNDS_LOADED: "soundsLoaded",
        STEP_STARTED: "stepStarted",
        CONTENT_READY: "contentready",
        SHOW_NEXT_BUTTON: "showNextButton",
        SHOW_SUBMIT_BUTTON: "showSubmitButton",
        ANSWER_ACCEPTED: "answerAccepted",
        ANIMATION_COMPLETED: "animationCompleted",
        FRAME_INITIALISED: "frameInitialised"
    },
    StepManager = {
        xml: void 0,
        currentStepNum: -1
    };

function changeXML (xmlURL) {
  var baseURL = window.top.location.href;
  var pathnames = baseURL.split('#');
  pathnames[pathnames.length-1] = xmlURL;
  var furl = pathnames[0] + '#' + xmlURL;
  window.top.location.href = furl;
  window.top.location.reload();
}    

function SoundManager() {
    var t = this;
    this.enabled = !0, this.lastSound = null, this.backgroundInstances = [];
    var o = new createjs.LoadQueue;

    function e() {
        t.replayInstance && t.replayInstance.stop(), t.lastSound && (t.replayInstance = createjs.Sound.play(t.lastSound), Main.showSubtitles(t.lastSound))
    }
    o.setMaxConnections(10), o.installPlugin(createjs.Sound), o.on("complete", function() {
        o.off("complete"), $("body").trigger(PlayerEvents.SOUNDS_LOADED)
    }, this), o.loadManifest([{
        id: "system_correct01",
        src: "player/sounds/correct01.mp3"
    }, {
        id: "system_correct02",
        src: "player/sounds/correct02.mp3"
    }, {
        id: "system_correct03",
        src: "player/sounds/correct03.mp3"
    }, {
        id: "system_correct04",
        src: "player/sounds/correct04.mp3"
    }, {
        id: "system_incorrect01",
        src: "player/sounds/incorrect01.mp3"
    }, {
        id: "system_incorrect02",
        src: "player/sounds/incorrect02.mp3"
    }, {
        id: "system_incorrect03",
        src: "player/sounds/incorrect03.mp3"
    }, {
        id: "system_incorrect04",
        src: "player/sounds/incorrect04.mp3"
    }, {
        id: "system_markerunderline",
        src: "player/sounds/markerunderline.mp3"
    }, {
        id: "system_markercircle",
        src: "player/sounds/markercircle.mp3"
    }, {
        id: "system_radiotoggle",
        src: "player/sounds/radiotoggle.mp3"
    }, {
        id: "system_counterblop",
        src: "player/sounds/counterblop.mp3"
    }, {
        id: "system_rememberlamp",
        src: "player/sounds/rememberlamp.mp3"
    }, {
        id: "system_dropdown",
        src: "player/sounds/dropdown.mp3"
    }, {
        id: "system_fireworks",
        src: "player/sounds/fireworks.mp3"
    }, {
        id: "system_showbutton",
        src: "player/sounds/showbutton.mp3"
    }, {
        id: "system_markerpress",
        src: "player/sounds/markerpress.mp3"
    }]), this.preloadSounds = function(t, e, n) {
        if (t) {
            for (var i = [], a = 0; a < t.childNodes.length; a++) {
                var r = t.childNodes[a];
                "sound" === r.nodeName && i.push({
                    id: n + r.getAttribute("id"),
                    src: r.getAttribute("src")
                })
            }
            o.on("complete", function() {
                e()
            }, this), o.loadManifest(i)
        } else e()
    }, this.playBackgroundSound = function(t, e) {
        if (this.enabled) {
            var n = createjs.Sound.play(e + t);
            this.backgroundInstances.push(n), n.on("complete", function() {
                ArrayUtils.removeObjectFromArray(n, this.backgroundInstances)
            })
        }
    }, this.play = function(t, e, n) {
        if (this.enabled) {
            var i = createjs.Sound.play(n + t);
            if (i.playState === createjs.Sound.PLAY_FAILED) return console.warn("Unknown sound", t), void e();
            i.on("complete", e)
        } else e()
    }, this.playResponse = function(t) {
        if (this.enabled) {
            var e = MathUtils.roundRandRange(1, 4);
            this.playSystemSound(t ? "correct0" + e : "incorrect0" + e)
        }
    }, this.playSystemSound = function(t) {
        if (this.enabled) try {
            createjs.Sound.play("system_" + t)
        } catch (t) {}
    }, this.showReplayButton = function(t) {
        this.lastSound && (t ? (this.$customReplayButton = $("#" + t), this.$customReplayButton.click(e), this.$customReplayButton.show()) : (this.$replayButton.show(), this.$replayButton.css("left", "580px"), this.$replayButton.css("top", "900px"), this.$replayButton.animate({
            left: "420",
            top: "850"
        }, {
            queue: !1,
            easing: "easeOutCubic",
            duration: 300
        })))
    }, this.hideReplayButton = function() {
        this.$replayButton.hide(), this.$customReplayButton && (this.$customReplayButton.hide(), this.$customReplayButton = null), this.replayInstance && this.replayInstance.stop(), Main.hideSubtitles(), this.backgroundInstances.forEach(function(t) {
            t.stop()
        }), this.backgroundInstances = []
    }, this.replayInstance = null, this.$replayButton = $('<div id="replay-button" />'), Main.$systemContainer.append(this.$replayButton), this.$replayButton.click(e), this.$customReplayButton = null
}

function RadioControl(t) {
    this.id = t.getAttribute("id"), this.type = "radio", this.correctAnswer = t.getAttribute("correctAnswer"), this.buttons = [], this.enabled = !1;
    var n = this;
    t.getAttribute("buttons").split(",").forEach(function(t) {
        var e = $("#" + t);
        e.prop("skin", e.prev()), this.buttons.push(e), e.on("change", function() {
            n.updateAllSkins()
        })
    }, this), this.enable = function() {
        this.enabled = !0, this.buttons.forEach(function(t) {
            t.prop("disabled", !1), n.updateSkin(t)
        })
    }, this.disable = function() {
        this.enabled = !1, this.buttons.forEach(function(t) {
            t.prop("disabled", !0), n.updateSkin(t)
        })
    }, this.answer = function() {
        var t = this.$selection();
        return t ? t.prop("id") : null
    }, this.setAnswer = function(t) {
        var e = $("#" + t);
        e.prop("checked", !0), e.trigger("change")
    }, this.check = function() {
        var t = this.answer(),
            e = t ? new ReturnType(t == this.correctAnswer) : new ReturnType(!1, !0);
        return e.studentAnswer = t, e.correctAnswer = this.correctAnswer, e
    }, this.cross = function() {
        var t = this.$selection();
        if (!Main.globalDictionary[this.id].correct && t) {
            var e = $('<div class="crossLine"/>');
            e.width(t.width() + 8), t.parent().append(e), e.position({
                my: "center",
                at: "center",
                of: t
            })
        }
    }, this.$selection = function() {
        for (var t = 0; t < this.buttons.length; t++)
            if (this.buttons[t].prop("checked")) return this.buttons[t];
        return null
    }, this.clear = function() {
        var t = this.$selection();
        t && (t.parent().find(".crossLine").remove(), t.prop("checked", !1)), this.updateAllSkins()
    }, this.updateAllSkins = function() {
        for (var t = 0; t < this.buttons.length; t++) this.updateSkin(this.buttons[t])
    }, this.updateSkin = function(t) {
        var e = t.prop("skin");
        e.removeClass(), e.addClass("radio-checkbox"), this.enabled ? t.prop("checked") ? e.addClass("radioSkinDown") : e.addClass("radioSkinUp") : t.prop("checked") ? e.addClass("radioSkinDownDisabled") : e.addClass("radioSkinUpDisabled")
    }
}

function CheckboxControl(t) {
    RadioControl.call(this, t), this.type = "checkbox", this.$selection = function() {
        for (var t = [], e = 0; e < this.buttons.length; e++) this.buttons[e].prop("checked") && t.push(this.buttons[e]);
        return t
    }, this.answer = function() {
        var t = this.$selection().map(function(t) {
            return t.prop("id")
        });
        return t.length ? t.join(",") : null
    }, this.setAnswer = function(t) {
        t.split(",").forEach(function(t) {
            var e = $("#" + t);
            e.prop("checked", !0), e.trigger("change")
        })
    }, this.cross = function() {
        var i = this.correctAnswer.split(",");
        this.$selection().forEach(function(t) {
            var e = t.prop("id");
            if (i.indexOf(e) < 0) {
                var n = $('<div class="crossLine"/>');
                n.width(t.width() + 8), t.parent().append(n), n.position({
                    my: "center",
                    at: "center",
                    of: t
                })
            }
        })
    }, this.clear = function() {
        this.$selection().forEach(function(t) {
            t.prop("checked", !1), t.parent().find(".crossLine").remove()
        })
    }, this.updateSkin = function(t) {
        var e = t.prop("skin");
        e.removeClass(), e.addClass("radio-checkbox"), this.enabled ? t.prop("checked") ? e.addClass("checkboxSkinDown") : e.addClass("checkboxSkinUp") : t.prop("checked") ? e.addClass("checkboxSkinDownDisabled") : e.addClass("checkboxSkinUpDisabled")
    }
}

function DNDControl(t) {
    this.id = t.getAttribute("id"), this.type = "dnd", this.correctAnswer = t.getAttribute("correctAnswer"), this.cards = [], this.targets = [], this.wetspots = [];
    var n = {},
        i = !1,
        l = this;
    t.getAttribute("cards").split(",").forEach(function(t) {
        var e = $("#" + t);
        this.cards.push(e), n[t] = e
    }, this), t.getAttribute("targets").split(",").forEach(function(t) {
        var e = $("#" + t);
        this.targets.push(e)
    }, this), l.cards.forEach(function(t) {
        var e = $('<span class="dndWetspot dndWetspotDisabled"/>');
        e.width(t.outerWidth()), e.height(t.outerHeight()), t.wrap(e), e = t.parent(), l.wetspots.push(e), t.prop("wetspot", e), e.prop("card", t)
    });
    var d = 20,
        h = 20,
        g = Main.$viewer.width(),
        f = Main.$viewer.height(),
        o = $("#hidden_span"),
        e = "mousedown",
        m = "mousemove",
        b = "mouseup";

    function M(t, e, n, i) {
        t.prop("inMotion", !0), o.position({
            my: "left top",
            at: "left top",
            of: e
        });
        var a = o.position();

        function r() {
            e.append(t), t.prop("target", e), t.css("position", "static"), e.prop("card", t), t.prop("inMotion", !1), s(t), c(e), n && n()
        }
        i ? r() : t.animate(a, 300, r)
    }

    function v(t, e) {
        t.prop("inMotion", !0);
        var n = t.prop("wetspot");
        o.position({
            my: "left top",
            at: "left top",
            of: n
        });
        var i = o.position();
        t.animate(i, 300, function() {
            n.append(t), t.css("position", "static"), t.prop("inMotion", !1), e && e()
        })
    }

    function s(t) {
        t.removeClass(), t.addClass("dndCard");
        var e = t.prop("target");
        i ? t.addClass(e ? "dndCardActiveOnTarget" : "dndCardActive") : t.addClass("dndCardDisabled")
    }

    function c(t) {
        t.removeClass(), t.addClass("dndTarget");
        var e = t.prop("card");
        i ? t.addClass(e ? "dndTargetWithCard" : "dndTargetActive") : t.addClass(e ? "dndTargetWithCard" : "dndTargetDisabled")
    }
    Main.isTouchDevice && (e = "touchstart", m = "touchmove", b = "touchend"), this.enable = function() {
        i = !0;
        var p = $(document);
        this.cards.forEach(function(s) {
            var a = 0,
                r = 0,
                n = s.width(),
                i = s.height();

            function c(t) {
                var e = o(t);
                e.left += a, e.top += r, s.offset(e), (e = s.position()).left = MathUtils.clamp(e.left, d, d + g - n), e.top = MathUtils.clamp(e.top, h, h + f - i), s.css(e)
            }

            function u(t) {
                p.off(b, null, u), p.off(m, null, c);
                var a, r, o, e = (r = null, o = new Rectangle(s[a = 0].getBoundingClientRect()), l.targets.forEach(function(t) {
                    if (!t.prop("card")) {
                        var e = new Rectangle(t[0].getBoundingClientRect()),
                            n = o.intersect(e);
                        if (!(n.width < 0 || n.height < 0)) {
                            var i = n.getArea();
                            a < i && (a = i, r = t)
                        }
                    }
                }), r);
                null !== e ? M(s, e) : v(s)
            }

            function o(t) {
                var e, n;
                if ("touches" in t && t.touches) {
                    var i = t.touches.item(0);
                    e = i.pageX, n = i.pageY
                } else e = t.pageX, n = t.pageY;
                return {
                    left: e,
                    top: n
                }
            }
            s.on(e, function(t) {
                if (s.prop("inMotion")) return;
                l.dropCarToStage(s), e = t, n = s.offset(), i = o(e), a = n.left - i.left, r = n.top - i.top, p.on(m, c), p.on(b, u);
                var e, n, i
            })
        }), l.updateAllStyles()
    }, this.dropCarToStage = function(t) {
        var e = t.prop("target");
        e && (e.prop("card", null), t.prop("target", null), e.find(".crossLine").remove(), s(t), c(e));
        var n = t.offset();
        Main.$viewer.append(t), t.css("position", "absolute"), t.offset(n)
    }, this.disable = function() {
        i = !1, this.cards.forEach(function(t) {
            t.off(e)
        }), l.updateAllStyles()
    }, this.updateAllStyles = function() {
        l.cards.forEach(function(t) {
            s(t)
        }), l.targets.forEach(function(t) {
            c(t)
        }), l.wetspots.forEach(function(t) {
            var e;
            (e = t).removeClass(), e.addClass("dndWetspot"), i ? e.addClass("dndWetspotActive") : e.addClass("dndWetspotDisabled")
        })
    }, this.check = function() {
        var t = this.answer(),
            e = function() {
                for (var t = !1, e = 0; e < l.targets.length; e++) {
                    var n = l.targets[e];
                    if (!n.prop("card")) {
                        t = !0;
                        break
                    }
                }
                for (var i = !1, e = 0; e < l.cards.length; e++) {
                    var a = l.cards[e];
                    if (!a.prop("target")) {
                        i = !0;
                        break
                    }
                }
                return i && t
            }() ? new ReturnType(!1, !0) : new ReturnType(t == this.correctAnswer);
        return e.studentAnswer = t, e.correctAnswer = this.correctAnswer, e
    }, this.answer = function() {
        var n = [];
        return this.targets.forEach(function(t) {
            var e = t.prop("card");
            n.push(e ? e.prop("id") : "")
        }), n.join(",")
    }, this.setAnswer = function(t) {
        for (var e = t.split(","), n = 0; n < e.length; n++) {
            var i = this.getCardByID(e[n]);
            i && this.moveCardToTarget(i, this.targets[n], null, !0)
        }
    }, this.cross = function() {
        for (var t = this.correctAnswer.split(","), e = 0; e < l.targets.length; e++) {
            var n = l.targets[e],
                i = n.prop("card");
            if (i && i.prop("id") !== t[e]) {
                var a = $('<div class="crossLine"/>');
                a.width(i.outerWidth() + 8), n.append(a), a.position({
                    my: "center",
                    at: "center",
                    of: n
                }), n.find(".frac").length && a.css("transform", "rotate(-60deg)")
            }
        }
    }, this.getIcorrectCrads = function() {
        for (var t = this.correctAnswer.split(","), e = [], n = 0; n < l.targets.length; n++) {
            var i = l.targets[n].prop("card");
            i && (i.prop("id") !== t[n] && e.push(i))
        }
        return e
    }, this.moveCardToWetplace = v, this.moveCardToTarget = M, this.getCardByID = function(t) {
        return n[t]
    }
}

function ChooseControl(t) {
    this.id = t.getAttribute("id"), this.type = "choose", this.correctAnswer = t.getAttribute("correctAnswer"), this.buttons = [];
    var e = 1 === this.correctAnswer.split(",").length,
        n = this;
    t.getAttribute("buttons").split(",").forEach(function(t) {
        var e = $("#" + t);
        this.buttons.push(e), e.prop("chooseGroup", n)
    }, this);
    var i = !1;

    function a(t) {
        t.removeClass(), t.addClass("choose"), i ? t.addClass(t.prop("selected") ? "chooseSelected" : "chooseUp") : t.addClass(t.prop("selected") ? "chooseSelectedDisabled" : "chooseUpDisabled")
    }
    this.enable = function() {
        this.buttons.forEach(function(t) {
            i = !0, t.mousedown(function() {
                e ? (n.selection().forEach(function(t) {
                    t.prop("selected", !1)
                }), t.prop("selected", !0)) : t.prop("selected", !t.prop("selected")), n.updateAllStyles()
            })
        }), n.updateAllStyles()
    }, this.disable = function() {
        i = !1, this.buttons.forEach(function(t) {
            t.off("mousedown")
        }), n.updateAllStyles()
    }, this.updateAllStyles = function() {
        n.buttons.forEach(function(t) {
            a(t)
        })
    }, this.updateAllSkins = this.updateAllStyles, this.answer = function() {
        return this.selection().map(function(t) {
            return t.prop("id")
        }).join(",")
    }, this.setAnswer = function(t) {
        t.split(",").forEach(function(t) {
            $("#" + t).trigger("mousedown", !0)
        })
    }, this.check = function() {
        var t = this.answer(),
            e = 0 < t.length ? new ReturnType(t == this.correctAnswer) : new ReturnType(!1, !0);
        return e.studentAnswer = t, e.correctAnswer = this.correctAnswer, e
    }, this.cross = function() {
        var i = this.correctAnswer.split(",");
        this.selection().forEach(function(t) {
            var e = t.prop("id");
            if (i.indexOf(e) < 0) {
                var n = $('<div class="crossLine"/>');
                n.width(t.outerWidth() + 8), t.parent().append(n), n.position({
                    my: "center",
                    at: "center",
                    of: t
                })
            }
        })
    }, this.selection = function() {
        return this.buttons.filter(function(t) {
            return Boolean(t.prop("selected"))
        })
    }, this.clear = function() {
        this.selection().forEach(function(t) {
            t.prop("selected", !1), t.parent().find(".crossLine").remove(), a(t)
        })
    }
}

function InputControl(t) {
    this.id = t.getAttribute("id"), this.$control = $("#" + this.id), this.type = "input", this.correctAnswer = t.getAttribute("correctAnswer"), this.cross = function() {
        if (!Main.globalDictionary[this.id].correct) {
            var t = $('<div class="crossLine"/>');
            t.width(this.$control.width() - 6), this.$control.parent().append(t), t.position({
                my: "center",
                at: "center",
                of: this.$control
            })
        }
    }, this.check = function() {
        var t = this.answer().replace("−", "-"),
            e = "" != t && t ? new ReturnType(Number(t) == Number(this.correctAnswer)) : new ReturnType(!1, !0);
        return e.studentAnswer = t, e.correctAnswer = this.correctAnswer, e
    }, this.answer = function() {
        return this.$control.val()
    }, this.setAnswer = function(t) {
        this.$control.val(t), this.$control.trigger("input")
    }, this.enable = function() {
        this.$control.prop("disabled", !1)
    }, this.disable = function() {
        this.$control.prop("disabled", !0)
    }, this.clear = function() {
        this.$control.parent().find(".crossLine").remove(), this.setAnswer("")
    }
}

function ListboxControl(t) {
    this.id = t.getAttribute("id"), this.$control = $("#" + this.id), this.type = "listbox", this.correctAnswer = t.getAttribute("correctAnswer"), this.cross = function() {
        if (!Main.globalDictionary[this.id].correct) {
            var t = $('<div class="crossLine"/>');
            t.width(this.$control.width() - 35), this.$control.parent().append(t), t.position({
                my: "center",
                at: "center-15 center",
                of: this.$control
            })
        }
    }, this.check = function() {
        var t = this.answer(),
            e = t ? new ReturnType(t == this.correctAnswer) : new ReturnType(!1, !0);
        return e.studentAnswer = t, e.correctAnswer = this.correctAnswer, e
    }, this.answer = function() {
        return this.$control.val()
    }, this.setAnswer = function(t) {
        this.$control.val(t), this.$control.trigger("input")
    }, this.enable = function() {
        this.$control.prop("disabled", !1)
    }, this.disable = function() {
        this.$control.prop("disabled", !0)
    }, this.clear = function() {
        this.$control.parent().find(".crossLine").remove(), this.setAnswer("")
    }
}

function CommonFraction(n) {
    this.id = n.prop("id"), this.type = "fraction", this.numString = "", this.denString = "", this.wholeString = "", this.acceptReducible = !1, this.$numerator = null, this.$denominator = null, this.$bar = null, this.$wholePart = null;
    var c = {},
        u = this,
        i = "3";
    ! function() {
        i = n.attr("maxlength") ? n.attr("maxlength") : "3";
        var t = n.html().trim().split("|");
        3 === t.length && (u.wholeString = t.shift());
        u.numString = t[0], u.denString = t[1], n.html(""), u.$numerator = $('<span class="numerator">' + u.numString + "</span>"), u.$denominator = $('<span class="denominator">' + u.denString + "</span>"), u.$bar = $('<div class="fracBar"/>'), n.append(u.$numerator), n.append(u.$bar), u.$bar.css("backgroundColor", n.css("color")), n.append(u.$denominator), n.wrap("<span></span>"), "" !== u.wholeString && (u.$wholePart = $("<span>" + u.wholeString + "</span>"), n.before(u.$wholePart));
        "" !== u.id && n.prop("id", u.id + "_frac");
        var e = n.attr("style");
        e && n.removeAttr("style");
        n = n.parent(), "" !== u.id && n.prop("id", u.id);
        e && n.attr("style", e);
        n.css("white-space", "nowrap")
    }(),
    function() {
        var t = '<input type="number" maxlength="' + i + '"/>';
        "#" === u.numString && (c.$numerator = $(t), u.$numerator.html(""), u.$numerator.append(c.$numerator));
        "#" === u.denString && (c.$denominator = $(t), u.$denominator.html(""), u.$denominator.append(c.$denominator));
        "#" === u.wholeString && (c.$wholePart = $(t), u.$wholePart.html(""), u.$wholePart.append(c.$wholePart))
    }(), this.writeIDs = function() {
        "" !== u.id && (c.$numerator ? c.$numerator.prop("id", u.id + "_num") : u.$numerator.prop("id", u.id + "_num"), c.$denominator ? c.$denominator.prop("id", u.id + "_den") : u.$denominator.prop("id", u.id + "_den"), c.$wholePart ? c.$wholePart.prop("id", u.id + "_whole") : u.$wholePart && u.$wholePart.prop("id", u.id + "_whole"), u.$bar.prop("id", u.id + "_bar"))
    }, this.setParams = function(t) {
        this.correctAnswer = t.getAttribute("correctAnswer"), t.hasAttribute("acceptReducible") && (this.acceptReducible = t.getAttribute("acceptReducible"))
    }, this.enable = function() {
        for (var t in c) c[t].prop("disabled", !1)
    }, this.disable = function() {
        for (var t in c) c[t].prop("disabled", !0)
    }, this.answer = function() {
        var t = [];
        return c.$wholePart && t.push(c.$wholePart.val()), c.$numerator && t.push(c.$numerator.val()), c.$denominator && t.push(c.$denominator.val()), t.join("|")
    }, this.setAnswer = function(t) {
        var e = t.split("|");
        c.$wholePart && (c.$wholePart.val(e.shift()), c.$wholePart.trigger("input")), c.$numerator && (c.$numerator.val(e.shift()), c.$numerator.trigger("input")), c.$denominator && (c.$denominator.val(e.shift()), c.$denominator.trigger("input"))
    }, this.getInputsArray = function() {
        var t = [];
        return c.$wholePart && t.push(c.$wholePart), c.$numerator && t.push(c.$numerator), c.$denominator && t.push(c.$denominator), t
    }, this.check = function() {
        var t = !1;
        for (var e in c) "" === c[e].val() && (t = !0);
        var n, i, a = this.answer();
        if (t) n = new ReturnType(!1, !0);
        else if (this.acceptReducible && !u.$wholePart) {
            var r = this.correctAnswer.split("|"),
                o = c.$numerator.val(),
                s = c.$denominator.val();
            n = new ReturnType((i = s, !/\D+/.test(o) && !/\D+/.test(i) && 0 !== parseInt(i) && parseInt(o) / parseInt(s) * parseInt(r[1]) / parseInt(r[0])))
        } else n = new ReturnType(a === this.correctAnswer);
        return n.studentAnswer = a, n.correctAnswer = this.correctAnswer, n
    }, this.cross = function() {
        if (!Main.globalDictionary[this.id].correct) {
            var t = $('<div class="crossLine"/>');
            t.width(n.width() + 10), n.append(t), t.position({
                my: "center",
                at: "center",
                of: n
            }), t.css("transform", "rotate(-60deg)")
        }
    }, this.clear = function() {
        n.find(".crossLine").remove(), this.setAnswer("||")
    }, this.writeIDs()
}

function ReturnType(t, e) {
    this.noresponse = Boolean(e), this.correct = Boolean(t), this.incorrect = !t, e && (this.correct = this.incorrect = !1), this.studentAnswer = "", this.correctAnswer = ""
}

function Marker() {
    Main.$viewer.append('<div id="globalMarker" class="markerUp"/>');
    var y = $("#globalMarker"),
        o = $("#hidden_span"),
        S = null,
        A = null;

    function w() {
        S && clearTimeout(S), y.stop(!0), A && A(), C("up")
    }

    function C(t) {
        switch (y.removeClass(), t) {
            case "down":
                y.addClass("markerDown");
                break;
            default:
                y.addClass("markerUp")
        }
    }

    function g(t) {
        C("down"), setTimeout(function() {
            C("up"), t()
        }, .2 * Main.timeMultiplier)
    }

    function f() {
        var t = $('<div class="markerCloud"/>');
        Main.$viewer.append(t), t.position({
            my: "center center",
            at: "left top",
            of: y
        }), t.effect("scale", {
            percent: 1e3,
            speed: 50
        }), t.fadeOut({
            duration: 700,
            queue: !1,
            complete: function() {
                t.remove()
            }
        })
    }
    this.toggleControl = function(t, e) {
        w(), A = e, o.position({
            my: "left top",
            at: "center center",
            of: t
        });
        var n = o.position();

        function i() {
            (t.is(":radio") || t.is(":checkbox")) && (t.prop("checked", !0), t.trigger("change")), t.prop("chooseGroup") && (t.prop("selected", !0), t.prop("chooseGroup").updateAllStyles()), f(), g(a), Main.soundManager.playSystemSound("radiotoggle")
        }

        function a() {
            y.animate({
                top: "+=15",
                left: "+=15"
            }, 400, r)
        }

        function r() {
            A === e && (A = null), e()
        }
        this.visible() ? y.animate(n, 500, i) : (this.fadeIn(), y.position({
            my: "left top",
            at: "center+100 center+100",
            of: t
        }), y.animate({
            top: "-=100",
            left: "-=100"
        }, 500, i))
    }, this.fadeIn = function(t) {
        y.fadeIn({
            queue: !1,
            complete: t
        })
    }, this.fadeOut = function(t) {
        y.fadeOut({
            queue: !1,
            complete: t
        })
    }, this.visible = function() {
        return y.is(":visible")
    }, this.pointAction = function(t, n) {
        var e = t.getAttribute("id"),
            i = t.hasAttribute("delay") ? Number(t.getAttribute("delay")) : 0,
            a = t.hasAttribute("standby") ? Number(t.getAttribute("standby")) : .3,
            r = t.hasAttribute("at") ? t.getAttribute("at") : "right-5 bottom-10",
            o = .5,
            s = $("#" + e),
            c = this;

        function u() {
            Main.soundManager.playSystemSound("markerpress"), f(), g(p)
        }

        function p() {
            y.animate({
                top: "+=5",
                left: "+=5"
            }, {
                duration: 200,
                complete: l,
                queue: !1
            })
        }

        function l() {
            a < 0 ? h() : S = setTimeout(d, a)
        }

        function d() {
            y.fadeOut({
                queue: !1,
                complete: h
            })
        }

        function h() {
            A === n && (A = null), n()
        }
        i - o < 0 ? (o = i, i = 0) : i -= o, o *= Main.timeMultiplier, i *= Main.timeMultiplier, a *= Main.timeMultiplier, setTimeout(function() {
            if (w(), A = n, c.visible()) {
                $("#hidden_span").position({
                    my: "left top",
                    at: r,
                    of: s
                });
                var t = $("#hidden_span").position();
                y.animate(t, {
                    duration: o,
                    complete: u,
                    queue: !1
                })
            } else {
                y.fadeIn({
                    queue: !1,
                    duration: Math.min(o, 400)
                }), y.position({
                    my: "left top",
                    at: r,
                    of: s
                });
                var e = y.offset();
                y.offset({
                    top: e.top + 50,
                    left: e.left + 50
                }), y.animate({
                    top: "-=50",
                    left: "-=50"
                }, {
                    duration: o,
                    complete: u,
                    queue: !1
                })
            }
        }, i)
    }, this.underlineAction = function(t, i) {
        var a = t.getAttribute("id"),
            e = t.hasAttribute("delay") ? Number(t.getAttribute("delay")) : 0,
            n = t.hasAttribute("standby") ? Number(t.getAttribute("standby")) : .3,
            r = t.hasAttribute("lineID") ? t.getAttribute("lineID") : "lineID" + String(Math.round(1e4 * Math.random())),
            o = "background:" + (t.hasAttribute("color") ? t.getAttribute("color") : "blue") + ";";
        t.hasAttribute("lineStyle") && (o = t.getAttribute("lineStyle"));
        var s, c, u = t.hasAttribute("dy") ? parseInt(t.getAttribute("dy")) : 0,
            p = t.hasAttribute("dx") ? parseInt(t.getAttribute("dx")) : 0,
            l = .5,
            d = $("#" + a),
            h = 100,
            g = this;

        function f() {
            C("down"), Main.soundManager.playSystemSound("markerunderline"), y.animate({
                left: "+=" + String(h)
            }, {
                duration: 500,
                queue: !1
            }), s.animate({
                width: h
            }, {
                duration: 500,
                complete: m,
                queue: !1
            })
        }

        function m() {
            C("up"), y.animate({
                top: "+=5",
                left: "+=5"
            }, {
                duration: 200,
                complete: b,
                queue: !1
            })
        }

        function b() {
            n < 0 ? v() : S = setTimeout(M, n)
        }

        function M() {
            y.fadeOut({
                queue: !1,
                complete: v
            })
        }

        function v() {
            A === i && (A = null), i()
        }
        e - l < 0 ? (l = e, e = 0) : e -= l, l *= Main.timeMultiplier, e *= Main.timeMultiplier, n *= Main.timeMultiplier, setTimeout(function() {
            if (w(), A = i, d.parent().append('<span class="markerUnderline" id="' + r + '" style="' + o + '"/>'), (s = $("#" + r)).position({
                    my: "left top",
                    at: "left+" + String(-p) + " bottom+" + u,
                    of: d
                }), e = a.split(","), n = new Rectangle($("#" + e.shift())[0].getBoundingClientRect()), e.forEach(function(t) {
                    n = n.union(new Rectangle($("#" + t)[0].getBoundingClientRect()))
                }), h = n.width + 2 * p, c = s.offset(), g.visible()) {
                $("#hidden_span").offset(c);
                var t = $("#hidden_span").position();
                y.animate(t, {
                    duration: l,
                    complete: f,
                    queue: !1
                })
            } else y.fadeIn({
                queue: !1,
                duration: Math.min(l, 400)
            }), y.offset({
                top: c.top + 50,
                left: c.left + 50
            }), y.animate({
                top: "-=50",
                left: "-=50"
            }, {
                duration: l,
                complete: f,
                queue: !1
            });
            var e, n
        }, e)
    }, this.circleAction = function(t, e) {
        var a = t.getAttribute("id"),
            n = t.hasAttribute("delay") ? Number(t.getAttribute("delay")) : 0,
            i = t.hasAttribute("standby") ? Number(t.getAttribute("standby")) : .3,
            r = t.hasAttribute("dx") ? parseInt(t.getAttribute("dx")) : 20,
            o = t.hasAttribute("dy") ? parseInt(t.getAttribute("dy")) : 20,
            s = .5,
            c = this,
            u = [];
        n - s < 0 ? (s = n, n = 0) : n -= s, s *= Main.timeMultiplier, n *= Main.timeMultiplier, i *= Main.timeMultiplier, setTimeout(function() {
            w(), A = e,
                function() {
                    var t = $("#hidden_span");
                    t.css("left", "0"), t.css("top", "0");
                    var e = new Rectangle(t[0].getBoundingClientRect()),
                        n = a.split(","),
                        i = new Rectangle($("#" + n.shift())[0].getBoundingClientRect());
                    n.forEach(function(t) {
                        i = i.union(new Rectangle($("#" + t)[0].getBoundingClientRect()))
                    }), u.push({
                        left: i.getRight() + r - e.x,
                        top: i.getCenterY() - e.y
                    }), u.push({
                        left: i.getCenterX() - e.x,
                        top: i.getBottom() + o - e.y
                    }), u.push({
                        left: i.x - r - e.x,
                        top: i.getCenterY() - e.y
                    }), u.push({
                        left: i.getCenterX() - e.x,
                        top: i.y - o - e.y
                    }), u.push({
                        left: i.getRight() + r - e.x,
                        top: i.getCenterY() + o - e.y
                    })
                }();
            var t = u.shift();
            c.visible() ? y.animate(t, {
                duration: s,
                complete: l,
                queue: !1
            }) : (y.fadeIn({
                queue: !1,
                duration: Math.min(s, 400)
            }), y.css("top", t.top + 50), y.css("left", t.left + 50), y.animate({
                top: "-=50",
                left: "-=50"
            }, {
                duration: s,
                complete: l,
                queue: !1
            }))
        }, n);
        var p = !0;

        function l() {
            C("down"), Main.soundManager.playSystemSound("markercircle"), d()
        }

        function d() {
            var t = u.shift();
            t ? (y.animate({
                top: t.top
            }, {
                duration: 200,
                easing: p ? "easeOutQuad" : "easeInQuad",
                queue: !1
            }), y.animate({
                left: t.left
            }, {
                duration: 200,
                easing: p ? "easeInQuad" : "easeOutQuad",
                complete: d,
                queue: !1
            }), p = !p) : function() {
                if (C("up"), i < 0) return g();
                S = setTimeout(h, i)
            }()
        }

        function h() {
            y.fadeOut({
                queue: !1,
                complete: g
            })
        }

        function g() {
            A === e && (A = null), e()
        }
    }
}

function TotalComplete(t) {
    this.totalComplete = t, this.handlers = [], this.onComplete = function() {
        this.handlers.push(e);
        var t = this;
        return e;

        function e() {
            ArrayUtils.removeObjectFromArray(e, t.handlers) && t.checkTotalcomplete()
        }
    }, this.checkTotalcomplete = function() {
        !this.handlers.length && this.totalComplete && (this.totalComplete(), this.totalComplete = null)
    };
    var e = this.onComplete();
    this.start = function() {
        e()
    }
}
StepManager.start = function(t) {
    StepManager.xml = t, StepManager.nextStep()
}, StepManager.nextStep = function() {
    StepManager.currentStepNum++;
    var t = StepManager.getCurrentStepXML();
    if (t)
        if (!StepManager.isInvalidNode(t) && StepManager.checkCondition(t)) switch (console.log("Current step", t), t.nodeName) {
            case "next":
                StepManager.createNextStep(t);
                break;
            case "step":
                StepManager.createSimpleStep(t);
                break;
            case "submit":
                StepManager.createSubmitStep(t);
                break;
            case "pause":
                StepManager.pauseAnimation(t);
                break;
            default:
                StepManager.nextStep()
        } else StepManager.nextStep();
        else Main.$viewer.trigger(PlayerEvents.ANIMATION_COMPLETED)
}, StepManager.createNextStep = function(t) {
    var e = null;
    t.hasAttribute("customID") && (e = t.getAttribute("customID"));
    var v = null;
    t.hasAttribute("changeURL") && (v = t.getAttribute("changeURL"));
    var n = null;
    t.hasAttribute("customReplayID") && (n = t.getAttribute("customReplayID"));
    var i = !1;
    t.hasAttribute("disableReplay") && (i = "true" === t.getAttribute("disableReplay")), Main.$viewer.trigger({
        type: PlayerEvents.SHOW_NEXT_BUTTON,
        customID: e,
        changeURL: v,
        customReplayID: n,
        disableReplay: i
    })
}, StepManager.isInvalidNode = function(t) {
    return "#text" === t.nodeName || "#comment" === t.nodeName
}, StepManager.pauseAnimation = function(t) {
    var e = t.hasAttribute("delay") ? parseFloat(t.getAttribute("delay")) : .5;
    e *= Main.timeMultiplier, setTimeout(StepManager.nextStep, e)
}, StepManager.getCurrentStepXML = function() {
    return StepManager.xml.childNodes[StepManager.currentStepNum]
}, StepManager.checkCondition = function(t) {
    if (!t.hasAttribute("if")) return !0;
    var e = t.getAttribute("if"),
        n = [],
        i = [];
    for (var a in Main.globalDictionary) n.push(a), i.push(Main.globalDictionary[a]);
    return new Function(n.toString(), '"use strict";return ' + e + ";").apply(null, i)
}, StepManager.createSimpleStep = function(t) {
    var e = new TotalComplete(function() {
            StepManager.nextStep()
        }),
        n = t.getAttribute("soundID");
    n && (Main.$viewer.trigger({
        type: PlayerEvents.STEP_STARTED,
        soundID: n
    }), Main.soundManager.play(n, e.onComplete(), ""), Main.soundManager.lastSound = n);
    for (var i = 0; i < t.childNodes.length; i++) !StepManager.isInvalidNode(t.childNodes[i]) && StepManager.checkCondition(t.childNodes[i]) && StepManager.createSubStep(t.childNodes[i], e.onComplete());
    e.start()
}, StepManager.createSubStep = function(t, e) {
    switch (t.nodeName) {
        case "show":
            StepManager.showStep(t, e);
            break;
        case "hide":
            StepManager.hideStep(t, e);
            break;
        case "shade":
            StepManager.shadeStep(t, e);
            break;
        case "unshade":
            StepManager.unshadeStep(t, e);
            break;
        case "animate":
            StepManager.animateStep(t, e);
            break;
        case "scale":
            StepManager.scaleStep(t, e);
            break;
        case "scale2":
            StepManager.scale2Step(t, e);
            break;
        case "showCounters":
            StepManager.showCountersStep(t, e);
            break;
        case "lightLamp":
            StepManager.lightLampStep(t, e);
            break;
        case "drop":
            StepManager.dropStep(t, e);
            break;
        case "dropDown":
            StepManager.dropDownStep(t, e);
            break;
        case "blind":
            StepManager.blindStep(t, e);
            break;
        case "showWTD":
            StepManager.showWTDStep(t, e);
            break;
        case "rotate":
            StepManager.rotateStep(t, e);
            break;
        case "rotate2":
            StepManager.rotate2Step(t, e);
            break;
        case "css":
            StepManager.updateCSSstep(t, e);
            break;
        case "turnOver":
            StepManager.turnOverStep(t, e);
            break;
        case "explode":
            StepManager.explodeStep(t, e);
            break;
        case "move":
            StepManager.moveStep(t, e);
            break;
        case "moveFrom":
            StepManager.moveFromStep(t, e);
            break;
        case "play":
            StepManager.playSoundStep(t, e);
            break;
        case "playVideo":
            StepManager.playVideoStep(t, e);
            break;
        case "highlight":
            StepManager.highlightStep(t, e);
            break;
        case "resetIndication":
            StepManager.resetIndicationStep(t, e);
            break;
        case "pointMarker":
            Main.marker.pointAction(t, e);
            break;
        case "underlineMarker":
            Main.marker.underlineAction(t, e);
            break;
        case "circleMarker":
            Main.marker.circleAction(t, e);
            break;
        case "replaceAnswerInput":
            StepManager.replaceAnswerInput(t, e);
            break;
        case "replaceAnswerToggle":
            StepManager.replaceAnswerToggle(t, e);
            break;
        case "clearControl":
            StepManager.clearControlStep(t, e);
            break;
        case "dndMove":
            StepManager.dndMove(t, e);
            break;
        case "gameAction":
            StepManager.gameAction(t, e);
            break;
        default:
            e()
    }
}, StepManager.getDelay = function(t) {
    return (t.hasAttribute("delay") ? Number(t.getAttribute("delay")) : 0) * Main.timeMultiplier
}, StepManager.getObject = function(t) {
    var e = $("#" + t);
    return 0 === e.length ? (console.warn("Unknown object with id=" + t), null) : e
}, StepManager.shadeStep = function(t, e) {
    var n = t.getAttribute("id"),
        i = StepManager.getDelay(t),
        a = StepManager.getObject(n);
    a ? setTimeout(function() {
        a.animate({
            opacity: .3
        }, {
            duration: 300,
            complete: e,
            queue: !1
        })
    }, i) : e()
}, StepManager.gameAction = function(t, e) {
    var n = StepManager.getDelay(t),
        i = $("#speedgame")[0];
    setTimeout(function() {
        i.contentWindow.Game.action(t, e)
    }, n)
}, StepManager.unshadeStep = function(t, e) {
    var n = t.getAttribute("id"),
        i = StepManager.getDelay(t),
        a = StepManager.getObject(n);
    a ? setTimeout(function() {
        a.animate({
            opacity: 1
        }, {
            duration: 300,
            complete: e,
            queue: !1
        })
    }, i) : e()
}, StepManager.distributeStepBetweenIDs = function(n, t) {
    var e = n.getAttribute("id"),
        i = new TotalComplete(t),
        a = n.hasAttribute("delay") ? Number(n.getAttribute("delay")) : 0,
        r = n.hasAttribute("stagger") ? Number(n.getAttribute("stagger")) : 0;
    e.split(",").forEach(function(t) {
        var e = n.cloneNode();
        e.setAttribute("id", t), e.setAttribute("delay", String(a)), a += r, StepManager.createSubStep(e, i.onComplete())
    }), i.start()
}, StepManager.showStep = function(t, e) {
    var n = t.getAttribute("id");
    if (1 < n.split(",").length) StepManager.distributeStepBetweenIDs(t, e);
    else {
        var i = StepManager.getDelay(t),
            a = t.hasAttribute("type") ? t.getAttribute("type") : "fadein",
            r = StepManager.getObject(n);
        r ? (!t.hasAttribute("type") && r.hasClass("counter") && (a = "jumpout"), setTimeout(function() {
            "jumpout" === a ? (r.css("opacity", 1), r.css("display", "none"), r.show({
                effect: "scale",
                easing: "easeOutBack",
                complete: e,
                queue: !1
            })) : (r.show(), r.css("visibility", "visible"), r.css("opacity", 0), r.animate({
                opacity: 1
            }, {
                duration: 500,
                complete: e,
                queue: !1
            }))
        }, i)) : e()
    }
}, StepManager.hideStep = function(t, a) {
    var e = t.getAttribute("id");
    if (1 < e.split(",").length) StepManager.distributeStepBetweenIDs(t, a);
    else {
        var n = StepManager.getDelay(t),
            r = !!t.hasAttribute("keepContent") && "true" === t.getAttribute("keepContent"),
            i = !!t.hasAttribute("disableDelete") && "true" === t.getAttribute("disableDelete"),
            o = StepManager.getObject(e);
        o ? (!o.is("input") || "radio" !== o.prop("type") && "checkbox" !== o.prop("type") || (o = o.parent()), setTimeout(function() {
            if (r)
                if (o.hasClass("dndTarget")) {
                    var i = o.find(".dndCard");
                    if (0 === i.length) return void s();
                    o.find(".crossLine").fadeOut(), i.unwrap(), i.animate({
                        backgroundColor: "rgba( 255, 255, 255, 0 )",
                        color: "#4F5C75",
                        borderColor: "rgba( 255, 255, 255, 0 )"
                    }, 500, function() {
                        var t = i.width();
                        i.css("width", "");
                        var e = i.width(),
                            n = (t - e) / 2;
                        i.css("padding-left", n), i.css("padding-right", n), i.animate({
                            padding: 0,
                            margin: 0,
                            border: 0
                        }, 300, a)
                    })
                } else o.find(".crossLine").fadeOut(), o.animate({
                    backgroundColor: "rgba( 255, 255, 255, 0 )",
                    color: "#4F5C75",
                    borderColor: "rgba( 255, 255, 255, 0 )"
                }, 500).animate({
                    padding: 0,
                    margin: 0,
                    border: 0
                }, 300, c);
            else s()
        }, n)) : a()
    }

    function s() {
        o.animate({
            opacity: 0
        }, {
            duration: 500,
            complete: u,
            queue: !1
        })
    }

    function c() {
        o.children().unwrap(), a()
    }

    function u() {
        if (i) a();
        else {
            var t = $('<span style="display: inline-block; width:50px; height: 50px; rgba(0,0,0,0) white-space: nowrap;"/>');
            t.width(o.outerWidth()), t.height(o.outerHeight()), o.replaceWith(t), t.animate({
                width: 0
            }, 300, function() {
                t.remove(), a()
            })
        }
    }
}, StepManager.animateStep = function(t, e) {
    var n = t.getAttribute("id"),
        i = StepManager.getDelay(t),
        a = t.hasAttribute("time") ? Number(t.getAttribute("time")) : .5,
        r = t.hasAttribute("easing") ? t.getAttribute("easing") : "swing",
        o = StepManager.getObject(n);
    if (o) {
        var s = {};
        if (t.hasAttribute("x") && (s.left = t.getAttribute("x")), t.hasAttribute("y") && (s.top = t.getAttribute("y")), t.hasAttribute("opacity") && (s.opacity = t.getAttribute("opacity")), t.hasAttribute("color")) {
            s.color = t.getAttribute("color");
            var c = o.hasClass("fracBar") ? o : o.find(".fracBar")
        }
        var u = {
            easing: r,
            duration: a * Main.timeMultiplier,
            queue: !1,
            complete: e
        };
        setTimeout(function() {
            c && c.length && c.animate({
                backgroundColor: s.color
            }, {
                easing: r,
                duration: a * Main.timeMultiplier,
                queue: !1
            });
            o.animate(s, u)
        }, i)
    } else e()
}, StepManager.scaleStep = function(t, e) {
    var n = t.getAttribute("id"),
        i = StepManager.getDelay(t),
        a = t.hasAttribute("time") ? Number(t.getAttribute("time")) : .5,
        r = t.getAttribute("scale"),
        o = "middle,center";
    t.hasAttribute("origin") && (o = t.getAttribute("origin"));
    var s = t.hasAttribute("easing") ? t.getAttribute("easing") : "swing";
    o = o.split(",");
    var c = StepManager.getObject(n);
    c ? setTimeout(function() {
        c.effect({
            effect: "scale",
            duration: a * Main.timeMultiplier,
            percent: 100 * r,
            origin: o,
            queue: !1,
            complete: e,
            easing: s
        })
    }, i) : e()
}, StepManager.scale2Step = function(t, e) {
    var n = t.getAttribute("id"),
        i = StepManager.getDelay(t),
        a = StepManager.getObject(n);
    if (a) {
        var r = t.hasAttribute("from") ? Number(t.getAttribute("from")) : -1,
            o = Number(t.getAttribute("scale")),
            s = t.hasAttribute("time") ? Number(t.getAttribute("time")) : .5,
            c = t.hasAttribute("easing") ? t.getAttribute("easing") : "swing",
            u = null;
        t.hasAttribute("origin") && (u = t.getAttribute("origin")), setTimeout(function() {
            u && a.css("transform-origin", u);
            r < 0 && (r = function() {
                var t = a.css("transform");
                if ("none" === t) return 1;
                var e = t.split("(")[1],
                    n = (e = (e = e.split(")")[0]).split(","))[0],
                    i = e[1];
                return Math.sqrt(n * n + i * i)
            }());
            var t = {
                easing: c,
                duration: s * Main.timeMultiplier,
                queue: !1,
                complete: p,
                step: function(t) {
                    a.css({
                        transform: "scale(" + t + ")"
                    })
                }
            };
            $({
                scale: r
            }).animate({
                scale: o
            }, t)
        }, i)
    } else e();

    function p() {
        a.css("transform", "scale(" + String(o) + ")"), e && e()
    }
}, StepManager.showCountersStep = function(t, e) {
    var n = t.getAttribute("id"),
        i = new TotalComplete(e),
        a = t.hasAttribute("delay") ? Number(t.getAttribute("delay")) : 0,
        r = t.hasAttribute("stagger") ? Number(t.getAttribute("stagger")) : .2;

    function o(t, e) {
        Main.soundManager.playSystemSound("counterblop"), t.css("opacity", 1), t.css("display", "none"), t.show({
            effect: "scale",
            easing: "easeOutBack",
            complete: e,
            queue: !1
        })
    }
    n.split(",").forEach(function(t) {
        var e = StepManager.getObject(t);
        if (e) {
            var n = i.onComplete();
            setTimeout(o, a * Main.timeMultiplier, e, n), a += r
        }
    }), i.start()
}, StepManager.lightLampStep = function(t, n) {
    var e = t.getAttribute("id"),
        i = StepManager.getDelay(t),
        a = StepManager.getObject(e);
    a ? setTimeout(function() {
        var t = $('<div class="rememberLampGradient"/>');
        Main.$viewer.append(t), t.position({
            my: "center",
            at: "left+55 top+55",
            of: a
        }), Main.soundManager.playSystemSound("rememberlamp");
        var e = $('<div class="rememberLamp"/>');
        Main.$viewer.append(e), e.position({
            my: "center",
            at: "left+54 top+55",
            of: a
        }), e.effect({
            effect: "scale",
            duration: 200,
            percent: 160,
            origin: ["bottom", "center"]
        }).effect({
            effect: "scale",
            duration: 200,
            percent: .625,
            origin: ["bottom", "center"]
        }), t.animate({
            opacity: .4
        }, {
            duration: 200,
            queue: !1
        }), t.effect({
            effect: "scale",
            duration: 200,
            percent: 400
        }).effect({
            effect: "scale",
            duration: 200,
            percent: 0,
            complete: function() {
                t.remove(), e.remove(), n()
            }
        })
    }, i) : n()
}, StepManager.dropStep = function(t, e) {
    var n = t.getAttribute("id"),
        i = StepManager.getDelay(t),
        a = StepManager.getObject(n);
    if (a) {
        var r = 1;
        setTimeout(function() {
            r = Math.max(a.width(), a.height()), a.css("opacity", 1), a.css("display", "none"), a.show(), a.effect({
                effect: "scale",
                duration: 0,
                percent: 200
            }).effect({
                effect: "scale",
                duration: 300,
                percent: 50
            }), setTimeout(o, .1 * Main.timeMultiplier)
        }, i)
    } else e();

    function o() {
        var t = $('<div class="cloud"/>');
        a.before(t), t.width(r), t.height(r), t.position({
            my: "center",
            at: "center",
            of: a
        }), t.effect({
            effect: "scale",
            duration: 300,
            percent: 250,
            queue: !1
        }), t.animate({
            opacity: 0
        }, {
            duration: 300,
            complete: function() {
                t.remove(), e()
            }
        }), Main.soundManager.playSystemSound("dropdown")
    }
}, StepManager.dropDownStep = function(t, e) {
    var n = t.getAttribute("id"),
        i = StepManager.getDelay(t),
        a = StepManager.getObject(n);

    function r() {
        a.animate({
            top: "+=900"
        }, {
            duration: 500,
            queue: !1,
            easing: "easeInCubic",
            complete: e
        })
    }
    a ? setTimeout(function() {
        a.css("transform-origin", "90% 10%"), Effects.rotate2(a, 0, -70, {
            easing: "easeOutBack",
            duration: .5 * Main.timeMultiplier,
            queue: !1,
            complete: r
        })
    }, i) : e()
}, StepManager.blindStep = function(t, e) {
    var n = t.getAttribute("id"),
        i = StepManager.getDelay(t),
        a = t.hasAttribute("direction") ? t.getAttribute("direction") : "right",
        r = t.hasAttribute("easing") ? t.getAttribute("easing") : "swing",
        o = t.hasAttribute("time") ? Number(t.getAttribute("time")) : .5,
        s = StepManager.getObject(n);
    s ? setTimeout(function() {
        s.toggle({
            effect: "blind",
            direction: a,
            queue: !1,
            easing: r,
            duration: o * Main.timeMultiplier,
            complete: e
        })
    }, i) : e()
}, StepManager.showWTDStep = function(t, e) {
    var n = t.getAttribute("id"),
        i = t.hasAttribute("part") ? t.getAttribute("part") : "both",
        a = StepManager.getDelay(t),
        r = StepManager.getObject(n);
    if (r) {
        var o = r.find("div.wtdPencil");
        if (0 === o.length) return console.warn("showWTD error. Object " + n + " is not WTD"), void e();
        setTimeout(function() {
            "pencil" === i ? s() : (o.hide(), r.show("fold", {}, 500, "popup" === i ? e : s))
        }, a)
    } else e();

    function s() {
        o.show(), o.css("opacity", 0), o.animate({
            opacity: 1
        }, {
            duration: 300,
            queue: !1
        }), o.animate({
            left: "+=200",
            top: "-=200"
        }, {
            duration: 0
        }).animate({
            left: "-=200",
            top: "+=200"
        }, {
            duration: 300,
            easing: "easeInCubic",
            complete: c
        })
    }

    function c() {
        o.css("transform-origin", "0% 100%"), Effects.rotate2(o, 0, -30, {
            easing: "easeOutSine",
            duration: 200,
            complete: u
        })
    }

    function u() {
        Effects.rotate2(o, -30, 0, {
            easing: "easeOutBack",
            complete: e,
            duration: 300
        })
    }
}, StepManager.turnOverStep = function(t, e) {
    var n = t.getAttribute("id"),
        i = StepManager.getDelay(t),
        a = t.hasAttribute("direction") ? t.getAttribute("direction") : "right",
        r = StepManager.getObject(n);
    if (r) {
        var o, s, c, u = {
            queue: !1,
            easing: "easeInOutSine",
            duration: .6 * Main.timeMultiplier,
            complete: function() {
                r.css("transform-origin", ""), r.css("transform", ""), e()
            }
        };
        switch (a) {
            case "down":
                s = "50% 0%", c = 90;
                break;
            case "up":
                s = "50% 100%", c = -90;
                break;
            case "left":
                s = "100% 50%", c = 90;
                break;
            default:
                s = "0% 50%", c = -90
        }
        u.step = function(t) {
            switch (a) {
                case "down":
                case "up":
                    o = "rotateX(" + t + "deg)";
                    break;
                default:
                    o = "rotateY(" + t + "deg)"
            }
            r.css({
                transform: o
            })
        }, setTimeout(function() {
            switch (r.css("transform-origin", s), r.show(), r.css("visibility", "visible"), r.css("opacity", 1), a) {
                case "left":
                    r.css("left", String(parseInt(r.css("left")) + 500) + "px"), r.animate({
                        left: "-=500"
                    }, {
                        queue: !1,
                        easing: u.easing,
                        duration: u.duration
                    });
                    break;
                case "up":
                    r.css("top", String(parseInt(r.css("left")) + 300) + "px"), r.animate({
                        top: "-=300"
                    }, {
                        queue: !1,
                        easing: u.easing,
                        duration: u.duration
                    });
                    break;
                case "down":
                    r.css("top", String(parseInt(r.css("left")) - 500) + "px"), r.animate({
                        top: "+=500"
                    }, {
                        queue: !1,
                        easing: u.easing,
                        duration: u.duration
                    });
                    break;
                default:
                    r.css("left", String(parseInt(r.css("left")) - 500) + "px"), r.animate({
                        left: "+=500"
                    }, {
                        queue: !1,
                        easing: u.easing,
                        duration: u.duration
                    })
            }
            $({
                deg: c
            }).animate({
                deg: 0
            }, u)
        }, i)
    } else e()
}, StepManager.explodeStep = function(t, e) {
    var n = t.getAttribute("id"),
        i = StepManager.getDelay(t),
        a = StepManager.getObject(n);
    if (a) {
        var r = 1;
        setTimeout(function() {
            Main.soundManager.playSystemSound("fireworks"), r = Math.max(a.width(), a.height()), a.hide({
                effect: "explode"
            }), t = $('<div class="cloud"/>'), a.before(t), t.width(r), t.height(r), t.position({
                my: "center",
                at: "center",
                of: a
            }), t.effect({
                effect: "scale",
                duration: 300,
                percent: 250,
                queue: !1
            }), t.animate({
                opacity: 0
            }, {
                duration: 300,
                complete: function() {
                    t.remove(), e()
                }
            });
            var t
        }, i)
    } else e()
}, StepManager.moveStep = function(t, n) {
    var e = t.getAttribute("id"),
        i = StepManager.getDelay(t),
        a = StepManager.getObject(e);
    if (a) {
        var r = t.hasAttribute("time") ? Number(t.getAttribute("time")) : .5,
            o = t.hasAttribute("easing") ? t.getAttribute("easing") : "swing",
            s = t.hasAttribute("my") ? t.getAttribute("my") : "center",
            c = t.hasAttribute("at") ? t.getAttribute("at") : "center",
            u = t.getAttribute("of"),
            p = $("#" + u);
        setTimeout(function() {
            var t = a.offset();
            a.position({
                my: s,
                at: c,
                of: p
            });
            var e = {
                left: a.css("left"),
                top: a.css("top")
            };
            a.offset(t), a.animate({
                left: e.left,
                top: e.top
            }, {
                duration: r * Main.timeMultiplier,
                queue: !1,
                easing: o,
                complete: n
            })
        }, i)
    } else n()
}, StepManager.moveFromStep = function(t, e) {
    var n = t.getAttribute("id"),
        i = StepManager.getDelay(t),
        a = StepManager.getObject(n);
    if (a) {
        var r = t.hasAttribute("time") ? Number(t.getAttribute("time")) : .5,
            o = t.hasAttribute("fontSize") ? parseInt(t.getAttribute("fontSize")) : null,
            s = t.hasAttribute("easing") ? t.getAttribute("easing") : "swing",
            c = t.hasAttribute("my") ? t.getAttribute("my") : "center",
            u = t.hasAttribute("at") ? t.getAttribute("at") : "center",
            p = t.getAttribute("from"),
            l = $("#" + p);
        setTimeout(function() {
            a.show();
            var t = a.position();
            o && (t.fontSize = parseInt(a.css("font-size")), a.css("font-size", o + "px"));
            a.position({
                my: c,
                at: u,
                of: l
            }), a.animate(t, {
                duration: r * Main.timeMultiplier,
                queue: !1,
                easing: s,
                complete: e
            })
        }, i)
    } else e()
}, StepManager.rotateStep = function(t, e) {
    var n = t.getAttribute("id"),
        i = StepManager.getDelay(t),
        a = StepManager.getObject(n);
    if (a) {
        var r = Number(t.getAttribute("angle")),
            o = t.hasAttribute("time") ? Number(t.getAttribute("time")) : .5,
            s = t.hasAttribute("easing") ? t.getAttribute("easing") : "swing",
            c = null;
        t.hasAttribute("origin") && (c = t.getAttribute("origin"));
        var u = 0,
            p = $("<div/>");
        setTimeout(function() {
            u = function() {
                var t = a.css("transform");
                if ("none" === t) return 0;
                var e = t.split("(")[1],
                    n = (e = (e = e.split(")")[0]).split(","))[0],
                    i = e[1];
                return Math.sqrt(n * n + i * i), Math.round(Math.atan2(i, n) * (180 / Math.PI))
            }(), c && a.css("transform-origin", c);
            p.css("opacity", 0);
            var t = {
                easing: s,
                duration: o * Main.timeMultiplier,
                queue: !1,
                complete: e,
                step: l
            };
            p.animate({
                opacity: 1
            }, t)
        }, i)
    } else e();

    function l() {
        a.css("transform", "rotate(" + String(u + r * Number(p.css("opacity"))) + "deg)")
    }
}, StepManager.rotate2Step = function(t, e) {
    var n = t.getAttribute("id"),
        i = StepManager.getDelay(t),
        a = StepManager.getObject(n);
    if (a) {
        var r = t.hasAttribute("from") ? Number(t.getAttribute("from")) : 0,
            o = Number(t.getAttribute("to")),
            s = t.hasAttribute("time") ? Number(t.getAttribute("time")) : .5,
            c = t.hasAttribute("easing") ? t.getAttribute("easing") : "swing",
            u = null;
        t.hasAttribute("origin") && (u = t.getAttribute("origin")), setTimeout(function() {
            u && a.css("transform-origin", u);
            Effects.rotate2(a, r, o, {
                easing: c,
                duration: s * Main.timeMultiplier,
                queue: !1,
                complete: e
            })
        }, i)
    } else e()
}, StepManager.updateCSSstep = function(t, e) {
    var n = t.getAttribute("id"),
        i = StepManager.getDelay(t),
        a = StepManager.getObject(n);
    if (a) {
        var r = t.getAttribute("style").split(";");
        setTimeout(function() {
            r.forEach(function(t) {
                var e = t.split(":");
                e && 2 === e.length && a.css(e[0].trim(), e[1].trim())
            }), e()
        }, i)
    } else e()
}, StepManager.playSoundStep = function(t, e) {
    var n = t.getAttribute("id"),
        i = StepManager.getDelay(t),
        a = !!t.hasAttribute("background") && "true" === t.getAttribute("background");
    setTimeout(function() {
        a ? (Main.soundManager.playBackgroundSound(n, "effect_"), e()) : Main.soundManager.play(n, e, "effect_")
    }, i)
}, StepManager.playVideoStep = function(t, e) {
    var n = t.getAttribute("id"),
        i = StepManager.getDelay(t);
    setTimeout(function() {
        var t = $("#" + n);
        t.on("ended", e), t[0].play()
    }, i)
}, StepManager.highlightStep = function(t, e) {
    var n = t.getAttribute("id"),
        i = StepManager.getDelay(t),
        a = t.hasAttribute("color") ? t.getAttribute("color") : "#FFFF00",
        r = !t.hasAttribute("marker") || "true" === t.getAttribute("marker"),
        o = StepManager.getObject(n);
    if (o) {
        var s = new TotalComplete(function() {
            e()
        });
        r && Main.marker.pointAction(t, s.onComplete()), setTimeout(function() {
            o.animate({
                backgroundColor: a
            }, {
                duration: 500,
                queue: !1,
                complete: s.onComplete()
            }), s.start()
        }, i)
    } else e()
}, StepManager.resetIndicationStep = function(t, e) {
    var n = t.getAttribute("id"),
        i = StepManager.getDelay(t),
        a = StepManager.getObject(n);
    a ? setTimeout(function() {
        a.animate({
            backgroundColor: "rgba( 255, 255, 255, 0 )"
        }, {
            duration: 500,
            queue: !1,
            complete: e
        })
    }, i) : e()
}, StepManager.replaceAnswerInput = function(t, r) {
    var o = t.getAttribute("id");
    if (Main.controls[o] && "fraction" === Main.controls[o].type) StepManager.replaceAnswerFraction(t, r);
    else {
        var e = StepManager.getDelay(t),
            s = $("#" + o),
            c = parseInt(s.css("font-size")),
            u = c,
            p = void 0;
        t.hasAttribute("positionObject") && (p = $("#" + t.getAttribute("positionObject")), u = parseInt(p.css("font-size")));
        var l = Main.globalDictionary[o],
            n = s.is("select") ? l.correctAnswer : l.correctAnswer.replace("-", "−"),
            d = $("<span>" + n + "</span>");
        d.css("font-size", c), d.css("white-space", "nowrap");
        var h = {};
        setTimeout(function() {
            var t = s.offset();
            d.addClass(l.correct ? "replaceInputCorrect" : "replaceInputIncorrect"), Main.$viewer.append(d);
            var e = s.outerWidth(),
                n = d.outerWidth(),
                i = s.outerHeight(),
                a = d.outerHeight();
            Main.$viewer.offset();
            l.correct ? (d.css("padding-left", String((e - n) / 2) + "px"), d.css("padding-right", String((e - n) / 2) + "px"), h = {
                top: t.top + i / 2 - a / 2,
                left: t.left
            }) : (h = {
                top: t.top + i / 2 - a / 2,
                left: t.left + e / 2 - n / 2
            }, d.offset(h), h = {
                top: d.css("top"),
                left: d.css("left")
            });
            l.correct && s.is("select") && (d.css("padding-left", "13px"), d.css("padding-right", String(e - n - 13) + "px"));
            p && (t = p.offset(), e = p.outerWidth(), i = p.outerHeight(), {
                top: t.top + i / 2 - a / 2,
                left: t.left + e / 2 - n / 2
            });
            l.incorrect && p ? (d.css("font-size", u), d.position({
                my: "center",
                at: "center",
                of: p
            })) : s.is("input") ? d.position({
                my: "center",
                at: "center",
                of: s
            }) : d.position({
                my: "left center",
                at: "left center",
                of: s
            });
            l.correct ? s.animate({
                opacity: 0
            }, 400, function() {
                s.after(d), d.css("position", "static"), s.remove(), d.animate({
                    paddingLeft: 0,
                    paddingRight: 0
                }, 300, r)
            }) : function() {
                var e = {
                        padding: "+=10",
                        left: "-=10",
                        top: "-=10",
                        borderTopLeftRadius: "+=10",
                        borderTopRightRadius: "+=10",
                        borderBottomLeftRadius: "+=10",
                        borderBottomRightRadius: "+=10"
                    },
                    n = {
                        padding: "-=10",
                        left: "+=10",
                        top: "+=10",
                        borderTopLeftRadius: "-=10",
                        borderTopRightRadius: "-=10",
                        borderBottomLeftRadius: "-=10",
                        borderBottomRightRadius: "-=10"
                    };
                d.hide().fadeIn().animate(e, 300).animate(n, 300, p ? function() {
                    var t = {
                        left: h.left,
                        top: h.top,
                        fontSize: c
                    };
                    d.animate(t, 400).animate(e, 300).animate(n, 300, i), s.delay(500).animate({
                        opacity: 0
                    }, 400)
                } : i), p || s.delay(500).animate({
                    opacity: 0
                }, 400);

                function i() {
                    Main.controls[o].clear(), s.after(d), d.css("position", "static"), d.css("background-color", "transparent");
                    var t = s.outerWidth(),
                        e = d.outerWidth(),
                        n = (t - e) / 2;
                    d.css("padding-right", String(30 + n) + "px"), d.css("padding-left", String(30 + n) + "px"), s.remove(), d.animate({
                        padding: 0
                    }, 300, r)
                }
            }()
        }, e)
    }
}, StepManager.replaceAnswerFraction = function(t, g) {
    var f = t.getAttribute("id"),
        m = Main.globalDictionary[f],
        e = StepManager.getDelay(t),
        b = Main.controls[f],
        M = void 0,
        v = $("#" + f);
    t.hasAttribute("positionObject") && (M = $("#" + t.getAttribute("positionObject")));
    var y = {};
    setTimeout(function() {
        if (m.correct) {
            var t = b.getInputsArray(),
                e = b.correctAnswer.split("|");
            v.find(".fracCorrect").remove();
            for (var n = 0; n < t.length; n++) {
                var i = $("<span>" + e[n] + "</span>");
                i.addClass("replaceInputCorrect");
                var a = t[n];
                Main.$viewer.append(i);
                var r = a.outerWidth(),
                    o = i.outerWidth();
                i.css("font-size", a.css("font-size")), i.css("padding-right", String((r - o) / 2) + "px"), i.css("padding-left", String((r - o) / 2) + "px"), i.position({
                    my: "center",
                    at: "center",
                    of: a
                }), s(a, i)
            }

            function s(t, e) {
                t.animate({
                    opacity: 0
                }, 400, function() {
                    t.after(e), e.css("font-size", ""), e.css("position", "static"), t.remove(), e.prop("id", t.prop("id")), e.animate({
                        padding: 0
                    }, 300, g)
                })
            }
        } else {
            var c = $('<span class="frac">' + b.correctAnswer + "</span>"),
                u = parseInt(v.css("font-size"));
            Main.$viewer.append(c);
            var p = new CommonFraction(c);
            (c = c.parent()).addClass("replaceFractionIncorrect"), c.css("font-size", u), c.position({
                my: "center",
                at: "center",
                of: v
            }), y = c.position();
            var l = {
                    padding: "+=10",
                    left: "-=10",
                    top: "-=10",
                    borderTopLeftRadius: "+=10",
                    borderTopRightRadius: "+=10",
                    borderBottomLeftRadius: "+=10",
                    borderBottomRightRadius: "+=10"
                },
                d = {
                    padding: "-=10",
                    left: "+=10",
                    top: "+=10",
                    borderTopLeftRadius: "-=10",
                    borderTopRightRadius: "-=10",
                    borderBottomLeftRadius: "-=10",
                    borderBottomRightRadius: "-=10"
                };

            function h() {
                v.after(c), c.css("position", "static"), c.css("background-color", "transparent");
                var t = v.outerWidth(),
                    e = c.outerWidth(),
                    n = (t - e) / 2;
                c.css("padding-right", String(10 + n) + "px"), c.css("padding-left", String(10 + n) + "px"), v.remove(), c.prop("id", v.prop("id")), c.animate({
                    padding: 0
                }, 300, g), p.id = f, p.writeIDs()
            }
            M && (c.css("font-size", M.css("font-size")), c.position({
                my: "center",
                at: "center",
                of: M
            })), c.hide().fadeIn().animate(l, 300).animate(d, 300, M ? function() {
                var t = {
                    left: y.left,
                    top: y.top,
                    fontSize: u
                };
                c.animate(t, 400).animate(l, 300).animate(d, 300, h), v.delay(500).animate({
                    opacity: 0
                }, 400)
            } : h)
        }
    }, e)
}, StepManager.replaceAnswerToggle = function(t, n) {
    var e = t.getAttribute("id"),
        i = StepManager.getDelay(t),
        a = Main.controls[e];
    if (Main.globalDictionary[e].correct) n();
    else {
        var r = a.correctAnswer.split(",");
        setTimeout(function() {
            a.clear(), a.updateAllSkins(), o()
        }, i)
    }

    function o() {
        var t = r.shift();
        if (t) {
            var e = $("#" + t);
            Main.marker.toggleControl(e, o)
        } else Main.marker.fadeOut(n)
    }
}, StepManager.dndMove = function(t, o) {
    var e = t.getAttribute("id"),
        n = Main.globalDictionary[e],
        i = StepManager.getDelay(t),
        s = Main.controls[e];

    function a() {
        for (var t = new TotalComplete(o), e = s.correctAnswer.split(","), n = 300, i = 0; i < e.length; i++) {
            var a = s.getCardByID(e[i]);
            if (a && !a.prop("target")) {
                var r = s.targets[i];
                setTimeout(c, n, a), setTimeout(s.dropCarToStage, n, a), setTimeout(s.moveCardToTarget, n, a, r, u(a, t.onComplete())), n += 200
            }
        }
        t.start()
    }

    function c(t) {
        t.removeClass(), t.addClass("dndCard dndCardActive")
    }

    function u(e, n) {
        return function() {
            var t;
            (t = e).removeClass(), t.addClass("dndCard dndCardDisabled"), n()
        }
    }
    n.correct ? o() : setTimeout(function() {
        var t = s.getIcorrectCrads();
        if (!t.length) return void a();
        for (var e = new TotalComplete(a), n = 0, i = 0; i < t.length; i++) setTimeout(c, n, t[i]), setTimeout(s.dropCarToStage, n, t[i]), setTimeout(s.moveCardToWetplace, n, t[i], u(t[i], e.onComplete())), n += 200;
        e.start()
    }, i)
}, StepManager.clearControlStep = function(t, e) {
    var n = t.getAttribute("id"),
        i = StepManager.getDelay(t),
        a = Main.controls[n];
    setTimeout(function() {
        a.clear(), "updateAllSkins" in a && a.updateAllSkins();
        e()
    }, i)
}, StepManager.createSubmitStep = function(o) {
    var e = o.getAttribute("id"),
        i = !o.hasAttribute("eval") || "true" === o.getAttribute("eval"),
        t = !!o.hasAttribute("disableReplay") && "true" === o.getAttribute("disableReplay"),
        a = !0,
        r = !1,
        s = [],
        c = new Date;

    function u() {
        s.forEach(function(t) {
            t.enable()
        }), Main.$submitButton.one("click", n), Main.$viewer.trigger({
            type: PlayerEvents.SHOW_SUBMIT_BUTTON,
            disableReplay: t
        })
    }

    function n() {
        Main.$submitButton.off("click"), s.forEach(function(t) {
            t.disable()
        }), document.activeElement && document.activeElement.blur(), Main.soundManager.hideReplayButton(), Main.soundManager.playSystemSound("radiotoggle"), Main.hideSubmitButton(p)
    }

    function p() {
        r = !(a = !0);
        var n = {};
        if (s.forEach(function(t) {
                var e = t.check();
                console.log("Control: " + t.id, e), n[t.id] = e, (Main.globalDictionary[t.id] = e).noresponse ? a = !(r = !0) : e.incorrect && (a = !1)
            }), Main.globalDictionary[e] = new ReturnType(a, r), console.log("Question", e, "isCorrect", a, "NR", r), r) Main.$viewer.css("opacity", .5), $("#noresponse-bubble").show({
            effect: "scale",
            easing: "easeOutBack"
        }).delay(1e3).hide({
            effect: "puff",
            complete: function() {
                Main.$viewer.css("opacity", 1), u()
            }
        });
        else if (Main.$viewer.trigger({
                type: PlayerEvents.ANSWER_ACCEPTED,
                ID: e,
                correct: a,
                answer: n,
                mainID: Main.UID,
                time: new Date - c
            }), i) {
            s.forEach(function(t) {
                t.cross()
            });
            var t = a ? $("#correct-bubble") : $("#incorrect-bubble");
            Main.soundManager.playResponse(a), Main.soundManager.lastSound = null, t.fadeIn(500).delay(Main.timeMultiplier).fadeOut(500, StepManager.nextStep)
        } else StepManager.nextStep()
    }! function() {
        for (var t = o.getElementsByTagName("controls")[0].childNodes, e = 0; e < t.length; e++) {
            var n, i = t[e];
            switch (i.nodeName) {
                case "control":
                    var a = i.getAttribute("id"),
                        r = $("#" + a);
                    Main.controls[a] ? "setParams" in (n = Main.controls[a]) && n.setParams(i) : !r.is("input") || "number" !== r.attr("type") && "text" !== r.attr("type") ? r.is("select") && (n = new ListboxControl(i)) : n = new InputControl(i);
                    break;
                case "radioControl":
                    n = new RadioControl(i);
                    break;
                case "checkboxControl":
                    n = new CheckboxControl(i);
                    break;
                case "chooseControl":
                    n = new ChooseControl(i);
                    break;
                case "dndControl":
                    n = new DNDControl(i);
                    break;
                default:
                    continue
            }
            n && (s.push(n), Main.controls[n.id] = n)
        }
    }(), u()
}, $(function() {
    $("body").on(PlayerEvents.SOUNDS_LOADED, function t() {
        console.log("Initial loading completed.");
        $("body").off(PlayerEvents.SOUNDS_LOADED, t);
        Main.status = PlayerEvents.FRAME_INITIALISED;
        $("body").trigger(PlayerEvents.FRAME_INITIALISED);
        parent && parent.$("body").trigger(PlayerEvents.FRAME_INITIALISED);
        try {
            console.log("problemXMLUrl", problemXMLUrl), Main.autoStart = !0, Main.loadXML(problemXMLUrl)
        } catch (t) {}
    }), Main.init()
});
var ArrayUtils = {
        removeObjectFromArray: function(t, e) {
            for (var n = 0; n < e.length; n++)
                if (e[n] === t) return e.splice(n, 1), !0;
            return !1
        }
    },
    MathUtils = {
        clamp: function(t, e, n) {
            return t < e ? e : n < t ? n : t
        },
        randRange: function(t, e) {
            return t + Math.random() * (e - t)
        },
        roundRandRange: function(t, e) {
            return Math.round(MathUtils.randRange(t, e))
        }
    },
    Effects = {};

function Rectangle(t, e, n, i) {
    this.x = 0, this.y = 0, this.width = 0, this.height = 0, this._set = function(t, e, n, i) {
        return this.x = t, this.y = e, this.width = n, this.height = i, this
    }, this.getArea = function() {
        return this.width * this.height
    }, this.isEmpty = function() {
        return 0 === this.width || 0 === this.height
    }, this.intersect = function(t) {
        var e = Math.max(this.x, t.x),
            n = Math.max(this.y, t.y);
        return new Rectangle(e, n, Math.min(this.x + this.width, t.x + t.width) - e, Math.min(this.y + this.height, t.y + t.height) - n)
    }, this.toString = function() {
        return "{ x: " + this.x + ", y: " + this.y + ", width: " + this.width + ", height: " + this.height + " }"
    }, this.union = function(t) {
        var e = Math.min(this.x, t.x),
            n = Math.min(this.y, t.y);
        return new Rectangle(e, n, Math.max(this.x + this.width, t.x + t.width) - e, Math.max(this.y + this.height, t.y + t.height) - n)
    }, this.getRight = function() {
        return this.x + this.width
    }, this.getBottom = function() {
        return this.y + this.height
    }, this.getCenterX = function() {
        return this.x + this.width / 2
    }, this.getCenterY = function() {
        return this.y + this.height / 2
    };
    var a = typeof t;
    "number" === a ? this._set(t, e, n, i) : "undefined" === a || null === t ? this._set(0, 0, 0, 0) : 1 === arguments.length && (Array.isArray(t) ? this._set.apply(this, t) : void 0 === t.x && void 0 === t.width || this._set(t.x || 0, t.y || 0, t.width || 0, t.height || 0))
}
Effects.rotate2 = function(e, t, n, i) {
    i.step = function(t) {
        e.css({
            transform: "rotate(" + t + "deg)"
        })
    };
    var a = i.complete;
    i.complete = function() {
        e.css("transform", "rotate(" + String(n) + "deg)"), a && a()
    }, $({
        deg: t
    }).animate({
        deg: n
    }, i)
};