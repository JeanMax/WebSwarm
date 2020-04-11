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

function Player() {
    let player = null;
    //TODO: show player name

    return {
        oninit: function(vnode) {
            player = vnode.attrs.player;
        },

        view: function() {
            return (
                <div class="player"
                     style={"left:" + player.x + "%;" +
                            "top:" + player.y + "%;" +
                            "width:" + player.w + "%;" +
                            "height:" + player.h + "%"}>
                </div>
            );
        }
    };
}

function Boid() {
    let boid = null;

    return {
        oninit: function(vnode) {
            boid = vnode.attrs.boid;
        },

        view: function() {
            return (
                <div class="boid"
                     style={"left:" + boid.x + "%;" +
                            "top:" + boid.y + "%;" +
                            "width:" + boid.w + "%;" +
                            "height:" + boid.h + "%"}>
                </div>
            );
        }
    };
}


function UnitList() {
    const boid_height = 3; // TODO: fetch from server
    const boid_width = boid_height * 0.565; // TODO: fetch from server
    const boids = {};

    const player_height = 5; // TODO: fetch from server
    const player_width = player_height * 0.565; // TODO: fetch from server
    const players = {};

    function server_update(data) {
        if (!g_is_running) {
            return;
        }
        const update = JSON.parse(data);
        update.boids.forEach((updated_boid, i) => {
            if (boids[updated_boid.key] === undefined) {
                boids[updated_boid.key] = Vector(
                    0, 0, boid_width, boid_height
                );
            }
            Object.assign(boids[i], updated_boid);
        });
        update.players.forEach((updated_player, i) => {
            if (players[updated_player.key] === undefined) {
                players[updated_player.key] = Vector(
                    0, 0, player_width, player_height
                );
            }
            Object.assign(players[updated_player.key], updated_player);
        });
        m.redraw();
    }

    return {
        oninit: function() {
            socket.on("update", server_update);
        },

        view: function() {
            return Object.values(boids).map(b => {
                return <Boid boid={b} key={b.key}/>;
            }).concat(
                Object.values(players).map(p => {
                    return <Player player={p} key={p.key}/>;
                })
            );
        }
    };
}


function Game() {

    function start() {
        if (!g_username) {
            open_modal();
            return;
        }
        g_is_running = true;
        socket.emit("start_game", null);
    }

    function stop() {
        g_is_running = false;
        socket.emit("stop_game", null);
    }

    return {
        view: function() {
            return (
                <div class="box has-text-centered">

                  <div id="game">
                    <div class="layer" id="layer-background"></div>

                    <div class="layer" id="layer-unit">
                      <UnitList/>
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
