(function (pinboard, chrome, window) {
  'use strict';
  chrome.tabs.onUpdated.addListener(onTabUpdated);

  window.savedPosts = {};

  function onTabUpdated(tabId, changeInfo, tab) {

    if (!tab.url.match(/^http/)){
      return;
    }

    chrome.storage.sync.get(["apitoken"], function (data) {

      if (!data || !data.hasOwnProperty("apitoken")) {
        console.log("No Pinboard API token found");
        return;
      }

      // Check if this tab URL is saved in user's Pinboard
      pinboard.config(data.apitoken);
      pinboard.posts.get({ url : tab.url }).then(function (data) {
        if (data.posts.length > 0) {
          // URL is in user's Pinboard
          showActiveIcon(tab.id);
          window.savedPosts[tab.url] = data.posts[0];    // Cache the post info incase the user clicks the popup
        } else {
          // URL is not in user's pinboard
          delete window.savedPosts[tab.url];             // Clear any cache entry for this post
        }
      });

    });

    chrome.pageAction.show(tabId);
  }

  function showActiveIcon(tabId){
    chrome.pageAction.setIcon({ tabId : tabId, path : "images/icon_active.png"});
  }

  function showDeactiveIcon(tabId){
    chrome.pageAction.setIcon({ tabId : tabId, path : "images/icon_deactive.png"});
  }

}(Pinboard, chrome, window));
