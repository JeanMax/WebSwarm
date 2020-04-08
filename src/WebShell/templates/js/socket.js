var socket = io();

document.addEventListener("DOMContentLoaded", function () {
    socket.on("connect", function() {
        console.log("Socket connected!"); // DEBUG
    });

    socket.on("disconnect", function() {
        console.log("Socket disconnected!"); // DEBUG
    });

    socket.on("update", function(data) {
        // console.log("test:" + JSON.parse(data)["pouet"]); // DEBUG
        console.log("update:" + JSON.stringify(data)); // DEBUG
    });
});
