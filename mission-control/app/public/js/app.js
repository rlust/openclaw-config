class TabManager {
  constructor() {
    this.tabs = {
      'overview': ['overview'],
      'tasks': ['tasks'],
      'piwigo': ['piwigo'],
      'health': ['health'],
      'costs': ['costs'],
      'agents': ['agents'],
      'hvac': ['hvac'],
      'discord': ['discord']
    };
  }

  init() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        this.switchTab(tabId);
      });
    });
    console.log('✅ TabManager initialized');
  }

  switchTab(tabId) {
    console.log(`🎯 Switching to: ${tabId}`);
    document.querySelectorAll('.tab-content').forEach(el => {
      el.classList.remove('active');
    });
    const tab = document.getElementById(tabId);
    if (tab) {
      tab.classList.add('active');
      document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
      });
      window.location.hash = tabId;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const tabManager = new TabManager();
  tabManager.init();
  window.addEventListener('hashchange', () => {
    const tabId = window.location.hash.slice(1) || 'overview';
    tabManager.switchTab(tabId);
  });
  console.log('✅ Mission Control ready!');
});
