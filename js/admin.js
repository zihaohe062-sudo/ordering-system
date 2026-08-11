import { store } from './store.js';
import { CATEGORIES, ORDER_STATUSES } from './data.js';
import { formatCurrency, formatTime, escapeHtml } from './utils.js';

let activeTab = 'orders';
let editingItem = null;
let menuFormOpen = false;

function renderStats() {
  const stats = store.getStats();
  const container = document.getElementById('admin-stats');
  if (!container) return;

  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-card-icon stat-card-icon-orders">📦</div>
      <div class="stat-card-info">
        <div class="stat-card-value">${stats.totalOrders}</div>
        <div class="stat-card-label">總訂單數</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-card-icon stat-card-icon-pending">⏳</div>
      <div class="stat-card-info">
        <div class="stat-card-value">${stats.pendingOrders}</div>
        <div class="stat-card-label">待處理</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-card-icon stat-card-icon-menu">🍽️</div>
      <div class="stat-card-info">
        <div class="stat-card-value">${stats.menuCount}</div>
        <div class="stat-card-label">菜式數量</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-card-icon stat-card-icon-revenue">💰</div>
      <div class="stat-card-info">
        <div class="stat-card-value">${formatCurrency(stats.totalRevenue)}</div>
        <div class="stat-card-label">總營業額</div>
      </div>
    </div>`;
}

function renderOrders() {
  const container = document.getElementById('admin-orders');
  if (!container) return;

  const orders = store.getOrders();

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-title">暫無訂單</div>
        <div class="empty-state-text">還沒有任何訂單紀錄</div>
      </div>`;
    return;
  }

  container.innerHTML = orders.map(order => {
    const status = ORDER_STATUSES[order.status];
    const itemsList = order.items.map(i =>
      `${escapeHtml(i.name)} × ${i.quantity}`
    ).join('、');

    return `
      <div class="order-card">
        <div class="order-card-header">
          <div class="order-card-id">${escapeHtml(order.id)}</div>
          <span class="badge badge-${status.color}">${status.icon} ${status.label}</span>
        </div>
        <div class="order-card-body">
          <div class="order-card-row">
            <span class="order-card-label">顧客</span>
            <span class="order-card-value">${escapeHtml(order.customerName)}</span>
          </div>
          <div class="order-card-row">
            <span class="order-card-label">桌號</span>
            <span class="order-card-value">${escapeHtml(order.tableNumber)}</span>
          </div>
          <div class="order-card-row">
            <span class="order-card-label">取餐時間</span>
            <span class="order-card-value">${escapeHtml(order.pickupTime)}</span>
          </div>
          ${order.notes ? `
          <div class="order-card-row">
            <span class="order-card-label">備註</span>
            <span class="order-card-value order-card-notes">${escapeHtml(order.notes)}</span>
          </div>` : ''}
          <div class="order-card-row">
            <span class="order-card-label">餐點</span>
            <span class="order-card-value order-card-items">${itemsList}</span>
          </div>
          <div class="order-card-row order-card-total">
            <span class="order-card-label">總計</span>
            <span class="order-card-value">${formatCurrency(order.total)}</span>
          </div>
        </div>
        <div class="order-card-footer">
          <select class="input select order-status-select" data-order-status="${order.id}">
            ${Object.entries(ORDER_STATUSES).map(([key, val]) =>
              `<option value="${key}" ${order.status === key ? 'selected' : ''}>${val.icon} ${val.label}</option>`
            ).join('')}
          </select>
          <button class="btn btn-ghost btn-sm text-danger" data-delete-order="${order.id}">刪除</button>
        </div>
      </div>`;
  }).join('');

  container.querySelectorAll('[data-order-status]').forEach(select => {
    select.addEventListener('change', (e) => {
      store.updateOrderStatus(select.dataset.orderStatus, e.target.value);
      renderStats();
    });
  });

  container.querySelectorAll('[data-delete-order]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('確定要刪除此訂單？')) {
        store.deleteOrder(btn.dataset.deleteOrder);
        renderStats();
      }
    });
  });
}

function renderMenuManagement() {
  const container = document.getElementById('admin-menu');
  if (!container) return;

  const items = store.getMenu();

  container.innerHTML = `
    <div class="menu-mgmt-header">
      <h3 class="menu-mgmt-title">菜單管理</h3>
      <button class="btn btn-primary btn-sm" id="add-menu-item-btn">+ 新增餐點</button>
    </div>
    <div class="menu-mgmt-list">
      ${items.map(item => `
        <div class="menu-mgmt-item">
          <div class="menu-mgmt-item-info">
            <div class="menu-mgmt-item-name">${escapeHtml(item.name)}</div>
            <div class="menu-mgmt-item-meta">
              <span class="badge badge-neutral">${getCategoryLabel(item.category)}</span>
              <span class="menu-mgmt-item-price">${formatCurrency(item.price)}</span>
              ${item.tags.map(t => `<span class="badge badge-primary">${escapeHtml(t)}</span>`).join('')}
            </div>
          </div>
          <div class="menu-mgmt-item-actions">
            <button class="btn btn-ghost btn-sm" data-edit-item="${item.id}">編輯</button>
            <button class="btn btn-ghost btn-sm text-danger" data-delete-item="${item.id}">刪除</button>
          </div>
        </div>
      `).join('')}
    </div>`;

  container.querySelector('#add-menu-item-btn')?.addEventListener('click', () => {
    editingItem = null;
    menuFormOpen = true;
    renderMenuForm();
  });

  container.querySelectorAll('[data-edit-item]').forEach(btn => {
    btn.addEventListener('click', () => {
      editingItem = store.getMenuItem(btn.dataset.editItem);
      menuFormOpen = true;
      renderMenuForm();
    });
  });

  container.querySelectorAll('[data-delete-item]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('確定要刪除此餐點？')) {
        store.deleteMenuItem(btn.dataset.deleteItem);
      }
    });
  });
}

function renderMenuForm() {
  const modal = document.getElementById('menu-form-modal');
  if (!modal) return;

  if (!menuFormOpen) {
    modal.classList.remove('open');
    return;
  }

  modal.classList.add('open');
  const form = modal.querySelector('.menu-form');
  if (!form) return;

  if (editingItem) {
    form.elements.name.value = editingItem.name;
    form.elements.description.value = editingItem.description;
    form.elements.price.value = editingItem.price;
    form.elements.category.value = editingItem.category;
    form.elements.tags.value = editingItem.tags.join(', ');
  } else {
    form.reset();
  }

  modal.querySelector('.modal-title').textContent = editingItem ? '編輯餐點' : '新增餐點';
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
  };

  if (!data.name || !data.price) return;

  if (editingItem) {
    store.updateMenuItem(editingItem.id, data);
  } else {
    store.addMenuItem(data);
  }

  menuFormOpen = false;
  editingItem = null;
  renderMenuForm();
  renderMenuManagement();
  renderStats();
}

function getCategoryLabel(id) {
  const cat = CATEGORIES.find(c => c.id === id);
  return cat ? cat.name : id;
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.admin-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  document.getElementById('admin-orders-section').style.display = tab === 'orders' ? '' : 'none';
  document.getElementById('admin-menu-section').style.display = tab === 'menu' ? '' : 'none';

  if (tab === 'orders') renderOrders();
  if (tab === 'menu') renderMenuManagement();
}

export function initAdmin() {
  store.subscribe('orders:change', () => {
    if (activeTab === 'orders') renderOrders();
    renderStats();
  });

  store.subscribe('menu:change', () => {
    if (activeTab === 'menu') renderMenuManagement();
    renderStats();
  });

  renderStats();
  renderOrders();

  // Tab switching
  document.querySelectorAll('.admin-tab').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Menu form
  document.getElementById('menu-form-modal')?.addEventListener('submit', handleMenuFormSubmit);
  document.getElementById('close-menu-form-btn')?.addEventListener('click', () => {
    menuFormOpen = false;
    editingItem = null;
    renderMenuForm();
  });
  document.getElementById('menu-form-overlay')?.addEventListener('click', () => {
    menuFormOpen = false;
    editingItem = null;
    renderMenuForm();
  });
}

export function refreshAdmin() {
  renderStats();
  if (activeTab === 'orders') renderOrders();
  if (activeTab === 'menu') renderMenuManagement();
}
