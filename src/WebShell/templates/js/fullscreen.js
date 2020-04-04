function _get_request_fullscreen_method(el) {
  return el.requestFullscreen
    || el.mozRequestFullScreen
    || el.webkitRequestFullscreen
    || el.msRequestFullscreen;
}

function _get_exit_fullscreen_method(el) {
  return el.exitFullscreen
    || el.mozCancelFullScreen
    || el.webkitExitFullscreen
    || el.msExitFullscreen;
}

function get_fullscreen_element() {
  return document.fullscreenElement
    || document.webkitFullscreenElement
    || document.mozFullScreenElement
    || document.msFullscreenElement;
}

function request_fullscreen(el) {
  return _get_request_fullscreen_method(el).call(el);
}

function exit_fullscreen(el) {
  return _get_exit_fullscreen_method(el).call(el);
}
