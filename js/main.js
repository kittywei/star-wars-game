(function () {
    var planes = {
        'normal': '<div class="enemy enemy-normal"><span class="icon-plane2"></span></div>',
        'strong': '<div class="enemy enemy-strong"><span class="icon-plane2"></span></div>'
    },
        grText = {
            'done': 'Well done!',
            'gameOver': 'Game Over!',
            'ready': 'Are you ready?',
            'how': '<span class="small">Press keyboard "A" and "D" to control the plane moving left and right. <br><br>Eliminate an enemy you will earn 100 points. <br>If your plane is hit by enemy, game over! <br><br>There are two levels in total.</span>',
            'levelText1': 'Level 1 <br> Well done!',
            'levelText2': 'Level 2 <br> Congratulations!'
        },
        bulletItem = '<span class="bullet-item"></span>',
        buttons = [
            {
                'next': '<div id="btn-next" class="button">Next</div>'
                }
            ],
        gameObj = $('#game'),
        planeCtrlObj = $('#plane-control'),
        pcoLeft = parseInt(planeCtrlObj.css('left')),
        pcoTop = parseInt(planeCtrlObj.css('top')),
        pcoWidth = parseInt(planeCtrlObj.width()),
        bulletObj = $('#bullet-control'),
        gameObjWidth = gameObj.width(),
        pcMaxLeft = gameObjWidth - planeCtrlObj.width() + 20,
        planedropInterval = null,
        planeCtrlInterval = null,
        bulletInterval = null,
        detectInterval = null,
        timerInterval = null,
        bulletDropSpeed = 1500,
        bulletAddSpeed = 200,
        detectSpeed = 80,
        PCSPEED = 5,
        checkSelfDie = false,
        last_keypress = -1,
        score = 0,
        planeNumTotal = 0,
        levelOptions = {
            lv1: {
                planeNum: 20,
                planesAddSpeed: 1000,
                planesDropSpeed: 8000
            },
            lv2: {
                planeNum: 50,
                planesAddSpeed: 600,
                planesDropSpeed: 4000
            }
        };
        

    //game
    function GameMain() {

        this.clearplaneCtrl = function () {
            clearInterval(planeCtrlInterval);
        };
        this.clearplaneDrop = function () {
            clearInterval(planedropInterval);
        };
        this.clearAllInterval = function () {
            clearInterval(planedropInterval);
            clearInterval(planeCtrlInterval);
            clearInterval(bulletInterval);
            clearInterval(detectInterval);
            clearInterval(timerInterval);
        };

        this.init = function () {
            this.clearAllInterval();
            planedropInterval = planeCtrlInterval = bulletInterval = detectInterval = timerInterval = null;
            last_keypress = -1;
            score = 0;
            checkSelfDie = false;
            pcoLeft = 200;
            planeNumTotal = 1;
            bulletObj.empty();
            planeCtrlObj.removeClass('died').removeAttr('style');
            $('.enemy').remove();
            $('#pop-text').html(grText.ready);
            $('#score').html(score);
            $('#game-result').hide(0);
            $('#game-ready').show(0);
            $('#btn-how').show(0);
            $('#btn-next').remove();
        };

        this.timer = function (text, button, planeNum, planesAddSpeed) {
            var self = this;
            timerInterval = setInterval(function () {
                if (planeNumTotal >= planeNum) {
                    self.clearplaneDrop();
                    if(parseInt(gameObj.children().last().css('top')) >= 620 || gameObj.children('.enemy').length <= 0){
                        self.levelPop(text, button);
                    }
                }
            }, planesAddSpeed);
        };

        this.levelPop = function (text, button) {
            this.clearAllInterval();
            $('#gr-text').html(text);
            $('#gr-score').html(score);
            $('#btn-finish').before(button);
            $('#game-result').fadeIn(300);
        };

        this.how = function () {
            $('#pop-text').html(grText.how);
            $('#btn-how').hide();
        };

        this.planeDrop = function (planesDropSpeed, planesAddSpeed) {
            planedropInterval = setInterval(function () {
                gameObj.append(planes.normal);
                var maxLeft = gameObjWidth - gameObj.children().last('.enemy').width() - 15;
                var randLeft = parseInt(Math.random() * (maxLeft - 0 + 1) + 0);
                gameObj.children().last('.enemy').css({
                    'left': randLeft
                }).animate({
                    'top': '620px'
                }, planesDropSpeed);
                planeNumTotal++;
            }, planesAddSpeed);

        };

        this.bulletCtrl = function () {
            var self = this;
            bulletInterval = setInterval(function () {
                bulletObj.append(bulletItem);
                bulletObj.children().last('.bullet-item').css({
                    'left': pcoLeft + 37
                }).animate({
                    'top': '-10px'
                }, bulletDropSpeed, 'linear', function () {
                    $(this).remove();
                });
            }, bulletAddSpeed);
            detectInterval = setInterval(function () {
                bulletObj.children('.bullet-item').each(function () {
                    var bulletTop = parseInt($(this).position().top);
                    var bulletLeft = parseInt($(this).position().left);
                    var bulletThis = this;
                    var pcLeft = planeCtrlObj.position().left;

                    gameObj.children('.enemy').each(function () {
                        var planeTop = parseInt($(this).position().top);
                        var planeLeft = parseInt($(this).position().left);
                        var planeWidth = parseInt($(this).width());
                        var planeHeight = parseInt($(this).height());

                        self.recordMove(bulletLeft, bulletTop, planeLeft, planeTop, planeWidth, planeHeight, bulletThis, this, pcLeft);
                    });
                });
            }, detectSpeed);

        };

        this.recordMove = function (bx, by, px, py, pw, ph, bthis, pthis, pcLeft) {
            //bx: 子弹x坐标, by:子弹y坐标, px: 敌机x坐标, py: 敌机y坐标, pw: 敌机宽, ph: 敌机高, pxe: 敌机x坐标加上本身的宽度, pye: 敌机y坐标加上本身的高度
            var pxe = px + pw + 5;
            var pye = py + ph;
            var pce = pcLeft + pcoWidth - 20;
            if (bx > px && bx < pxe && by > py && by < pye) { //判断位置是否有交集
                bthis.remove();
                pthis.remove();
                score += 100;
                $('#score').html(score);
            }
            if (pxe > pcLeft && px < pce && py > pcoTop + 10 && py < 490) { //判断位置敌机是否撞到机身
                planeCtrlObj.addClass('died');
                this.gameEnd();
                checkSelfDie = true;
            }

        };

        this.planeControl = function () {
            var self = this;
            $(window).keydown(function (event) {
                if (event.keyCode === last_keypress) { //持续按住
                    return false;
                }
                self.clearplaneCtrl();
                if (event.keyCode === 65) {
                    planeCtrlInterval = setInterval(function () {
                        planeCtrlObj.css({
                            'left': '-=' + PCSPEED
                        });
                        if (planeCtrlObj.position().left <= -20) {
                            planeCtrlObj.css({
                                'left': '-20px'
                            });
                        }
                        pcoLeft = parseInt(planeCtrlObj.css('left'));
                    }, 20);
                }
                if (event.keyCode === 68) {
                    planeCtrlInterval = setInterval(function () {
                        planeCtrlObj.css({
                            'left': '+=' + PCSPEED
                        });
                        if (planeCtrlObj.position().left >= pcMaxLeft) {
                            planeCtrlObj.css({
                                'left': pcMaxLeft
                            });
                        }
                        pcoLeft = parseInt(planeCtrlObj.css('left'));
                    }, 20);
                }

                last_keypress = event.keyCode;
            });
            $(window).keyup(function () {
                last_keypress = -1;
                self.clearplaneCtrl();
            });
        };

        this.start = function (text, button, planeNum, planesAddSpeed, planesDropSpeed, stscore) {
            this.init();
            score = stscore;
            $('#game-ready').hide(0);
            $('#score').html(score);
            $('.enemy').removeAttr('style');
            this.timer(text, button, planeNum, planesAddSpeed);
            this.planeDrop(planesDropSpeed, planesAddSpeed);
            this.bulletCtrl();
            this.planeControl();
            console.log(score);
        };

        this.gameEnd = function () {
            var self = this;
            this.clearAllInterval();
            gameObj.children().stop();
            bulletObj.children().stop();
            $('#gr-text').html(grText.gameOver);
            $('#gr-score').html(score);
            $('#game-result').fadeIn(300);
            $('#btn-next').remove();
        };
    }

    var game = new GameMain();

    //call
    game.init();
    $('body').on('click', '#btn-start', function () {
        game.start(grText.levelText1, buttons[0].next, levelOptions.lv1.planeNum, levelOptions.lv1.planesAddSpeed, levelOptions.lv1.planesDropSpeed, 0);
    });
    $('body').on('click', '#btn-how', function () {
        game.how();
    });
    $('body').on('click', '#btn-finish', function () {
        game.init();
    });
    $('body').on('click', '#btn-next', function () {
        game.start(grText.levelText2, '', levelOptions.lv2.planeNum, levelOptions.lv2.planesAddSpeed, levelOptions.lv2.planesDropSpeed, score);
    });

})();