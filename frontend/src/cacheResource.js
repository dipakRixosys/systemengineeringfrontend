const cacheResource = () => {
  
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
      navigator.serviceWorker
        .register("/serviceWorker.js?v=5")
        .then(res =>  console.log("serviceWorker.js registered ;)"))
        .catch(err => console.log("serviceWorker.js failed to registered :0", err))
    })
  }
  
};

export default cacheResource;