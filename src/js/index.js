"use strict";
// control off-canvas
(function () {
    // 0: nav open or not
    // 1: window.innerWidth > screen.width && nav open
    // 2: window.innerWidth < screen.width && nav open
    let state = 0;
    let screen_w = screen.width;
    let menu = document.getElementById('menu');
    let body = document.body;
    let drawer = document.getElementById('drawer');
    let main = document.getElementById('main');
    let title = document.getElementsByClassName('title')[0];

    window.addEventListener('load', function(){
        let w = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;
        if (screen_w > 850) {
            toggleStyleOpen();
            state = w > (screen_w / 2) ? 1 : 2;
        }
    });

    menu.addEventListener('click', function (e) {
        let w = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;
        let containOpen = drawer.classList.contains('open');
        if (!containOpen) {
            state = w > (screen_w / 2) ? 1 : 2;
        } else {
            state = 0;
        }
        toggleStyleOpen();
        e.stopPropagation();
    });

    window.addEventListener('resize', function(e){
        if (state === 2) {
            return;
        }
        let w = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;
        if (w < (screen_w / 2) && state === 1) {
            removeStyleOpen();
        }
    });

    let toggleStyleOpen = function (){
        body.classList.toggle('open');
        drawer.classList.toggle('open');
        main.classList.toggle('open');
        title.classList.toggle('open');
    };

    let removeStyleOpen = function (){
        body.classList.remove('open');
        drawer.classList.remove('open');
        main.classList.remove('open');
        title.classList.toggle('open');
    };

})();



