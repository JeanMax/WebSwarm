var g_chat_logs = [
    // {user: "Bob", content: "blabla"},
];


function Message(initialVnode) {
    return {
        view: function(vnode) {
            return (
                <p style="margin-bottom:0.3em">
                  <strong>{vnode.attrs.user}:&nbsp;</strong>
                  {vnode.attrs.msg}
                </p>
            );
        }
    };
}


function Chat(initialVnode) {
    var chat_logs = g_chat_logs;

    function chat_logs_to_html() {
        return chat_logs.map(msg => {
            return <Message user={msg.user} msg={msg.content}/>
        });
    }

    function send_chat_msg() {
        var chat_msg_input = document.getElementById("message-input");
        if (!chat_msg_input.value) {
            return;
        }
        if (!g_username) {
            open_modal();
            return;
        }
        socket.emit(
            "chat_msg",
            {user: g_username, content: chat_msg_input.value}
        );
        chat_msg_input.value = "";
    }

    return {
        oninit: function(vnode) {
            socket.on("chat_message_log", function(msg) {
                console.log("chat msg received:" + JSON.stringify(msg)); // DEBUG
                g_chat_logs.push(msg);
                setTimeout(m.redraw, 50);
            });
        },

        onupdate: function(vnode) {
            var msg_box = document.getElementById("message-logs");
            msg_box.scrollTop = msg_box.scrollHeight;
        },

        view: function(vnode) {
            return (
                <div class="columns is-centered">
                  <div class="box">
                    <div class="column" id="message-logs" style="height:20em; overflow-y:auto">
                      {chat_logs_to_html()}
                    </div>
                    <div class="column">
                      <div class="field is-grouped">
                        <p class="control is-expanded">
                          <input class="input" id="message-input" type="text" placeholder="Type your message here"/>
                        </p>
                        <p class="control">
                          <a class="button is-info" onclick={send_chat_msg}>Send</a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
            );
        }
    };
}
