import { store } from './store.js';
import { getCATEGORIES, getORDER_STATUSES, getCategoryEmoji, t } from './i18n.js';
import { CONFIG } from './config.js';
import { formatCurrency, formatTime, escapeHtml } from './utils.js';

let activeTab = 'orders';
let editingItem = null;
let menuFormOpen = false;
let orderDetailOpen = false;
let selectedOrder = null;

function renderStats() {
  const stats = store.getStats();
  const container = document.getElementById('admin-stats');
  if (!container) return;
  const s = CONFIG().admin.stats;
  container.innerHTML = `
    <div class="stat-card"><div class="stat-card-icon stat-card-icon-orders">📦</div><div class="stat-card-info"><div class="stat-card-value">${stats.totalOrders}</div><div class="stat-card-label">${s.totalOrders}</div></div></div>
    <div class="stat-card"><div class="stat-card-icon stat-card-icon-pending">⏳</div><div class="stat-card-info"><div class="stat-card-value">${stats.pendingOrders}</div><div class="stat-card-label">${s.pendingOrders}</div></div></div>
    <div class="stat-card"><div class="stat-card-icon stat-card-icon-menu">🍽️</div><div class="stat-card-info"><div class="stat-card-value">${stats.menuCount}</div><div class="stat-card-label">${s.menuCount}</div></div></div>
    <div class="stat-card"><div class="stat-card-icon stat-card-icon-revenue">💰</div><div class="stat-card-info"><div class="stat-card-value">${formatCurrency(stats.totalRevenue)}</div><div class="stat-card-label">${s.totalRevenue}</div></div></div>`;
}

function renderOrders() {
  const container = document.getElementById('admin-orders');
  if (!container) return;
  const orders = store.getOrders();
  const cfg = CONFIG();
  const ocfg = cfg.admin.orders;
  const statuses = getORDER_STATUSES();
  const lang = localStorage.getItem('oms_lang') || 'zh-HK';

  if (orders.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">${ocfg.emptyIcon}</div><div class="empty-state-title">${ocfg.emptyTitle}</div><div class="empty-state-text">${ocfg.emptyText}</div></div>`;
    return;
  }

  container.innerHTML = orders.map(order => {
    const status = statuses[order.status];
    const itemsList = order.items.map(i => { const n = lang === 'en' && i.nameEn ? i.nameEn : i.name; return `${escapeHtml(n)} × ${i.quantity}`; }).join(', ');
    return `
      <div class="order-card" data-view-order="${order.id}">
        <div class="order-card-header">
          <div class="order-card-id">${escapeHtml(order.id)}</div>
          <span class="badge badge-${status.color}">${status.icon} ${status.label}</span>
        </div>
        <div class="order-card-body">
          <div class="order-card-row"><span class="order-card-label">${ocfg.customer}</span><span class="order-card-value">${escapeHtml(order.customerName)}</span></div>
          <div class="order-card-row"><span class="order-card-label">${ocfg.phone}</span><span class="order-card-value">${escapeHtml(order.phone)}</span></div>
          <div class="order-card-row"><span class="order-card-label">${ocfg.table}</span><span class="order-card-value">${escapeHtml(order.tableNumber)}</span></div>
          <div class="order-card-row"><span class="order-card-label">${ocfg.pickupTime}</span><span class="order-card-value">${escapeHtml(order.pickupTime)}</span></div>
          ${order.notes ? `<div class="order-card-row"><span class="order-card-label">${ocfg.notes}</span><span class="order-card-value order-card-notes">${escapeHtml(order.notes)}</span></div>` : ''}
          <div class="order-card-row"><span class="order-card-label">${ocfg.items}</span><span class="order-card-value order-card-items">${itemsList}</span></div>
          <div class="order-card-row order-card-total"><span class="order-card-label">${ocfg.total}</span><span class="order-card-value">${formatCurrency(order.total)}</span></div>
        </div>
        <div class="order-card-footer">
          <select class="input select order-status-select" data-order-status="${order.id}" onclick="event.stopPropagation()">
            ${Object.entries(statuses).map(([key, val]) => `<option value="${key}" ${order.status === key ? 'selected' : ''}>${val.icon} ${val.label}</option>`).join('')}
          </select>
          <button class="btn btn-ghost btn-sm text-danger" data-delete-order="${order.id}" onclick="event.stopPropagation()">${ocfg.delete}</button>
        </div>
      </div>`;
  }).join('');

  container.querySelectorAll('[data-view-order]').forEach(card => { card.addEventListener('click', () => { selectedOrder = store.getOrder(card.dataset.viewOrder); orderDetailOpen = true; renderOrderDetail(); }); });
  container.querySelectorAll('[data-order-status]').forEach(select => { select.addEventListener('change', (e) => { store.updateOrderStatus(select.dataset.orderStatus, e.target.value); renderStats(); }); });
  container.querySelectorAll('[data-delete-order]').forEach(btn => { btn.addEventListener('click', () => { if (confirm(ocfg.confirmDelete)) { store.deleteOrder(btn.dataset.deleteOrder); renderStats(); } }); });
}

function renderOrderDetail() {
  const modal = document.getElementById('order-detail-modal');
  if (!modal) return;
  if (!orderDetailOpen || !selectedOrder) { modal.classList.remove('open'); return; }
  modal.classList.add('open');
  const body = modal.querySelector('.modal-body');
  const cfg = CONFIG();
  const order = selectedOrder;
  const statuses = getORDER_STATUSES();
  const status = statuses[order.status];
  const ocfg = cfg.admin.orders;
  const dcfg = cfg.orderDetail;
  const lang = localStorage.getItem('oms_lang') || 'zh-HK';

  body.innerHTML = `
    <div class="order-detail">
      <div class="order-detail-header"><div class="order-detail-id">${escapeHtml(order.id)}</div><span class="badge badge-${status.color}">${status.icon} ${status.label}</span></div>
      <div class="order-detail-section">
        <div class="order-detail-row"><span class="order-detail-label">${ocfg.customer}</span><span class="order-detail-value">${escapeHtml(order.customerName)}</span></div>
        <div class="order-detail-row"><span class="order-detail-label">${ocfg.phone}</span><span class="order-detail-value">${escapeHtml(order.phone)}</span></div>
        <div class="order-detail-row"><span class="order-detail-label">${ocfg.table}</span><span class="order-detail-value">${escapeHtml(order.tableNumber)}</span></div>
        <div class="order-detail-row"><span class="order-detail-label">${ocfg.pickupTime}</span><span class="order-detail-value">${escapeHtml(order.pickupTime)}</span></div>
        ${order.notes ? `<div class="order-detail-row"><span class="order-detail-label">${ocfg.notes}</span><span class="order-detail-value">${escapeHtml(order.notes)}</span></div>` : ''}
        <div class="order-detail-row"><span class="order-detail-label">${ocfg.orderTime}</span><span class="order-detail-value">${formatTime(order.createdAt)}</span></div>
      </div>
      <div class="order-detail-section">
        <div class="order-detail-section-title">${dcfg.orderItems}</div>
        <div class="order-detail-items">
          ${order.items.map(item => { const n = lang === 'en' && item.nameEn ? item.nameEn : item.name; return `
          <div class="order-detail-item"><div class="order-detail-item-info"><div class="order-detail-item-name">${escapeHtml(n)}</div><div class="order-detail-item-price">${formatCurrency(item.price)} ${dcfg.qty} ${item.quantity}</div></div><div class="order-detail-item-subtotal">${formatCurrency(item.price * item.quantity)}</div></div>`; }).join('')}
        </div>
      </div>
      <div class="order-detail-section order-detail-summary">
        <div class="order-detail-row"><span class="order-detail-label">${cfg.cart.subtotal}</span><span class="order-detail-value">${formatCurrency(order.subtotal)}</span></div>
        <div class="order-detail-row"><span class="order-detail-label">${cfg.cart.serviceCharge}</span><span class="order-detail-value">${formatCurrency(order.serviceCharge)}</span></div>
        <div class="order-detail-row order-detail-total"><span class="order-detail-label">${cfg.cart.total}</span><span class="order-detail-value">${formatCurrency(order.total)}</span></div>
      </div>
    </div>`;
}

function renderMenuManagement() {
  const container = document.getElementById('admin-menu');
  if (!container) return;
  const items = store.getMenu();
  const cfg = CONFIG();
  const mcfg = cfg.admin.menu;
  const lang = localStorage.getItem('oms_lang') || 'zh-HK';

  if (items.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">${mcfg.emptyIcon}</div><div class="empty-state-title">${mcfg.emptyTitle}</div><div class="empty-state-text">${mcfg.emptyText}</div></div>`;
    return;
  }

  container.innerHTML = `
    <div class="menu-mgmt-header"><h3 class="menu-mgmt-title">${cfg.admin.menu.title}</h3><button class="btn btn-primary btn-sm" id="add-menu-item-btn">${mcfg.add}</button></div>
    <div class="menu-mgmt-list">
      ${items.map(item => {
        const n = lang === 'en' && item.nameEn ? item.nameEn : item.name;
        return `
        <div class="menu-mgmt-item">
          ${item.image ? `<div class="menu-mgmt-item-thumb"><img src="${escapeHtml(item.image)}" alt=""></div>` : ''}
          <div class="menu-mgmt-item-info">
            <div class="menu-mgmt-item-name">${escapeHtml(n)}</div>
            <div class="menu-mgmt-item-meta">
              <span class="badge badge-neutral">${getCategoryLabel(item.category)}</span>
              <span class="menu-mgmt-item-price">${formatCurrency(item.price)}</span>
              ${item.tags.map(t => `<span class="badge badge-primary">${escapeHtml(t)}</span>`).join('')}
            </div>
          </div>
          <div class="menu-mgmt-item-actions">
            <button class="btn btn-ghost btn-sm" data-edit-item="${item.id}">${mcfg.edit}</button>
            <button class="btn btn-ghost btn-sm text-danger" data-delete-item="${item.id}">${mcfg.delete}</button>
          </div>
        </div>`;
      }).join('')}
    </div>`;

  container.querySelector('#add-menu-item-btn')?.addEventListener('click', () => { editingItem = null; menuFormOpen = true; renderMenuForm(); });
  container.querySelectorAll('[data-edit-item]').forEach(btn => { btn.addEventListener('click', () => { editingItem = store.getMenuItem(btn.dataset.editItem); menuFormOpen = true; renderMenuForm(); }); });
  container.querySelectorAll('[data-delete-item]').forEach(btn => { btn.addEventListener('click', () => { if (confirm(mcfg.confirmDelete)) store.deleteMenuItem(btn.dataset.deleteItem); }); });
}

function renderMenuForm() {
  const modal = document.getElementById('menu-form-modal');
  if (!modal) return;
  if (!menuFormOpen) { modal.classList.remove('open'); return; }
  modal.classList.add('open');
  const form = modal.querySelector('.menu-form');
  if (!form) return;
  const cfg = CONFIG();
  const fcfg = cfg.admin.menuForm;
  modal.querySelector('.modal-title').textContent = editingItem ? fcfg.editTitle : fcfg.addTitle;
  form.elements.name.value = editingItem ? editingItem.name : '';
  form.elements.description.value = editingItem ? editingItem.description : '';
  form.elements.price.value = editingItem ? editingItem.price : '';
  form.elements.category.value = editingItem ? editingItem.category : 'mains';
  form.elements.tags.value = editingItem ? editingItem.tags.join(', ') : '';
  form.elements.image.value = editingItem ? (editingItem.image || '') : '';
  renderImagePreview(editingItem ? editingItem.image : '');
}

function renderImagePreview(src) {
  const preview = document.getElementById('image-preview');
  if (!preview) return;
  if (src) { preview.innerHTML = `<img src="${escapeHtml(src)}" alt="Preview">`; preview.style.display = 'block'; }
  else { preview.innerHTML = ''; preview.style.display = 'none'; }
}

function handleMenuFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    name: form.elements.name.value.trim(),
    description: form.elements.description.value.trim(),
    price: Number(form.elements.price.value),
    category: form.elements.category.value,
    tags: form.elements.tags.value.split(',').map(t => t.trim()).filter(Boolean),
    image: form.elements.image.value.trim(),
  };
  if (!data.name || !data.price) return;
  if (editingItem) { store.updateMenuItem(editingItem.id, data); } else { store.addMenuItem(data); }
  menuFormOpen = false; editingItem = null; renderMenuForm(); renderMenuManagement(); renderStats();
}

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => { const form = document.querySelector('.menu-form'); if (form) form.elements.image.value = ev.target.result; renderImagePreview(ev.target.result); };
  reader.readAsDataURL(file);
}

function getCategoryLabel(id) {
  const categories = getCATEGORIES();
  const cat = categories.find(c => c.id === id);
  return cat ? cat.name : id;
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.getElementById('admin-orders-section').style.display = tab === 'orders' ? '' : 'none';
  document.getElementById('admin-menu-section').style.display = tab === 'menu' ? '' : 'none';
  if (tab === 'orders') renderOrders();
  if (tab === 'menu') renderMenuManagement();
}

export function initAdmin() {
  store.subscribe('orders:change', () => { if (activeTab === 'orders') renderOrders(); renderStats(); });
  store.subscribe('menu:change', () => { if (activeTab === 'menu') renderMenuManagement(); renderStats(); });
  renderStats(); renderOrders();
  document.querySelectorAll('.admin-tab').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
  document.getElementById('menu-form-modal')?.addEventListener('submit', handleMenuFormSubmit);
  document.getElementById('close-menu-form-btn')?.addEventListener('click', () => { menuFormOpen = false; editingItem = null; renderMenuForm(); });
  document.getElementById('menu-form-overlay')?.addEventListener('click', () => { menuFormOpen = false; editingItem = null; renderMenuForm(); });
  document.getElementById('menu-image-upload')?.addEventListener('change', handleImageUpload);
  document.getElementById('menu-image')?.addEventListener('input', (e) => renderImagePreview(e.target.value));
  document.getElementById('close-order-detail-btn')?.addEventListener('click', () => { orderDetailOpen = false; selectedOrder = null; renderOrderDetail(); });
  document.getElementById('order-detail-overlay')?.addEventListener('click', () => { orderDetailOpen = false; selectedOrder = null; renderOrderDetail(); });
}

export function refreshAdmin() { renderStats(); if (activeTab === 'orders') renderOrders(); if (activeTab === 'menu') renderMenuManagement(); }
