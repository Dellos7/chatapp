const express = require('express');
const app = express();
const router = express.Router();
const WebSocket = require('ws');

let salas = [
    {
        idSala: 1,
        nombre: 'Ada Byron',
        foto: '/images/ada.png',
        color: '#9c27b0'
    },
    {
        idSala: 2,
        nombre: 'Linus Torvalds',
        foto: '/images/linus.png',
        color: '#ff9800'
    },
    {
        idSala: 3,
        nombre: 'Steve Jobs',
        foto: '/images/steve.png',
        color: '#e91e63'
    },
    {
        idSala: 4,
        nombre: 'Bill Gates',
        foto: '/images/bill.png',
        color: '#00bcd4'
    },
];
let clientes = [];
let mensajesPorSala = {};

router.get( '/', function(req, res){
    res.send('Página principal del chat');
});

router.get( '/salas', function(req, res){
    res.json( salas );
});

router.get( '/mensajes/:idSala', function(req, res){
    const idSala = req.params.idSala;
    res.json( mensajesPorSala[idSala] );
});

app.get( '/json', function(req, res){
    res.json( { status: 'ok', message: 'Hola!' } );
});

app.use( function middleware(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

// Servir el directorio public/images en la ruta /images
app.use( '/images', express.static('public/images') );

// Tendremos: /chat/salas , /chat/mensajes/:idSala ...
app.use( '/chat', router );

app.listen( 3000, function(){
    console.log('ChatApp escuchando en puerto 3000');
});

const ws = new WebSocket.Server( { port: 3100 } );

ws.on( 'connection', function(client, req){
    //
    client.on( 'message', function(msg) {
        if( !existeCliente(client) ){
            let usuarioYSala = JSON.parse(msg);
            let { usuario, idSala } = usuarioYSala;
            clientes.push({ usuario, idSala, client });
            const sala = obtenerSala(idSala);
            client.send( JSON.stringify({ estado: 'ok', ...sala }) );
        } else{
            const mensajeJson = JSON.parse(msg);
            console.log( `Recibido: ${msg}` );
            if( !mensajesPorSala[mensajeJson.idSala] ){
                mensajesPorSala[mensajeJson.idSala] = [];
            }
            const fecha = new Date();
            mensajesPorSala[mensajeJson.idSala].push({
                ...mensajeJson, fecha
            });
            clientesSala( mensajeJson.idSala ).forEach( (cl) => {
                if( cl.readyState === WebSocket.OPEN ){
                    cl.send( JSON.stringify( { ...mensajeJson, fecha } ) );
                }
            });
        }
    });
});

function existeCliente( wsClient ){
    return clientes.filter( (c) => {
        return c.client == wsClient;
    }).length > 0;
}

function clientesSala( idSala ){
    return clientes.filter( (cl) => {
        return cl.idSala == idSala;
    }).map( (cl) => {
        return cl.client;
    });
}

function obtenerSala( idSala ){
    return salas.find( (sala) => {
        return sala.idSala == idSala;
    });
}