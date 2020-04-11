import math
from random import uniform as rdm

# these are actually percents, eh
WORLD_WIDTH = 100
WORLD_HEIGHT = 100
BOXED_WORLD = False


class Point():
    def __init__(self, x=0, y=0):
        self.x, self.y = x, y

    def __repr__(self):
        return f"<Point ({self.x:.4g}, {self.y:.4g})>"

    def distance(self, point):
        return math.hypot(point.x - self.x, point.y - self.y)

    def in_range_slow(self, range_dist, point_list):
        return [
            p for p in point_list
            if p != self and self.distance(p) < range_dist
        ]

    def __add__(self, rhs):
        if isinstance(rhs, Point):
            return Point(self.x + rhs.x, self.y + rhs.y)
        return Point(self.x + rhs, self.y + rhs)

    def __sub__(self, rhs):
        if isinstance(rhs, Point):
            return Point(self.x - rhs.x, self.y - rhs.y)
        return Point(self.x - rhs, self.y - rhs)

    def __mul__(self, rhs):
        return Point(self.x * rhs, self.y * rhs)

    def __truediv__(self, rhs):
        return Point(self.x / rhs, self.y / rhs)

    @staticmethod
    def mean(point_list):
        n = len(point_list)
        return Point(
            x=sum([p.x for p in point_list]) / n,
            y=sum([p.y for p in point_list]) / n
        )


class Rectangle(Point):
    def __init__(self, x=0, y=0, w=1, h=1):
        super().__init__(x=x, y=y)
        self.w, self.h = w, h

    def __repr__(self):
        return f"<Rectangle ({self.x:.4g}, {self.y:.4g}), ({self.w}, {self.h})>"

    def is_outside(self):
        return (
            self.x < 0 or self.x + self.w > WORLD_WIDTH
            or self.y < 0 or self.y + self.h > WORLD_HEIGHT
        )


class Vector(Rectangle):
    def __init__(self, x=0, y=0, w=0, h=0, dir_x=0, dir_y=0, key=None):
        super().__init__(x=x, y=y, w=w, h=h)
        self.direction = Point(x=dir_x, y=dir_y)
        self.next_direction = Point(x=dir_x, y=dir_y)
        self.key = key

    def __repr__(self):
        return (
            f"<Vector ({self.x:.4g}, {self.y:.4g}), ({self.w}, {self.h}), "
            f"({self.direction.x:.4g}, {self.direction.y:.4g})>"
        )

    def to_json(self):
        return (
            '{'
            f'"key":"{self.key}",'
            f'"x":{self.x:.4g},"y":{self.y:.4g}'
            # f'"w":{self.w},"h":{self.h},'
            # '"dir":{'
            # f'"x":{self.direction.x:.2g},"y":{self.direction.y:.2g}'
            # '}'
            '}'
        )

    def _teleport(self):
        if self.x < 0:
            self.x = WORLD_WIDTH - self.w
        elif self.x + self.w > WORLD_WIDTH:
            self.x = 0

        if self.y < 0:
            self.y = WORLD_HEIGHT - self.h
        elif self.y + self.h > WORLD_HEIGHT:
            self.y = 0

    def _bounce(self):
        if self.x < 0 or self.x + self.w > WORLD_WIDTH:
            self.x -= 2 * self.direction.x
            self.direction.x = -self.direction.x

        if self.y < 0 or self.y + self.h > WORLD_HEIGHT:
            self.y -= 2 * self.direction.y
            self.direction.y = -self.direction.y

    def move(self):
        self.direction = self.next_direction
        # self += self.direction
        self.x += self.direction.x
        self.y += self.direction.y

        if not self.is_outside():
            return

        if BOXED_WORLD:
            self._bounce()
        else:
            self._teleport()


class Boid(Vector):
    size = 3
    sight_radius = size + 0.5
    max_speed = 0.5

    alignment_coef = 0.5
    cohesion_coef = 1
    separation_coef = 1

    def __init__(self, x=None, y=None, key=None):
        super().__init__(
            x=x if x is not None else rdm(0, WORLD_WIDTH - Boid.size),
            y=y if y is not None else rdm(0, WORLD_HEIGHT - Boid.size),
            w=Boid.size * 0.565,  # 16/9, it's actually a square...
            h=Boid.size,
            dir_x=rdm(-Boid.max_speed, Boid.max_speed),
            dir_y=rdm(-Boid.max_speed, Boid.max_speed),
            key=key
        )

    def __repr__(self):
        return f"<Boid ({self.x:.4g}, {self.y:.4g})>"

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

    def _limit_speed(self):
        if self.next_direction.x > Boid.max_speed:
            self.next_direction.x = Boid.max_speed
        elif self.next_direction.x < -Boid.max_speed:
            self.next_direction.x = -Boid.max_speed

        if self.next_direction.y > Boid.max_speed:
            self.next_direction.y = Boid.max_speed
        elif self.next_direction.y < -Boid.max_speed:
            self.next_direction.y = -Boid.max_speed

    @staticmethod
    def _alignement_force(neighbors):
        mean_direction = Point.mean([n.direction for n in neighbors])
        return mean_direction * Boid.alignment_coef

    @staticmethod
    def _cohesion_force(neighbors):
        mean_coord = Point.mean(neighbors)
        return mean_coord * Boid.cohesion_coef

    def _separation_force(self, neighbors):
        mean_repulsion = Point.mean([self - n for n in neighbors])
        return mean_repulsion * Boid.separation_coef

    def apply_forces(self, grid):
        neighbors = self.in_range(grid)
        if not neighbors:
            self.next_direction = self.direction
            return
        self.next_direction = Point.mean([
            self.direction,
            self._alignement_force(neighbors),
            self._cohesion_force(neighbors),
            self._separation_force(neighbors),
        ])
        self._limit_speed()


class Player(Vector):
    size = 5
    sight_radius = size + 0.5
    max_speed = 0.5

    def __init__(self, x=None, y=None, key=None, name=None):
        super().__init__(
            x=x if x is not None else rdm(0, WORLD_WIDTH - Player.size),
            y=y if y is not None else rdm(0, WORLD_HEIGHT - Player.size),
            w=Player.size * 0.565,  # 16/9, it's actually a square...
            h=Player.size,
            dir_x=0,
            dir_y=0,
            key=key
        )
        self.name = name

    def __repr__(self):
        return f"<Player ({self.x:.4g}, {self.y:.4g})>"


class World():
    tile_size = max(Player.sight_radius, Boid.sight_radius) * 2

    def __init__(self, max_boids=100):
        self.players_dic = {}
        self.boids = [Boid(key=k) for k in range(max_boids)]
        self.grid = self._new_grid()
        self._fill_grid()

    def to_json(self):
        return (
            "{"
            '"boids":['
            + ",".join([b.to_json() for b in self.boids])
            + "],"
            '"players":['
            + ",".join([p.to_json() for p in self.players_dic.values()])
            + "]"
            "}"
        )

    @staticmethod
    def _new_grid():
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

    def add_player(self, sid, username):
        p = self.players_dic.get(sid, None)
        if p is not None:
            p.name = username
        else:
            self.players_dic[sid] = Player(key=sid, name=username)

    def rm_player(self, sid, username):
        p = self.players_dic.get(sid, None)
        if p is not None:
            del self.players_dic[sid]

    def next_frame(self):
        for b in self.boids:
            b.apply_forces(self.grid)
        for b in self.boids:
            b.move()
        self.grid = self._new_grid()
        self._fill_grid()
