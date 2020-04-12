var g_chat_logs = [
    // {user: "Bob", content: "blabla"},
];


var Message = {
    view: function(vnode) {
        return (
            <p style="margin-bottom:0.3em">
              <strong>{vnode.attrs.user}:&nbsp;</strong>
              {vnode.attrs.msg}
            </p>
        );
    }
};


function MessageList() {
    const chat_logs = g_chat_logs;

    function recv_msg(msg) {
        chat_logs.push(msg);  //TODO: limit log size?
        setTimeout(m.redraw, 1);
    }

    function recv_logs(srv_chat_logs) {
        srv_chat_logs.forEach(msg => {
            chat_logs.push(msg);
        });
        setTimeout(m.redraw, 1);
    }

    return {
        oninit: function() {
            if (!g_chat_logs.length) {
                socket.emit("chat_logs", null);
                socket.on("srv_chat_logs", recv_logs);
            }
            socket.on("srv_chat_msg", recv_msg);
        },

        view: function() {
            return chat_logs.map((msg, k) => {
                return <Message user={msg.user} msg={msg.content} key={k}/>;
            });
        }
    };
}


function Chat() {

    function send_chat_msg() {
        const chat_msg_input = document.getElementById("message-input");
        const msg = chat_msg_input.value;
        if (!msg) {
            return;
        }
        if (!g_username) {
            open_modal();
            return;
        }
        chat_msg_input.value = "";
        socket.emit("chat_msg", {user: g_username, content: msg});
    }

    return {
        oninit: function() {
            document.addEventListener("keydown", function (event) {
                const e = event || window.event;
                if (e.keyCode == 13
                    && document.activeElement === document.getElementById("message-input")) {
                    send_chat_msg();
                }
            });
        },

        oncreate: function() {
            document.getElementById("message-input").focus();
        },

        onupdate: function() {
            const msg_box = document.getElementById("message-logs");
            msg_box.scrollTop = msg_box.scrollHeight;
        },

        view: function() {
            return (
                <div class="columns is-centered">
                  <div class="box">
                    <div class="column" id="message-logs" style="height:20em; overflow-y:auto">
                      <MessageList/>
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
