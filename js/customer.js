import { store } from './store.js';
import { CATEGORIES, ORDER_STATUSES } from './data.js';
import { formatCurrency, escapeHtml, getCurrentTime } from './utils.js';

let activeCategory = 'all';
let cartDrawerOpen = false;
let checkoutModalOpen = false;
let orderSuccessVisible = false;
let lastOrder = null;

function getCartItemQuantity(itemId) {
  return store.getCartQuantity(itemId);
}

function renderCategoryTabs() {
  const container = document.getElementById('category-tabs');
  if (!container) return;

  container.innerHTML = CATEGORIES.map(cat => `
    <button class="category-tab ${cat.id === activeCategory ? 'active' : ''}"
            data-category="${cat.id}">
      <span>${cat.icon}</span>
      <span>${cat.name}</span>
    </button>
  `).join('');

  container.querySelectorAll('.category-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.category;
      renderCategoryTabs();
      renderMenuGrid();
    });
  });
}

function renderMenuGrid() {
  const container = document.getElementById('menu-grid');
  if (!container) return;

  const items = store.getMenuByCategory(activeCategory);

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🍽️</div>
        <div class="empty-state-title">暫無餐點</div>
        <div class="empty-state-text">此分類暫時沒有可用餐點</div>
      </div>`;
    return;
  }

  container.innerHTML = items.map(item => {
    const qty = getCartItemQuantity(item.id);
    const tagsHtml = item.tags.length
      ? `<div class="menu-card-tags">${item.tags.map(t => `<span class="badge badge-primary">${escapeHtml(t)}</span>`).join('')}</div>`
      : '';

    return `
      <div class="menu-card" data-id="${item.id}">
        <div class="menu-card-image">
          <span>${getCategoryEmoji(item.category)}</span>
        </div>
        <div class="menu-card-content">
          ${tagsHtml}
          <div class="menu-card-title">${escapeHtml(item.name)}</div>
          <div class="menu-card-description">${escapeHtml(item.description)}</div>
          <div class="menu-card-footer">
            <div class="menu-card-price">${formatCurrency(item.price)}</div>
            ${qty === 0
              ? `<button class="menu-card-add" data-add="${item.id}" aria-label="加入購物車">+</button>`
              : `<div class="menu-card-quantity">
                  <button class="menu-card-qty-btn" data-qty-minus="${item.id}">−</button>
                  <span class="menu-card-qty-value">${qty}</span>
                  <button class="menu-card-qty-btn" data-qty-plus="${item.id}">+</button>
                </div>`
            }
          </div>
        </div>
      </div>`;
  }).join('');

  container.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = store.getMenuItem(btn.dataset.add);
      if (item) store.addToCart(item, 1);
    });
  });

  container.querySelectorAll('[data-qty-minus]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.qtyMinus;
      const qty = getCartItemQuantity(id);
      store.updateCartQuantity(id, qty - 1);
    });
  });

  container.querySelectorAll('[data-qty-plus]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.qtyPlus;
      const qty = getCartItemQuantity(id);
      store.updateCartQuantity(id, qty + 1);
    });
  });
}

function getCategoryEmoji(category) {
  const map = { mains: '🍚', sides: '🍟', drinks: '☕', desserts: '🍰' };
  return map[category] || '🍽️';
}

function renderCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  if (!drawer) return;

  const cart = store.getCart();
  const summary = store.getCartSummary();

  const bodyEl = drawer.querySelector('.cart-drawer-body');
  const footerEl = drawer.querySelector('.cart-drawer-footer');

  if (cart.length === 0) {
    bodyEl.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <div class="cart-empty-title">購物車是空的</div>
        <div class="cart-empty-text">快去選些美味的餐點吧！</div>
      </div>`;
    footerEl.style.display = 'none';
  } else {
    bodyEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-image">
          <span>${getCategoryEmoji(item.category)}</span>
        </div>
        <div class="cart-item-details">
          <div class="cart-item-title">${escapeHtml(item.name)}</div>
          <div class="cart-item-price">${formatCurrency(item.price)}</div>
          <div class="cart-item-controls">
            <button class="cart-qty-btn" data-cart-minus="${item.id}">−</button>
            <span class="cart-qty-value">${item.quantity}</span>
            <button class="cart-qty-btn" data-cart-plus="${item.id}">+</button>
            <button class="cart-item-remove" data-cart-remove="${item.id}" aria-label="移除">✕</button>
          </div>
        </div>
      </div>
    `).join('');

    footerEl.style.display = 'block';
    footerEl.querySelector('.cart-summary').innerHTML = `
      <div class="cart-summary-row">
        <span>小計</span>
        <span>${formatCurrency(summary.subtotal)}</span>
      </div>
      <div class="cart-summary-row">
        <span>服務費 (10%)</span>
        <span>${formatCurrency(summary.serviceCharge)}</span>
      </div>
      <div class="cart-summary-row total">
        <span>總計</span>
        <span>${formatCurrency(summary.total)}</span>
      </div>`;

    bodyEl.querySelectorAll('[data-cart-minus]').forEach(btn => {
      btn.addEventListener('click', () => {
        const qty = getCartItemQuantity(btn.dataset.cartMinus);
        store.updateCartQuantity(btn.dataset.cartMinus, qty - 1);
      });
    });

    bodyEl.querySelectorAll('[data-cart-plus]').forEach(btn => {
      btn.addEventListener('click', () => {
        const qty = getCartItemQuantity(btn.dataset.cartPlus);
        store.updateCartQuantity(btn.dataset.cartPlus, qty + 1);
      });
    });

    bodyEl.querySelectorAll('[data-cart-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        store.removeFromCart(btn.dataset.cartRemove);
      });
    });
  }

  // update footer badge
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.textContent = summary.itemCount;
    badge.style.display = summary.itemCount > 0 ? 'flex' : 'none';
  }

  // update mobile footer badge
  const mobileBadge = document.getElementById('mobile-cart-badge');
  if (mobileBadge) {
    mobileBadge.textContent = summary.itemCount;
    mobileBadge.style.display = summary.itemCount > 0 ? 'flex' : 'none';
  }
}

function toggleCartDrawer(open) {
  cartDrawerOpen = typeof open === 'boolean' ? open : !cartDrawerOpen;
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer) drawer.classList.toggle('open', cartDrawerOpen);
  if (overlay) overlay.classList.toggle('open', cartDrawerOpen);
  document.body.style.overflow = cartDrawerOpen ? 'hidden' : '';
}

function renderCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (!modal) return;

  if (!checkoutModalOpen) {
    modal.classList.remove('open');
    return;
  }

  modal.classList.add('open');
  const form = modal.querySelector('.checkout-form');
  if (form) {
    form.querySelector('[name="pickupTime"]').value = getCurrentTime();
  }
}

function renderOrderSuccess() {
  const modal = document.getElementById('checkout-modal');
  if (!modal) return;

  if (!orderSuccessVisible) {
    modal.classList.remove('open');
    return;
  }

  modal.classList.add('open');
  const body = modal.querySelector('.modal-body');
  body.innerHTML = `
    <div class="order-success">
      <div class="order-success-icon">✓</div>
      <div class="order-success-title">訂單已送出！</div>
      <div class="order-success-message">感謝您的訂單，請稍候取餐</div>
      <div class="order-success-details">
        <div class="order-success-detail-row">
          <span class="order-success-detail-label">訂單編號</span>
          <span class="order-success-detail-value">${lastOrder.id}</span>
        </div>
        <div class="order-success-detail-row">
          <span class="order-success-detail-label">顧客</span>
          <span class="order-success-detail-value">${escapeHtml(lastOrder.customerName)}</span>
        </div>
        <div class="order-success-detail-row">
          <span class="order-success-detail-label">桌號</span>
          <span class="order-success-detail-value">${escapeHtml(lastOrder.tableNumber)}</span>
        </div>
        <div class="order-success-detail-row">
          <span class="order-success-detail-label">取餐時間</span>
          <span class="order-success-detail-value">${escapeHtml(lastOrder.pickupTime)}</span>
        </div>
        <div class="order-success-detail-row">
          <span class="order-success-detail-label">總計</span>
          <span class="order-success-detail-value">${formatCurrency(lastOrder.total)}</span>
        </div>
      </div>
      <button class="btn btn-primary btn-lg mt-6" id="success-close-btn">完成</button>
    </div>`;

  body.querySelector('#success-close-btn').addEventListener('click', () => {
    orderSuccessVisible = false;
    checkoutModalOpen = false;
    renderCheckoutModal();
  });
}

function handleCheckoutSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const customerName = form.customerName.value.trim();
  const tableNumber = form.tableNumber.value.trim();
  const pickupTime = form.pickupTime.value.trim();
  const notes = form.notes.value.trim();

  if (!customerName) { form.customerName.focus(); return; }
  if (!tableNumber) { form.tableNumber.focus(); return; }

  lastOrder = store.createOrder({ customerName, tableNumber, pickupTime, notes });
  checkoutModalOpen = false;
  orderSuccessVisible = true;
  renderOrderSuccess();
}

export function initCustomer() {
  store.subscribe('cart:change', () => {
    renderCartDrawer();
    renderMenuGrid();
  });

  store.subscribe('menu:change', () => {
    renderMenuGrid();
  });

  renderCategoryTabs();
  renderMenuGrid();
  renderCartDrawer();

  // Cart drawer toggle
  document.getElementById('open-cart-btn')?.addEventListener('click', () => toggleCartDrawer(true));
  document.getElementById('close-cart-btn')?.addEventListener('click', () => toggleCartDrawer(false));
  document.getElementById('cart-overlay')?.addEventListener('click', () => toggleCartDrawer(false));

  // Mobile cart button
  document.getElementById('mobile-cart-btn')?.addEventListener('click', () => toggleCartDrawer(true));

  // Checkout button
  document.getElementById('checkout-btn')?.addEventListener('click', () => {
    const summary = store.getCartSummary();
    if (summary.itemCount === 0) return;
    checkoutModalOpen = true;
    orderSuccessVisible = false;
    renderCheckoutModal();
  });

  // Checkout modal close
  document.getElementById('close-checkout-btn')?.addEventListener('click', () => {
    checkoutModalOpen = false;
    orderSuccessVisible = false;
    renderCheckoutModal();
  });
  document.getElementById('checkout-overlay')?.addEventListener('click', () => {
    checkoutModalOpen = false;
    orderSuccessVisible = false;
    renderCheckoutModal();
  });

  // Checkout form submit
  document.getElementById('checkout-form')?.addEventListener('submit', handleCheckoutSubmit);
}

export function refreshCustomer() {
  renderMenuGrid();
  renderCartDrawer();
}
