var pinboard = pinboard;
window.savedPosts = {}; // cache any URLs we know to be saved

// Add a listener so background knows when a tab has changed.
// You need "tabs" persmission, that"s why we added it to manifest file.
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
      console.log("creds are missing username");
      return;
    }

    pinboard.init(data.username, data.apitoken);

     /* Check if this tab"s URL has been bookmarked already.
       We check the local cache first, and if that"s empty fire off a request to the API.
       The icon"s are toggled as appropriate;
    */
    // TODO: If pinboard is edited outside of Chrome, it'll be out of sync? Maybe don't bother with the cache?
    // Or give it an expiry time?
    if (savedPosts.hasOwnProperty(tab.url)) {
      chrome.pageAction.setIcon({ tabId : tab.id, path : "icon_active.png"});
    } else {
      pinboard.getPost({ url : tab.url }, function (data) {
        if (data.posts.length > 0) {
          chrome.pageAction.setIcon({ tabId : tab.id, path : "icon_active.png"});
          savedPosts[tab.url] = true;
        } else {
          chrome.pageAction.setIcon({ tabId : tab.id, path : "icon_deactive.png"});
        }
      });
    }

  });

  chrome.pageAction.show(tabId);
}