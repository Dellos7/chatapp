let ws, idSala, usuario;

const baseUrlBackend = `http://${window.location.hostname}:3000`;

const formEntrarSalaEl = document.querySelector( '#entrar-en-sala' );
const salaEl = document.getElementById( 'sala' );
const usuarioEl = document.querySelector('#entrar-en-sala [name="usuario"]');
const idSalaEl = document.querySelector('#entrar-en-sala [name="id-sala"]');
const mensajesEl = document.querySelector( '#sala .mensajes' );
const nombreSalaEl = document.getElementById( 'nombre-sala' );
const imagenSalaEl = document.getElementById( 'imagen-sala' );
const salaHeaderEl = document.getElementById( 'sala-header' );

obtenerSalas();

function apiCall( endPoint, callback ){
    const url = `${baseUrlBackend}/chat/${endPoint}`;
    const req = new XMLHttpRequest();
    req.open( 'GET', url );
    req.onreadystatechange = function(){
        if( req.status === 200 && req.readyState === req.DONE ){
            callback( JSON.parse(req.response) );
        }
    };
    req.send();
}

function obtenerSalas(){
    apiCall( 'salas', (salas) => {
        rellenarSalasOpts(salas);
    });
}

function rellenarSalasOpts( salas ){
    for( let sala of salas ){
        const optEl = document.createElement('option');
        optEl.innerText = `${sala.idSala}- ${sala.nombre}`;
        optEl.value = sala.idSala;
        idSalaEl.appendChild(optEl);
    }
}

function obtenerIdSalaSeleccionada(){
    return idSalaEl.options[ idSalaEl.selectedIndex ].value;
}

function entrarEnSala(e){
    e.preventDefault();
    ws = new WebSocket( `ws://${window.location.hostname}:3100` );
    ws.addEventListener( 'open', (e) => {
        idSala = obtenerIdSalaSeleccionada();
        usuario = usuarioEl.value;
        ws.send( JSON.stringify({ usuario, idSala }) );
    });
    ws.addEventListener( 'message', (e) =>{
        const res = JSON.parse(e.data);
        if( res.estado ){
            document.documentElement.style.setProperty( '--color-primary', res.color );
            nombreSalaEl.innerText = res.nombre;
            imagenSalaEl.src = `${baseUrlBackend}${res.foto}`;
            salaHeaderEl.style.background = res.color;
        }
        else{
            insertarMensajeEnSala( res );
        }
    });
    formEntrarSalaEl.classList.toggle( 'oculto' );
    salaEl.classList.toggle( 'oculto' );
    return false;
}

function enviarMensajeSala(e){
    e.preventDefault();
    const mensajeEl = document.querySelector( '#enviar-mensaje-sala [name="mensaje"]' );
    const txt = mensajeEl.value;
    if( txt ){
        ws.send( JSON.stringify( { mensaje: txt, usuario, idSala } ) );
        mensajeEl.value = '';
    }
    return false;
}

function insertarMensajeEnSala(msg){
    const mensajeEl = document.createElement( 'div' );
    mensajeEl.classList.add('mensaje');
    if( msg.usuario === usuario ){
        mensajeEl.classList.add( 'propio' );
    }
    const usuarioEl = document.createElement( 'span' );
    usuarioEl.classList.add( 'usuario' );
    usuarioEl.innerText = msg.usuario;
    mensajeEl.appendChild(usuarioEl);
    const textoMensajeEl = document.createElement( 'span' );
    textoMensajeEl.classList.add( 'texto-mensaje' );
    textoMensajeEl.innerText = msg.mensaje;
    mensajeEl.appendChild(textoMensajeEl);
    mensajesEl.appendChild(mensajeEl);
}