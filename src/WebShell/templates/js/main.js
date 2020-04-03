"use strict";

var g_username;

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


var Link = m.route.Link;


document.addEventListener("DOMContentLoaded", function () {
    g_username = get_cookie("user");

    m.mount(document.body, Main);
    m.route(document.getElementById("root"), "/index", {
        "/index": Index,
        "/chat": Chat,
    });
});
