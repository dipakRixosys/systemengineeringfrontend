# [CRISKLE](https://app.secureelements.io/login)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). 

At some places we are using newly promoted Functional-based React.js components which uses concepts of hooks including `useEffect`, `useState`, `useCallback` — please refer https://reactjs.org/docs/hooks-reference.html for more.

At most of the place where _more of stateful, more of data-based UI_ is required we chose to use Class-based React.js components. There is nothing like _that classical render() & componentDidMount() function._

### Nodejs / Version 
- Use `nvm use lts/fermium` to use Nodejs14 runtime to run this project.


### Libraries
- Bootstrap 4 + Material Theme - Base UI framework
- jQuery - DOM Manipulation + Bootstrap Plugins
- fetch/jQuery.AJAX - HTTP Network
- SweetAlerts - Alert dialogs
- NProgress - Progress indicator
- Moment.js - Time & dates
- [React Data Table](https://react-data-table-component.netlify.app/?path=/docs/api-columns--page) (`react-data-table`) - Basic tables with search, sort & pagination
- [React Diagrams](https://github.com/projectstorm/react-diagrams) (`react-diagrams`) - Diagram (Nodes + Links)

### Words on `react-diagrams` 
Constructor & Events

```
var model=new DiagramModel();
model.addListener({
     nodesUpdated: function(e){
       // Do something here
     },
     zoomUpdated: function(e){
      // Do something here
     },
});
```

Events for `DiagramModel`:
```
nodesUpdated
linksUpdated
offsetUpdated
zoomUpdated
gridUpdated
selectionChanged
entityRemoved
```

Events for `LinkModel`:
```
sourcePortChanged
targetPortChanged
selectionChanged
entityRemoved
```

Events for NodeModel and PointModel:
```
selectionChanged
entityRemoved
```

##### Source Code & Limited Copyright Agreement
All source codes & bounded business logic are strictly developed by *Ethereal Corporate Network* for *Secure Elements Ltd* henceforth referred to as *Secure Elements* previously called *Cybergenics* under the terms and conditions of the NDA signed by *Ethereal Corporate Network* and *Mr Saket Mohan* dated 24/09/2021.



#### How to start code with live api

npm run start:stage-v1-live