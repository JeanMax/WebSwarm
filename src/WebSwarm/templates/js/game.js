/*!
 * the game rendering idea is heavily inspired (stolen) from:
 * https://github.com/kiki727/geMithril
 */
var g_is_running = false;
var g_show_fps = false;
var g_me;


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
            return g_show_fps ? fps + " fps - " : "";
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
                    <p class="player-name">{player.name}</p>
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
    const my_direction =  {x: undefined, y: undefined};

    function server_update(data) {
        if (!g_is_running) {
            return;
        }
        const update = JSON.parse(data);
        update.boids.forEach(updated_boid => {
            if (boids[updated_boid.key] === undefined) {
                boids[updated_boid.key] = Vector(
                    0, 0, boid_width, boid_height
                );
            }
            Object.assign(boids[updated_boid.key], updated_boid);
        });
        update.players.forEach(updated_player => {
            if (players[updated_player.key] === undefined) {
                players[updated_player.key] = Vector(
                    0, 0, player_width, player_height
                );
            }
            Object.assign(players[updated_player.key], updated_player);
        });
        m.redraw();

        g_me = players[socket.id];
        if (g_me
            && (g_me.dir.x != my_direction.x || g_me.dir.y != my_direction.y)) {
            g_me.dir.x = my_direction.x;
            g_me.dir.y = my_direction.y;
            socket.emit("change_dir", my_direction);
        }
    }

    return {
        oninit: function() {
            socket.on("update", server_update);
        },

        oncreate: function() {
            const game = document.getElementById("layer-unit");
            game.onclick = function(event) {
                if (!g_is_running) {
                    return;
                }
                const e = event || window.event;
                const click_coord = {
                    x: e.offsetX / game.offsetWidth * 100,
                    y: e.offsetY / game.offsetHeight * 100
                };
                if (click_coord.x >= g_me.x && click_coord.x <= g_me.x + g_me.w
                   && click_coord.y >= g_me.y && click_coord.y <= g_me.y + g_me.h) {
                    //player clicked
                    my_direction.x = 0;
                    my_direction.y = 0;
                } else {
                    my_direction.x = click_coord.x - (g_me.x + g_me.w / 2);
                    my_direction.y = click_coord.y - (g_me.y + g_me.h / 2);
                    const speed_scale = 15;
                    my_direction.x /= speed_scale;
                    my_direction.y /= speed_scale;
                }

            };
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
        socket.emit("start_game", g_username);
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
                      <p>
                        <Fps/>
                        Score: {g_me ? g_me.score : 0}
                      </p>
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
