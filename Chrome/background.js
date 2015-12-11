//'use strict';
chrome.tabs.onUpdated.addListener(onTabUpdated);

window.savedPosts = {};

function onTabUpdated(tabId, changeInfo, tab) {

  if (!tab.url.match(/^http/)){
    return;
  }

  chrome.storage.local.get(["username", "apitoken"], function (data) {

    if (!data) {
      console.log("No pinboard credentials");
      return;
    }

    if (!data.hasOwnProperty("username")) {
      console.log("Credentials are missing username");
      return;
    }

    // Check if the tab URL is saved in user's Pinboard
    Pinboard.config(data.username, data.apitoken);
    Pinboard.posts.get({ url : tab.url }).then(function (data) {
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


