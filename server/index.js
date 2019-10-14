var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

let clients = [];

io.on('connection', function (socket) {
    console.log("Cliente conectado")
    
    socket.on("set_position", (data) => {
        console.log(data)
        let index = clients.map(item => item.id).indexOf(socket.id)

        if ( index == -1 ) {
            clients.push({
                id: socket.id,
                location: data,
                ref: Date.now()
            })
        } else {
            clients[index].location = data
        }
        io.emit("clients_update", clients.map(item => ({
            location: item.location,
            ref: item.ref
        })))
    })

    socket.on("disconnect", () => {
        clients = clients.filter(item => item.id != socket.id )
    })

});

http.listen(3000, function () {
    console.log('listening on *:3000');
});