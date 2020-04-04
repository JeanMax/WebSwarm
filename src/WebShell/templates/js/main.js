"use strict";

var g_username;

var Link = m.route.Link;

var Main =  {
    view: function() {
        return (
            <div>
              <Navbar/>
              <LoginModal/>
              <section class="section" id="root">
              </section>
            </div>
        );
    }
};

var Index =  {
    view: function() {
        return (
            <h1 class="title">Hello World!</h1>
        );
    }
};


document.addEventListener("DOMContentLoaded", function () {
    g_username = get_cookie("user");

    m.mount(document.body, Main);
    m.route(document.getElementById("root"), "/index", {
        "/index": Index,
        "/chat": Chat,
        "/game": Game,
    });
});
