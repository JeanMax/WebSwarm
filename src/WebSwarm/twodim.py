import math
from collections import namedtuple

# these are actually percents, eh
WORLD_WIDTH = 100
WORLD_HEIGHT = 100
BOXED_WORLD = True


PointWithDist = namedtuple('PointWithDist', 'point dist')


class Point():
    def __init__(self, x=0, y=0):
        self.x, self.y = x, y

    def __repr__(self):
        return f"<Point ({self.x:.4g}, {self.y:.4g})>"

    def distance(self, point):
        return math.hypot(point.x - self.x, point.y - self.y)

    def in_range_slow(self, range_dist, point_list, with_dist=False):
        if not with_dist:
            return [
                p for p in point_list
                if p != self and self.distance(p) < range_dist
            ]
        ret = []
        for p in point_list:
            if p == self:
                continue
            dist = self.distance(p)
            if dist < range_dist:
                ret.append(PointWithDist(point=p, dist=dist))
        return ret

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
    max_speed = 1

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

    def _limit_speed(self):
        abs_dir_x = abs(self.next_direction.x)
        abs_dir_y = abs(self.next_direction.y)
        if abs_dir_x < self.max_speed and abs_dir_y < self.max_speed:
            return
        if abs_dir_x:
            self.next_direction.x = (
                self.next_direction.x / max(abs_dir_x, abs_dir_y)
            ) * self.max_speed * 0.565
        if abs_dir_y:
            self.next_direction.y = (
                self.next_direction.y / max(abs_dir_x, abs_dir_y)
            ) * self.max_speed

    def move(self):
        self._limit_speed()
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
