import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { Database } from './config/conexion.js';
import path from 'path';
const app = express();
// Middleware
app.use(cors());
app.use(express.json());
// Rutas con prefijo /api
app.use('/api', routes);
// Configurar middleware para servir archivos estáticos
app.use(express.static('dist/views'));
// Servir el HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './views/index.html'));
});
// Inicializar la base de datos
Database.init()
    .then(() => {
    console.log('Base de datos conectada');
})
    .catch(error => {
    console.error('Error al conectar a la base de datos:', error);
});
// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
export default app;
