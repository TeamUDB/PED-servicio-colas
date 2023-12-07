const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

app.get('/api/turno/actual', (req, res) => {
    res.json({turno: 'P09'});
});

/* Lista los ultimos 5 turnos que se han  atendido */
app.get('/api/turno/ultimos', (req, res) => {
    res.json({turnos: ['P01', 'P02', 'P03', 'P04', 'P05']});
});

/* Solicita que le asignen el turno que va a ser atendido */
app.post('/api/turno/solicitar', (req, res) => {
    res.json({turno: 'P09'});
});

/* Confirma que ya empezo a atender el cliente */
app.post('/api/turno/iniciar', (req, res) => {
    const turno = req.body.turno;
    res.json({turno: 'P09'});
});

/* Cancela el turno */
app.post('/api/turno/cancelar', (req, res) => {
    const turno = req.body.turno;
    res.json({turno: 'P09'});
});

/* Recibe el numero de documento y devuelve el turno que le corresponde */
app.post('/api/turno/asignar/:documento', (req, res) => {
    const documento = req.body.documento;
    res.json({turno: 'P09'});
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});