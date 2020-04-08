import math
from random import uniform as rdm

# these are actually percents, eh
WORLD_WIDTH = 100
WORLD_HEIGHT = 100


class Point():
    def __init__(self, x=0, y=0):
        self.x, self.y = x, y

    def __repr__(self):
        return f"<Point ({self.x:.2g}, {self.y:.2g})>"

    def distance(self, point):
        return math.hypot(point.x - self.x, point.y - self.y)

    def in_range_slow(self, range_dist, point_list):
        return [
            p for p in point_list
            if p != self and self.distance(p) < range_dist
        ]


class Rectangle(Point):
    def __init__(self, x=0, y=0, w=1, h=1):
        super().__init__(x=x, y=y)
        self.w, self.h = w, h

    def __repr__(self):
        return f"<Rectangle ({self.x:.2g}, {self.y:.2g}), ({self.w}, {self.h})>"

    def is_outside(self):
        return (
            self.x < 0 or self.x + self.w > WORLD_WIDTH
            or self.y < 0 or self.y + self.h > WORLD_HEIGHT
        )


class Vector(Rectangle):
    def __init__(self, x=0, y=0, w=0, h=0, dir_x=0, dir_y=0):
        super().__init__(x=x, y=y, w=w, h=h)
        self.direction = Point(x=dir_x, y=dir_y)

    def __repr__(self):
        return (
            f"<Vector ({self.x:.2g}, {self.y:.2g}), ({self.w}, {self.h}), "
            f"({self.direction.x:.2g}, {self.direction.y:.2g})>"
        )

    def to_json(self):
        return (
            '{'
            f'"x":{self.x:.2g},"y":{self.y:.2g},'
            f'"w":{self.w},"h":{self.h},'
            '"dir":{'
            f'"x":{self.direction.x:.2g},"y":{self.direction.y:.2g}'
            '}}'
        )

    def move(self):
        if not self.is_outside():
            self.x += self.direction.x
            self.y += self.direction.y
            return

        # teleport
        if self.x < 0:
            self.x = WORLD_WIDTH - self.w
        elif self.x + self.w > WORLD_WIDTH:
            self.x = 0

        if self.y < 0:
            self.y = WORLD_HEIGHT - self.h
        elif self.y + self.h > WORLD_HEIGHT:
            self.y = 0


class Boid(Vector):
    size = 3
    sight_radius = 7
    max_speed = 0.5

    def __init__(self, x=None, y=None):
        super().__init__(
            x=x if x is not None else rdm(0, WORLD_WIDTH - Boid.size),
            y=y if y is not None else rdm(0, WORLD_HEIGHT - Boid.size),
            w=Boid.size,
            h=Boid.size,
            dir_x=rdm(-Boid.max_speed, Boid.max_speed),
            dir_y=rdm(-Boid.max_speed, Boid.max_speed)
        )

    def __repr__(self):
        return f"<Boid ({self.x:.2g}, {self.y:.2g})>"

    def _in_range_maybe(self, grid):
        ret = []
        offset = 1  # math.ceil(Boid.sight_radius / World.tile_size)
        grid_x = int(self.x // World.tile_size)
        grid_y = int(self.y // World.tile_size)
        for y in range(grid_y - offset, grid_y + offset + 1):
            for x in range(grid_x - offset, grid_x + offset + 1):
                try:
                    ret += grid[y][x]
                except IndexError:  # x or y outside grid
                    pass
        return ret

    def in_range(self, grid):
        return self.in_range_slow(Boid.sight_radius, self._in_range_maybe(grid))


class World():
    tile_size = Boid.sight_radius * 2

    def __init__(self, max_boids=100):
        self.boids = [Boid() for _ in range(max_boids)]
        self.grid = self._new_grid()
        self._fill_grid()

    def _new_grid(self):
        d = math.ceil(max(WORLD_WIDTH, WORLD_HEIGHT) / World.tile_size)
        return [
            [[] for _ in range(d)]
            for _ in range(d)
        ]

    def _fill_grid(self):
        for b in self.boids:
            self.grid[
                int(b.y // World.tile_size)
            ][
                int(b.x // World.tile_size)
            ].append(b)

    def next_frame(self):
        for b in self.boids:
            b.move()
        self.grid = self._new_grid()
        self._fill_grid()
