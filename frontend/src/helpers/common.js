import { Link } from 'react-router-dom';
// UUID-v4
import { v4 as uuidv4 } from 'uuid';

import {  httpGet, apify,httpPost } from "helpers/network";

// jQuery
const jQuery = window.jQuery;

// SweetAlert
const Swal = window.Swal;

// Moment.js
const moment = window.moment;

// Set Title for page
export function setTitle(title) {
  let appName = 'CRISKLE by Secure Elements';
  document.title = `${title} | ${appName}`;
  return true;
}

// Set body overflow
export function setBodyOverflow(overflow = false) {
  if (overflow) {
    jQuery('body').css({
      'overflow-y': 'hidden',
    });
  }


  if (!overflow) {
    jQuery('body').css({
      'overflow-y': 'auto',
    });
  }
}

// Bootstrap modal helper
export function modal(id, params) {
  jQuery(id).modal(params);
  return true;
}

//
export function fireLogoutEvents(redirectToLoginPage = false) {
  let cacheKeys = ['appConfig', 'user', 'authToken'];
  cacheKeys.forEach(key => {
    removeLocalData(key);
  });

  // In case of redirection to login page
  if (redirectToLoginPage) {
    swalPopup({
      title: "Session Expired",
      text: "Please re-login to access the resource.",
    }, 'error', () => {
      document.location.href = `/login`;
    });
  }

  return true;
}

// Apply on-scroll header hide/show
export function applyScrollNavbar() {
  var prevScrollpos = window.pageYOffset;
  window.onscroll = function () {
    var currentScrollPos = window.pageYOffset;
    if (prevScrollpos > currentScrollPos) {
      jQuery("#PrimaryNavbar").removeClass('scrollnavbar');
    } else {
      jQuery("#PrimaryNavbar").addClass('scrollnavbar');
    }
    prevScrollpos = currentScrollPos;
  }
}

// Location change events
export function applyLocationChangeEvents() {
  // Animate to top when location changes
  var body = jQuery("html, body");
  body.stop().animate({ scrollTop: 0 }, 500, 'swing', function () {

  });
}

// Modal-close, form validation & input field clear
export function resetModalFormValidations(params) {
  let forms = params['forms'];
  forms.forEach(f => {
    jQuery(f).trigger("reset");
  });

  let validators = params['validators'];
  validators.forEach(v => {
    window[v].resetForm();
  });

  //
  if (params['resetFormControl']) {
    jQuery('.form-control:text').val(null);
  }
}

// Set Local-Storage-Item with Key
export function setLocalData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  return true;
}

// Get Local-Storage-Item with Key
export function getLocalData(key) {
  var value = localStorage.getItem(key);
  var jsonValue = null;
  try {
    jsonValue = JSON.parse(value);
  } catch (err) {
    jsonValue = null;
  }
  return jsonValue;
}

// Remove Local-Storage-Item with Key
export function removeLocalData(key) {
  localStorage.removeItem(key);
  return true;
}

// Destroy Local-Storage
export function destroryLocalData() {
  let keys = ["user"]
  keys.forEach((key) => {
    removeLocalData(key);
  });
  return true;
}

// Render Time (with format)
export function renderTime(dateObject, format = 'DD-MMM-YYYY hh:mma') {
  let t = moment(dateObject).format(format);
  return t;
}

// Sweet-Alert popup
export function swalPopup(ctx, icon = 'error', cb) {
  // Swal if ref. with Object
  if (typeof ctx === 'object') {
    ctx['icon'] = icon;
    Swal.fire(ctx).then((r) => {
      if (cb && typeof cb === 'function') {
        cb();
      }
    });
  }
  // Swal if ref. with Message
  if (typeof ctx === 'string') {
    Swal.fire({
      icon: icon,
      title: ctx
    }).then((r) => {
      if (cb && typeof cb === 'function') {
        cb();
      }
    });
  }
}

//
export function triggerSwalLoader(mode='SHOW') {
  if (mode === 'HIDE') {
    Swal.close();
    return;
  }


  Swal.fire({
    title: 'Please wait...',
    showConfirmButton: false,
    showDenyButton: false,
    showCancelButton: false,
    allowOutsideClick: false,
    willOpen: () => {
      Swal.showLoading()
    },
  });
}

// Sweet-Alert confirmation popup
export function swalConfirmationPopup(ctx, cb = null) {
  Swal.fire({
    title: ctx['title'],
    text: ctx['text'],
    icon: ctx['icon'] ?? 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: ctx['confirmButtonText'] ?? 'Okay',
    allowOutsideClick: false,
  }).then((result) => {
    if (result.isConfirmed) {
      if (cb) { cb(); }
    }
  });
}

// User property from Local-Storage
export function getUserProperty(attr) {
  let user = getLocalData('user');
  return user ? user[attr] : null;
}

// App in DEMO mode
export function isInDemoMode() {
  let user = getLocalData('user');
  return user ? Boolean(user['organization']['is_demo_mode']) : true;
}

// Get unique list
export function getUniqueListBy(arr, key) {
  return [...new Map(arr.map(item => [item[key], item])).values()]
}

// Remove item from array
export function removeItemFromArray(arr, value) {
  arr = arr.filter(function (item) {
    return item !== value
  });
  return arr;
}

// UUID
export function uuidV4() {
  return uuidv4();
}

// Null-if-Empty
export function nullIfEmpty (ctx) {
  return (ctx === undefined || ctx === null || ctx.length < 1) ? null : ctx;
}

//
export function returnSafeArrayValue (arary) {
  
}

// Black Space to Dash
export function spaceToDash(ctx) {
  return String(ctx).replace(' ', '-');
}

 // Change State Function
 function changeState (programUuid, state, appName="Lifecycle-App") {
  //
  Swal.fire({
    html: `
      Do you want to ${state} this program? <br />
    `,
    confirmButtonText: 'Yes',
    input: state === 'REJECT' && "text",
    inputPlaceholder: "Give the reason for reject",
    showCloseButton: true,
  }).then(async (result) => {
    //
    if (result.isConfirmed) {
      let params = {
        'programUuid': programUuid,
        'state': state,
        'app': appName,
      };

      let message = 'Program Approved Succesfully'

      if (state === 'REJECT') {
        params.rejected_remark = result.value
        message= 'Please review the programme again and re-submit'
      }

      httpPost(apify('app/programs/state-change'), params).then(data => {
        swalPopup(message, 'success');
        // Get list of programs
        httpGet(apify(`app/all-programs`)).then(res => {
          if (res['success']) {
            window.location.reload()
          }
        });
      }).catch(() => {
        swalPopup("Something went wrong.");
      });
    }
  });
}

// Get Random Bits
export function getRandomBits() {
  return new Date().getTime().toString();
}

// Lifecycle routes 
export function programLifecycleRoute(lifecycle, uuid, attrs=undefined, attrs2=undefined) {
  var path;
  switch (lifecycle) {
    case 'Item-Definition':
      path = `/dashboard/concept-phase/item-definition/${uuid}`;
      break;

    case 'Asset-Identification':
      path = `/dashboard/threat-risk-assesment/asset-identification/${uuid}`;
      break;
 
    case 'Threat-Analysis':
      path = `/dashboard/threat-risk-assesment/tara/${uuid}`;
      break;

    case 'Residual-Risk':
      path = `/dashboard/threat-risk-assesment/residual-risk/${uuid}`;
      break;

    case 'Security-Concept':
      path = `/dashboard/threat-risk-assesment/security-concept/${uuid}`;
      break;

    case 'Statistical-Analysis':
      path = `/dashboard/threat-risk-assesment/statistical-analysis/${uuid}`;
      break;

    case 'Generate-Attack-Tree':
      // path = `/dashboard/threat-risk-assesment/attack-tree/${uuid}`;
      // path = `/dashboard/attack-tree-viewer/${uuid}`;
      // Use v2 theme for attack tree
      path = `/dashboard/attack-tree-viewer-v2/${uuid}`;
      break;

    case 'Attack-Tree-Simulation':
      path = `/dashboard/threat-risk-assesment/attack-tree-simulation/${uuid}`;
      break;

    case 'Requirements-Summary':
      path = `/dashboard/product-development-phase/requirement-summary/${uuid}`;
      break;

    case 'Design-Specification':
      path = `/dashboard/product-development-phase/design-specification/${uuid}`;
      break;

    case 'Integration-and-Verification':
      path = `/dashboard/product-development-phase/integration-verification/${uuid}`;
      break;

    case 'Test-Verification':
      path = `/dashboard/product-development-phase/test-verification/${uuid}`;
      break;

    case 'Cyber-Security-Validation':
      path = `/dashboard/product-development-phase/test-validation/${uuid}`;
      break;

    case 'Production-Phase':
      path = `/dashboard/post-development/production/${uuid}`;
      break;

    case 'Cybersecurity-Incident-Response':
      path = `/dashboard/post-development/operations/${uuid}`;
      break;

    case 'Decomissioning':
      path = `/dashboard/post-development/decomission/${uuid}`;
      break;

    case 'SBoM-Management':
      path = `/dashboard/sbom-management/${uuid}`;
      break;

    case 'Digital-Twin':
      path = `/dashboard/digital-twin/${uuid}`;
      break;

    case 'Vulnerability-Monitoring-And-Triage':
      path = `/dashboard/cybersecurity/vulnerability-monitoring-and-triage/${uuid}`;
      break;

    case 'Functional-Safety-View':
      path = `/app/functional-safety/program/${uuid}`;
      break;

    case 'Functional-Safety-HAZOP':
      path = `/app/functional-safety/hazop/${uuid}`;
      break;

    case 'Functional-Safety-HAZOP-Hazards':
      path = `/app/functional-safety/hazop-hazards/${uuid}/${attrs['functionUuid']}`;
      break;

    case 'Functional-Safety-Configure-Hazop-Function':
      path = `/app/functional-safety/hazop-function-configure/${uuid}/${attrs['functionUuid']}`;
      break;

    case 'Functional-Safety-Edit-Configure-Hazop-Function':
      path = `/app/functional-safety/hazop-function-configure-edit/${uuid}/${attrs['functionUuid']}/${attrs2['hazardUuid']}`;
      break;

    case 'Functional-Safety-Hazard-Description':
      path = `/app/functional-safety/hazard-description/${uuid}`;
      break;

    case 'Functional-Safety-HARA':
      path = `/app/functional-safety/hara/${uuid}`;
      break;

    case 'Functional-Safety-HARA-Create-Event':
      path = `/app/functional-safety/hara/create-event/${uuid}`;
      break;

    case 'Functional-Safety-HARA-Edit-Event':
      path = `/app/functional-safety/hara/edit-event/${uuid}/${attrs['hazardEventId']}`;
      break;

    case 'Functional-Safety-FSG':
      path = `/app/functional-safety/goals/${uuid}`;
      break;

    case 'Functional-Safety-FSG-Graph':
      path = `/app/functional-safety/goals-graph/${uuid}`;
      break;

    case 'Functional-Safety-Concept':
      path = `/app/functional-safety/concept/${uuid}`;
      break;

    case 'Interface-Agreement-Program-View':
      path = `/app/interface-agreement/program/${uuid}`;
      break;
    
    case 'Audit-Tool-Program-View':
      path = `/app/audit-tool/program/${uuid}`;
      break;

    case 'System-Configuration':
      path = `/dashboard/system-configuration/${uuid}`;
      break;      
      
    case 'View':
    default:
      path = `/dashboard/program/${uuid}`;
      break;
  }
  return path;
}

// UUID
export function uuidProject(programID, prefix, counter) {
  let padding = 3;
  var zeroes = new Array(padding + 1).join("0");
  counter =  (zeroes + counter).slice(-padding);
  return `${prefix}-${programID}-${counter}`;
}

// 
export function renderBadge(boolValue, trueValueText, falseValueText, additionalClasses) {
  if (boolValue) {
    return `<span class="badge badge-primary badge-v2">${trueValueText}</span>`;
  }

  if (!boolValue) {
    return `<span class="badge badge-danger badge-v2">${falseValueText}</span>`;
  }
}

// Program DataTable Dynamic columns 
export function programColumns(attributes, row) {
  let {appName} = attributes;
  
  let columns = [
    {
      name: 'Group',
      selector: row => row.vehicle_program['group']['name'],
      sortable: true,
    },
    {
      name: 'OEM',
      selector: row => row.vehicle_program['oem']['name'],
      sortable: true,
    },
    {
      name: 'Vehcle Program',
      selector: row => row.vehicle_program['program'],
      sortable: true,
    },
    {
      name: 'Model Year',
      selector: row => row.vehicle_program['year'],
      sortable: true,
    },
    {
      name: 'System',
      selector: row => row.system['name'],
      sortable: true,
    },
    {
      name: 'Phase',
      selector: row => row.phase,
    },
    {
      name: 'Status',
      cell: (row) => {
        // --- Lifecycle-App ---
        // Created 
        if (appName === 'Lifecycle-App' && row['status'] === 'CREATED'){
          return <span className="badge badge-warning">Created</span>
        }
        // In-process
        else if (appName === 'Lifecycle-App' && row['status'] === 'IN-PROCESS'){
          return <span className="badge badge-info">In Process</span>
        }
        // Under Review
        else if (appName === 'Lifecycle-App' && row['status'] === 'UNDER-REVIEW'){
          return <span className="badge badge-primary">Under Review</span>
        }
        // Approved
        else if (appName === 'Lifecycle-App' && row['status'] === 'APPROVED') {
          return <span className="badge badge-success">Approved</span>
        }
        // Rejected
        else if (appName === 'Lifecycle-App' && row['status'] === 'REJECTED') {
          return <span className="badge badge-danger">Rejected and Re-Opened</span>
        }
        // --- Lifecycle-App ENDS ---

        // --- Functional-Safety-App ---
        // Created 
        else if (appName === 'Functional-Safety-App' && row['fs_status'] === 'CREATED'){
          return <span className="badge badge-warning">Created</span>
        }
        // In-process
        else if (appName === 'Functional-Safety-App' && row['fs_status'] === 'IN-PROCESS'){
          return <span className="badge badge-info">In Process</span>
        }
        // Under Review
        else if (appName === 'Functional-Safety-App' && row['fs_status'] === 'UNDER-REVIEW'){
          return <span className="badge badge-primary">Under Review</span>
        }
        // Approved
        else if (appName === 'Functional-Safety-App' && row['fs_status'] === 'APPROVED') {
          return <span className="badge badge-success">Approved</span>
        }
        // Rejected
        else if (appName === 'Functional-Safety-App' && row['fs_status'] === 'REJECTED') {
          return <span className="badge badge-danger">Rejected and Re-Opened</span>
        }
        // --- Functional-Safety-App ENDS ---
        
        // --- Interface-Agreement-App ---
        // Created 
        else if (appName === 'Interface-Agreement-App' && row['agreement_status'] === 'CREATED'){
          return <span className="badge badge-warning">Created</span>
        }
        // In-process
        else if (appName === 'Interface-Agreement-App' && row['agreement_status'] === 'IN-PROCESS'){
          return <span className="badge badge-info">In Process</span>
        }
        // Under Review
        else if (appName === 'Interface-Agreement-App' && row['agreement_status'] === 'UNDER-REVIEW'){
          return <span className="badge badge-primary">Under Review</span>
        }
        // Approved
        else if (appName === 'Interface-Agreement-App' && row['agreement_status'] === 'APPROVED') {
          return <span className="badge badge-success">Approved</span>
        }
        // Rejected
        else if (appName === 'Interface-Agreement-App' && row['agreement_status'] === 'REJECTED') {
          return <span className="badge badge-danger">Rejected and Re-Opened</span>
        }
        // --- Interface-Agreement-App ENDS ---
        
        // --- Audit-Tool-App ---
        // Created 
        else if (appName === 'Audit-Tool-App' && row['audit_status'] === 'CREATED'){
          return <span className="badge badge-warning">Created</span>
        }
        // In-process
        else if (appName === 'Audit-Tool-App' && row['audit_status'] === 'IN-PROCESS'){
          return <span className="badge badge-info">In Process</span>
        }
        // Under Review
        else if (appName === 'Audit-Tool-App' && row['audit_status'] === 'UNDER-REVIEW'){
          return <span className="badge badge-primary">Under Review</span>
        }
        // Approved
        else if (appName === 'Audit-Tool-App' && row['audit_status'] === 'APPROVED') {
          return <span className="badge badge-success">Approved</span>
        }
        // Rejected
        else if (appName === 'Audit-Tool-App' && row['audit_status'] === 'REJECTED') {
          return <span className="badge badge-danger">Rejected and Re-Opened</span>
        }
        // --- Audit-Tool-App ENDS ---
      }
    },
    {
      name: 'Created On',
      selector: row => row.created_at,
      sortable: true,
      cell: (row) => {
        return (
          renderTime(row['created_at'])
        )
      }
    },
    {
      name: 'Action',
      selector: row => row.uuid,
      right: true,
      cell: (row) => {
        return (
          <ul className="navbar-nav ml-2">
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#!" data-toggle="dropdown">
                Actions
              </a>
              <div className="dropdown-menu">
                {
                  appName === 'Lifecycle-App' && 
                  <>
                    <Link to={programLifecycleRoute('View', row['uuid'])} className="dropdown-item">
                      View
                    </Link>
                    <Link to={programLifecycleRoute('SBoM-Management', row['uuid'])} className="dropdown-item" title="S-BoM Management">
                      S-BoM
                    </Link>
                    <Link to={programLifecycleRoute('Digital-Twin', row['uuid'])} className="dropdown-item" title="Digital Twin">
                      Digital Twin
                    </Link>
                  </>
                }
                
                {
                  (appName === 'Lifecycle-App' && (row['status'] === 'REJECTED' || row['status'] === 'UNDER-REVIEW')) && 
                  <button onClick={() => changeState(row.uuid, 'APPROVE')} className="dropdown-item">
                    Approve
                  </button>
                }

                {
                  (appName === 'Lifecycle-App' && (row['status'] === 'APPROVED' || row['status'] === 'UNDER-REVIEW')) && 
                  <button onClick={() => changeState(row.uuid, 'REJECT')} className="dropdown-item">
                    Reject and Re-Open
                  </button>
                }

                

                {
                  appName === 'Functional-Safety-App' && 
                  <>
                    <Link to={programLifecycleRoute('Functional-Safety-View', row['uuid'])} className="dropdown-item">
                      View
                    </Link>
                   
                  </>
                }

                {
                  (appName === 'Functional-Safety-App' && (row['fs_status'] === 'REJECTED' || row['fs_status'] === 'UNDER-REVIEW')) && 
                  <button onClick={() => changeState(row.uuid, 'APPROVE',"Criskle-Functional-Safety")} className="dropdown-item">
                    Approve
                  </button>
                }

                {
                  (appName === 'Functional-Safety-App' && (row['fs_status'] === 'APPROVED' || row['fs_status'] === 'UNDER-REVIEW')) && 
                  <button onClick={() => changeState(row.uuid, 'REJECT',"Criskle-Functional-Safety")} className="dropdown-item">
                    Reject and Re-Open
                  </button>
                }

                {
                  appName === 'Interface-Agreement-App' && 
                  <>
                    <Link to={programLifecycleRoute('Interface-Agreement-Program-View', row['uuid'])} className="dropdown-item">
                      View
                    </Link>
                   
                  </>
                }

                {
                  appName === 'Audit-Tool-App' && 
                  <>
                    <Link to={programLifecycleRoute('Audit-Tool-Program-View', row['uuid'])} className="dropdown-item">
                      View
                    </Link>
                   
                  </>
                }
              </div>
            </li>
          </ul>
        )
      }
    }
  ];

  return columns;
}