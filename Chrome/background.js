//window.savedPosts = {}; // cache any URLs we know to be saved

// Add a listener so background knows when a tab has changed.
chrome.tabs.onUpdated.addListener(tabUpdated);

function tabUpdated(tabId, changeInfo, tab) {

  chrome.storage.local.get(["username", "apitoken"], function (data) {

    if (!data) {
      console.log("No pinboard credentials");
      return;
    }

    if (!data.hasOwnProperty("username")) {
      console.log("Credentials are missing username");
      return;
    }

    var pinboard = new Pinboard(data.username, data.apitoken);

    // Update the icon if this tab's URL is saved at Pinboard
    pinboard.posts.get({ url : tab.url }, function (data) {
      if (data.posts.length > 0) {
        showActiveIcon(tab.id);
      }
    });

  });

  chrome.pageAction.show(tabId);
}

function showActiveIcon(tabId){
  chrome.pageAction.setIcon({ tabId : tabId, path : "images/icon_active.png"});
}

function showDeactiveIcon(tabId){
  chrome.pageAction.setIcon({ tabId : tab.id, path : "images/icon_deactive.png"});
}

/* Check whether this tab is saved in Pinboard or not */
function checkPinned(tab) {

  // Check the local cache
  //if (savedPosts.hasOwnProperty(tab.url)) {
    //chrome.pageAction.setIcon({ tabId : tab.id, path : "images/icon_active.png"});
    //return;
  //} 

  // Query the Pinboard API
  pinboard.posts.get({ url : tab.url }, function (data) {
    if (data.posts.length > 0) {
      showActiveIcon(tab.id);
      //savedPosts[tab.url] = true;
    }
  });
}