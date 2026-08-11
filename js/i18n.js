// ═══════════════════════════════════════════════════════════
//  語言包 — 繁體中文 / English
// ═══════════════════════════════════════════════════════════

export const LOCALES = {
  'zh-HK': {
    // 品牌
    brand: {
      name: '簡約點餐',
      icon: '☕',
      tagline: '選取您喜愛的餐點，輕鬆下單',
      welcomeText: '歡迎光臨',
    },
    // 導航
    nav: {
      customer: '點餐',
      admin: '後台管理',
      cart: '購物車',
      menu: '菜單管理',
      orders: '訂單管理',
      backToShop: '← 點餐前台',
      backToAdmin: '後台管理 →',
    },
    // 分類
    categories: {
      all: { name: '全部', icon: '🍽️' },
      mains: { name: '主食', icon: '🍚' },
      sides: { name: '小食', icon: '🍟' },
      drinks: { name: '飲品', icon: '☕' },
      desserts: { name: '甜品', icon: '🍰' },
    },
    // 購物車
    cart: {
      title: '購物車',
      emptyTitle: '購物車是空的',
      emptyText: '快去選些美味的餐點吧！',
      emptyIcon: '🛒',
      subtotal: '小計',
      serviceCharge: '服務費 (10%)',
      total: '總計',
      checkout: '前往結帳',
      remove: '移除',
    },
    // 結帳
    checkout: {
      title: '確認訂單',
      nameLabel: '顧客姓名 *',
      namePlaceholder: '請輸入姓名',
      phoneLabel: '聯絡電話 *',
      phonePlaceholder: '例如：91234567',
      tableLabel: '桌號 / 外帶號碼 *',
      tablePlaceholder: '例如：5 或 外帶',
      timeLabel: '取餐時間',
      notesLabel: '訂單備註',
      notesPlaceholder: '例如：少辣、不要洋蔥...',
      submit: '送出訂單',
    },
    // 訂單成功
    orderSuccess: {
      title: '訂單已送出！',
      message: '感謝您的訂單，請稍候取餐',
      orderId: '訂單編號',
      customer: '顧客',
      phone: '電話',
      table: '桌號',
      pickupTime: '取餐時間',
      total: '總計',
      done: '完成',
    },
    // 訂單狀態
    orderStatuses: {
      pending: { label: '待處理', color: 'warning', icon: '⏳' },
      preparing: { label: '製作中', color: 'info', icon: '👨‍🍳' },
      ready: { label: '可取餐', color: 'success', icon: '✅' },
      completed: { label: '已完成', color: 'neutral', icon: '✔️' },
    },
    // 後台管理
    admin: {
      title: '後台管理',
      subtitle: '訂單與菜單管理',
      stats: {
        totalOrders: '總訂單數',
        pendingOrders: '待處理',
        menuCount: '菜式數量',
        totalRevenue: '總營業額',
      },
      orders: {
        emptyTitle: '暫無訂單',
        emptyText: '還沒有任何訂單紀錄',
        emptyIcon: '📋',
        customer: '顧客',
        phone: '電話',
        table: '桌號',
        pickupTime: '取餐時間',
        notes: '備註',
        items: '餐點',
        total: '總計',
        detail: '詳情',
        delete: '刪除',
        confirmDelete: '確定要刪除此訂單？',
        orderTime: '下單時間',
      },
      menu: {
        title: '菜單管理',
        add: '+ 新增餐點',
        edit: '編輯',
        delete: '刪除',
        confirmDelete: '確定要刪除此餐點？',
        emptyTitle: '暫無餐點',
        emptyText: '點擊上方按鈕新增第一道餐點',
        emptyIcon: '🍽️',
      },
      menuForm: {
        addTitle: '新增餐點',
        editTitle: '編輯餐點',
        nameLabel: '名稱 *',
        namePlaceholder: '餐點名稱',
        descLabel: '描述',
        descPlaceholder: '簡短描述',
        priceLabel: '價格 *',
        pricePlaceholder: '0',
        categoryLabel: '分類',
        tagsLabel: '標籤（逗號分隔）',
        tagsPlaceholder: '例如：人氣, 推薦',
        imageLabel: '圖片網址',
        imagePlaceholder: 'https://example.com/photo.jpg',
        imageUpload: '或上傳圖片',
        imageUploadBtn: '📁 點擊選擇圖片',
        save: '儲存',
      },
    },
    // 訂單詳情
    orderDetail: {
      title: '訂單詳情',
      orderItems: '訂單內容',
      qty: '×',
    },
    // 主題
    theme: {
      lightIcon: '🌙',
      darkIcon: '☀️',
    },
    // 語言
    lang: { zh: '繁中', en: 'EN' },
  },

  'en': {
    // Brand
    brand: {
      name: 'Simple Order',
      icon: '☕',
      tagline: 'Pick your favorites and order with ease',
      welcomeText: 'Welcome',
    },
    // Nav
    nav: {
      customer: 'Menu',
      admin: 'Admin',
      cart: 'Cart',
      menu: 'Menu Mgmt',
      orders: 'Orders',
      backToShop: '← Back to Shop',
      backToAdmin: '→ Admin Panel',
    },
    // Categories
    categories: {
      all: { name: 'All', icon: '🍽️' },
      mains: { name: 'Mains', icon: '🍚' },
      sides: { name: 'Sides', icon: '🍟' },
      drinks: { name: 'Drinks', icon: '☕' },
      desserts: { name: 'Desserts', icon: '🍰' },
    },
    // Cart
    cart: {
      title: 'Cart',
      emptyTitle: 'Your cart is empty',
      emptyText: 'Add some delicious items!',
      emptyIcon: '🛒',
      subtotal: 'Subtotal',
      serviceCharge: 'Service Charge (10%)',
      total: 'Total',
      checkout: 'Checkout',
      remove: 'Remove',
    },
    // Checkout
    checkout: {
      title: 'Confirm Order',
      nameLabel: 'Customer Name *',
      namePlaceholder: 'Enter name',
      phoneLabel: 'Phone *',
      phonePlaceholder: 'e.g. 91234567',
      tableLabel: 'Table / Takeaway No. *',
      tablePlaceholder: 'e.g. 5 or Takeaway',
      timeLabel: 'Pickup Time',
      notesLabel: 'Notes',
      notesPlaceholder: 'e.g. less spicy, no onions...',
      submit: 'Place Order',
    },
    // Order Success
    orderSuccess: {
      title: 'Order Placed!',
      message: 'Thank you, please wait for your order',
      orderId: 'Order ID',
      customer: 'Customer',
      phone: 'Phone',
      table: 'Table',
      pickupTime: 'Pickup Time',
      total: 'Total',
      done: 'Done',
    },
    // Order Statuses
    orderStatuses: {
      pending: { label: 'Pending', color: 'warning', icon: '⏳' },
      preparing: { label: 'Preparing', color: 'info', icon: '👨‍🍳' },
      ready: { label: 'Ready', color: 'success', icon: '✅' },
      completed: { label: 'Completed', color: 'neutral', icon: '✔️' },
    },
    // Admin
    admin: {
      title: 'Admin Panel',
      subtitle: 'Orders & Menu Management',
      stats: {
        totalOrders: 'Total Orders',
        pendingOrders: 'Pending',
        menuCount: 'Menu Items',
        totalRevenue: 'Revenue',
      },
      orders: {
        emptyTitle: 'No Orders Yet',
        emptyText: 'Orders will appear here',
        emptyIcon: '📋',
        customer: 'Customer',
        phone: 'Phone',
        table: 'Table',
        pickupTime: 'Pickup',
        notes: 'Notes',
        items: 'Items',
        total: 'Total',
        detail: 'Detail',
        delete: 'Delete',
        confirmDelete: 'Delete this order?',
        orderTime: 'Order Time',
      },
      menu: {
        title: 'Menu Management',
        add: '+ Add Item',
        edit: 'Edit',
        delete: 'Delete',
        confirmDelete: 'Delete this item?',
        emptyTitle: 'No Menu Items',
        emptyText: 'Click above to add your first item',
        emptyIcon: '🍽️',
      },
      menuForm: {
        addTitle: 'Add New Item',
        editTitle: 'Edit Item',
        nameLabel: 'Name *',
        namePlaceholder: 'Item name',
        descLabel: 'Description',
        descPlaceholder: 'Short description',
        priceLabel: 'Price *',
        pricePlaceholder: '0',
        categoryLabel: 'Category',
        tagsLabel: 'Tags (comma separated)',
        tagsPlaceholder: 'e.g. Popular, Featured',
        imageLabel: 'Image URL',
        imagePlaceholder: 'https://example.com/photo.jpg',
        imageUpload: 'Or upload image',
        imageUploadBtn: '📁 Choose Image',
        save: 'Save',
      },
    },
    // Order Detail
    orderDetail: {
      title: 'Order Detail',
      orderItems: 'Order Items',
      qty: '×',
    },
    // Theme
    theme: {
      lightIcon: '🌙',
      darkIcon: '☀️',
    },
    // Lang
    lang: { zh: '繁中', en: 'EN' },
  },
};

let currentLang = localStorage.getItem('oms_lang') || 'zh-HK';

export function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('oms_lang', lang);
}

export function getLang() {
  return currentLang;
}

export function t(path) {
  const keys = path.split('.');
  let val = LOCALES[currentLang];
  for (const k of keys) {
    if (val && typeof val === 'object') val = val[k];
    else return path;
  }
  return val ?? path;
}

export function getCategories() {
  const cats = t('categories');
  return Object.entries(cats).map(([id, v]) => ({ id, name: v.name, icon: v.icon }));
}

export function getStatuses() {
  return t('orderStatuses');
}

export function getCategoryEmoji(category) {
  const cats = t('categories');
  return cats[category]?.icon || '🍽️';
}
