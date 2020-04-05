/*!
 * the game rendering idea is heavily inspired (stolen) from:
 * https://github.com/kiki727/geMithril
 */


var Unit = {
    view: function(vnode) {
        const v = vnode.attrs.vector;
        return (
            <div class="unit"
                 style={"left:" + v.x + "%;" +
                        "top:" + v.y + "%;" +
                        "width:" + (v.w * 0.565) + "%;" +
                        "height:" + v.h + "%"}>
            </div>
        );
    }
};


function create_vectors(n) {
    const vectors = [];
    for (let i = 0; i < n; i++) {
        vectors.push(RandomVector());
    }
    return vectors;
}



function Game(initial_vnode) {
    let is_running = false;
    let fps = 0;
    const times = [];

    const max_unit = 80;
    const vectors = create_vectors(max_unit);

    function start() {
        console.log("start!");
        is_running = true;
        initial_vnode.dom.click();
    }

    function stop() {
        console.log("stop!");
        is_running = false;
    }

    function count_fps(){
        const now = performance.now();
        while (times.length > 0 && times[0] <= now - 1000) {
            times.shift();
        }
        times.push(now);
        fps = times.length;
    }

    function units_to_html() {
        return vectors.map((v, k) => {
            return <Unit vector={v} key={k}/>;
        });
    }

    function play_frame() {
        vectors.forEach(v => {
            move(v);
        });
    }

    return {
        onupdate: function(vnode) {
            if (is_running) {
                count_fps();
                play_frame();
                vnode.dom.click(); // loop!
            }
        },

        view: function() {
            return (
                <div onclick={(e)=>e.preventDefault()}>
                  <div class="box has-text-centered">

                    <div id="game">
                      <div class="layer" id="layer-background">
                        <img src="/static/img/background.jpg"/>
                      </div>

                      <div class="layer" id="layer-unit">
                        {units_to_html()}
                      </div>

                      <div class="layer" id="layer-info">
                        <p class="content" id="fps">{fps} fps</p>
                      </div>
                    </div>

                    <br />
                    {is_running ?
                     <a class="button is-warning" onclick={stop}>Stop!</a>
                     : <a class="button is-success" onclick={start}>Start!</a>
                    }
                    &nbsp;
                    <a class="button is-info" onclick={()=> request_fullscreen(document.getElementById("game"))}>FullScreen</a>
                  </div>
                </div>
            );
        }
    };
}
