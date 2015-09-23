//var PINMARK = PINMARK || {};

var PINMARK = {
  savedPosts : {},
  savedTags : {},
  activeTab : null,
  pinboard: null,

  init : function () {
    var self = this;
    this.editFormEl     = document.getElementById('editPost');
    this.loginFormEl    = document.getElementById('login');
    this.removeButtonEl = document.getElementById('removePost');
    this.titleEl        = document.querySelector('input[name=title]');
    this.descriptionEl  = document.querySelector('textarea[name=description]');
    this.tagsEl         = document.querySelector('input[name=tags]');
    this.urlEl          = document.querySelector('input[name=url]');
    this.dateEl         = document.getElementById('date');

    chrome.storage.local.get(['username', 'apitoken'], function (data) {

      if (!data.hasOwnProperty('username')) {
        // Missing user credentials, so show login form
        self.showLoginForm();
        return;
      }

      self.pinboard = new Pinboard(data.username, data.apitoken);
      self.showEditForm();
      self.getActiveTab(function (tab) {
        self.getOrCreate(tab.url, tab.title);
      });

      self.pinboard.getTags({}, function (data) {
        self.savedTags = data;
        var tagSuggest = new TagSuggest(Object.keys(data), self.tagsEl);
      });

    });

    this.loginFormEl.addEventListener('submit', function (e) {
      var username = e.target.username.value,
        apitoken = e.target.apitoken.value;
      //e.preventDefault();
      self.pinboard = new Pinboard(username, apitoken);

      // Save pinboard credentials so we can make future API calls
      chrome.storage.local.set({
        'username' : username,
        'apitoken' : apitoken
      });

    });

    this.editFormEl.addEventListener('submit', function (e) {

      e.preventDefault();

      self.pinboard.addPost({
        url : self.activeTab.url,
        replace : 'yes',
        description : self.titleEl.value,
        extended : self.descriptionEl.value,
        tags: self.tagsEl.value
      }, self.postUpdated);

    });

    this.removeButtonEl.addEventListener('click', function (e) {
      self.pinboard.deletePost({ url : self.activeTab.url }, function (data) {
        if (data.result_code === 'done') {
          self.postDeleted(data);
        } else {
          alert('Error removing post from pinboard: ' + data.result_code);
        }
      });
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
    document.getElementById('currentUser').textContent = this.pinboard.username;
  },

  postAdded : function (data) {
    //savedPosts[tab.url] = true;
    chrome.pageAction.setIcon({ tabId : this.activeTab.id, path : 'images/icon_active.png'});
    this.titleEl.value = this.activeTab.title;
    document.getElementById("heading").textContent = "Added to Pinboard!";
  },

  postUpdated : function (data) {
    window.close();
  },

  postDeleted : function (data) {
    chrome.pageAction.setIcon({ tabId : this.activeTab.id, path : 'images/icon_deactive.png'}, function(e){
      window.close();
    });
  },

  getActiveTab : function (callback) {
    var self = this;
    chrome.tabs.query({ active : true }, function (tabs) {
      self.activeTab = tabs[0];
      callback(tabs[0]);
    });
  },

  showPost : function(url, title, description, tags, isNew){
    chrome.pageAction.setIcon({ tabId : this.activeTab.id, path : 'images/icon_active.png'});
    //this.titleEl.value = this.activeTab.title;
    this.titleEl.value = title;
    this.descriptionEl.value = description;
    this.tagsEl.value = tags;
    if (isNew){
      document.getElementById("heading").textContent = "Added to Pinboard!"; 
    }
    this.titleEl.select();
  },

  // Create a new post if the URL doesn't already exist in Pinboard. Otherwise, allows editing
  getOrCreate : function (url, title) {

    var self = this;

    // Set the title to make everything appear quick
    this.titleEl.value = title;
    this.urlEl.value = url;

    this.pinboard.getPost({ url : url }, function (data) {
      console.log(data);

      if (data.posts.length === 0) {

        self.showPost(url, title, null, null, true);

        // It's a new URL, so save it to Pinboard 
        self.pinboard.addPost({ url : url, description : title }, function (data) {
          if (data.result_code === 'done') {
            
          } else {
            alert('Error adding post to pinboard: ' + data.result_code);
            // TODO: deactivate pinicon and title
          }
        });

      } else {

        // URL is already saved in Pinboard, so display the fetched data
        var post = data.posts[0];
        self.showPost(url, post.description, post.extended, post.tags, false);
        //var now = new Date();
        //var date = new Date(data.date);
        //dateEl.textContent = date;

      }
    });

  }

};


(function (Pinboard, window, document) {

  document.addEventListener('DOMContentLoaded', PINMARK.init());

}(Pinboard, window, document));
