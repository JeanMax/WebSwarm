function getAll(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
}
