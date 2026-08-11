import { DEFAULT_MENU, MOCK_ORDERS } from './data.js';
import { generateId, generateItemId, calculateSubtotal, calculateServiceCharge, calculateTotal } from './utils.js';

const STORAGE_KEYS = {
  menu: 'oms_menu',
  cart: 'oms_cart',
  orders: 'oms_orders',
};

function loadFromStorage(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch { /* silent */ }
}

class Store {
  constructor() {
    this.menu = loadFromStorage(STORAGE_KEYS.menu, DEFAULT_MENU);
    this.orders = loadFromStorage(STORAGE_KEYS.orders, MOCK_ORDERS);
    this.cart = loadFromStorage(STORAGE_KEYS.cart, []);
    this.listeners = new Map();
  }

  subscribe(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(fn);
    return () => this.listeners.get(event).delete(fn);
  }

  emit(event, data) {
    const fns = this.listeners.get(event);
    if (fns) fns.forEach(fn => fn(data));
  }

  // ── Menu ──
  getMenu() { return this.menu; }

  getMenuByCategory(category) {
    if (category === 'all') return this.menu.filter(i => i.available);
    return this.menu.filter(i => i.category === category && i.available);
  }

  getMenuItem(id) { return this.menu.find(i => i.id === id); }

  addMenuItem(item) {
    const newItem = { ...item, id: generateItemId(), available: true };
    this.menu.push(newItem);
    this._persistMenu();
    this.emit('menu:change', this.menu);
    return newItem;
  }

  updateMenuItem(id, updates) {
    const idx = this.menu.findIndex(i => i.id === id);
    if (idx === -1) return null;
    this.menu[idx] = { ...this.menu[idx], ...updates };
    this._persistMenu();
    this.emit('menu:change', this.menu);
    return this.menu[idx];
  }

  deleteMenuItem(id) {
    this.menu = this.menu.filter(i => i.id !== id);
    this._persistMenu();
    this.emit('menu:change', this.menu);
  }

  _persistMenu() { saveToStorage(STORAGE_KEYS.menu, this.menu); }

  // ── Cart ──
  getCart() { return this.cart; }

  addToCart(menuItem, quantity = 1) {
    const existing = this.cart.find(c => c.id === menuItem.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({ ...menuItem, quantity });
    }
    this._persistCart();
    this.emit('cart:change', this.cart);
  }

  updateCartQuantity(itemId, quantity) {
    if (quantity <= 0) {
      this.cart = this.cart.filter(c => c.id !== itemId);
    } else {
      const item = this.cart.find(c => c.id === itemId);
      if (item) item.quantity = quantity;
    }
    this._persistCart();
    this.emit('cart:change', this.cart);
  }

  removeFromCart(itemId) {
    this.cart = this.cart.filter(c => c.id !== itemId);
    this._persistCart();
    this.emit('cart:change', this.cart);
  }

  clearCart() {
    this.cart = [];
    this._persistCart();
    this.emit('cart:change', this.cart);
  }

  getCartQuantity(itemId) {
    const item = this.cart.find(c => c.id === itemId);
    return item ? item.quantity : 0;
  }

  getCartSummary() {
    const subtotal = calculateSubtotal(this.cart);
    const serviceCharge = calculateServiceCharge(subtotal);
    const total = calculateTotal(subtotal, serviceCharge);
    const itemCount = this.cart.reduce((sum, c) => sum + c.quantity, 0);
    return { subtotal, serviceCharge, total, itemCount };
  }

  _persistCart() { saveToStorage(STORAGE_KEYS.cart, this.cart); }

  // ── Orders ──
  getOrders() { return this.orders; }

  getOrder(id) { return this.orders.find(o => o.id === id); }

  createOrder({ customerName, tableNumber, pickupTime, notes }) {
    const items = this.cart.map(c => ({ ...c }));
    const subtotal = calculateSubtotal(items);
    const serviceCharge = calculateServiceCharge(subtotal);
    const total = calculateTotal(subtotal, serviceCharge);

    const order = {
      id: generateId('ORD'),
      customerName,
      tableNumber,
      pickupTime,
      notes,
      items,
      subtotal,
      serviceCharge,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.orders.unshift(order);
    this.clearCart();
    this._persistOrders();
    this.emit('orders:change', this.orders);
    return order;
  }

  updateOrderStatus(orderId, status) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return null;
    order.status = status;
    this._persistOrders();
    this.emit('orders:change', this.orders);
    return order;
  }

  deleteOrder(orderId) {
    this.orders = this.orders.filter(o => o.id !== orderId);
    this._persistOrders();
    this.emit('orders:change', this.orders);
  }

  _persistOrders() { saveToStorage(STORAGE_KEYS.orders, this.orders); }

  // ── Stats ──
  getStats() {
    const totalOrders = this.orders.length;
    const pendingOrders = this.orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
    const menuCount = this.menu.filter(i => i.available).length;
    const totalRevenue = this.orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0);

    return { totalOrders, pendingOrders, menuCount, totalRevenue };
  }
}

export const store = new Store();
