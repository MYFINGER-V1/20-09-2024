
function getAdminIdFromSession() {
    // Obtener el adminId desde el almacenamiento local o sesión
    return localStorage.getItem('adminId') || '';

}document.addEventListener('DOMContentLoaded', () => {
    const userTableBody = document.querySelector('#userTable tbody');
    const adminId = getAdminIdFromSession();

    if (!adminId) {
        alert('Error: No se valida usuario como administrador.');
        return;
    }

    fetch(`/api/users?adminId=${adminId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la red: ' + response.statusText);
            }
            return response.json();
        })
        .then(users => {
            if (Array.isArray(users)) {
                userTableBody.innerHTML = users.map(user => `
                    <tr>
                        <td>${user.nombre}</td>
                        <td>${user.apellido}</td>
                        <td>${user.apodo}</td>
                        <td>${user.correo}</td>
                        <td>${user.estado}</td>
                        <td>
                            <button class="update-btn" onclick="openUpdateModal(${user.id_usuario})">Actualizar</button>
                            <button class="delete-btn" onclick="confirmDelete(${user.id_usuario})">Eliminar</button>
                        </td>
                    </tr>
                `).join('');
            } else {
                console.error('La respuesta del servidor no es una lista de usuarios');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ocurrió un error al cargar los usuarios. Por favor, inténtalo de nuevo más tarde.');
        });
});



function confirmDelete(id) {
    const adminId = localStorage.getItem('adminId'); // Asegúrate de usar localStorage para recuperar el adminId

    if (!adminId) {
        alert('Error: No se valida usuario como administrador.');
        return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
        fetch(`/api/users/${id}?adminId=${adminId}`, { // Incluye adminId en la query string
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                alert('Usuario eliminado correctamente');
                location.reload(); // Recargar la página para actualizar la tabla
            } else {
                alert('Error al eliminar el usuario');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ocurrió un error al eliminar el usuario.');
        });
    }
}





// Función para cargar el contenido del modal desde una URL
function loadModal(url, callback) {
    console.log('Cargando modal desde URL:', url);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log('Modal cargado con éxito');
                callback(xhr.responseText);
            } else {
                console.error('Error al cargar el modal:', xhr.statusText);
            }
        }
    };
    xhr.send();
}


// Función para manejar la visualización y cierre de los modales
function handleModalDisplay(modal, overlay) {
    if (modal && overlay) {
        modal.style.display = 'block';
        overlay.style.display = 'block';

        const closeModalSpan = modal.getElementsByClassName('close')[0];
        if (closeModalSpan) {
            closeModalSpan.onclick = function () {
                modal.style.display = 'none';
                overlay.style.display = 'none';
            };
        }

        document.onkeydown = function (event) {
            if (event.key === "Escape") {
                modal.style.display = 'none';
                overlay.style.display = 'none';
            }
        };

        window.onclick = function (event) {
            if (event.target === overlay) {
                modal.style.display = 'none';
                overlay.style.display = 'none';
            }
        };
    }
}

// Función para abrir el modal de actualización y cargar los datos del usuario
function openUpdateModal(userId) {
    /*console.log('Abriendo modal de actualización para usuario con ID:', userId);*/

    // Cargar el modal de actualización
    loadModal('/html/actualizar-modal.html', function (html) {
        modalContainer.innerHTML = html;
        const updateModal = document.getElementById('updateModal');
        const updateOverlay = document.querySelector('.modal-overlay');
        const adminId = getAdminIdFromSession();

        // Manejar la visualización del modal de actualización
        handleModalDisplay(updateModal, updateOverlay);

        // Obtener los datos del usuario y rellenar el formulario
        fetch(`/api/users/${userId}?adminId=${adminId}`)
            .then(response => response.json())
            .then(user => {
                // Rellenar los campos del formulario con los datos del usuario
                const form = updateModal.querySelector('.form');
                if (form) {
                    form.querySelector('input[name="username"]').value = user.nombre;
                    form.querySelector('input[name="apellido"]').value = user.apellido;
                    form.querySelector('input[name="nickname"]').value = user.apodo;
                    form.querySelector('input[name="correo"]').value = user.correo;
                    form.querySelector('input[name="password"]').value = user.contrasena; 
                    form.querySelector('select[name="estado"]').value = user.estado;

                    // Manejar el envío del formulario de actualización
                    form.addEventListener('submit', function (event) {
                        event.preventDefault();

                        // Obtener los datos actualizados del formulario
                        const nombre = form.querySelector('input[name="username"]').value;
                        const apellido = form.querySelector('input[name="apellido"]').value;
                        const apodo = form.querySelector('input[name="nickname"]').value;
                        const correo = form.querySelector('input[name="correo"]').value;
                        const contrasena = form.querySelector('input[name="password"]').value;
                        const estado = form.querySelector('select[name="estado"]').value;

                        // Validar el formato del correo
                        if (!correo.includes('@')) {
                            const responseMessage = updateModal.querySelector('#responseMessage');
                            if (responseMessage) {
                                responseMessage.textContent = 'El correo electrónico debe contener un "@"';
                                responseMessage.style.color = 'red';
                            }
                            return;
                        }

                        const formData = {
                            nombre,
                            apellido,
                            apodo,
                            correo,
                            contrasena,
                            estado,
                            adminId
                        };

                        // Enviar los datos actualizados como JSON
                        fetch(`/api/users/${userId}?adminId=${adminId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(formData)
                        })
                        .then(response => response.json())
                        .then(data => {
                            const responseMessage = updateModal.querySelector('#responseMessage');
                            if (responseMessage) {
                                // Ajustar el mensaje y el color según la respuesta del servidor
                                if (data.error) {
                                    responseMessage.textContent = data.error;
                                    responseMessage.style.color = 'red';
                                } else if (data.message) {
                                    responseMessage.textContent = data.message;
                                    responseMessage.style.color = 'green';
                                    setTimeout(() => {
                                        updateModal.style.display = 'none';
                                        if (updateOverlay) {
                                            updateOverlay.style.display = 'none';
                                        }
                                        location.reload(); 
                                    }, 1100);
                                } else {
                                    responseMessage.textContent = 'Error desconocido';
                                    responseMessage.style.color = 'red';
                                }
                            }
                        })
                        .catch(error => {
                            console.error('Error al actualizar el usuario:', error);
                            const responseMessage = updateModal.querySelector('#responseMessage');
                            if (responseMessage) {
                                responseMessage.textContent = 'Ocurrió un error al actualizar el usuario.';
                                responseMessage.style.color = 'red';
                            }
                        });
                    });
                }
            })
            .catch(error => {
                console.error('Error al obtener los datos del usuario:', error);
            });
    });
}

