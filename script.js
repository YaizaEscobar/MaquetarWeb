
let productosData;
let usuariosJSON;
let cantidadProducto = 1;
let precioTotal = 0;
let osmUrl, osmAttrib, osm, map;
const header = document.querySelector('header');

// Funcion para cargar las distintas funciones cuando se cargue la pagina
window.onload = function () {
    cargarInfoUsuarioSS();
    cargarInfoProductos();
    cargarUsuariosJSON();
    setMap();
};

//Funcion para abrir el modal
function abrirModales(id) {
    const modal = document.getElementById(id);
    modal.classList.add('show');
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
}

//Funcion para cerrar los modales
function cerrarModales(id) {
    const modal = document.getElementById(id);
    modal.classList.remove('show');
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

// Función para validar el registro 
function validarRegistro() {
    // Expresiones regulares
    const nombreRegex = /^[a-zA-Z]+$/;
    const apellidosRegex = /^[a-zA-Z ]+$/;
    const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z]+$/;
    const contraseniaRegex = /^(?=.*[A-Za-z0-9@$!%*?&])[A-Za-z\d@$!%*?& ]{8,}$/;

    // Obtenemos los valores del formulario
    const nombre = document.getElementById('textoNombre').value;
    const apellidos = document.getElementById('textoApellidos').value;
    const email = document.getElementById('textoEmailR').value;
    const contrasenia = document.getElementById('textoContraseniaR').value;

    // Resetear mensajes de error
    document.getElementById('nombreError').innerText = '';
    document.getElementById('apellidosError').innerText = '';
    document.getElementById('emailError').innerText = '';
    document.getElementById('contraseniaError').innerText = '';

    // Validar nombre
    if (!nombreRegex.test(nombre)) {
        document.getElementById('nombreError').innerText = 'Nombre inválido, solo debe tener letras';
        return;
    }

    // Validar apellidos
    if (!apellidosRegex.test(apellidos)) {
        document.getElementById('apellidosError').innerText = 'Apellidos inválidos solo debe tener letras';
        return;
    }

    // Validar email
    if (!emailRegex.test(email)) {
        document.getElementById('emailError').innerText = 'Email inválido';
        return;
    }

    // Validar contraseña
    if (!contraseniaRegex.test(contrasenia)) {
        document.getElementById('contraseniaError').innerText = 'Contraseña inválida, debe tener al menos 8 caracteres';
        return;
    }
}

// Función para iniciar la sesión
function iniciarSesion() {
    // Variables
    const email = document.getElementById('textoEmailIS').value;
    const contrasenia = document.getElementById('textoContraseniaIS').value;
    const mensajeError = document.getElementById('mensaje_Error');
    const usuarioAlmacenado = sessionStorage.getItem('usuario');
    // Si hay un usuario que haya iniciado sesion mostrar un mensaje de error
    if (usuarioAlmacenado) {
        mensajeError.textContent = 'Ya has iniciado sesión. Cierra la sesión actual antes de iniciar una nueva.';
        return false;
    } else {
        // Busca el usuario por correo electrónico
        const usuarioEncontrado = usuariosJSON.find(usuariosJSON => usuariosJSON.email === email);
        // Si encuentra al usuario y la contraseña coincide inicia sesion
        if (usuarioEncontrado && usuarioEncontrado.contrasenia === contrasenia) {
            // Se guarda la info del usuario en el Sesion storage
            sessionStorage.setItem('usuario', JSON.stringify(usuarioEncontrado));
            cargarInfoUsuarioSS();
        } else {
            mensajeError.textContent = 'Credenciales incorrectas. Verifica tu email y contraseña.';
        }
    }
}

// Función para cerrar la sesión
function cerrarSesion() {
    //eliminar la sesion abierta
    sessionStorage.removeItem('usuario');
    cargarInfoUsuarioSS();
    // Cierra el modal
    cerrarModales('modalCerrarSesion');
}

// Función para cargar la info de los usuarios desde el WebStorage
function cargarInfoUsuarioSS() {
    const datosInicioSesion = document.getElementById('datosInicioSesion');
    // Obtiene la información del usuario almacenada en sessionStorage
    const usuarioAlmacenado = sessionStorage.getItem('usuario');
    if (usuarioAlmacenado) {
        const usuario = JSON.parse(usuarioAlmacenado);
        datosInicioSesion.textContent = `Has iniciado sesión como: ${usuario.nombre}`;
    } else {
        datosInicioSesion.textContent = `Sesion no iniciada`;
    }
};

// Función para cargar la info de los productos
function cargarInfoProductos() {
    fetch('./productos.json')
        .then(response => response.json())
        .then(data => {
            productosData = data.productos;

            const contenedorCatalogo = document.getElementById('seccionCatalogo');

            let filaActual;

            // Recorrer los productos y generar elementos HTML
            data.productos.forEach((producto, index) => {
                // Crear una nueva fila si es el primer producto o si la fila actual está llena
                if (index % 4 === 0) {
                    filaActual = document.createElement('div');
                    filaActual.classList.add('row', 'mb-4');
                    contenedorCatalogo.appendChild(filaActual);
                }

                // Crear una nueva card para cada producto
                const productoCard = document.createElement('div');
                productoCard.classList.add('col-sm-3', 'd-flex', 'justify-content-center');

                // Estructura de la card
                productoCard.innerHTML = `
                    <div class="card">
                        <img id="img${producto.id}" src="${producto.imagen}" class="card-img-top img-fluid" alt="" style="height: 200px;"
                            onmouseover="cambiarImagen('img${producto.id}', '${producto.imagenReves}')"
                            onmouseout="restaurarImagen('img${producto.id}', '${producto.imagen}')">
                        <div class="card-body">
                            <h5 class="card-title d-flex justify-content-center">${producto.nombre}</h5>
                            <div id="cardBotonesProducto" class="d-flex justify-content-center">
                                <button class="btn" onclick="informacionDetalladaProducto(${producto.id})" id="botonMasInfo">+Info</button>
                                <button class="btn ms-1" onclick="añadirProductoCarrito(${producto.id}, '${producto.imagen}', '${producto.nombre}', ${producto.precio})" id="botonAñadirProducto">
                                    <img src="img/iconos/carritoAñadir.png" alt="" class="img-fluid" style="max-height: 30px; max-width: 20px;">
                                </button>
                            </div>
                        </div>
                    </div>`;
                filaActual.appendChild(productoCard);
            });
        })
        .catch(error => console.error('Error cargando el JSON:', error));

}

// Función para iniciar el reconocimiento de voz y establecer el resultado en el campo de búsqueda
function iniciarReconocimientoVoz() {
    // Verifica si el navegador admite la API de reconocimiento de voz
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const mensajeVoz = document.getElementById("mensajeReconocimientoVoz");
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        // Inicia el reconocimiento de voz
        recognition.start();
        //mientras se esta ejecutando
        recognition.onstart = function () {
            mensajeVoz.textContent = "Escuchando";
        }
        // Detecta cuando deja de hablar (speechend) y para el reconocimiento (stop())
        recognition.onspeechend = function () {
            recognition.stop();
            mensajeVoz.textContent = "Se detuvo";
        };
        // Configura la función que se ejecutará cuando se detecte voz
        recognition.onresult = function (event) {
            const transcript = event.results[0][0].transcript;
            // Establece el resultado en el campo de búsqueda
            document.getElementById('campoBusquedaModal').value = transcript;
        };
    } else {
        alert('El reconocimiento de voz no es compatible con este navegador.');
    }
}

// Función para buscar los productos en el catalogo
function realizarBusqueda() {
    const busqueda = document.getElementById('campoBusquedaModal').value.toLowerCase(); 
    const productos = document.querySelectorAll('.card'); 

    // Iterar sobre cada producto para buscar coincidencias
    productos.forEach(producto => {
        const nombreProducto = producto.querySelector('.card-title').textContent.toLowerCase();
        if (nombreProducto.includes(busqueda)) {
            cerrarModales('modalBusqueda');
            producto.classList.add('producto-encontrado'); 
            // scrolear hacia el producto
            producto.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
}

// Función para cambiar la imagen producto al pasar por encima
function cambiarImagen(id, nuevaImagen) {
    document.getElementById(id).src = nuevaImagen;
}

// Función para volver a la imagen original del producto
function restaurarImagen(id, imagenOriginal) {
    document.getElementById(id).src = imagenOriginal;
}

// Función para dar más información del producto
function informacionDetalladaProducto(id) {
    abrirModales('modalMasInfo');

    // Obtener el producto correspondiente al ID
    const producto = productosData.find(producto => producto.id === id);

    // Actualizar el contenido del modal con la información del producto
    const modalBody = document.getElementById('contenidoModalMasInfo');
    modalBody.innerHTML = `
        <div class="card">
            <img src="${producto.imagen}" class="card-img-top mx-auto d-block img-fluid" alt="" style="height: 200px; max-width: 80%;">
            <div class="card-body">
                <h5 class="card-title d-flex justify-content-center">${producto.nombre}</h5>
                <div id="cardInfoProducto" class="d-flex justify-content-between">
                    <p class="card-text">Talla: ${producto.talla.join(', ')}</p>
                    <p class="card-text">Marca: ${producto.marca}</p>
                    <p class="card-text">Precio: ${producto.precio.toFixed(2)}€</p>
                </div>
                <div id="cardBotonesProducto" class="d-flex justify-content-center">
                    <button class="btn btn-secondary-subtle ms-1" onclick="añadirProductoCarrito()" id="botonAñadirProducto">
                        <img src="img/iconos/carritoAñadir.png" alt="" class="img-fluid" style="max-height: 30px; max-width: 20px;">
                    </button>
                </div>
            </div>
        </div>`;
}

// Función para registrar a los usuarios
function registrarUsuario() {
    // Obtener los valores del formulario
    const nombre = document.getElementById('textoNombre').value;
    const apellidos = document.getElementById('textoApellidos').value;
    const email = document.getElementById('textoEmailR').value;
    const contrasenia = document.getElementById('textoContraseniaR').value;

    // Crear un nuevo objeto de usuario
    const nuevoUsuario = {
        nombre: nombre,
        apellidos: apellidos,
        email: email,
        contrasenia: contrasenia
    };
    agregarUsuario(nuevoUsuario);
}

// Función para agregar un nuevo usuario al JSON de usuarios
function agregarUsuario(nuevoUsuario) {
    cargarUsuariosJSON().then(() => {
        usuariosJSON.push(nuevoUsuario);
        cerrarModales('modalRegistro');
    });
}

// Función para cargar el JSON de usuarios y retornar una promesa
function cargarUsuariosJSON() {
    return fetch('./usuarios.json')
        .then(response => response.json())
        .then(data => {
            usuariosJSON = data;
            console.log('JSON de usuarios cargado:', usuariosJSON);
        })
        .catch(error => console.error('Error cargando el JSON de usuarios:', error));
}

// Función para añadir productos al carrito
function añadirProductoCarrito(id, imagen, nombre, precio) {

    const usuarioAlmacenado = sessionStorage.getItem('usuario');

    if (usuarioAlmacenado) {
        const carrito = document.getElementById('productosEnCarrito');

        // Crear un nuevo elemento li para el producto
        const nuevoProducto = document.createElement('li');
        nuevoProducto.classList.add('list-group-item');

        // Contenido del producto
        nuevoProducto.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <img src="${imagen}" alt="${nombre}" style="max-width: 50px;">
                <p class="mt-2" id="precioProducto">Precio: ${precio.toFixed(2)}€</p>
                <div>
                    <h6 class="mb-0">${nombre}</h6>
                </div>
                <div class="d-flex">
                    <button class="btn btn-sm btn-light me-2" onclick="restarCantidad(this.parentElement)">-</button>
                    <span class="me-2" id="cantidadProducto">1</span>
                    <button class="btn btn-sm btn-light" onclick="sumarCantidad()">+</button>
                </div>
                <button class="btn btn-sm btn-danger" onclick="eliminarProducto(this.parentElement)">Eliminar</button>
            </div>`;

        // Agregar el nuevo producto al carrito
        carrito.appendChild(nuevoProducto);
        alert("¡Producto añadido al carrito!");
        abrirModales("modalCarrito");
        calcularPrecioTotalCarrito();
    } else {
        abrirModales("modalCarritoMensaje");
    }
}

// Función para aumentar la cantidad de productos
function sumarCantidad() {
    cantidadProducto++;
    document.getElementById('cantidadProducto').innerText = cantidadProducto;
}

// Función para restar la cantidad de productos
function restarCantidad(elementoProducto) {
    // Obtener la cantidad actual
    let cantidad = parseInt(elementoProducto.querySelector('#cantidadProducto').innerText);
    // Si hay más de un producto, restar uno
    if (cantidad > 1) {
        cantidad--;
        elementoProducto.querySelector('#cantidadProducto').innerText = cantidad;
    } else {
        // Si la cantidad es 0 se elimina el producto
        confirm("¿Desea eliminar el producto del carrito?");
        if (confirm) {
            elementoProducto.parentNode.parentNode.remove();
        }
    }
}

// Función para eliminar un producto del carrito
function eliminarProducto(elementoProducto) {
    elementoProducto.parentNode.remove();
}

// Función para alternar el menú de navegación
function expandirMenuNavegacion() {

    const menuNavegacion = document.getElementById('menuNavegacion');
    menuNavegacion.classList.toggle('show');
}

// Función para la cookie
function getCookie(c_name) {
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");
    if (c_start == -1) {
        c_start = c_value.indexOf(c_name + "=");
    }
    if (c_start == -1) {
        c_value = null;
    } else {
        c_start = c_value.indexOf("=", c_start) + 1;
        var c_end = c_value.indexOf(";", c_start);
        if (c_end == -1) {
            c_end = c_value.length;
        }
        c_value = unescape(c_value.substring(c_start, c_end));
    }
    return c_value;
}

function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}

if (getCookie('tiendaaviso') != "1") {
    document.getElementById("barraaceptacion").style.display = "block";
}

function PonerCookie() {
    setCookie('tiendaaviso', '1', 365);
    document.getElementById("barraaceptacion").style.display = "none";
}

function setMap() {
    // Creamos el mapa
    osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        osm = L.tileLayer(osmUrl, { maxZoom: 18, attribution: osmAttrib });
    // Esto de setView sirve para situar la cámara, las coordenadas desde las que 
    map = L.map('map').setView([40.4110500, -3.6825300], 13).addLayer(osm);
    markerGroup = L.layerGroup().addTo(map);
    showMap();
}

// Comprueba si has hecho el mapa entero
function setFullMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showFullMap);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Añade el marcador de El Ángel Caído
function showMap() {
    L.marker([40.4110500, -3.6825300]).addTo(map)
        .bindPopup('El Retiro')
        .openPopup()
        .addTo(map);
}

// Añade el marcador de tu localización
function showFullMap(position) {
    L.marker([position.coords.latitude, position.coords.longitude]).addTo(map)
        .bindPopup('Tu localización')
        .openPopup()
        .addTo(map);
}

