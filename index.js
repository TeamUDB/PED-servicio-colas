const PrismaClient = require('@prisma/client').PrismaClient;
const express = require('express');
const bodyParser = require('body-parser')

// create application/json parser
const jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({extended: false})

const prisma = new PrismaClient()
const app = express();
const http = require('http');
const server = http.createServer(app);

/* Lista los ultimos 5 turnos que se han  atendido */
app.get('/api/turno/ultimos', (req, res) => {
    return getUltimosTurnos().then((turnos) => {
        const turnosAtendidos = turnos.map((turno) => {
            return {
                id: turno.id,
                code: turno.code
            };
        });
        res.json({turnos: turnosAtendidos});
    }).then(async () => {
        await prisma.$disconnect();
    });
});

/* Solicita que le asignen el turno que va a ser atendido */
app.post('/api/turno/solicitar', (req, res) => {
    return getTurnoAsignar().then((turno) => {
        res.json({id: turno.id, code: turno.code});
    }).then(async () => {
        await prisma.$disconnect();
    });
});

/* Confirma que ya empezo a atender el cliente */
app.post('/api/turno/iniciar', jsonParser, (req, res, next) => {
    const {id, code} = req.body;
    return updateTurno(id, code, 1).then((turno) => {
        res.json({id: turno.id, code: turno.code});
    }).then(async () => {
        await prisma.$disconnect();
    });
});

/* Cancela el turno */
app.post('/api/turno/cancelar', jsonParser, (req, res) => {
    const {id, code} = req.body;
    return updateTurno(id, code, 2).then((turno) => {
        res.json({id: turno.id, code: turno.code});
    }).then(async () => {
        await prisma.$disconnect();
    });
});

/* Recibe el numero de documento y devuelve el turno que le corresponde */
app.post('/api/turno/asignar', jsonParser, (req, res) => {
    const {document} = req.body;
    return getCliente(document).then((cliente) => {
        if (cliente) {
            return crearTurno(cliente).then((turno) => {
                res.json({id: turno.id, code: turno.code});
            });
        } else {
            res.json({error: 'No fue posible asignar el turno'});
        }
    }).then(async () => {
        await prisma.$disconnect();
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});


// Funcion para obtener los ultimos 5 turnos atendidos
const getUltimosTurnos = async () => {
    const turnos = await prisma.clients_queues.findMany({
        where: {
            status: 1
        },
        orderBy: {
            created_at: 'desc'
        },
        take: 6
    });
    return turnos;
}

// Function para obtener el turno que se va a asignar
const getTurnoAsignar = async () => {
    const records = await prisma.clients_queues.findMany({
        where: {
            status: 0
        },
        orderBy: {
            created_at: 'asc'
        }
    });

    // Buscar el registro con la prioridad mas alta
    let turno = records[0];
    let diffSeconds = Math.abs(new Date() - turno.created_at) * turno.priority;
    const now = new Date();
    records.forEach((record) => {
        if ((Math.abs(now - record.created_at) * record.priority) > diffSeconds) {
            turno = record;
        }
    });
    return turno;
}

// Funcion para actualizar el estado del turno
const updateTurno = async (id, code, status) => {
    const turno = await prisma.clients_queues.update({
        where: {
            id: id,
            code: code
        },
        data: {
            status: status
        }
    });
    return turno;
}

// Funcion para buscar al cliente por medio del documento
const getCliente = async (documento) => {
    const cliente = await prisma.clients.findFirst({
        where: {
            document: documento
        }
    });
    return cliente;
}

// Funcion para crear el turno en la tabla clients_queues y colocar la prioridad al insertar el cliente
const crearTurno = async (cliente) => {
    const turno = await prisma.clients_queues.create({
        data: {
            clients: {
                connect: {
                    id: cliente.id
                }
            },
            priority: cliente.priority,
            status: 0
        }
    });
    return turno;
}