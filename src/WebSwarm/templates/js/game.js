/*!
 * the game rendering idea is heavily inspired (stolen) from:
 * https://github.com/kiki727/geMithril
 */
var g_is_running = false;


function Unit() {
    let vector = null;

    function kill(event) {
        if (!g_is_running) {
            return;
        }
        const e = event || window.event;
        const target = e.target || e.srcElement;

        target.style.backgroundImage = "";
        target.style.backgroundSize = "";
        target.classList.add("explosion");
        setTimeout(() => {
            vector.is_alive = false;
            target.classList.remove("explosion");
            target.classList.add("dead");
        }, 500);
    }

    return {
        oninit: function(vnode) {
            vector = vnode.attrs.vector;
            vector.is_alive = true;
        },

        view: function() {
            return (
                <div class="unit"
                     onclick={(e)=>kill(e)}
                     style={"left:" + vector.x + "%;" +
                            "top:" + vector.y + "%;" +
                            "width:" + vector.w + "%;" +
                            "height:" + vector.h + "%"}>
                </div>
            );
        }
    };
}


function create_vectors(n) {
    const vectors = [];
    for (let i = 0; i < n; i++) {
        vectors.push(RandomVector());
    }
    return vectors;
}


function Game() {
    let show_fps = false;
    let fps = 0;
    const times = [];
    // const framerate = 30;

    const max_unit = 100;
    const vectors = create_vectors(max_unit);

    function units_to_html() {
        return vectors.map(v=> {
            return <Unit vector={v} key={v.key}/>;
        });
    }

    function start() {
        console.log("start!");
        g_is_running = true;  //setInterval(m.redraw, 1000 / framerate);
    }

    function stop() {
        console.log("stop!");
        // clearInterval(g_is_running);
        g_is_running = false;
    }

    function count_fps(){
        const now = performance.now();
        while (times.length > 0 && times[0] <= now - 1000) {
            times.shift();
        }
        times.push(now);
        fps = times.length;
    }

    // function play_frame() {
    //     vectors.forEach(v => {
    //         if (v.is_alive) {
    //             move(v);
    //         }
    //     });
    // }

    function server_update(data) {
        if (!g_is_running) {
            return;
        }
        const update_vectors = JSON.parse(data);
        for (let i = 0; i < update_vectors.length; i++) {
            Object.assign(vectors[i], update_vectors[i]);
        }
        m.redraw();
    }

    return {
        oninit: function() {
            socket.on("update", server_update);
            socket.on("test", data => { // DEBUG
                console.log("test...");
                console.log(data);
            });
        },

        onupdate: function() {
            if (!g_is_running) {
                return;
            }
            if (show_fps) {
                count_fps();
            }
            // play_frame();
        },

        view: function() {
            return (
                <div class="box has-text-centered">

                  <div id="game">
                    <div class="layer" id="layer-background"></div>

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
                      {g_is_running ?
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
