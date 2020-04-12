import math
from random import uniform as rdm
from WebSwarm.twodim import WORLD_WIDTH, WORLD_HEIGHT, Point, Vector


class Boid(Vector):
    size = 3
    sight_radius = size + 0.5
    max_speed = 0.5

    alignment_coef = 1.5
    cohesion_coef = 1
    separation_coef = 1
    player_coef = 100

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

    def to_json(self):
        return (
            '{'
            f'"key":{self.key},'
            f'"x":{self.x:.4g},'
            f'"y":{self.y:.4g}'
            '}'
        )

    @staticmethod
    def _alignement_force(neighbors):
        mean_direction = Point.mean([
            n.direction if isinstance(n, Boid)
            else n.direction * Boid.player_coef
            for n in neighbors
        ])
        return mean_direction * Boid.alignment_coef

    @staticmethod
    def _cohesion_force(neighbors):
        mean_coord = Point.mean(neighbors)
        return mean_coord * Boid.cohesion_coef

    def _separation_force(self, neighbors):
        mean_repulsion = Point.mean([
            self - n
            # if isinstance(n, Boid)
            # else self - (n * Boid.player_coef)
            for n in neighbors
        ])
        return mean_repulsion * Boid.separation_coef

    def apply_forces(self, grid_man):
        neighbors = grid_man.find_neighbors(self)
        if not neighbors:
            self.next_direction = self.direction
            return
        self.next_direction = Point.mean([
            self.direction,
            self._alignement_force(neighbors),
            self._cohesion_force(neighbors),
            self._separation_force(neighbors),
        ])


class Player(Vector):
    size = 5
    # sight_radius = size + 0.5
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

    def to_json(self):
        return (
            '{'
            f'"key":"{self.key}",'
            f'"x":{self.x:.4g},'
            f'"y":{self.y:.4g},'
            f'"name":"{self.name}"'
            '}'
        )


class GridManager():
    """
    This class is used to speed up the neighbors-finding:
    basically, we'll divise the world in tiles, so we'll just have to search
    for neighbors inside the tile containing the point of interest.
    Maths!
    """
    tile_size = Boid.sight_radius * 2

    def __init__(self):
        self.grid = self._new_grid()

    @staticmethod
    def _new_grid():
        d = math.ceil(max(WORLD_WIDTH, WORLD_HEIGHT) / GridManager.tile_size)
        return [
            [[] for _ in range(d)]
            for _ in range(d)
        ]

    def _fill_grid(self, units):
        for u in units:
            self.grid[
                int(u.y // GridManager.tile_size)
            ][
                int(u.x // GridManager.tile_size)
            ].append(u)

    def update(self, units):
        self.grid = self._new_grid()
        self._fill_grid(units)

    def _in_range_maybe(self, point):
        ret = []
        offset = 1  # math.ceil(Boid.sight_radius / GridManager.tile_size)
        grid_x = int(point.x // GridManager.tile_size)
        grid_y = int(point.y // GridManager.tile_size)
        for y in range(grid_y - offset, grid_y + offset + 1):
            for x in range(grid_x - offset, grid_x + offset + 1):
                try:
                    ret += self.grid[y][x]
                except IndexError:  # x or y outside grid
                    pass
        return ret

    def find_neighbors(self, point):
        return point.in_range_slow(
            Boid.sight_radius,  # humph
            self._in_range_maybe(point)
        )


class World():
    def __init__(self, max_boids=30):
        self.players_dic = {}
        self.boids = [Boid(key=k) for k in range(max_boids)]
        self.grid_man = GridManager()

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

    def add_player(self, key, username):
        p = self.players_dic.get(key, None)
        if p is not None:
            p.name = username
        else:
            self.players_dic[key] = Player(key=key, name=username)

    def rm_player(self, key):
        p = self.players_dic.get(key, None)
        if p is not None:
            del self.players_dic[key]

    def turn_player(self, key, dir_x, dir_y):
        p = self.players_dic.get(key, None)
        if p is not None:
            p.next_direction.x = dir_x
            p.next_direction.y = dir_y

    def next_frame(self):
        units = self.boids + list(self.players_dic.values())
        self.grid_man.update(units)
        for b in self.boids:
            b.apply_forces(self.grid_man)
        for u in units:
            u.move()
