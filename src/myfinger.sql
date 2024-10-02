
-- Tabla de roles de usuario
CREATE TABLE Roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
);

CREATE TABLE Admins (
    id_admin INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    apodo VARCHAR(30) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE
);



-- Tabla de usuarios
CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    apodo VARCHAR(30) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado TINYINT DEFAULT 1, -- 1 para activo, 0 para inactivo
    rol_id INT,
    admin_id INT NULL,
    FOREIGN KEY (rol_id) REFERENCES Roles(id),
	FOREIGN KEY (admin_id) REFERENCES Admins(id_admin)
);


DELIMITER //

CREATE PROCEDURE InsertUserAndAdmin(
    IN p_nombre VARCHAR(50),
    IN p_apellido VARCHAR(50),
    IN p_apodo VARCHAR(30),
    IN p_correo VARCHAR(100),
    IN p_contrasena VARCHAR(255),
    IN p_estado TINYINT,
    IN p_rol_id INT
)
BEGIN
    DECLARE id_admin INT;

    -- Insertar el nuevo usuario
    INSERT INTO Usuarios (nombre, apellido, apodo, correo, contrasena, estado, rol_id)
    VALUES (p_nombre, p_apellido, p_apodo, p_correo, p_contrasena, p_estado, p_rol_id);

    -- Verificar si el nuevo usuario es un administrador
    IF p_rol_id = 1 THEN
        -- Insertar el nuevo admin en la tabla Admins
        INSERT INTO Admins (nombre, apellido, apodo, correo)
        VALUES (p_nombre, p_apellido, p_apodo, p_correo);

        -- Obtener el ID del nuevo admin
        SET id_admin = LAST_INSERT_ID();

        -- Actualizar el campo admin_id en la tabla Usuarios
        UPDATE Usuarios
        SET admin_id = id_admin
        WHERE correo = p_correo;
    END IF;
END//

DELIMITER ;



-- Tabla de tipos de actividad
CREATE TABLE TiposActividad (
    id_tipo_actividad INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- Tabla de actividades
CREATE TABLE Actividad (
    id_actividad INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    id_usuario INT NOT NULL, -- Llave foránea hacia Usuarios
    id_tipo_actividad INT NOT NULL, -- Llave foránea hacia TiposActividad
    tiempo TIME,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
    FOREIGN KEY (id_tipo_actividad) REFERENCES TiposActividad(id_tipo_actividad)
);

-- Tabla de textos para las actividades
CREATE TABLE Textos (
    id_texto INT AUTO_INCREMENT PRIMARY KEY,
    texto TEXT NOT NULL,
    id_actividad INT NOT NULL, -- Llave foránea hacia Actividad
    FOREIGN KEY (id_actividad) REFERENCES Actividad(id_actividad)
);

-- Tabla de programación de actividades
CREATE TABLE Programacion (
    id_programacion INT AUTO_INCREMENT PRIMARY KEY,
    fecha_inicio DATETIME,
    fecha_fin DATETIME,
    id_actividad INT NOT NULL, -- Llave foránea hacia Actividad
    cantidad_textos INT, -- Podrías ajustar a un tipo numérico
    tiempo TIME,
    FOREIGN KEY (id_actividad) REFERENCES Actividad(id_actividad)
);

-- Tabla de resultados
CREATE TABLE Resultados (
    id_usuario INT NOT NULL, -- Llave foránea hacia Usuarios
    id_texto INT NOT NULL, -- Llave foránea hacia Textos
    puntaje TINYINT NOT NULL, -- Puntaje entre 1 y 100
    aciertos INT NOT NULL,
    fallos INT NOT NULL,
    PRIMARY KEY (id_usuario, id_texto), -- Llave primaria compuesta
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
    FOREIGN KEY (id_texto) REFERENCES Textos(id_texto)
);


#Insertar datos 
INSERT INTO `Roles` (`id`, `nombre`, `descripcion`) VALUES ('1', 'Admin', 'Gestión de Usuarios: Permite realizar operaciones CRUD (crear, leer, actualizar y eliminar) sobre los usuarios.\r\nVisualización de Datos: Acceso a la información personal de los usuarios y a los datos de rendimiento obtenidos en las actividades.'), ('2', 'Customer', 'acceder a actividades de mecanografía, seguir el progreso personal y gestionar resultados a través del registro e inicio de sesión.');
call InsertUserAndAdmin ('Julian', 'Bernal', 'Jambs', 'julianalberto448@gmail.com', '2878641', '1', '1');
call InsertUserAndAdmin ('Yuliet', 'Sanzhex', 'Yuli', 'Yuliet@gmail.com', '2878641', '1', '1');
call InsertUserAndAdmin ('Stefania', 'Cuenca', 'Stef', 'stefania@gmail.com', '2878641', '1', '1');






INSERT INTO Usuarios (nombre, apellido, apodo, correo, contrasena, estado,rol_id, admin_id)
VALUES ('Julian2', 'Bernal', 'Jambs', 'julianalberto4482@gmail.com', '2878641', 1, 2,1);



