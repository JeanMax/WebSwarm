function Navbar() {

    function toggle_navbar() {
        const navbar = document.getElementById("super-navbar");
        const burger = document.getElementById("super-burger");

        navbar.classList.toggle("is-active");
        burger.classList.toggle("is-active");
    }

    function logout() {
        del_cookie("user");
        socket.emit("logout", {user: g_username});
        g_username = null;
    }

    return {
        view: function() {
            return (
                <nav class="navbar" id="navbar" role="navigation" aria-label="main navigation">
                  <div class="navbar-brand">
                    <Link class="navbar-item" href="/index">
                      <img src="/static/img/logo.png" width="96"/>
                    </Link>

                    <label role="button" class="navbar-burger burger" id="super-burger" aria-label="menu" aria-expanded="false" onclick={toggle_navbar}>
                      <span aria-hidden="true"></span>
                      <span aria-hidden="true"></span>
                      <span aria-hidden="true"></span>
                    </label>
                  </div>

                  <div class="navbar-menu" id="super-navbar">
                    <div class="navbar-start">
                      <Link class="navbar-item" href="/chat">Chat</Link>
                      <Link class="navbar-item" href="/game">Game</Link>
                    </div>

                    <div class="navbar-end">
                      <div class="navbar-item">
                        <div class="buttons">
                          {g_username != null ?
                          <>
                            <a class="button is-warning" onclick={logout}><strong>Log out</strong></a>
                            <div class="navbar-item"><strong>User:&nbsp;</strong>{g_username}</div>
                          </>
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
