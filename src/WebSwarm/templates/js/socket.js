var socket = io();

document.addEventListener("DOMContentLoaded", function () {
    socket.on("connect", function() {
        console.log("Socket connected!"); // DEBUG
    });

    socket.on("disconnect", function() {
        console.log("Socket disconnected!"); // DEBUG
    });
});
