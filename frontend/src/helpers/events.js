// Events

// Listen - Add Node Event
export function listenAddNodeEvent(callback) {
  window.addEventListener('add-node-event', function (e) {
    //
    e.stopImmediatePropagation();
    // Callback
    if (callback && typeof callback === 'function') {
      callback(e.detail);
    }
  });
}

// Dispatch - Add Node Event
export function dispatchAddNodeEvent(node) {
  let event = new CustomEvent('add-node-event', {
    detail: {node: node}
  });
  window.dispatchEvent(event);
}

// Listen - Configure Channel Event
export function listenConfigureChannelEvent(callback) {
  window.addEventListener('configure-channel', function (e) {
    e.stopImmediatePropagation();

    // Callback
    if (callback && typeof callback === 'function') {
      callback(e.detail);
    }
  });
}

// Dispatch - Configure Channel Event
export function dispatchConfigureChannelEvent(channel) {
  let event = new CustomEvent('configure-channel', {
    detail: {channel: channel}
  });
  window.dispatchEvent(event);
}

// Listen - Add Function Event
export function listenAddFunctionEvent(callback) {
  window.addEventListener('add-function', function (e) {
    //
    e.stopImmediatePropagation();
    
    // Callback
    if (callback && typeof callback === 'function') {
      callback(e.detail);
    }
  });
}

// Dispatch - Add Function Event
export function dispatchAddFunctionEvent(func) {
  let event = new CustomEvent('add-function', {
    detail: {function: func}
  });
  window.dispatchEvent(event);
}

// Listen - Add Diagram Event
export function listenAddDiagramEvent(callback) {
  window.addEventListener('add-diagram', function (e) {
    // Callback
    if (callback && typeof callback === 'function') {
      callback(e.detail);
    }
  });
}

// Dispatch - Add Diagram Event
export function dispatchAddDiagramEvent(diagram) {
  let event = new CustomEvent('add-diagram', {
    detail: {diagram: diagram}
  });
  window.dispatchEvent(event);
}