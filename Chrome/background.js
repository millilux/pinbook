//'use strict';
chrome.tabs.onUpdated.addListener(onTabUpdated);

function onTabUpdated(tabId, changeInfo, tab) {

  chrome.storage.local.get(["username", "apitoken"], function (data) {

    if (!data) {
      console.log("No pinboard credentials");
      return;
    }

    if (!data.hasOwnProperty("username")) {
      console.log("Credentials are missing username");
      return;
    }

    // Update the icon if this tab's URL is saved at Pinboard
    Pinboard.config(data.username, data.apitoken);
    Pinboard.posts.get({ url : tab.url }).then(function (data) {
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
  chrome.pageAction.setIcon({ tabId : tabId, path : "images/icon_deactive.png"});
}


