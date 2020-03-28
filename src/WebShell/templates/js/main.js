'use strict';

document.addEventListener('DOMContentLoaded', function () {
    var root = document.getElementById("root");

    var Title = {
        view: function (vnode) {
            return <h2>{vnode.children}</h2>
        }
    };

    m.render(
        root,
        <Title>Mithril? yes</Title>
    );
});


function login() {
    var username = document.getElementById("login-input").value;
    set_cookie("user", username);
    document.getElementById("login-modal").classList.remove("is-active");
}

function logout() {
    del_cookie("user");
}
