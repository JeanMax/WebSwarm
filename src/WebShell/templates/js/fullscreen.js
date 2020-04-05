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
        || el.webkitRequestFullscreen
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
    var d = document.getElementById("fps"), // DEBUG
        t = "";                             // DEBUG



    const m = _get_request_fullscreen_method(el);

    t += "fs_met: " + m;        // DEBUG
    d.textContent = t;          // DEBUG

    if (m) {
        const r = m.call(el);
        t += " --- fs_met_call: " + r; // DEBUG
        d.textContent = t;          // DEBUG


        if (!r || !get_fullscreen_element()) {
            return _fullscreen_hack(el);
        }
        t += " --- fs_el: " + get_fullscreen_element(); // DEBUG
        d.textContent = t;          // DEBUG
    }
    return _fullscreen_hack(el);
}

// function exit_fullscreen(el) {
//   return _get_exit_fullscreen_method(el).call(el);
// }
