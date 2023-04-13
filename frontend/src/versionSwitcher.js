const versionSwitcher = () => {
  window.AppConfig['version'] = process.env.REACT_APP_VERSION;
  let versionCode = window['AppConfig']['version'];
  let loadDatabase = {
    "v1": {
      "css": [
        "/static/css/bootstrap.min.css",
        "/static/css/style.css",
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css",
        "https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/css/bootstrap-select.min.css",
      ],
      "js": [
        "/static/js/bootstrap.bundle.min.js",
        "https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/bootstrap-select.min.js",
        "https://cdn.jsdelivr.net/npm/sweetalert2@10",
        "https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.3/jquery.validate.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js",
        "https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js",
        "https://www.gstatic.com/charts/loader.js",
        "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js",
      ],
    },

    "v2": {
      "css": [
        "/theme/css/bootstrap-dark.min.css",
        "/theme/css/app-dark.min.css",
        "/theme/libs/datatables.net-bs4/css/dataTables.bootstrap4.min.css",
        "/theme/libs/datatables.net-responsive-bs4/css/responsive.bootstrap4.min.css",
        "/theme/css/icons.min.css",
        "/custom/custom-v2.css",
      ],
      "js": [
        "/theme/libs/bootstrap/js/bootstrap.bundle.min.js",
        "/theme/libs/metismenu/metisMenu.min.js",
        "/theme/libs/simplebar/simplebar.min.js",
        "/theme/libs/node-waves/waves.min.js",
        "/theme/libs/apexcharts/apexcharts.min.js",
        "/theme/libs/datatables.net/js/jquery.dataTables.min.js",
        "/theme/libs/datatables.net-bs4/js/dataTables.bootstrap4.min.js",
        "/theme/libs/datatables.net-responsive/js/dataTables.responsive.min.js",
        "/theme/libs/datatables.net-responsive-bs4/js/responsive.bootstrap4.min.js",
        "/theme/js/pages/dashboard.init.js",
        "/theme/js/app.js",
      ],
    },
  };

  var head  = document.getElementsByTagName('head')[0];
  let stylesheets = loadDatabase[versionCode]['css'];
  stylesheets.forEach(href => {
    var link  = document.createElement('link');
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = href;
    link.media = 'all';
    head.appendChild(link);
  });

  let scripts = loadDatabase[versionCode]['js'];
  scripts.forEach(src => {
    var script  = document.createElement('script');
    script.src = src;
    script.async = false; 
    head.appendChild(script);
  });
};

export default versionSwitcher;