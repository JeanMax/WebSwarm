import time
from WebSwarm.log import warning


class FrameRateHandler():
    def __init__(self, sleeper, fps=60):
        self.frame_delay = 1 / fps
        self.sleeper = sleeper
        self.tick = time.time()

    def wait_next_frame(self):
        tack = time.time()
        elapsed = tack - self.tick
        delay = self.frame_delay - elapsed

        if delay < 0:
            self.tick = tack
            warning(
                f"Lag! Frame took {int(elapsed * 1000)}ms "
                f"(max: {int(self.frame_delay * 1000)}ms)"
            )
            return

        self.sleeper(delay)
        self.tick = time.time()
