/* =============================================
   HotelManager Pro — app.js
   localStorage: hotels[], rooms[]
============================================= */

// ── Storage helpers ──────────────────────────
const Storage = {
  getHotels:  () => JSON.parse(localStorage.getItem('hmp_hotels')  || '[]'),
  getRooms:   () => JSON.parse(localStorage.getItem('hmp_rooms')   || '[]'),
  saveHotels: (d) => localStorage.setItem('hmp_hotels',  JSON.stringify(d)),
  saveRooms:  (d) => localStorage.setItem('hmp_rooms',   JSON.stringify(d)),
};

// ── UUID ─────────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Stars helper ─────────────────────────────
function stars(n) { return '★'.repeat(n) + '☆'.repeat(5 - n); }

// ── Toast ────────────────────────────────────
function showToast(msg, type = 'success') {
  const el = document.getElementById('app-toast');
  const msgEl = document.getElementById('toast-message');
  el.classList.remove('toast-success', 'toast-error');
  el.classList.add(type === 'success' ? 'toast-success' : 'toast-error');
  msgEl.textContent = msg;
  const t = new bootstrap.Toast(el, { delay: 2800 });
  t.show();
}

// ── Global confirm callback ───────────────────
let _confirmCb = null;

function openConfirm(message, cb) {
  document.getElementById('confirm-message').textContent = message;
  _confirmCb = cb;
  const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
  modal.show();
}

document.getElementById('btn-confirm-action').addEventListener('click', () => {
  if (_confirmCb) { _confirmCb(); _confirmCb = null; }
  bootstrap.Modal.getInstance(document.getElementById('confirmModal')).hide();
});

// ── Navigation ────────────────────────────────
document.querySelectorAll('.sidebar-link[data-section]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const sec = link.dataset.section;
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`section-${sec}`).classList.add('active');
    if (sec === 'dashboard') renderDashboard();
    if (sec === 'rooms')     renderRooms();
  });
});

// ── Header stats update ───────────────────────
function updateHeaderStats() {
  const hotels = Storage.getHotels();
  const rooms  = Storage.getRooms();
  document.getElementById('hdr-hotels').textContent = hotels.length;
  document.getElementById('hdr-rooms').textContent  = rooms.length;
}

// ════════════════════════════════════════════
//   HOTELS
// ════════════════════════════════════════════

function renderHotels() {
  const hotels = Storage.getHotels();
  const rooms  = Storage.getRooms();
  const list   = document.getElementById('hotel-list');
  const empty  = document.getElementById('hotel-empty');
  list.innerHTML = '';

  if (!hotels.length) {
    empty.classList.remove('d-none');
    updateHeaderStats();
    return;
  }
  empty.classList.add('d-none');

  hotels.forEach(hotel => {
    const roomCount = rooms.filter(r => r.hotelId === hotel.id).length;
    const col = document.createElement('div');
    col.className = 'col-sm-6 col-xl-4';
    col.innerHTML = `
      <div class="hotel-card">
        <div class="hotel-stars">${stars(parseInt(hotel.stars))}</div>
        <div class="hotel-name">${escHtml(hotel.name)}</div>
        <div class="hotel-meta">
          ${hotel.city ? `<i class="bi bi-geo-alt-fill"></i> ${escHtml(hotel.city)}` : ''}
          ${hotel.address ? ` &bull; ${escHtml(hotel.address)}` : ''}
        </div>
        <div class="hotel-room-count"><i class="bi bi-door-closed"></i> ${roomCount} habitación${roomCount !== 1 ? 'es' : ''}</div>
        <div class="card-actions mt-3">
          <button class="btn-edit" data-id="${hotel.id}"><i class="bi bi-pencil-fill"></i> Editar</button>
          <button class="btn-delete" data-id="${hotel.id}"><i class="bi bi-trash-fill"></i> Eliminar</button>
        </div>
      </div>`;
    list.appendChild(col);
  });

  // Events
  list.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => openEditHotel(btn.dataset.id));
  });
  list.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const hotel = Storage.getHotels().find(h => h.id === btn.dataset.id);
      openConfirm(`¿Eliminar el hotel "${hotel.name}" y todas sus habitaciones?`, () => {
        deleteHotel(btn.dataset.id);
      });
    });
  });

  updateHeaderStats();
  populateHotelSelects();
}

function openEditHotel(id) {
  const hotel = Storage.getHotels().find(h => h.id === id);
  if (!hotel) return;
  document.getElementById('hotel-id').value      = hotel.id;
  document.getElementById('hotel-name').value    = hotel.name;
  document.getElementById('hotel-city').value    = hotel.city    || '';
  document.getElementById('hotel-address').value = hotel.address || '';
  document.getElementById('hotel-stars').value   = hotel.stars   || '3';
  document.getElementById('hotel-modal-title').textContent = 'Editar Hotel';
  new bootstrap.Modal(document.getElementById('hotelModal')).show();
}

function deleteHotel(id) {
  const hotels = Storage.getHotels().filter(h => h.id !== id);
  const rooms  = Storage.getRooms().filter(r => r.hotelId !== id);
  Storage.saveHotels(hotels);
  Storage.saveRooms(rooms);
  renderHotels();
  renderRooms();
  showToast('Hotel eliminado correctamente');
}

document.getElementById('btn-save-hotel').addEventListener('click', () => {
  const name    = document.getElementById('hotel-name').value.trim();
  const city    = document.getElementById('hotel-city').value.trim();
  const address = document.getElementById('hotel-address').value.trim();
  const starsVal= document.getElementById('hotel-stars').value;
  const id      = document.getElementById('hotel-id').value;

  if (!name) { showToast('El nombre del hotel es obligatorio', 'error'); return; }

  const hotels = Storage.getHotels();
  if (id) {
    const idx = hotels.findIndex(h => h.id === id);
    if (idx !== -1) hotels[idx] = { ...hotels[idx], name, city, address, stars: starsVal };
  } else {
    hotels.push({ id: uid(), name, city, address, stars: starsVal });
  }

  Storage.saveHotels(hotels);
  bootstrap.Modal.getInstance(document.getElementById('hotelModal')).hide();
  resetHotelForm();
  renderHotels();
  showToast(id ? 'Hotel actualizado' : 'Hotel creado correctamente');
});

document.getElementById('hotelModal').addEventListener('hidden.bs.modal', resetHotelForm);
function resetHotelForm() {
  document.getElementById('hotel-id').value      = '';
  document.getElementById('hotel-name').value    = '';
  document.getElementById('hotel-city').value    = '';
  document.getElementById('hotel-address').value = '';
  document.getElementById('hotel-stars').value   = '3';
  document.getElementById('hotel-modal-title').textContent = 'Nuevo Hotel';
}

// ════════════════════════════════════════════
//   ROOMS
// ════════════════════════════════════════════

function renderRooms() {
  const rooms   = Storage.getRooms();
  const hotels  = Storage.getHotels();
  const list    = document.getElementById('room-list');
  const empty   = document.getElementById('room-empty');

  const filterHotel = document.getElementById('filter-hotel').value;
  const filterType  = document.getElementById('filter-type').value;

  let filtered = rooms;
  if (filterHotel) filtered = filtered.filter(r => r.hotelId === filterHotel);
  if (filterType)  filtered = filtered.filter(r => r.type    === filterType);

  list.innerHTML = '';

  if (!filtered.length) {
    empty.classList.remove('d-none');
    return;
  }
  empty.classList.add('d-none');

  filtered.forEach(room => {
    const hotel = hotels.find(h => h.id === room.hotelId);
    const col = document.createElement('div');
    col.className = 'col-sm-6 col-lg-4';
    col.innerHTML = `
      <div class="room-card">
        <span class="room-type-badge type-${room.type}">${typeLabel(room.type)}</span>
        <div class="room-code">${escHtml(room.code)}</div>
        <div class="room-meta">
          <i class="bi bi-layers-fill"></i> Piso ${escHtml(String(room.floor))} &bull;
          <i class="bi bi-people-fill"></i> Cap. ${escHtml(String(room.capacity))}
        </div>
        <div class="room-hotel-tag">
          <i class="bi bi-building"></i> ${hotel ? escHtml(hotel.name) : '<em>Hotel eliminado</em>'}
        </div>
        <div class="card-actions">
          <button class="btn-edit" data-id="${room.id}"><i class="bi bi-pencil-fill"></i> Editar</button>
          <button class="btn-delete" data-id="${room.id}"><i class="bi bi-trash-fill"></i> Eliminar</button>
        </div>
      </div>`;
    list.appendChild(col);
  });

  list.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => openEditRoom(btn.dataset.id));
  });
  list.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const room = Storage.getRooms().find(r => r.id === btn.dataset.id);
      openConfirm(`¿Eliminar la habitación "${room.code}"?`, () => deleteRoom(btn.dataset.id));
    });
  });
}

function typeLabel(t) {
  return { estandar: 'Estándar', doble: 'Doble', suite: 'Suite' }[t] || t;
}

function openEditRoom(id) {
  const room = Storage.getRooms().find(r => r.id === id);
  if (!room) return;
  document.getElementById('room-id').value       = room.id;
  document.getElementById('room-hotel').value    = room.hotelId;
  document.getElementById('room-code').value     = room.code;
  document.getElementById('room-floor').value    = room.floor;
  document.getElementById('room-type').value     = room.type;
  document.getElementById('room-capacity').value = room.capacity;
  document.getElementById('room-modal-title').textContent = 'Editar Habitación';
  new bootstrap.Modal(document.getElementById('roomModal')).show();
}

function deleteRoom(id) {
  const rooms = Storage.getRooms().filter(r => r.id !== id);
  Storage.saveRooms(rooms);
  renderRooms();
  renderHotels(); // update room counts
  showToast('Habitación eliminada');
}

document.getElementById('btn-save-room').addEventListener('click', () => {
  const hotelId  = document.getElementById('room-hotel').value;
  const code     = document.getElementById('room-code').value.trim();
  const floor    = document.getElementById('room-floor').value.trim();
  const type     = document.getElementById('room-type').value;
  const capacity = document.getElementById('room-capacity').value.trim();
  const id       = document.getElementById('room-id').value;

  if (!hotelId)  { showToast('Selecciona un hotel',          'error'); return; }
  if (!code)     { showToast('El código es obligatorio',      'error'); return; }
  if (floor === '')  { showToast('El piso es obligatorio',    'error'); return; }
  if (!capacity) { showToast('La capacidad es obligatoria',  'error'); return; }

  const rooms = Storage.getRooms();

  // Unique code per hotel
  const duplicate = rooms.find(r => r.hotelId === hotelId && r.code === code && r.id !== id);
  if (duplicate) { showToast('Ya existe una habitación con ese código en este hotel', 'error'); return; }

  if (id) {
    const idx = rooms.findIndex(r => r.id === id);
    if (idx !== -1) rooms[idx] = { ...rooms[idx], hotelId, code, floor, type, capacity };
  } else {
    rooms.push({ id: uid(), hotelId, code, floor, type, capacity });
  }

  Storage.saveRooms(rooms);
  bootstrap.Modal.getInstance(document.getElementById('roomModal')).hide();
  resetRoomForm();
  renderRooms();
  renderHotels();
  showToast(id ? 'Habitación actualizada' : 'Habitación registrada');
});

document.getElementById('roomModal').addEventListener('hidden.bs.modal', resetRoomForm);
function resetRoomForm() {
  document.getElementById('room-id').value       = '';
  document.getElementById('room-hotel').value    = '';
  document.getElementById('room-code').value     = '';
  document.getElementById('room-floor').value    = '';
  document.getElementById('room-type').value     = 'estandar';
  document.getElementById('room-capacity').value = '';
  document.getElementById('room-modal-title').textContent = 'Nueva Habitación';
}

// Filters
document.getElementById('filter-hotel').addEventListener('change', renderRooms);
document.getElementById('filter-type').addEventListener('change',  renderRooms);

// ── Populate hotel selects ────────────────────
function populateHotelSelects() {
  const hotels = Storage.getHotels();
  const opts   = hotels.map(h => `<option value="${h.id}">${escHtml(h.name)}</option>`).join('');

  ['room-hotel', 'filter-hotel'].forEach(id => {
    const el = document.getElementById(id);
    const prev = el.value;
    el.innerHTML = id === 'filter-hotel'
      ? `<option value="">Todos los hoteles</option>${opts}`
      : `<option value="">Selecciona un hotel</option>${opts}`;
    el.value = prev;
  });
}

// ════════════════════════════════════════════
//   DASHBOARD
// ════════════════════════════════════════════

function renderDashboard() {
  const hotels = Storage.getHotels();
  const rooms  = Storage.getRooms();

  const suites   = rooms.filter(r => r.type === 'suite').length;
  const capacity = rooms.reduce((a, r) => a + parseInt(r.capacity || 0), 0);

  document.getElementById('kpi-hotels').textContent   = hotels.length;
  document.getElementById('kpi-rooms').textContent    = rooms.length;
  document.getElementById('kpi-suites').textContent   = suites;
  document.getElementById('kpi-capacity').textContent = capacity;

  const bd = document.getElementById('dashboard-breakdown');
  bd.innerHTML = '';

  if (!hotels.length) {
    bd.innerHTML = `<div class="col-12"><p class="text-center" style="color:var(--txt-secondary)">No hay hoteles para mostrar.</p></div>`;
    return;
  }

  hotels.forEach(hotel => {
    const hr = rooms.filter(r => r.hotelId === hotel.id);
    const count = (t) => hr.filter(r => r.type === t).length;
    const total = hr.length || 1;

    const col = document.createElement('div');
    col.className = 'col-sm-6 col-xl-4';
    col.innerHTML = `
      <div class="breakdown-card">
        <div class="breakdown-hotel-name"><i class="bi bi-building" style="color:var(--gold)"></i> ${escHtml(hotel.name)}</div>
        <div class="type-bar">
          <span class="type-bar-label">Estándar</span>
          <div class="type-bar-track"><div class="type-bar-fill fill-estandar" style="width:${pct(count('estandar'),total)}%"></div></div>
          <span class="type-bar-count">${count('estandar')}</span>
        </div>
        <div class="type-bar">
          <span class="type-bar-label">Doble</span>
          <div class="type-bar-track"><div class="type-bar-fill fill-doble" style="width:${pct(count('doble'),total)}%"></div></div>
          <span class="type-bar-count">${count('doble')}</span>
        </div>
        <div class="type-bar">
          <span class="type-bar-label">Suite</span>
          <div class="type-bar-track"><div class="type-bar-fill fill-suite" style="width:${pct(count('suite'),total)}%"></div></div>
          <span class="type-bar-count">${count('suite')}</span>
        </div>
        <div style="margin-top:10px;font-size:12px;color:var(--txt-secondary)">
          Total: <strong style="color:var(--txt-primary)">${hr.length}</strong> habitación${hr.length !== 1 ? 'es' : ''}
        </div>
      </div>`;
    bd.appendChild(col);
  });
}

function pct(n, total) { return Math.round((n / total) * 100); }

// ── Clear all data ────────────────────────────
document.getElementById('btn-clear-all').addEventListener('click', () => {
  openConfirm('¿Eliminar TODOS los hoteles y habitaciones? Esta acción no se puede deshacer.', () => {
    Storage.saveHotels([]);
    Storage.saveRooms([]);
    renderHotels();
    renderRooms();
    showToast('Todos los datos han sido eliminados');
  });
});

// ── XSS helper ────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Init ──────────────────────────────────────
(function init() {
  populateHotelSelects();
  renderHotels();
  renderRooms();
})();
