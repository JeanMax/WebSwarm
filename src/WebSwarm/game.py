import math
from random import uniform as rdm

from WebSwarm.twodim import WORLD_WIDTH, WORLD_HEIGHT, Point, Vector


class Boid(Vector):
    size = 2
    sight_radius = size * 2
    max_speed = 0.6

    alignment_coef = 1
    cohesion_coef = 1
    separation_coef = 1.2
    border_repulsion_coef = 0.8
    player_coef = 5

    def __init__(self, x=None, y=None, key=None):
        super().__init__(
            x=x if x is not None else rdm(0, WORLD_WIDTH - Boid.size),
            y=y if y is not None else rdm(0, WORLD_HEIGHT - Boid.size),
            # x=WORLD_WIDTH / 2, y=WORLD_HEIGHT / 2,
            w=Boid.size * 0.565,  # 16/9, it's actually a square...
            h=Boid.size,
            dir_x=rdm(-Boid.max_speed, Boid.max_speed),
            dir_y=rdm(-Boid.max_speed, Boid.max_speed),
            # dir_x=0, dir_y=0,
            key=key
        )
        self.neighbors = []

    def __repr__(self):
        return f"<Boid ({self.x:.4g}, {self.y:.4g})>"

    def to_json(self):
        return (
            '{'
            f'"key":{self.key},'
            f'"x":{self.x:.4g},'
            f'"y":{self.y:.4g},'
            '"dir":{'
            f'"x":{self.direction.x:.4g},'
            f'"y":{self.direction.y:.4g}'
            '}'
            '}'
        )

    def _alignement_force(self):
        neighbors = [n.point for n in self.neighbors]
        mean_direction = Point.mean([
            n.direction if isinstance(n, Boid)
            else n.direction * Boid.player_coef
            for n in neighbors
        ])
        return mean_direction * Boid.alignment_coef

    def _cohesion_force(self):
        neighbors = [n.point for n in self.neighbors]
        mean_coord = Point.mean(neighbors)
        return mean_coord * Boid.cohesion_coef

    def _separation_force(self):
        neighbors = [
            n for n in self.neighbors
            if n.dist < Boid.size
        ]
        if not neighbors:
            return Point(0, 0)
        mean_repulsion = Point.sum([
            (self - n.point) / (n.dist * n.dist)
            if n.dist else
            Point(
                rdm(-Boid.max_speed, Boid.max_speed),
                rdm(-Boid.max_speed, Boid.max_speed)
            )
            for n in neighbors
        ])
        return mean_repulsion * Boid.separation_coef

    def _border_repulsion_force(self):
        border_limit = Boid.size * 2
        repulsion = Point(0, 0)
        if self.x < border_limit:
            repulsion.x = Boid.max_speed
        elif self.x + self.w > WORLD_WIDTH - border_limit:
            repulsion.x = -Boid.max_speed
        if self.y < border_limit:
            repulsion.y = Boid.max_speed
        elif self.y + self.h > WORLD_HEIGHT - border_limit:
            repulsion.y = -Boid.max_speed
        return repulsion * Boid.border_repulsion_coef

    def apply_forces(self, grid_man):
        self.neighbors = grid_man.find_neighbors(self)

        if self.neighbors:
            self.next_direction = Point.sum([
                self.direction,
                self._alignement_force(),
                # self._cohesion_force(),
                self._separation_force(),
                self._border_repulsion_force(),
            ])
        # else:
        #     self.next_direction = Point.sum([
        #         self.direction,
        #         self._border_repulsion_force(),
        #     ])


class Player(Vector):
    size = 5
    sight_radius = size * 1.5
    max_speed = Boid.max_speed  # it's really hard to play if players are faster

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
        self.neighbors = []
        self.score = 0

    def __repr__(self):
        return f"<Player ({self.x:.4g}, {self.y:.4g})>"

    def to_json(self):
        return (
            '{'
            f'"key":"{self.key}",'
            f'"x":{self.x:.4g},'
            f'"y":{self.y:.4g},'
            f'"name":"{self.name}",'
            f'"score":{self.score}'
            '}'
        )

    def fetch_neighbors(self, grid_man):
        self.neighbors = grid_man.find_neighbors(self)

    def fetch_score(self):
        minion_list = []
        to_check = self.neighbors[::]
        while to_check:
            minion = to_check.pop().point
            if minion not in minion_list and minion != self:
                to_check += minion.neighbors
                minion_list.append(minion)
        self.score = len(minion_list)


class GridManager():
    """
    This class is used to speed up the neighbors-finding:
    basically, we'll divise the world in tiles, so we'll just have to search
    for neighbors inside the tile containing the point of interest.
    Maths!
    """
    tile_size = max(Player.sight_radius, Boid.sight_radius) * 2

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
        maybe_neighbors = self._in_range_maybe(point)
        return point.in_range_slow(
            Boid.sight_radius if isinstance(point, Boid)
            else Player.sight_radius,
            [b for b in maybe_neighbors if isinstance(b, Boid)],
            with_dist=True
        ) + point.in_range_slow(
            Player.sight_radius,
            [p for p in maybe_neighbors if isinstance(p, Player)],
            with_dist=True
        )


class World():
    def __init__(self, max_boids=80):
        self.players_dic = {}
        self.boids = [Boid(key=k) for k in range(max_boids)]
        self.grid_man = GridManager()
        self.grid_man.update(self.boids)

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
        players = list(self.players_dic.values())
        units = self.boids + players
        for b in self.boids:
            b.apply_forces(self.grid_man)
        for p in players:
            p.fetch_neighbors(self.grid_man)
        for p in players:
            p.fetch_score()
        for u in units:
            u.move()
        self.grid_man.update(units)
