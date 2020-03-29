

function Message(initialVnode) {

    return {
        view: function(vnode) {
            return (
                <p class="content">
                  <strong>{vnode.attrs.user}:&nbsp;</strong>
                  {vnode.attrs.msg}
                </p>
            );
        }
    };
}



function Chat(initialVnode) {

    return {
        view: function(vnode) {
            return (
                <div class="columns is-centered">
                  <div class="box">
                    <div class="column" id="message-logs" style="max-height:20em; overflow-y:auto">
                      <Message user="Bob" msg="blabl abla bla blabla"/>
                      <Message user="John" msg="blabl abla bla blabla"/>
                      <Message user="Alfred" msg="blabl abla bla blabla"/>
                      <Message user="Joe" msg="blabl abla bla blablabla blablabla blablabla blablabla blablabla blablabla blablabla blablabla blablabla blablabla blablabla blablabla blablabla blablabla blablabla blablabla blabla"/>
                    </div>
                    <div class="column">
                      <div class="field is-grouped">
                        <p class="control is-expanded">
                          <input class="input" type="text" placeholder="Type your message here"/>
                        </p>
                        <p class="control">
                          <a class="button is-info">Send</a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
            );
        }
    };
}
