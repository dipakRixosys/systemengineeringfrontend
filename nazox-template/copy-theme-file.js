const fs = require('fs');
const path = require('path')

function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

let files = [
  "css/bootstrap-dark.min.css",
  "css/app-dark.min.css",
  "libs/datatables.net-bs4/css/dataTables.bootstrap4.min.css",
  "libs/datatables.net-responsive-bs4/css/responsive.bootstrap4.min.css",
  "css/icons.min.css",
  "libs/jquery/jquery.min.js",
  "libs/bootstrap/js/bootstrap.bundle.min.js",
  "libs/metismenu/metisMenu.min.js",
  "libs/simplebar/simplebar.min.js",
  "libs/node-waves/waves.min.js",
  "libs/apexcharts/apexcharts.min.js",
  "libs/datatables.net/js/jquery.dataTables.min.js",
  "libs/datatables.net-bs4/js/dataTables.bootstrap4.min.js",
  "libs/datatables.net-responsive/js/dataTables.responsive.min.js",
  "libs/datatables.net-responsive-bs4/js/responsive.bootstrap4.min.js",
  "js/pages/dashboard.init.js",
  "js/app.js"
];

let folder = `theme`;
files.forEach(css => {
  let newPath = `${folder}/${css}`; 
  ensureDirectoryExistence(newPath);
  
  fs.copyFile(css, newPath, (err) => {
    if (err) throw err;
    console.log(`${css} <> ${newPath}`);
  });

});
