'use strict';

document.addEventListener('DOMContentLoaded', function () {
    var root = document.body;

    m.render(
        root,
        <div id="root">
          <Navbar/>
          <LoginModal/>
          <section class="section">
            <h1 class="title">Hello World!</h1>
          </section>
        </div>
    );
});
