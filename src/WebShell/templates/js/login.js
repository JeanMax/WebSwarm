
function open_modal() {
    document.documentElement.classList.add('is-clipped');
    document.getElementById("login-modal").classList.add('is-active');
}


// TODO: find a way to better scope these previous functions

function LoginModal(initialVnode) {

    function is_valid_username(s) {
        return /[a-zA-Z0-9_-]{2,}/.test(s);
    }

    function validate_username() {
        var username_value = document.getElementById("login-input").value;
        if (!username_value) {
            document.getElementById("login-input").classList.remove("is-success");
            document.getElementById("login-input").classList.remove("is-danger");
            document.getElementById("login-helper").textContent = ""
        } else if (is_valid_username(username_value)) {
            document.getElementById("login-input").classList.remove("is-danger");
            document.getElementById("login-input").classList.add("is-success");
            document.getElementById("login-helper").textContent = ""
        } else {
            document.getElementById("login-input").classList.remove("is-success");
            document.getElementById("login-input").classList.add("is-danger");
            document.getElementById("login-helper").textContent = "Invalid Username"
        }
    }

    function login() {
        var username_value = document.getElementById("login-input").value;
        if (!is_valid_username(username_value)) {
            return;
        }
        set_cookie("user", username_value);
        g_username = username_value;
        close_modal();
        socket.on("connect", function() {
            socket.emit("my event", {data: "I'm connected!"});
        });
    }

    function close_modal() {
        document.documentElement.classList.remove("is-clipped");
        document.getElementById("login-modal").classList.remove("is-active");
    }

    document.addEventListener("keydown", function (event) {
        var e = event || window.event;
        if (e.keyCode === 27) {
            close_modal();
        } else if (e.keyCode == 13 && document.getElementById("login-modal")
                                              .classList.value.includes("is-active")) {
            login();
            m.redraw();
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
                              <input class="input" id="login-input" type="text" placeholder="Enter your name" onkeyup={validate_username}/>
                            </div>
                            <div class="control">
                              <a class="button is-info" onclick={login}>Log in</a>
                            </div>
                          </div>
                          <p class="help is-danger" id="login-helper"></p>

                        </div>
                      </div>
                    </div>
                  <button class="modal-close is-large" aria-label="close" onclick={close_modal}></button>
                </div>
            );
        }
    };
}
