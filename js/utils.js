let idCounter = 1000;

export function generateId(prefix = 'ORD') {
  idCounter++;
  return `${prefix}-${String(idCounter).padStart(3, '0')}`;
}

export function generateItemId() {
  return 'item_' + Math.random().toString(36).substring(2, 9);
}

export function formatCurrency(amount) {
  return '$' + Number(amount).toFixed(1);
}

export function formatTime(dateString) {
  const d = new Date(dateString);
  return d.toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString('zh-HK', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' });
}

export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function calculateSubtotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calculateServiceCharge(subtotal) {
  return Math.round(subtotal * 0.1 * 10) / 10;
}

export function calculateTotal(subtotal, serviceCharge) {
  return Math.round((subtotal + serviceCharge) * 10) / 10;
}
