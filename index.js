const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql2');
const dotenv = require('dotenv');

// Rutas
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes'); 
const crudUserRoutes = require('./src/routes/crudUserRoutes'); // Importamos las rutas del CRUD de usuarios

// Configuración del servidor y base de datos
const config = require('./config');

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de la sesión
app.use(session({
    secret: 'tu-secreto', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

// Configuración de la base de datos MySQL
const db = mysql.createConnection({
    host: process.env.MYSQL_HOST || config.mysql.host,
    user: process.env.MYSQL_USER || config.mysql.user,
    password: process.env.MYSQL_PASSWORD || config.mysql.password,
    database: process.env.MYSQL_DB || config.mysql.database,
    port: process.env.MYSQL_PORT || config.mysql.port
});

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.message);
        return;
    }
    console.log('Conectado a la base de datos MySQL.');
});

// Rutas de la API
app.use('/api', userRoutes); // Rutas para el registro de usuario
app.use('/api', authRoutes); // Rutas de autenticación
app.use('/api', crudUserRoutes); // Rutas para el CRUD de usuario

// Rutas para páginas estáticas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

app.get('/acerca_de', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'acerca_de.html'));
});

app.get('/actividades', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'Actividades.html'));
});

app.get('/modos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'app.html'));
});

// Obtener el puerto desde las variables de entorno o utilizar el 4000 por defecto
const PORT = process.env.PORT || config.app.port

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
