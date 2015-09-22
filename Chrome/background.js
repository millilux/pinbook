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
      // TODO: set icon to grey
      return;
    }

    if (!data.hasOwnProperty("username")) {
      console.log("Credentials are missing username");
      return;
    }

    pinboard.init(data.username, data.apitoken);
    setIcon(tab);
  });

  chrome.pageAction.show(tabId);
}

/* Update the a tab's icon based on whether it's saved in Pinboard or not */
function setIcon(tab) {

  // Check the local cache
  if (savedPosts.hasOwnProperty(tab.url)) {
    //chrome.pageAction.setIcon({ tabId : tab.id, path : "images/icon_active.png"});
    //return;
  } 

  // Query the API
  pinboard.getPost({ url : tab.url }, function (data) {
    if (data.posts.length > 0) {
      chrome.pageAction.setIcon({ tabId : tab.id, path : "images/icon_active.png"});
      savedPosts[tab.url] = true;
    } else {
      chrome.pageAction.setIcon({ tabId : tab.id, path : "images/icon_deactive.png"});
    }
  });
}