(function (pinmark, background) {
  'use strict';

  pinmark.popup = {
    savedTags : {},
    activeTab : null,
    username: null,

    config : function (username, apitoken) {
      Pinboard.config(username, apitoken);
      this.username = username;
    },

    init : function () {
      var self = this;

      self.editFormEl     = document.getElementById('editPost');
      self.loginFormEl    = document.getElementById('login');
      self.deleteButtonEl = document.getElementById('removePost');
      self.titleEl        = document.querySelector('input[name=title]');
      self.descriptionEl  = document.querySelector('textarea[name=description]');
      self.tagsEl         = document.querySelector('input[name=tags]');
      self.urlEl          = document.querySelector('input[name=url]');
      self.dateEl         = document.getElementById('date');

      chrome.storage.local.get(['username', 'apitoken'], function (data) {

        if (!data.hasOwnProperty('username')) {
          // Missing user credentials, so show login form
          self.showLoginForm();
          return;
        }
   
        self.config(data.username, data.apitoken);
        self.showEditForm();

        self.getActiveTab(function (tab) {
          self.getOrCreatePost(tab);
        });

        Pinboard.tags.get().then(function (data) {
          self.savedTags = data;
          var tagSuggest = new TagSuggest(Object.keys(data), self.tagsEl);
        });

      });

      self.setupEvents();

    },

    setupEvents : function () {

      var self = this;

      // Login form
      self.loginFormEl.addEventListener('submit', function (e) {
        var username = e.target.username.value,
          apitoken = e.target.apitoken.value;
        //e.preventDefault();
        self.config(username, apitoken);

        // Save pinboard credentials so we can make future API calls
        chrome.storage.local.set({
          'username' : username,
          'apitoken' : apitoken
        });

      });

      // Edit form
      self.editFormEl.addEventListener('submit', function (e) {
        e.preventDefault();
        self.updatePost();
      });

      // Delete button
      self.deleteButtonEl.addEventListener('click', function (e) {
        self.deletePost();
      });

    },

    showLoginForm : function () {
      this.loginFormEl.style.display = 'block';
      this.editFormEl.style.display = 'none';
    },

    showEditForm : function () {
      this.loginFormEl.style.display = 'none';
      this.editFormEl.style.display = 'block';
      document.getElementById('currentUser').style.display = 'block';
      document.getElementById('currentUser').textContent = this.username;
    },

    showPost : function(url, title, description, tags, isNew){
      this.activateIcon();
      this.titleEl.value = title;
      this.descriptionEl.value = description;
      this.tagsEl.value = tags;
      if (isNew){
        document.getElementById("heading").textContent = "Added to Pinboard!"; 
      }
      this.titleEl.select();
    },

    activateIcon : function(){
      chrome.pageAction.setIcon({ tabId : this.activeTab.id, path : 'images/icon_active.png'});
    },

    deactivateIcon : function(){
      chrome.pageAction.setIcon({ tabId : this.activeTab.id, path : 'images/icon_deactive.png'});
    },

    getActiveTab : function (callback) {
      var self = this;
      chrome.tabs.query({ active : true }, function (tabs) {
        self.activeTab = tabs[0];
        callback(tabs[0]);
      });
    },

    getOrCreatePost : function(tab){
      var self = this;
      var url = tab.url;
      var title = tab.title;
      if (tab.id in background.savedPosts === false){
        // New post
        self.activateIcon();
        self.showPost(url, title, null, null, true);
        Pinboard.posts.add({ url : url, description : title }).then(function (data) {
          if (data.result_code === 'done') {
            background.savedPosts[tab.id] = {
              href : url,
              description : title,
              extended : "",
              tags: ""
            };
          } else {
            alert('Error adding post to pinboard: ' + data.result_code);
            self.deactivateIcon();
          }
        });
      } else {
        // Existing post
        var savedPost = background.savedPosts[tab.id];
        self.showPost(savedPost.href, savedPost.description, savedPost.extended, savedPost.tags, false);
      }
    }, 

    updatePost : function(){
      var self = this;
      Pinboard.posts.add({
        url : self.activeTab.url,
        replace : 'yes',
        description : self.titleEl.value,
        extended : self.descriptionEl.value,
        tags: self.tagsEl.value
      }).then(function(){
        background.savedPosts[self.activeTab.id] = {
          href : self.activeTab.url,
          description : self.titleEl.value,
          extended : self.descriptionEl.value,
          tags: self.tagsEl.value
        };
        window.close();
      });
    }, 

    deletePost : function(){
      var self = this;
      Pinboard.posts.delete({ url : self.activeTab.url }).then(function (data) {
        if (data.result_code === 'done') {
          delete background.savedPosts[self.activeTab.id];
          chrome.pageAction.setIcon({ tabId : self.activeTab.id, path : 'images/icon_deactive.png'}, function(e){
            window.close();
          });
        } else {
          alert('Error removing post from pinboard: ' + data.result_code);
        }
      });
    }

  };

  document.addEventListener('DOMContentLoaded', pinmark.popup.init());

}(window.Pinmark = window.Pinmark || {}, chrome.extension.getBackgroundPage()));
