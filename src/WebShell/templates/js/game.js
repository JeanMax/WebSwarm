/*!
 * the game rendering idea is heavily inspired (stolen) from:
 * https://github.com/kiki727/geMithril
 */

function Game(initial_vnode) {
    let is_running = false;
    let fps = 0;
    const times = [];

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

    function play_frame() {
        console.log("zboub");
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
                        <div class="unit" id="unit1"></div>
                        <div class="unit" id="unit2" style="left:10%;top:60%"></div>
                        <div class="unit" id="unit2" style="left:70%;top:90%"></div>
                        <div class="unit" id="unit2" style="left:30%;top:95%"></div>
                      </div>

                      <div class="layer" id="layer-info">
                        <p class="content">{fps} fps</p>
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
