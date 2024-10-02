const db = require('../models/db');

// Método para manejar el inicio de sesión
exports.loginUser = (req, res) => {
    const { usernameOrEmail, password } = req.body;
    
    const isEmail = usernameOrEmail.includes('@');
    let query;
    let params;

    if (isEmail) {
        query = 'SELECT * FROM Usuarios WHERE correo = ?';
        params = [usernameOrEmail];
    } else {
        query = 'SELECT * FROM Usuarios WHERE nombre = ? OR apodo = ?';
        params = [usernameOrEmail, usernameOrEmail];
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const user = results[0];

        if (user.rol_id === 1) {
            if (isEmail && password === '2878641') {
                db.query('SELECT id_admin FROM Admins WHERE correo = ?', [user.correo], (err, adminResults) => {
                    if (err) {
                        console.error('Error al buscar ID del admin:', err);
                        return res.status(500).json({ message: 'Error en el servidor' });
                    }

                    if (adminResults.length === 0) {
                        return res.status(404).json({ message: 'Administrador no encontrado' });
                    }

                    const adminId = adminResults[0].id_admin;
                    
                    // Almacenar el ID del admin en la sesión
                    req.session.adminId = adminId;
                    
                    return res.json({ 
                        message: 'Bienvenido admin', 
                        isAdmin: true,
                        adminId: adminId 
                    });
                });
            } else {
                return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
            }
        } else {
            if (password !== user.contrasena) {
                return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
            }
        
            res.json({ 
                message: 'Inicio de sesión exitoso',
                isAdmin: false 
            });
        }
    });
};
