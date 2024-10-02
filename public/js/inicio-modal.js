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

        // Cerrar el modal al hacer clic en la "X"
        const closeModalSpan = modal.getElementsByClassName('close')[0];
        if (closeModalSpan) {
            closeModalSpan.onclick = function () {
                modal.style.display = 'none';
                overlay.style.display = 'none';
            };
        }

        // Cerrar el modal al presionar la tecla "Esc"
        document.onkeydown = function (event) {
            if (event.key === "Escape") {
                modal.style.display = 'none';
                overlay.style.display = 'none';
            }
        };

        // Cerrar el modal al hacer clic fuera de él
        window.onclick = function (event) {
            if (event.target === overlay) {
                modal.style.display = 'none';
                overlay.style.display = 'none';
            }
        };
    }
}

// Obtener el botón para abrir el modal de inicio de sesión
const openModalBtn = document.getElementById('openModalBtn');
const modalContainer = document.getElementById('modalContainer');

// Función para cerrar el modal
function closeModal(modal) {
    if (modal) {
        modal.classList.remove('show'); // O la clase que estés usando para mostrar el modal
        setTimeout(() => {
            modalContainer.innerHTML = ''; // Limpiar el contenido del modal
        }, 300); // Tiempo para la animación de cierre del modal
    }
}

// Cargar el modal de inicio de sesión al hacer clic en el botón
// Cargar el modal de inicio de sesión al hacer clic en el botón
if (openModalBtn) {
    openModalBtn.onclick = function () {
        console.log('Botón de abrir modal clickeado');
        loadModal('/html/login-modal.html', function (html) {
            modalContainer.innerHTML = html;
            const loginModal = document.getElementById('loginModal');
            const overlay = document.querySelector('.modal-overlay');

            // Manejar la visualización del modal de inicio de sesión
            handleModalDisplay(loginModal, overlay);

            // Manejar el formulario de inicio de sesión
            const form = loginModal.querySelector('.form');
            if (form) {
                form.addEventListener('submit', function (event) {
                    event.preventDefault(); // Prevenir el envío por defecto del formulario

                    // Recoger los datos del formulario
                    const usernameOrEmail = form.querySelector('input[name="username"]').value;
                    const password = form.querySelector('input[name="password"]').value;

                    /*console.log('Datos de inicio de sesión:', { usernameOrEmail, password });*/

                    // Enviar los datos al servidor para autenticar
                    fetch('/api/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ usernameOrEmail, password })
                    })
                    .then(response => response.json())
                    .then(data => {
                        const responseMessage = loginModal.querySelector('#responseMessage');
                        if (responseMessage) {
                            // Ajustar el mensaje y el color según la respuesta
                            switch(data.message) {
                                case 'Inicio de sesión exitoso':
                                    responseMessage.textContent = data.message;
                                    responseMessage.style.color = 'green';
                                    break;
                                case 'Bienvenido admin':
                                    responseMessage.textContent = data.message;
                                    responseMessage.style.color = 'pink';
                                    break;
                                case 'Usuario no encontrado':
                                    responseMessage.textContent = data.message;
                                    responseMessage.style.color = 'red';
                                    break;
                                case 'Usuario o contraseña incorrectos':
                                    responseMessage.textContent = data.message;
                                    responseMessage.style.color = 'red';
                                    break;
                                default:
                                    responseMessage.textContent = 'Error desconocido';
                                    responseMessage.style.color = 'red';
                                    break;
                            }

                            

                            // Cerrar el modal después de 2 segundos y redirigir según el rol
                            if (data.message === 'Inicio de sesión exitoso' || data.message === 'Bienvenido admin') {
                                setTimeout(() => {
                                    closeModal(loginModal); // Cerrar el modal
                            
                                    // Guardar adminId en localStorage si es un administrador
                                    if (data.isAdmin) {
                                        localStorage.setItem('adminId', data.adminId);
                                         // Almacenar la URL actual en localStorage antes de redirigir
                                        localStorage.setItem('previousPage', window.location.pathname);
                                    }
                                    
                                    

                                    setTimeout(() => {
                                        // Redirigir al usuario según su rol después de cerrar el modal
                                        if (data.isAdmin) {
                                            window.location.href = `/html/admin-app.html?id=${data.adminId}`; // Redirigir a la página de administrador con el ID
                                            
                                        } else {
                                            window.location.href = '/html/app.html'; // Redirigir a la página de usuario
                                        }
                                    }, 300); 
                                }, 2000); 
                            }

                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        const responseMessage = loginModal.querySelector('#responseMessage');
                        if (responseMessage) {
                            responseMessage.textContent = 'Ocurrió un error al iniciar sesión.';
                            responseMessage.style.color = 'red'; // Destacar el mensaje de error
                        }
                    });
                });
            } else {
                console.error('Formulario de inicio de sesión no encontrado');
            }
        });
    }
}

