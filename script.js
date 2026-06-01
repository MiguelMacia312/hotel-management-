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
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section-content');

// Eventos de navegación
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remover clase active de todos los items
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Ocultar todas las secciones
        sections.forEach(s => s.classList.add('d-none'));
        
        // Mostrar la sección seleccionada
        const sectionId = item.getAttribute('data-section');
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
    mostrarAlerta('✓ Hotel agregado exitosamente', 'success');
    renderizarHoteles();
    actualizarSelectHoteles();
    actualizarBadges();
});

function renderizarHoteles() {
    listaHoteles.innerHTML = '';
    
    if (hoteles.length === 0) {
        listaHoteles.innerHTML = `
            <div class="empty-message">
                <i class="fas fa-inbox"></i>
                <p>No hay hoteles registrados aún</p>
            </div>
        `;
        return;
    }
    
    hoteles.forEach(hotel => {
        const habitacionesHotel = habitaciones.filter(h => h.hotelId === hotel.id).length;
        const hotelDiv = document.createElement('div');
        hotelDiv.className = 'item-card';
        hotelDiv.innerHTML = `
            <div class="item-info">
                <div class="item-title">${hotel.nombre}</div>
                <div class="item-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    ${hotel.ubicacion}
                </div>
                <div class="item-detail">
                    <i class="fas fa-door-open"></i>
                    ${habitacionesHotel} habitación(es)
                </div>
            </div>
            <div class="item-actions">
                <button class="btn btn-edit" onclick="editarHotel(${hotel.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-delete" onclick="eliminarHotel(${hotel.id})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
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
    mostrarAlerta('✓ Hotel actualizado exitosamente', 'success');
    renderizarHoteles();
    actualizarSelectHoteles();
    renderizarRegistros();
}

function eliminarHotel(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este hotel y todas sus habitaciones?')) return;
    
    hoteles = hoteles.filter(h => h.id !== id);
    habitaciones = habitaciones.filter(hab => hab.hotelId !== id);
    
    guardarEnLocalStorage('hoteles', hoteles);
    guardarEnLocalStorage('habitaciones', habitaciones);
    mostrarAlerta('✓ Hotel eliminado exitosamente', 'success');
    renderizarHoteles();
    actualizarSelectHoteles();
    renderizarRegistros();
    actualizarBadges();
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
    mostrarAlerta('✓ Habitación agregada exitosamente', 'success');
    renderizarHabitaciones();
    renderizarRegistros();
    actualizarBadges();
});

function renderizarHabitaciones() {
    listaHabitaciones.innerHTML = '';
    
    if (habitaciones.length === 0) {
        listaHabitaciones.innerHTML = `
            <div class="empty-message">
                <i class="fas fa-inbox"></i>
                <p>No hay habitaciones registradas aún</p>
            </div>
        `;
        return;
    }
    
    habitaciones.forEach(habitacion => {
        const hotel = hoteles.find(h => h.id === habitacion.hotelId);
        const nombreHotel = hotel ? hotel.nombre : 'Hotel desconocido';
        
        const tipoColor = {
            'Estándar': '#3b82f6',
            'Doble': '#8b5cf6',
            'Suite': '#f59e0b'
        };
        
        const habitacionDiv = document.createElement('div');
        habitacionDiv.className = 'item-card';
        habitacionDiv.innerHTML = `
            <div class="item-info">
                <div class="item-title">Habitación ${habitacion.codigo}</div>
                <div class="item-detail">
                    <i class="fas fa-building"></i>
                    ${nombreHotel}
                </div>
                <div class="item-detail">
                    <i class="fas fa-tag"></i>
                    <span style="background: ${tipoColor[habitacion.tipo]}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">
                        ${habitacion.tipo}
                    </span>
                </div>
                <div class="item-detail">
                    <i class="fas fa-layer-group"></i>
                    Piso ${habitacion.piso} | 
                    <i class="fas fa-users"></i>
                    ${habitacion.capacidad} persona(s)
                </div>
            </div>
            <div class="item-actions">
                <button class="btn btn-edit" onclick="editarHabitacion(${habitacion.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-delete" onclick="eliminarHabitacion(${habitacion.id})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
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
    mostrarAlerta('✓ Habitación actualizada exitosamente', 'success');
    renderizarHabitaciones();
    renderizarRegistros();
}

function eliminarHabitacion(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta habitación?')) return;
    
    habitaciones = habitaciones.filter(h => h.id !== id);
    guardarEnLocalStorage('habitaciones', habitaciones);
    mostrarAlerta('✓ Habitación eliminada exitosamente', 'success');
    renderizarHabitaciones();
    renderizarRegistros();
    actualizarBadges();
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
        tablaRegistros.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #6b7280;">No hay registros disponibles</td></tr>';
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

// Actualizar badges
function actualizarBadges() {
    document.getElementById('badge-hoteles').textContent = hoteles.length;
    document.getElementById('badge-habitaciones').textContent = habitaciones.length;
}

// Funciones auxiliares
function guardarEnLocalStorage(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
}

function mostrarAlerta(mensaje, tipo = 'info') {
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo}`;
    alerta.innerHTML = `
        <span>${mensaje}</span>
        <button type="button" class="alert-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    const mainContent = document.querySelector('.content-area');
    mainContent.insertBefore(alerta, mainContent.firstChild);
    
    // Remover alerta después de 4 segundos
    setTimeout(() => {
        alerta.remove();
    }, 4000);
}

// Inicializar página
function inicializar() {
    renderizarHoteles();
    renderizarHabitaciones();
    renderizarRegistros();
    actualizarSelectHoteles();
    actualizarBadges();
}

// Llamar a inicializar cuando carga la página
window.addEventListener('DOMContentLoaded', inicializar);
