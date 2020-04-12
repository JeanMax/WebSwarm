from WebSwarm.twodim import World, Boid


def sort(boid_list):
    return sorted(boid_list, key=lambda b: id(b))


def test_grid():
    w = World()
    for b in w.boids:
        assert (
            sort(b.in_range(w.grid))
            == sort(b.in_range_slow(Boid.sight_radius, w.boids))
        )


def test_grid_with_players():
    w = World()
    w.add_player(41, 41)
    w.add_player(42, 42)
    w.add_player(43, 43)
    w.grid = w._new_grid()
    w._fill_grid()
    for b in w.boids:
        assert (
            sort(b.in_range(w.grid))
            == sort(b.in_range_slow(
                Boid.sight_radius, w.boids + list(w.players_dic.values()))
            )
        )
