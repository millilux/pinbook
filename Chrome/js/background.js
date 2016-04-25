(function (Pinboard, chrome, window) {
  'use strict';
  chrome.tabs.onActivated.addListener(onTabActivated);
  chrome.tabs.onUpdated.addListener(onTabUpdated);

  window.savedPosts = {};

  function onTabActivated(activeInfo){
    chrome.tabs.get(activeInfo.tabId, tab => {
      pinboardCheck(tab);
    });
  }

  function onTabUpdated(tabId, changeInfo, tab) {
    chrome.pageAction.show(tabId);
    pinboardCheck(tab);
  }

  // Check if there's a Pinboard entry for a given tab
  function pinboardCheck(tab){
    if (!tab.url.match(/^http/)){
      return;
    }

    chrome.storage.sync.get(["apitoken"], data => {
      if (!data || !data.hasOwnProperty("apitoken")) {
        console.log("No Pinboard API token found");
        return;
      }
      let pinboard = new Pinboard(data.apitoken);
      pinboard.posts.get({ url : tab.url }).then(data => {
        if (data.posts.length > 0) {
          showActiveIcon(tab.id);
          window.savedPosts[tab.url] = data.posts[0];    // Cache the post info incase the user clicks the popup
        } else {
          showDeactiveIcon(tab.id);
          delete window.savedPosts[tab.url];             // Clear any cache entry for this post
        }
      });
    });    
  }

  function showActiveIcon(tabId){
    chrome.pageAction.setIcon({ tabId : tabId, path : "images/icon_active.png"});
  }

  function showDeactiveIcon(tabId){
    chrome.pageAction.setIcon({ tabId : tabId, path : "images/icon_deactive.png"});
  }

}(Pinboard, chrome, window));
