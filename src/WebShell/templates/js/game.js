/*!
 * the game rendering idea is heavily inspired (stolen) from:
 * https://github.com/kiki727/geMithril
 */
const WIDTH = 250;
const HEIGHT = 500;


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
                    <p class="content">{fps} fps</p>
                    <figure id="game" class="image is-1by2" style={"width:" + WIDTH + "px;height:" + HEIGHT + "px"}>
                      <img src="https://bulma.io/images/placeholders/320x640.png"/>
                    </figure>
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

// style={"width:" + WIDTH + "px;height:" + HEIGHT + "px"}