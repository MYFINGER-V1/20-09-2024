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


// Abrir el modal de registro al hacer clic en "Registrarse"
const openRegisterModalBtn = document.getElementById('openRegisterModalBtn');
if (openRegisterModalBtn) {
    openRegisterModalBtn.onclick = function () {
        console.log('Abriendo modal de registro');
        loadModal('/html/registro-modal.html', function (html) {
            modalContainer.innerHTML = html;
            const registerModal = document.getElementById('registerModal');
            const registerOverlay = document.querySelector('.modal-overlay');

            // Manejar la visualización del modal de registro
            handleModalDisplay(registerModal, registerOverlay);

            // Manejar el formulario de registro
            const modal = document.getElementById('registerModal');
            if (modal) {
                const form = modal.querySelector('.form');
                console.log('Formulario encontrado:', form); 

                if (form) {
                    form.addEventListener('submit', function (event) {
                        event.preventDefault(); 

                        const username = form.querySelector('input[name="username"]').value;
                        const apellido = form.querySelector('input[name="apellido"]').value;
                        const nickname = form.querySelector('input[name="nickname"]').value;
                        const correo = form.querySelector('input[name="correo"]').value;
                        const password = form.querySelector('input[name="password"]').value;
                        const estado = form.querySelector('select[name="estado"]').value;

                        /*console.log('Datos del formulario:', { username, apellido, nickname, correo, password, estado });*/

                        // Crear un objeto con los datos del formulario y el adminId
                        const formData = {
                            username,
                            apellido,
                            nickname,
                            correo,
                            password,
                            estado,
                        };

                        fetch('/api/register', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(formData)
                        })
                        .then(response => response.json())
                        .then(data => {
                            const responseMessage = modal.querySelector('#responseMessage');
                            if (responseMessage) {
                                responseMessage.textContent = data.message;
                                responseMessage.style.color = data.message === 'Usuario registrado con éxito' ? 'green' : 'red';
                                
                                if (data.message === 'Usuario registrado con éxito') {
                                    setTimeout(() => {
                                        modal.style.display = 'none';
                                        const overlay = document.querySelector('.modal-overlay'); 
                                        if (overlay) {
                                            overlay.style.display = 'none'; 
                                        }
                                        location.reload(); 
                                    }, 1100);
                                }
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            const responseMessage = modal.querySelector('#responseMessage');
                            if (responseMessage) {
                                responseMessage.textContent = 'Ocurrió un error en el registro.';
                                responseMessage.style.color = 'red'; 
                            }
                        });
                    });
                } else {
                    console.error('Formulario no encontrado dentro de #registerModal');
                }
            } else {
                console.error('Modal #registerModal no encontrado');
            }
        });
    };  

}
