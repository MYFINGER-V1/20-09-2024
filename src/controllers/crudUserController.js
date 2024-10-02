const db = require('../models/db');

// Verificar si el usuario es administrador
function isAdmin(adminId) {
    return new Promise((resolve, reject) => {
        if (!adminId) {
            return reject('No se valida usuario como administrador');
        }

        const query = 'SELECT rol_id FROM Usuarios WHERE admin_id = ?';
        db.query(query, [adminId], (err, results) => {
            if (err) {
                return reject('Error al verificar el rol del usuario');
            }
            if (results.length > 0 && results[0].rol_id === 1) {
                resolve(true); // El usuario es un administrador
            } else {
                resolve(false); // No es administrador
            }
        });
    });
}


// Obtener todos los usuarios (solo accesible por administradores)
exports.getUsers = async (req, res) => {
    
    const adminId = req.query.adminId; 
    console.log('Admin ID en getUsers:', adminId);
    try {
        // Verifica que el adminId esté presente
        if (!adminId) {
            return res.status(400).json({ message: 'No se valida usuario como administrador.' });
        }

        const isAdminUser = await isAdmin(adminId);
        if (!isAdminUser) {
            return res.status(403).json({ message: 'Acceso denegado: solo los administradores pueden ver esta información.' });
        }

        // Si es administrador, obtiene todos los usuarios
        const query = 'SELECT * FROM Usuarios WHERE rol_id = 2 AND admin_id = ? ;';
        db.query(query, [adminId], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener los usuarios' });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
};




// Actualizar un usuario
exports.updateUser = async (req, res) => {
    const adminId = req.query.adminId;
    const { id } = req.params;
    const { nombre, apellido, apodo, correo, contrasena, estado } = req.body;

    try {
        const isAdminUser = await isAdmin(adminId);
        if (!isAdminUser) {
            return res.status(403).json({ message: 'Acceso denegado: solo los administradores pueden actualizar usuarios.' });
        }

        if (!correo.includes('@')) {
            return res.status(400).json({ error: 'El correo electrónico debe contener un "@"' });
        }

        const checkEmailQuery = 'SELECT COUNT(*) AS count FROM Usuarios WHERE correo = ? AND id_usuario != ?';
        db.query(checkEmailQuery, [correo, id], (err, results) => {

            if (results[0].count > 0) {
                return res.status(400).json({ error: 'El correo electrónico ya está en uso' });
            }

            const updateQuery = 'UPDATE Usuarios SET nombre = ?, apellido = ?, apodo = ?, correo = ?, contrasena = ?, estado = ? WHERE id_usuario = ?';
            db.query(updateQuery, [nombre, apellido, apodo, correo, contrasena, estado, id], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Error al actualizar el usuario' });
                }
                res.status(200).json({ message: 'Usuario actualizado correctamente' });
            });
        });
    } catch (error) {
        res.status(500).json({ error });
    }
};

// Eliminar un usuario
exports.deleteUser = async (req, res) => {
    const adminId = req.query.adminId;
    const { id } = req.params;

    try {
        const isAdminUser = await isAdmin(adminId);
        if (!isAdminUser) {
            return res.status(403).json({ message: 'Acceso denegado: solo los administradores pueden eliminar usuarios.' });
        }

        const DeleteQuery = 'DELETE  FROM Usuarios WHERE id_usuario = ?';
        db.query(DeleteQuery, [id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error al eliminar el usuario' });
            }
            res.status(200).json({ message: 'Usuario eliminado correctamente' });
        });
    } catch (error) {
        res.status(500).json({ error });
    }
};

// Obtener un usuario por ID
exports.getUserById = async (req, res) => {
    const adminId = req.query.adminId;
    const { id } = req.params;

    try {
        const isAdminUser = await isAdmin(adminId);
        if (!isAdminUser) {
            return res.status(403).json({ message: 'Acceso denegado: solo los administradores pueden obtener información de los usuarios.' });
        }

        const query = 'SELECT * FROM Usuarios WHERE id_usuario = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener el usuario' });
            }
            if (result.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            res.status(200).json(result[0]);
        });
    } catch (error) {
        res.status(500).json({ error });
    }
};
