from WebSwarm.game import World, Boid


def sort(boid_list):
    return sorted(boid_list, key=lambda b: id(b))


def test_grid():
    w = World()
    w.next_frame()
    for b in w.boids:
        assert (
            sort(w.grid_man.find_neighbors(b))
            == sort(b.in_range_slow(Boid.sight_radius, w.boids))
        )


def test_grid_with_players():
    w = World()
    w.add_player(41, 41)
    w.add_player(42, 42)
    w.add_player(43, 43)
    w.next_frame()
    for b in w.boids:
        assert (
            sort(w.grid_man.find_neighbors(b))
            == sort(b.in_range_slow(
                Boid.sight_radius, w.boids + list(w.players_dic.values()))
            )
        )
