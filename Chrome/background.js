var pinboard = pinboard;
window.savedPosts = {}; // cache any URLs we know to be saved

// Add a listener so background knows when a tab has changed.
// You need "tabs" permission, that"s why we added it to manifest file.
chrome.tabs.onUpdated.addListener(init);
//chrome.pageAction.onClicked.addListener(clickHandler);

function init(tabId, changeInfo, tab) {

  chrome.storage.local.get(["username", "apitoken"], function (data) {

    if (!data) {
      console.log("No pinboard credentials");
      return;
    }

    if (!data.hasOwnProperty("username")) {
      console.log("Credentials are missing username");
      return;
    }

    pinboard.init(data.username, data.apitoken);
    checkPinned(tab);
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
  if (savedPosts.hasOwnProperty(tab.url)) {
    //chrome.pageAction.setIcon({ tabId : tab.id, path : "images/icon_active.png"});
    //return;
  } 

  // Query the Pinboard API
  pinboard.getPost({ url : tab.url }, function (data) {
    if (data.posts.length > 0) {
      showActiveIcon(tab.id);
      savedPosts[tab.url] = true;
    }
  });
}