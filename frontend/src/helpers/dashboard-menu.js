import { getLocalData } from 'helpers/common';

// Get Dashboard Menu
export function getDashboardMenu(appName) {
  let menus = {};
  let innerApps = getLocalData('innerApps');
  
  innerApps.forEach(app => {
    menus[app['name']] = app['menu'];
  });

  return menus[appName] ?? [];
}