function Navbar(initialVnode) {

    function toggle_navbar() {
        var navbar = document.getElementById("super-navbar"),
            burger = document.getElementById("super-burger");

        navbar.classList.toggle('is-active');
        burger.classList.toggle('is-active');
    }

    function logout() {
        del_cookie("user");
        g_username = null;
    }

    return {

        view: function(vnode) {
            return (
                <nav class="navbar" role="navigation" aria-label="main navigation">
                  <div class="navbar-brand">
                    <a class="navbar-item" href="/">
                      <img src="/static/img/logo.png" width="96"/>
                    </a>

                    <label role="button" class="navbar-burger burger" id="super-burger" aria-label="menu" aria-expanded="false" onclick={toggle_navbar}>
                      <span aria-hidden="true"></span>
                      <span aria-hidden="true"></span>
                      <span aria-hidden="true"></span>
                    </label>
                  </div>

                  <div class="navbar-menu" id="super-navbar">
                    <div class="navbar-start">
                      <a class="navbar-item" href="/TODO">TODO</a>
                    </div>

                    <div class="navbar-end">
                      <div class="navbar-item">
                        <div class="buttons">
                          {g_username != null ?
                            <><a class="button is-warning" onclick={logout}><strong>Log out</strong></a><div class="navbar-item"><strong>User: </strong>{g_username}</div></>
                            : <a class="button is-light modal-button" onclick={open_modal}>Log in</a>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </nav>
            );
        }
    };
}
