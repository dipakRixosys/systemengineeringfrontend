import { getLocalData, removeLocalData, setLocalData } from 'helpers/common';

var userActivityMonitor = {
  maxTimeAllowed: 15, // In seconds
  idleTimeFrequency: 0.1 * 1000, // In seconds x msQunatity
  
  init: function() {
    let idleTime = getLocalData("Idle-Time");
    setLocalData("Idle-Time", idleTime ?? 0);

    let logoutEvent = getLocalData("Fire-Logout-Event") ?? false;
    if (logoutEvent) {
      removeLocalData("Fire-Logout-Event");
      return;
    }
    
    this.idleInterval = setInterval(() => this.idleTimeTicker(), this.idleTimeFrequency);
    
    document.addEventListener('mousemove', e => {
      setLocalData("Idle-Time", 0); 
    });

    document.addEventListener('keypress', e => {
      setLocalData("Idle-Time", 0); 
    });
  },
  
  idleTimeTicker: function() {
    let idleTime = getLocalData("Idle-Time");
    
    if (idleTime > this.maxTimeAllowed) {
      setLocalData("Fire-Logout-Event", true);
    } 
    
    else {
      setLocalData("Idle-Time", ++idleTime);
    }
  },
};

export default userActivityMonitor;