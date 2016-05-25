(function (Pinboard, chrome, window) {
  'use strict';
  window.savedPosts = {};

  function isSaveable(url) {
    if (url.match(/^http/)) {
      return true;
    }
    return false;
  }

  function showActive(tabId) {
    chrome.browserAction.setIcon({ tabId: tabId, path: 'images/icon_active.png' });
    chrome.browserAction.setTitle({ tabId: tabId, title: 'Edit' });
  }

  function showDeactive(tabId) {
    chrome.browserAction.setIcon({ tabId: tabId, path: 'images/icon_deactive.png' });
    chrome.browserAction.setTitle({ tabId: tabId, title: 'Save current URL to Pinboard.in' });
  }

  // Check if there's a Pinboard entry for a given tab and update the browser action icon & title
  function updateBrowserAction(tab) {
    if (!isSaveable(tab.url)) {
      return;
    }

    chrome.storage.sync.get(['apitoken'], data => {
      if (!data || !data.hasOwnProperty('apitoken')) {
        console.log('No Pinboard API token found');
        return;
      }
      const pinboard = new Pinboard(data.apitoken);
      pinboard.posts
        .get({ url : tab.url })
        .then(data => {
          if (data.posts.length > 0) {
            showActive(tab.id);
            window.savedPosts[tab.url] = data.posts[0];    // Cache the post info incase the user clicks the popup
          } else {
            showDeactive(tab.id);
            delete window.savedPosts[tab.url];             // Clear any cache entry for this post
          }
        })
        .catch(error => {
          console.log(error);
        });
    });
  }

  function onTabActivated(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, tab => {
      updateBrowserAction(tab);
    });
  }

  function onTabUpdated(tabId, changeInfo, tab) {
    updateBrowserAction(tab);
  }

  chrome.tabs.onActivated.addListener(onTabActivated);
  chrome.tabs.onUpdated.addListener(onTabUpdated);
}(Pinboard, chrome, window));
