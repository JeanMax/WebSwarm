'use strict';

var g_username;

var Main =  {
    view: function() {
        return (
            <div id="root">
              <Navbar/>
              <LoginModal/>
              <section class="section">
                <h1 class="title">Hello World!</h1>
                <Chat/>
              </section>
            </div>
        );
    }
}

document.addEventListener('DOMContentLoaded', function () {
    var root = document.body;
    g_username = get_cookie("user");

    m.mount(root, Main);
});
