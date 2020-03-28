
function open_modal() {  //...
    document.documentElement.classList.add('is-clipped');
    document.getElementById("login-modal").classList.add('is-active');
}

function LoginModal(initialVnode) {

    function login() {
        var username = document.getElementById("login-input").value;
        set_cookie("user", username);
        close_modal();
    }

    function logout() {
        del_cookie("user");
    }

    function close_modal() {
        document.documentElement.classList.remove('is-clipped');
        document.getElementById("login-modal").classList.remove('is-active');
    }

    document.addEventListener('keydown', function (event) {
        var e = event || window.event;
        if (e.keyCode === 27) {
            close_modal();
        }
    });

    return {
        view: function(vnode) {
            return (
                <div class="modal" id="login-modal">
                  <div class="modal-background" onclick={close_modal}></div>

                  <div class="modal-content is-clipped">
                    <div class="columns is-mobile is-centered">
                      <div class="column is-half">
                        <div class="field has-addons">
                          <div class="control">
                            <input class="input" id="login-input" type="text" placeholder="Enter your name"/>
                          </div>
                          <div class="control">
                            <a class="button is-info" onclick={login}>Log in</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button class="modal-close is-large" aria-label="close" onclick={close_modal}></button>
                </div>
            );
        }
    };
}
// <a class="button is-warning" onclick="logout()"><strong>Log out</strong></