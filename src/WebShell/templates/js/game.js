/*!
 * the game rendering idea is heavily inspired (stolen) from:
 * https://github.com/kiki727/geMithril
 */

function Game(initial_vnode) {
    let is_running = false;
    let fps = 0;
    const times = [];
    const width = 250;
    const height = 500;

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
                    <p class="content">{fps} fps</p>
                    <div class="columns is-mobile is-centered">
                      <div class="column is-half" id="game" style={"width:" + width + "px;height:" + height + "px;background-color:black"}></div>
                   </div>
                      {is_running ?
                      <a class="button is-warning" onclick={stop}>Stop!</a>
                    : <a class="button is-success" onclick={start}>Start!</a>}
                  </div>
                </div>
            );
        }
    };
}
