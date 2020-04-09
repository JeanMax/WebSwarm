/*!
 * the game rendering idea is heavily inspired (stolen) from:
 * https://github.com/kiki727/geMithril
 */
var g_is_running = false;
var g_show_fps = true;


function Fps() {
    let fps = 0;
    const times = [];

    function count_fps(){
        const now = performance.now();
        while (times.length > 0 && times[0] <= now - 1000) {
            times.shift();
        }
        times.push(now);
        fps = times.length;
    }

    return {
        onupdate: function() {
            if (g_is_running && g_show_fps) {
                count_fps();
            }
        },

        view: function() {
            return (
                <p class="content" id="fps">{g_show_fps ? fps + " fps" : ""}</p>
            );
        }
    };
}


function Boid() {
    let boid = null;

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
            boid.is_alive = false;
            target.classList.remove("explosion");
            target.classList.add("dead");
        }, 500);
    }

    return {
        oninit: function(vnode) {
            boid = vnode.attrs.boid;
            boid.is_alive = true;
        },

        view: function() {
            return (
                <div class="unit"
                     onclick={(e)=>kill(e)}
                     style={"left:" + boid.x + "%;" +
                            "top:" + boid.y + "%;" +
                            "width:" + boid.w + "%;" +
                            "height:" + boid.h + "%"}>
                </div>
            );
        }
    };
}


function BoidList() {
    const max_boids = 100;  //TODO: this should be fetched from server
    const boids = [];

    function server_update(data) {
        if (!g_is_running) {
            return;
        }
        const update_boids = JSON.parse(data);
        for (let i = 0; i < update_boids.length; i++) {
            Object.assign(boids[i], update_boids[i]);
        }
        m.redraw();
    }

    return {
        oninit: function() {
            for (let i = 0; i < max_boids; i++) {
                boids.push(Vector());
            }
            socket.on("update", server_update);
        },

        view: function() {
            return boids.map(b => {
                return <Boid boid={b} key={b.key}/>;
            });
        }
    };
}


function Game() {

    return {
        view: function() {
            return (
                <div class="box has-text-centered">

                  <div id="game">
                    <div class="layer" id="layer-background"></div>

                    <div class="layer" id="layer-unit">
                      <BoidList/>
                    </div>

                    <div class="layer" id="layer-info">
                      <Fps/>
                    </div>
                  </div>

                  <br />
                  <div class="columns">
                    <div class="column">
                      <a class="button is-info" onclick={() => g_show_fps = !g_show_fps}>{g_show_fps ? "Hide" : "Show"} fps</a>
                    </div>

                    <div class="column">
                      {g_is_running ?
                       <a class="button is-warning" onclick={() => g_is_running = false}>Stop!</a>
                       : <a class="button is-success" onclick={() => g_is_running = true}>Start!</a>
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
