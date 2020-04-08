
function Point(x, y) {
    return {x: x, y: y};
}

function Rectangle(x, y, w, h) {
    return {x: x, y: y, w: w, h: h};
}

function Vector(x, y, w, h, dir_x, dir_y) {
    const r = Rectangle(x, y, w, h);
    r.dir = Point(dir_x, dir_y);
    return r;
}


// random
function rdm(min, max) {
  return Math.random() * (max - min) + min;
}

function RandomVector() {
    const dim = rdm(3, 7);
    return Vector(
        rdm(0, 95), rdm(0, 95),
        dim, dim,
        rdm(-0.5, 0.5), rdm(-0.5, 0.5)
    );
}


// since js objects suck, lets not type anything... yolo
// function distance(p1, p2) {
//     const x_diff = p1.x - p2.x,
//           y_diff = p1.y - p2.y;
//     return Math.sqrt(x_diff * x_diff + y_diff * y_diff);
// }

function is_outside(r) {
    return r.x < 0 || r.x + (r.w * 0.565) > 100
        || r.y < 0 || r.y + r.h > 100;
}

function move(v) {
    if (!is_outside(v)) {
        v.x += v.dir.x;
        v.y += v.dir.y;
        return;
    }

    if (v.x < 0) {
        v.x = 100 - (v.w * 0.565);
    } else if (v.x + (v.w * 0.565) > 100) {
        v.x = 0;
    }

    if (v.y < 0) {
        v.y = 100 - v.h;
    } else if (v.y + v.h > 100) {
        v.y = 0;
    }
}
