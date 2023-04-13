import { getLocalData, fireLogoutEvents } from "./common";

// API Endpoint Generator
export function apify(path) {
  window.AppConfig['apiUrl'] = process.env['REACT_APP_API'];
  return `${window.AppConfig['apiUrl']}/${path}`;
}

// Base domain Endpoint Generator
export function apiBaseUrl(path) {
  window.AppConfig['apiBaseUrl'] = process.env['REACT_APP_BASE'];
  return `${window.AppConfig['apiBaseUrl']}/${path}`;
}

// HTTP Client
export function httpClient(request) {
  //
  let defaultSettings = {
    async: true,
    crossDomain: true,
    processData: false,
  };
  request = { ...defaultSettings, ...request };

  //
  return new Promise((resolve, reject) => {
    //
    window.jQuery
      .ajax(request)
      .done((data) => resolve(data))
      .fail((xhr, status, err) => {
        // In case of forbidden (non-Auth),
        // fire logout event and redirect to login page
        if (
          request["ctx"] === undefined ||
          request["ctx"]["overrideDefault403Middleware"] === undefined
        ) {
          if (xhr.status === 403) {
            fireLogoutEvents(true);
            return;
          }
        }

        // ...else for other rejection!
        reject({
          xhrJson: xhr.responseJSON,
          xhrStatusCode: xhr.status,
          xhrErr: err,
        });
      });
  });
}

//
export async function httpGet(url) {
  //
  return httpClient({
    method: "GET",
    headers: {
      "ACCESS-TOKEN": getLocalData("authToken") ?? null,
    },
    url: url,
  });
}

//
export async function httpPost(url, data, ctx) {
  return httpClient({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ACCESS-TOKEN": getLocalData("authToken") ?? null,
    },
    processData: false,
    contentType: false,
    url: url,
    data: JSON.stringify(data),
    ctx: ctx,
  });
}

//
export async function httpFile(url, data) {
  //

  let form_data = new FormData();
  form_data.append("file", data);

  return fetch(url, {
    method: "POST",
    headers: {
      // "Content-Type": "multipar",
      "ACCESS-TOKEN": getLocalData("authToken") ?? null,
    },
    body: form_data,
  }).then((res) => res.json());
}

//
export async function httpPostMultipart(url, data) {
  return fetch(url, {
    method: "POST",
    headers: {
      // "Content-Type": "multipart",
      "ACCESS-TOKEN": getLocalData("authToken") ?? null,
    },
    body: data,
  }).then((res) => res.json());
}
