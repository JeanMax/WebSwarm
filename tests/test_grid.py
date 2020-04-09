from WebShell.twodim import World, Boid


def sort(boid_list):
    return sorted(boid_list, key=lambda b: id(b))


def test_grid():
    w = World()
    for b in w.boids:
        assert (
            sort(b.in_range(w.grid))
            == sort(b.in_range_slow(Boid.sight_radius, w.boids))
        )
