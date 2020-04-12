
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
