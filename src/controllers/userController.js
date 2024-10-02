const db = require('../models/db');

function getAdminIdFromSession(req) {
    return req.session.adminId || '';
}

exports.registerUser = (req, res) => {
    console.log('Datos recibidos:', req.body); // Verificar datos recibidos

    const { username, apellido, nickname, correo, password, estado } = req.body;

    // Verificar si todos los campos están presentes
    if (!username || !apellido || !nickname || !correo || !password || estado === undefined) {
        return res.status(400).json({ message: 'Todos los campos son requeridos, incluyendo el estado' });
    }

    // Verificar si el correo contiene el carácter '@'
    if (!correo.includes('@')) {
        return res.status(400).json({ message: 'El correo electrónico debe contener el carácter @' });
    }

    // Verificar si el correo ya existe
    const checkEmailQuery = 'SELECT * FROM Usuarios WHERE correo = ?';
    db.query(checkEmailQuery, [correo], (err, results) => {
        if (err) {
            console.error('Error al verificar el correo:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (results.length > 0) {
            // Correo ya registrado
            return res.status(400).json({ message: 'El correo electrónico ya está en uso' });
        }

        const rolId = 2; // Rol de ID 2 (Usuario)
        const adminId = getAdminIdFromSession(req); // Usa req para obtener adminId desde la sesión
        // Insertar el nuevo usuario 

        const queryAdminCheck = 'SELECT rol_id FROM Usuarios WHERE admin_id = ?';

        db.query(queryAdminCheck, [adminId], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Error al verificar el rol del usuario' });
            }

            const adminRole = results[0]?.rol_id;
            if (adminRole !== 1) {
                return res.status(403).json({ message: 'Acceso denegado: solo los administradores pueden crear usuarios.' });
            }

            // Si el rol_id es 1, procedemos a crear el nuevo usuario
            const query = 'INSERT INTO Usuarios (nombre, apellido, apodo, correo, contrasena, estado, rol_id, admin_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            db.query(query, [username, apellido, nickname, correo, password, estado, rolId, adminId], (err, result) => {
                if (err) {
                    console.error('Error al registrar usuario:', err);
                    res.status(500).json({ message: 'Error en el servidor' });
                } else {
                    console.log('Usuario registrado con éxito'); // Verificar éxito de la operación
                    res.status(200).json({ message: 'Usuario registrado con éxito' });
                }
            });
        });

    });
};
