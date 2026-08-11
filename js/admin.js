import { store } from './store.js';
import { getCategories, getStatuses, getCategoryEmoji, t } from './i18n.js';
import { CONFIG } from './config.js';
import { formatCurrency, formatTime, escapeHtml } from './utils.js';

let activeSection = 'master';
let activeTab = 'menu';
let editingItem = null;
let menuFormOpen = false;
let orderDetailOpen = false;
let selectedOrder = null;

const LOGS_KEY = 'oms_logs';

function getLogs() {
  try { return JSON.parse(localStorage.getItem(LOGS_KEY)) || []; } catch { return []; }
}

function addLog(type, action, detail = '') {
  const logs = getLogs();
  logs.unshift({ id: Date.now(), type, action, detail, time: new Date().toISOString() });
  if (logs.length > 500) logs.length = 500;
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

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

function getCategoryLabel(id) {
  const categories = getCategories();
  const cat = categories.find(c => c.id === id);
  return cat ? cat.name : id;
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
  container.querySelectorAll('[data-delete-item]').forEach(btn => { btn.addEventListener('click', () => { if (confirm(mcfg.confirmDelete)) { store.deleteMenuItem(btn.dataset.deleteItem); addLog('master', 'delete_menu', btn.dataset.deleteItem); } }); });
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
  form.elements.nameEn.value = editingItem ? (editingItem.nameEn || '') : '';
  form.elements.description.value = editingItem ? editingItem.description : '';
  form.elements.descriptionEn.value = editingItem ? (editingItem.descriptionEn || '') : '';
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
    nameEn: form.elements.nameEn.value.trim(),
    description: form.elements.description.value.trim(),
    descriptionEn: form.elements.descriptionEn.value.trim(),
    price: Number(form.elements.price.value),
    category: form.elements.category.value,
    tags: form.elements.tags.value.split(',').map(t => t.trim()).filter(Boolean),
    image: form.elements.image.value.trim(),
  };
  if (!data.name || !data.price) return;
  if (editingItem) { store.updateMenuItem(editingItem.id, data); addLog('master', 'edit_menu', editingItem.id); }
  else { store.addMenuItem(data); addLog('master', 'add_menu', data.name); }
  menuFormOpen = false; editingItem = null; renderMenuForm(); renderMenuManagement(); renderStats();
}

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => { const form = document.querySelector('.menu-form'); if (form) form.elements.image.value = ev.target.result; renderImagePreview(ev.target.result); };
  reader.readAsDataURL(file);
}

function renderCategories() {
  const container = document.getElementById('admin-categories');
  if (!container) return;
  const categories = getCategories();
  const lang = localStorage.getItem('oms_lang') || 'zh-HK';
  container.innerHTML = `
    <div class="menu-mgmt-header"><h3 class="menu-mgmt-title">分類管理</h3></div>
    <div class="menu-mgmt-list">
      ${categories.map(cat => `
        <div class="menu-mgmt-item">
          <div class="menu-mgmt-item-info">
            <div class="menu-mgmt-item-name">${cat.icon} ${lang === 'en' ? cat.nameEn : cat.name}</div>
            <div class="menu-mgmt-item-meta">
              <span class="badge badge-neutral">ID: ${cat.id}</span>
            </div>
          </div>
        </div>`).join('')}
    </div>`;
}

function renderSettings() {
  const container = document.getElementById('admin-settings');
  if (!container) return;
  const cfg = CONFIG();
  container.innerHTML = `
    <div class="menu-mgmt-header"><h3 class="menu-mgmt-title">系統設定</h3></div>
    <div class="settings-list">
      <div class="settings-item"><span class="settings-label">品牌名稱</span><span class="settings-value">${cfg.brand.name}</span></div>
      <div class="settings-item"><span class="settings-label">品牌圖標</span><span class="settings-value">${cfg.brand.icon}</span></div>
      <div class="settings-item"><span class="settings-label">服務費</span><span class="settings-value">10%</span></div>
      <div class="settings-item"><span class="settings-label">語言</span><span class="settings-value">繁體中文 / English</span></div>
    </div>`;
}

function renderReports() {
  const container = document.getElementById('admin-reports');
  if (!container) return;
  const stats = store.getStats();
  const orders = store.getOrders();
  const lang = localStorage.getItem('oms_lang') || 'zh-HK';
  const completed = orders.filter(o => o.status === 'completed');
  const avgOrderValue = completed.length > 0 ? completed.reduce((s, o) => s + o.total, 0) / completed.length : 0;
  const categoryStats = {};
  orders.forEach(o => o.items.forEach(i => {
    const cat = i.category || 'other';
    if (!categoryStats[cat]) categoryStats[cat] = { count: 0, revenue: 0 };
    categoryStats[cat].count += i.quantity;
    categoryStats[cat].revenue += i.price * i.quantity;
  }));
  const catLabels = { mains: '主食', sides: '小食', drinks: '飲品', desserts: '甜品', other: '其他' };

  container.innerHTML = `
    <div class="menu-mgmt-header"><h3 class="menu-mgmt-title">統計報表</h3></div>
    <div class="reports-grid">
      <div class="report-card"><div class="report-title">已完成訂單</div><div class="report-value">${completed.length}</div></div>
      <div class="report-card"><div class="report-title">平均訂單金額</div><div class="report-value">${formatCurrency(avgOrderValue)}</div></div>
      <div class="report-card"><div class="report-title">總收入</div><div class="report-value">${formatCurrency(stats.totalRevenue)}</div></div>
    </div>
    <div class="menu-mgmt-header" style="margin-top: 16px;"><h3 class="menu-mgmt-title">分類銷量</h3></div>
    <div class="menu-mgmt-list">
      ${Object.entries(categoryStats).map(([cat, data]) => `
        <div class="menu-mgmt-item">
          <div class="menu-mgmt-item-info">
            <div class="menu-mgmt-item-name">${catLabels[cat] || cat}</div>
            <div class="menu-mgmt-item-meta">
              <span class="badge badge-neutral">銷量: ${data.count}</span>
              <span class="menu-mgmt-item-price">${formatCurrency(data.revenue)}</span>
            </div>
          </div>
        </div>`).join('')}
    </div>`;
}

function renderOrders() {
  const container = document.getElementById('admin-orders');
  if (!container) return;
  const orders = store.getOrders();
  const cfg = CONFIG();
  const ocfg = cfg.admin.orders;
  const statuses = getStatuses();
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
  container.querySelectorAll('[data-order-status]').forEach(select => { select.addEventListener('change', (e) => { store.updateOrderStatus(select.dataset.orderStatus, e.target.value); addLog('data', 'update_order_status', select.dataset.orderStatus + ' -> ' + e.target.value); renderStats(); }); });
  container.querySelectorAll('[data-delete-order]').forEach(btn => { btn.addEventListener('click', () => { if (confirm(ocfg.confirmDelete)) { store.deleteOrder(btn.dataset.deleteOrder); addLog('data', 'delete_order', btn.dataset.deleteOrder); renderStats(); } }); });
}

function renderOrderDetail() {
  const modal = document.getElementById('order-detail-modal');
  if (!modal) return;
  if (!orderDetailOpen || !selectedOrder) { modal.classList.remove('open'); return; }
  modal.classList.add('open');
  const body = modal.querySelector('.modal-body');
  const cfg = CONFIG();
  const order = selectedOrder;
  const statuses = getStatuses();
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

function renderActivityLogs() {
  const container = document.getElementById('admin-activity');
  if (!container) return;
  const logs = getLogs().filter(l => l.type === 'data');
  if (logs.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📝</div><div class="empty-state-title">暫無操作記錄</div><div class="empty-state-text">操作訂單後會在此顯示</div></div>`;
    return;
  }
  const actionLabels = { update_order_status: '更新訂單狀態', delete_order: '刪除訂單', create_order: '建立訂單' };
  container.innerHTML = `
    <div class="menu-mgmt-header"><h3 class="menu-mgmt-title">操作日誌</h3><button class="btn btn-ghost btn-sm text-danger" id="clear-activity-logs">清除記錄</button></div>
    <div class="menu-mgmt-list">
      ${logs.map(log => `
        <div class="menu-mgmt-item">
          <div class="menu-mgmt-item-info">
            <div class="menu-mgmt-item-name">${actionLabels[log.action] || log.action}</div>
            <div class="menu-mgmt-item-meta">
              <span class="badge badge-neutral">${log.detail}</span>
              <span class="menu-mgmt-item-price">${formatTime(log.time)}</span>
            </div>
          </div>
        </div>`).join('')}
    </div>`;
  container.querySelector('#clear-activity-logs')?.addEventListener('click', () => {
    const all = getLogs().filter(l => l.type !== 'data');
    localStorage.setItem(LOGS_KEY, JSON.stringify(all));
    renderActivityLogs();
  });
}

function renderAuditLogs() {
  const container = document.getElementById('admin-audit');
  if (!container) return;
  const logs = getLogs().filter(l => l.type === 'master');
  if (logs.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">暫無審計記錄</div><div class="empty-state-text">修改菜單後會在此顯示</div></div>`;
    return;
  }
  const actionLabels = { add_menu: '新增餐點', edit_menu: '編輯餐點', delete_menu: '刪除餐點' };
  container.innerHTML = `
    <div class="menu-mgmt-header"><h3 class="menu-mgmt-title">審計日誌</h3><button class="btn btn-ghost btn-sm text-danger" id="clear-audit-logs">清除記錄</button></div>
    <div class="menu-mgmt-list">
      ${logs.map(log => `
        <div class="menu-mgmt-item">
          <div class="menu-mgmt-item-info">
            <div class="menu-mgmt-item-name">${actionLabels[log.action] || log.action}</div>
            <div class="menu-mgmt-item-meta">
              <span class="badge badge-neutral">${log.detail}</span>
              <span class="menu-mgmt-item-price">${formatTime(log.time)}</span>
            </div>
          </div>
        </div>`).join('')}
    </div>`;
  container.querySelector('#clear-audit-logs')?.addEventListener('click', () => {
    const all = getLogs().filter(l => l.type !== 'master');
    localStorage.setItem(LOGS_KEY, JSON.stringify(all));
    renderAuditLogs();
  });
}

function switchSection(section) {
  activeSection = section;
  document.querySelectorAll('.admin-section-tab').forEach(t => t.classList.toggle('active', t.dataset.section === section));
  document.querySelectorAll('.admin-section-content').forEach(c => c.style.display = 'none');
  document.getElementById('section-' + section).style.display = '';
  if (section === 'master') { activeTab = 'menu'; renderMasterTab(); renderMenuManagement(); }
  if (section === 'data') { activeTab = 'orders'; renderDataTab(); renderStats(); renderOrders(); }
  if (section === 'logs') { activeTab = 'activity'; renderLogsTab(); renderActivityLogs(); }
}

function renderMasterTab() {
  document.querySelectorAll('#section-master .admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('#section-master .admin-tab[data-tab="menu"]')?.classList.add('active');
  document.getElementById('admin-menu-section').style.display = '';
  document.getElementById('admin-categories-section').style.display = 'none';
  document.getElementById('admin-settings-section').style.display = 'none';
}

function renderDataTab() {
  document.querySelectorAll('#section-data .admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('#section-data .admin-tab[data-tab="orders"]')?.classList.add('active');
  document.getElementById('admin-orders-section').style.display = '';
  document.getElementById('admin-reports-section').style.display = 'none';
}

function renderLogsTab() {
  document.querySelectorAll('#section-logs .admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('#section-logs .admin-tab[data-tab="activity"]')?.classList.add('active');
  document.getElementById('admin-activity-section').style.display = '';
  document.getElementById('admin-audit-section').style.display = 'none';
}

function switchTab(tab) {
  activeTab = tab;
  if (activeSection === 'master') {
    document.querySelectorAll('#section-master .admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    document.getElementById('admin-menu-section').style.display = tab === 'menu' ? '' : 'none';
    document.getElementById('admin-categories-section').style.display = tab === 'categories' ? '' : 'none';
    document.getElementById('admin-settings-section').style.display = tab === 'settings' ? '' : 'none';
    if (tab === 'menu') renderMenuManagement();
    if (tab === 'categories') renderCategories();
    if (tab === 'settings') renderSettings();
  }
  if (activeSection === 'data') {
    document.querySelectorAll('#section-data .admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    document.getElementById('admin-orders-section').style.display = tab === 'orders' ? '' : 'none';
    document.getElementById('admin-reports-section').style.display = tab === 'reports' ? '' : 'none';
    if (tab === 'orders') renderOrders();
    if (tab === 'reports') renderReports();
  }
  if (activeSection === 'logs') {
    document.querySelectorAll('#section-logs .admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    document.getElementById('admin-activity-section').style.display = tab === 'activity' ? '' : 'none';
    document.getElementById('admin-audit-section').style.display = tab === 'audit' ? '' : 'none';
    if (tab === 'activity') renderActivityLogs();
    if (tab === 'audit') renderAuditLogs();
  }
}

export function initAdmin() {
  store.subscribe('orders:change', () => { if (activeSection === 'data' && activeTab === 'orders') renderOrders(); renderStats(); });
  store.subscribe('menu:change', () => { if (activeSection === 'master' && activeTab === 'menu') renderMenuManagement(); renderStats(); });
  renderStats(); renderOrders();
  document.querySelectorAll('.admin-section-tab').forEach(btn => btn.addEventListener('click', () => switchSection(btn.dataset.section)));
  document.querySelectorAll('.admin-tab').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
  document.getElementById('menu-form-modal')?.addEventListener('submit', handleMenuFormSubmit);
  document.getElementById('close-menu-form-btn')?.addEventListener('click', () => { menuFormOpen = false; editingItem = null; renderMenuForm(); });
  document.getElementById('menu-form-overlay')?.addEventListener('click', () => { menuFormOpen = false; editingItem = null; renderMenuForm(); });
  document.getElementById('menu-image-upload')?.addEventListener('change', handleImageUpload);
  document.getElementById('menu-image')?.addEventListener('input', (e) => renderImagePreview(e.target.value));
  document.getElementById('close-order-detail-btn')?.addEventListener('click', () => { orderDetailOpen = false; selectedOrder = null; renderOrderDetail(); });
  document.getElementById('order-detail-overlay')?.addEventListener('click', () => { orderDetailOpen = false; selectedOrder = null; renderOrderDetail(); });
}

export function refreshAdmin() { renderStats(); if (activeSection === 'data' && activeTab === 'orders') renderOrders(); if (activeSection === 'master' && activeTab === 'menu') renderMenuManagement(); }
