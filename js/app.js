import { initCustomer, refreshCustomer } from './customer.js';
import { initAdmin, refreshAdmin } from './admin.js';

let currentView = 'customer';

function initTheme() {
  const saved = localStorage.getItem('oms_theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('oms_theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('oms_theme', 'dark');
  }
  updateThemeIcon();
}

function updateThemeIcon() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.querySelector('.theme-icon-light').style.display = isDark ? 'none' : '';
    btn.querySelector('.theme-icon-dark').style.display = isDark ? '' : 'none';
  }
}

function switchView(view) {
  currentView = view;

  document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
  document.getElementById(`${view}-view`)?.classList.add('active');

  document.querySelectorAll('.header-nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });

  document.querySelectorAll('.footer-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });

  // refresh on switch
  if (view === 'customer') refreshCustomer();
  if (view === 'admin') refreshAdmin();

  document.body.style.overflow = '';
}

function init() {
  initTheme();
  updateThemeIcon();

  initCustomer();
  initAdmin();

  // View switching
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // Theme toggle
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

  // Default view
  switchView('customer');
}

document.addEventListener('DOMContentLoaded', init);
