// Property Getters

// Get Link Property
export function getLinkProperties(link) {
  // Source Port + Parent Property
  var sourcePort = link['sourcePort'];
  var sourcePortParentName = sourcePort['parent']['options']['name'];
  var sourcePortName = `${sourcePortParentName}-${sourcePort['options']['name']}`;
  var sourcePortRef = sourcePort['options']['id'];
  var sourceNodeRef = sourcePort['parent']['node'];


  // Target Port + Parent Property
  var targetPort = link['targetPort'];
  var targetPortParentName = targetPort['parent']['options']['name'];
  var targetPortName = `${targetPortParentName}-${targetPort['options']['name']}`;
  var targetPortRef = targetPort['options']['id'];
  var targetNodeRef = targetPort['parent']['node'];
  
  //
  let sourceNodeStoreArrayName = `${sourceNodeRef['nodeType']}S`;
  let targetNodeStoreArrayName = `${targetNodeRef['nodeType']}S`;

  //
  window.ItemDefinition['INTERNAL'][sourceNodeStoreArrayName][sourceNodeRef['refId']]['Out'][sourcePortRef] = targetPort['parent']['options'];
  window.ItemDefinition['INTERNAL'][targetNodeStoreArrayName][targetNodeRef['refId']]['In'][targetPortRef] = sourcePort['parent']['options'];
  
  // Link Property
  var property = {
    refId: link['options']['id'],
    sourcePortRef: sourcePortRef,
    sourcePortName: sourcePortName,
    targetPortRef: targetPortRef,
    targetPortName: targetPortName,
  };
  return property;
}

// Get Node Property
export function getNodeProperties(nodeObject, assetItems) {
  // Node object
  var node = nodeObject['node'];

  let assetItemsData = {}
  assetItems && assetItems['Components'] && Object.keys(assetItems['Components']).map((assetItem) => {
    
    assetItemsData = {
      ...assetItemsData,
      [`${assetItems['Components'][assetItem]}`]: node['node'][assetItems['Components'][assetItem]]
    }
  })

  // Node Property
  var property = {
    refId:  node['options']['id'],
    name:   node['options']['name'],
    title:   node['node']['title'],
    description:  node['node']['description'],
    technologyValue:   node['node']['technologyValue'],
    storedDataValue:   node['node']['storedDataValue'],
    ...assetItemsData,
    inputPorts:   node['portsIn'].length,
    outputPorts:  node['portsOut'].length,
  };

  //
  return property;
}

// Get Function Property
export function getFunctionProperties(nodeObject) {
  // Function object
  var node = nodeObject['node'];

  // Node Property
  var property = {
    refId:  node['options']['id'],
    name:   node['options']['name'],
    title:   node['node']['title'],
    description:  node['node']['description'],
  };
  return property;
}

// Get Diagram Property
export function getDiagramProperties(nodeObject) {
  // Diagram object
  var node = nodeObject['node'];

  // Diagram Property
  var property = {
    refId:        node['options']['id'],
    designValue:  node['node']['designValue'],
    name:         node['options']['name'],
    title:        node['node']['title'],
    description:  node['node']['description'],
  };
  return property;
}