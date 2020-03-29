'use strict';

function get_cookie(key) {
    var cookie, ret = null;

    document.cookie.split(';').forEach(c => {
        cookie = c.split("=");
        if (cookie[0].trim() == key) {
            ret = cookie[1];
        }
    });

    return ret;
}

function set_cookie(key, value, days) {
    if (typeof(days) === 'undefined') {
        days = 365;
    }
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 3600 * 1000));

    document.cookie = key + "=" + value + "; "
    + "expires=" + date.toGMTString() + "; "
    + "path=/";
}

function del_cookie(key) {
    set_cookie(key, "", -1);
}