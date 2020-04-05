function _fullscreen_hack(el) {
    const nav = document.getElementById("navbar");
    nav.style.visibility = "hidden";
    el.style.position = "absolute";
    el.style.top = "0px";
    el.style.left = "0px";
    el.style.width = "100vw";
    el.style.height = "56.6vw";

    document.addEventListener("keydown", function (event) {
        const e = event || window.event;
        if (e.keyCode === 27 && nav.style.visibily) {
            nav.style.visibily = "";
            el.style.position = "relative";
            el.style.top = "";
            el.style.left = "";
            el.style.width = "";
            el.style.height = "";
        }
    });
}


function _get_request_fullscreen_method(el) {
    return el.requestFullscreen
        || el.mozRequestFullScreen
        || el.webkitRequestFullScreen
        || el.msRequestFullscreen;
}

// function _get_exit_fullscreen_method(el) {
//   return el.exitFullscreen
//     || el.mozCancelFullScreen
//     || el.webkitExitFullscreen
//     || el.msExitFullscreen;
// }

function get_fullscreen_element() {
  return document.fullscreenElement
    || document.webkitFullscreenElement
    || document.mozFullScreenElement
    || document.msFullscreenElement;
}

function request_fullscreen(el) {

    try {
        const m = _get_request_fullscreen_method(el);
        m ? m.call(el) : _fullscreen_hack(el);
        setTimeout(() => get_fullscreen_element() || _fullscreen_hack(el), 500);
    } catch(e) {
        document.getElementById("fps").textContent =  e.toString();      // DEBUG
        _fullscreen_hack(el);
    }
}

// function exit_fullscreen(el) {
//   return _get_exit_fullscreen_method(el).call(el);
// }
