// Default Key-Store
export function autoKeyStore(initial={}) {
  window.AutoKeyStore = initial;
  return window.AutoKeyStore;
}

// Add/Update item in Key-Store
export function addAutoKeyStore(key, data) {
  window.AutoKeyStore[key] = data;
  return window.AutoKeyStore;
}

// Get item from Key-Store
export function getAutoKeyStore(key) {
  return window.AutoKeyStore[key] ?? null;
}