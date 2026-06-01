// Variables globales
let hoteles = JSON.parse(localStorage.getItem('hoteles')) || [];
let habitaciones = JSON.parse(localStorage.getItem('habitaciones')) || [];

// Elementos del DOM
const formHotel = document.getElementById('formHotel');
const formHabitacion = document.getElementById('formHabitacion');
const listaHoteles = document.getElementById('listaHoteles');
const listaHabitaciones = document.getElementById('listaHabitaciones');
const tablaRegistros = document.getElementById('tablaRegistros');
const hotelSelect = document.getElementById('hotelSelect');
const navLinks = document.querySelectorAll('.sidebar .nav-link');
const sections = document.querySelectorAll('.section-content');

// Eventos de navegación
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remover clase active de todos los links
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Ocultar todas las secciones
        sections.forEach(s => s.classList.add('d-none'));
        
        // Mostrar la sección seleccionada
        const sectionId = link.getAttribute('data-section');
        document.getElementById(sectionId).classList.remove('d-none');
    });
});

// CRUD Hoteles
formHotel.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nombreHotel = document.getElementById('nombreHotel').value.trim();
    const ubicacionHotel = document.getElementById('ubicacionHotel').value.trim();
    
    if (!nombreHotel || !ubicacionHotel) {
        mostrarAlerta('Por favor completa todos los campos', 'danger');
        return;
    }
    
    const hotel = {
        id: Date.now(),
        nombre: nombreHotel,
        ubicacion: ubicacionHotel
    };
    
    hoteles.push(hotel);
    guardarEnLocalStorage('hoteles', hoteles);
    formHotel.reset();
    mostrarAlerta('Hotel agregado exitosamente', 'success');
    renderizarHoteles();
    actualizarSelectHoteles();
});

function renderizarHoteles() {
    listaHoteles.innerHTML = '';
    
    if (hoteles.length === 0) {
        listaHoteles.innerHTML = '<div class="empty-message"><p>No hay hoteles registrados</p></div>';
        return;
    }
    
    hoteles.forEach(hotel => {
        const hotelDiv = document.createElement('div');
        hotelDiv.className = 'hotel-card';
        hotelDiv.innerHTML = `
            <div class="hotel-info">
                <h5>${hotel.nombre}</h5>
                <p><strong>Ubicación:</strong> ${hotel.ubicacion}</p>
                <p><small class="text-muted">ID: ${hotel.id}</small></p>
            </div>
            <div class="hotel-actions">
                <button class="btn btn-warning btn-sm" onclick="editarHotel(${hotel.id})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="eliminarHotel(${hotel.id})">Eliminar</button>
            </div>
        `;
        listaHoteles.appendChild(hotelDiv);
    });
}

function editarHotel(id) {
    const hotel = hoteles.find(h => h.id === id);
    if (!hotel) return;
    
    const nuevoNombre = prompt('Nuevo nombre del hotel:', hotel.nombre);
    if (nuevoNombre === null) return;
    
    const nuevaUbicacion = prompt('Nueva ubicación:', hotel.ubicacion);
    if (nuevaUbicacion === null) return;
    
    hotel.nombre = nuevoNombre.trim();
    hotel.ubicacion = nuevaUbicacion.trim();
    
    guardarEnLocalStorage('hoteles', hoteles);
    mostrarAlerta('Hotel actualizado exitosamente', 'success');
    renderizarHoteles();
    actualizarSelectHoteles();
}

function eliminarHotel(id) {
    if (!confirm('¿Estás seguro de eliminar este hotel?')) return;
    
    hoteles = hoteles.filter(h => h.id !== id);
    habitaciones = habitaciones.filter(hab => hab.hotelId !== id);
    
    guardarEnLocalStorage('hoteles', hoteles);
    guardarEnLocalStorage('habitaciones', habitaciones);
    mostrarAlerta('Hotel eliminado exitosamente', 'success');
    renderizarHoteles();
    actualizarSelectHoteles();
    renderizarRegistros();
}

// CRUD Habitaciones
formHabitacion.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const hotelId = parseInt(hotelSelect.value);
    const codigoHab = document.getElementById('codigoHab').value.trim();
    const pisoHab = parseInt(document.getElementById('pisoHab').value);
    const capacidadHab = parseInt(document.getElementById('capacidadHab').value);
    const tipoHab = document.getElementById('tipoHab').value;
    
    if (!hotelId || !codigoHab || !pisoHab || !capacidadHab || !tipoHab) {
        mostrarAlerta('Por favor completa todos los campos', 'danger');
        return;
    }
    
    // Validar que no exista una habitación con el mismo código en el mismo hotel
    if (habitaciones.some(h => h.hotelId === hotelId && h.codigo === codigoHab)) {
        mostrarAlerta('Ya existe una habitación con este código en el hotel', 'warning');
        return;
    }
    
    const habitacion = {
        id: Date.now(),
        hotelId: hotelId,
        codigo: codigoHab,
        piso: pisoHab,
        capacidad: capacidadHab,
        tipo: tipoHab
    };
    
    habitaciones.push(habitacion);
    guardarEnLocalStorage('habitaciones', habitaciones);
    formHabitacion.reset();
    mostrarAlerta('Habitación agregada exitosamente', 'success');
    renderizarHabitaciones();
    renderizarRegistros();
});

function renderizarHabitaciones() {
    listaHabitaciones.innerHTML = '';
    
    if (habitaciones.length === 0) {
        listaHabitaciones.innerHTML = '<div class="empty-message"><p>No hay habitaciones registradas</p></div>';
        return;
    }
    
    habitaciones.forEach(habitacion => {
        const hotel = hoteles.find(h => h.id === habitacion.hotelId);
        const nombreHotel = hotel ? hotel.nombre : 'Hotel desconocido';
        
        const habitacionDiv = document.createElement('div');
        habitacionDiv.className = 'habitacion-card';
        habitacionDiv.innerHTML = `
            <div class="habitacion-info">
                <h5>Habitación ${habitacion.codigo}</h5>
                <p><strong>Hotel:</strong> ${nombreHotel}</p>
                <p><strong>Tipo:</strong> ${habitacion.tipo} | <strong>Piso:</strong> ${habitacion.piso} | <strong>Capacidad:</strong> ${habitacion.capacidad} personas</p>
                <p><small class="text-muted">ID: ${habitacion.id}</small></p>
            </div>
            <div class="habitacion-actions">
                <button class="btn btn-warning btn-sm" onclick="editarHabitacion(${habitacion.id})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="eliminarHabitacion(${habitacion.id})">Eliminar</button>
            </div>
        `;
        listaHabitaciones.appendChild(habitacionDiv);
    });
}

function editarHabitacion(id) {
    const habitacion = habitaciones.find(h => h.id === id);
    if (!habitacion) return;
    
    const nuevoTipo = prompt('Nuevo tipo de habitación (Estándar/Doble/Suite):', habitacion.tipo);
    if (nuevoTipo === null) return;
    
    if (!['Estándar', 'Doble', 'Suite'].includes(nuevoTipo)) {
        mostrarAlerta('Tipo de habitación inválido', 'danger');
        return;
    }
    
    const nuevaCapacidad = prompt('Nueva capacidad:', habitacion.capacidad);
    if (nuevaCapacidad === null) return;
    
    habitacion.tipo = nuevoTipo;
    habitacion.capacidad = parseInt(nuevaCapacidad);
    
    guardarEnLocalStorage('habitaciones', habitaciones);
    mostrarAlerta('Habitación actualizada exitosamente', 'success');
    renderizarHabitaciones();
    renderizarRegistros();
}

function eliminarHabitacion(id) {
    if (!confirm('¿Estás seguro de eliminar esta habitación?')) return;
    
    habitaciones = habitaciones.filter(h => h.id !== id);
    guardarEnLocalStorage('habitaciones', habitaciones);
    mostrarAlerta('Habitación eliminada exitosamente', 'success');
    renderizarHabitaciones();
    renderizarRegistros();
}

// Actualizar select de hoteles
function actualizarSelectHoteles() {
    const currentValue = hotelSelect.value;
    hotelSelect.innerHTML = '<option value="">-- Selecciona un hotel --</option>';
    
    hoteles.forEach(hotel => {
        const option = document.createElement('option');
        option.value = hotel.id;
        option.textContent = hotel.nombre;
        hotelSelect.appendChild(option);
    });
    
    if (currentValue) {
        hotelSelect.value = currentValue;
    }
}

// Renderizar tabla de registros
function renderizarRegistros() {
    tablaRegistros.innerHTML = '';
    
    if (habitaciones.length === 0) {
        tablaRegistros.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay registros</td></tr>';
        return;
    }
    
    habitaciones.forEach(habitacion => {
        const hotel = hoteles.find(h => h.id === habitacion.hotelId);
        const nombreHotel = hotel ? hotel.nombre : 'Hotel desconocido';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${nombreHotel}</td>
            <td>${habitacion.codigo}</td>
            <td>${habitacion.tipo}</td>
            <td>${habitacion.piso}</td>
            <td>${habitacion.capacidad}</td>
        `;
        tablaRegistros.appendChild(row);
    });
}

// Funciones auxiliares
function guardarEnLocalStorage(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
}

function mostrarAlerta(mensaje, tipo = 'info') {
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    alerta.setAttribute('role', 'alert');
    alerta.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const mainContent = document.querySelector('.content');
    mainContent.insertBefore(alerta, mainContent.firstChild);
    
    // Remover alerta después de 5 segundos
    setTimeout(() => {
        alerta.remove();
    }, 5000);
}

// Inicializar página
function inicializar() {
    renderizarHoteles();
    renderizarHabitaciones();
    renderizarRegistros();
    actualizarSelectHoteles();
}

// Llamar a inicializar cuando carga la página
window.addEventListener('DOMContentLoaded', inicializar);
