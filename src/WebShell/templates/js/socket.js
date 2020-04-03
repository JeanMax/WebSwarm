var socket = io();

document.addEventListener("DOMContentLoaded", function () {
    socket.on("connect", function() {
        console.log("Socket connected!"); // DEBUG
        socket.emit("custom_event", {data: "I'm in!"});
    });

    socket.on("disconnect", function() {
        console.log("Socket disconnected!"); // DEBUG
        socket.emit("custom_event", {data: "I'm out!"});
    });

    socket.on("test", function(data) {
        console.log("Received test:" + JSON.stringify(data)); // DEBUG
    });
});
