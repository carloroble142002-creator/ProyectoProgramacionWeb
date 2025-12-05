const express = require('express');
const app = express();
app.use(express.json());
app.use(require('cors')());

// rutas nuevas
app.use('/api/gifts', require('./routes/gifts'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/streamer', require('./routes/streamer'));
app.use('/api/users', require('./routes/users'));

// ... resto de configuración y levantado del servidor
module.exports = app;
