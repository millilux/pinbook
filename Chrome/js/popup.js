(function (pinboard, chrome, window) {
  'use strict';

  var background = chrome.extension.getBackgroundPage();
  var activeTab = null;

  // Cached DOM elements
  var editFormEl     = document.getElementById('editPost');
  var deleteButtonEl = document.getElementById('removePost');
  var loginFormEl    = document.getElementById('login');
  var titleEl        = document.querySelector('input[name=title]');
  var descriptionEl  = document.querySelector('textarea[name=description]');
  var tagsEl         = document.querySelector('input[name=tags]');
  var urlEl          = document.querySelector('input[name=url]');
  var dateEl         = document.getElementById('date');
  var errorEl        = document.querySelector('.error');
  var connErrorMsg   = 'Could not connect to Pinboard';

  var setupEvents = function () {

    // Update post
    editFormEl.addEventListener('submit', ev => {
      ev.preventDefault();
      updatePost(activeTab.url, titleEl.value, descriptionEl.value, tagsEl.value);
    });

    // Delete post
    deleteButtonEl.addEventListener('click', ev => {
      deletePost(activeTab.url);
    });

    // Login
    loginFormEl.addEventListener('submit', ev => {
      login(ev.target.apitoken.value);
      getOrCreatePost(activeTab.url, activeTab.title);
      setupTags();
    });

  };

  var login = function (apitoken) {
    pinboard.config(apitoken);

    // Save Pinboard credentials for future API calls
    chrome.storage.sync.set({
      'apitoken' : apitoken
    });
  };

  var showLoginForm = function () {
    loginFormEl.style.display = 'block';
    editFormEl.style.display = 'none';
  };

  var showPost = function(url, title, description, tags, isNew){
    activateIcon();

    loginFormEl.style.display = 'none';
    editFormEl.style.display = 'block';
    document.getElementById('currentUser').style.display = 'block';
    document.getElementById('currentUser').textContent = pinboard.username();

    titleEl.value = title;
    descriptionEl.value = description;
    tagsEl.value = tags;
    if (isNew){
      document.getElementById('heading').textContent = 'Added to Pinboard!'; 
    }
    titleEl.select();
  };

  var activateIcon = function(){
    chrome.pageAction.setIcon({ tabId : activeTab.id, path : 'images/icon_active.png'});
  };

  var deactivateIcon = function(){
    chrome.pageAction.setIcon({ tabId : activeTab.id, path : 'images/icon_deactive.png'});
  };

  var getOrCreatePost = function(url, title){
    if (url in background.savedPosts === false){
      // New post
      showPost(url, title, null, null, true);
      pinboard.posts.add({
        url : url, 
        description : title 
      }).then(data => {
          background.savedPosts[url] = {
            href : url,
            description : title,
            extended : "",
            tags: ""
          };
      }).catch(error => {
        errorMessage('Error adding post to Pinboard: ' + error.message);
        deactivateIcon();
      });
    } else {
      // Existing post
      var post = background.savedPosts[url];
      showPost(post.href, post.description, post.extended, post.tags, false);
    }
  };

  var updatePost = function(url, title, description, tags){
    return pinboard.posts.add({
      url : url,
      replace : 'yes',
      description : title,
      extended : description,
      tags: tags
    }).then(() => {
      background.savedPosts[url] = {
        href : url,
        description : title,
        extended : description,
        tags: tags
      };
      window.close();
    }).catch(error => {
      errorMessage(error.message);
      deactivateIcon();
      window.close();    
    });
  };

  var deletePost = function(url){
    return pinboard.posts.delete({
      url : url
    }).then(data => {
      delete background.savedPosts[url];
      chrome.pageAction.setIcon({ tabId : activeTab.id, path : 'images/icon_deactive.png'}, function(e){
        window.close();
      });
    }).catch(error => {
      errorMessage('Error deleting post from Pinboard: ' + error.message);
    });
  };

  var setupTags = function(){
    var tagSuggest;
    return pinboard.tags.get().then(data => {
      tagSuggest = new TagSuggest(Object.keys(data), tagsEl);
    }).catch(error => {
      errorMessage('Error fetching tags from Pinboard: ' + error.message);
    });
  };

  var errorMessage = function(message){
    errorEl.textContent = message;
  };

  /* Init */
  document.addEventListener('DOMContentLoaded', ev => {
    chrome.tabs.query({ active : true }, tabs => {
      activeTab = tabs[0];
      setupEvents();
      // TODO: fetch the private and read later default options
      chrome.storage.sync.get(['apitoken'], data => {
        if (!data.hasOwnProperty('apitoken')) {
          showLoginForm();
          return;
        }
        login(data.apitoken);
        getOrCreatePost(activeTab.url, activeTab.title);
        setupTags();
      });
    });
  });

}(Pinboard, chrome, window));
