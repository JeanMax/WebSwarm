function open_modal() {
    document.documentElement.classList.add("is-clipped");
    document.getElementById("login-modal").classList.add("is-active");
    document.getElementById("login-input").focus();
}


// TODO: find a way to better scope these previous functions

function LoginModal() {

    function is_valid_username(s) {
        return /^\w{2,32}$/.test(s);
    }

    function validate_username() {
        const username_value = document.getElementById("login-input").value;
        if (!username_value) {
            document.getElementById("login-input").classList.remove("is-success");
            document.getElementById("login-input").classList.remove("is-danger");
            document.getElementById("login-helper").textContent = "";
        } else if (is_valid_username(username_value)) {
            document.getElementById("login-input").classList.remove("is-danger");
            document.getElementById("login-input").classList.add("is-success");
            document.getElementById("login-helper").textContent = "";
        } else {
            document.getElementById("login-input").classList.remove("is-success");
            document.getElementById("login-input").classList.add("is-danger");
            document.getElementById("login-helper").textContent = "Invalid Username";
        }
    }

    function login() {
        const username_value = document.getElementById("login-input").value;
        if (!is_valid_username(username_value)) {
            return;
        }
        close_modal();
        set_cookie("user", username_value);
        g_username = username_value;
        socket.emit("login", {user: g_username});
    }

    function close_modal() {
        document.documentElement.classList.remove("is-clipped");
        document.getElementById("login-modal").classList.remove("is-active");
    }

    return {
        oncreate: function(vnode) {
            document.addEventListener("keydown", function (event) {
                if (!vnode.dom.classList.value.includes("is-active")) {
                    return;
                }
                const e = event || window.event;
                if (e.keyCode === 27) {
                    close_modal();
                } else if (e.keyCode === 13) {
                    login();
                    m.redraw();
                }
            });
        },

        view: function() {
            return (
                <div class="modal" id="login-modal">
                  <div class="modal-background" onclick={close_modal}></div>
                    <div class="modal-content is-clipped">

                      <div class="columns is-mobile is-centered">
                        <div class="column is-half">
                          <label class="label is-centered">Enter your name:</label>
                          <div class="field has-addons">
                            <div class="control">
                              <input class="input" id="login-input" type="text" placeholder="Username" onkeyup={validate_username}/>
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
