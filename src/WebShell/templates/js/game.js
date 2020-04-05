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

    let show_fps = false;
    let fps = 0;
    const times = [];
    // let prev_timestamp = 0;
    // let now = 0;

    const max_unit = 80;
    const vectors = create_vectors(max_unit);

    function units_to_html() {
        return vectors.map((v, k) => {
            return <Unit vector={v} key={k}/>;
        });
    }

    function start() {
        console.log("start!");
        is_running = true;
        m.redraw();
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
        // const this_fps = parseInt((1000 / (now - prev_timestamp)));
        // prev_timestamp = now;
    }

    function play_frame() {
        vectors.forEach(v => {
            move(v);
        });
    }

    return {
        onupdate: function(vnode) {
            if (is_running) {
                if (show_fps) {
                    count_fps();
                }
                play_frame();
                m.redraw();  //loop!
            }
        },

        view: function() {
            return (
                <div class="box has-text-centered">

                  <div id="game">
                    <div class="layer" id="layer-background">
                    </div>

                    <div class="layer" id="layer-unit">
                      {units_to_html()}
                    </div>

                    <div class="layer" id="layer-info">
                      <p class="content" id="fps">{show_fps ? fps + " fps" : ""}</p>
                    </div>
                  </div>

                  <br />
                  <div class="columns">
                    <div class="column">
                      <a class="button is-info" onclick={()=> show_fps = !show_fps}>{show_fps ? "Hide" : "Show"} fps</a>
                    </div>

                    <div class="column">
                      {is_running ?
                       <a class="button is-warning" onclick={stop}>Stop!</a>
                       : <a class="button is-success" onclick={start}>Start!</a>
                      }
                    </div>

                    <div class="column">
                      <a class="button is-info" onclick={()=> request_fullscreen(document.getElementById("game"))}>FullScreen</a>
                    </div>
                  </div>

                </div>
            );
        }
    };
}
