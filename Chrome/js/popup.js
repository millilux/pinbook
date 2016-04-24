class Popup {
  constructor (activeTab) {

    this.background = chrome.extension.getBackgroundPage();
    this.activeTab = activeTab;

    // Cached DOM elements
    this.editFormEl     = document.getElementById('editPost');
    this.deleteButtonEl = document.getElementById('removePost');
    this.loginFormEl    = document.getElementById('login');
    this.titleEl        = document.querySelector('input[name=title]');
    this.descriptionEl  = document.querySelector('textarea[name=description]');
    this.tagsEl         = document.querySelector('input[name=tags]');
    this.urlEl          = document.querySelector('input[name=url]');
    this.dateEl         = document.getElementById('date');
    this.errorEl        = document.querySelector('.error');
    this.connErrorMsg   = 'Could not connect to Pinboard';

    this.setupEvents();

  }

  setupEvents() {

    // Update post
    this.editFormEl.addEventListener('submit', ev => {
      ev.preventDefault();
      this.updatePost(this.activeTab.url, this.titleEl.value, this.descriptionEl.value, this.tagsEl.value);
    });

    // Delete post
    this.deleteButtonEl.addEventListener('click', ev => {
      this.deletePost(this.activeTab.url);
    });

    // Login
    this.loginFormEl.addEventListener('submit', ev => {
      this.login(ev.target.apitoken.value);
      this.getOrCreatePost(this.activeTab.url, this.activeTab.title);
      setupTags();
    });

  }

  login (apitoken) {
    this.pinboard = new Pinboard(apitoken);

    // Save Pinboard credentials for future API calls
    chrome.storage.sync.set({
      'apitoken' : apitoken
    });
  }

  showLoginForm () {
    this.loginFormEl.style.display = 'block';
    this.editFormEl.style.display = 'none';
  }

  showPost (url, title, description, tags, isNew){
    this.activateIcon();

    this.loginFormEl.style.display = 'none';
    this.editFormEl.style.display = 'block';
    document.getElementById('currentUser').style.display = 'block';
    document.getElementById('currentUser').textContent = this.pinboard.username;

    this.titleEl.value = title;
    this.descriptionEl.value = description;
    this.tagsEl.value = tags;
    if (isNew){
      document.getElementById('heading').textContent = 'Added to Pinboard!'; 
    }
    this.titleEl.select();
    return new Promise((resolve, reject) => {
      resolve({ url: url, description: title, extended: description, tags: tags });
    });
  }

  activateIcon (){
    chrome.pageAction.setIcon({ tabId : this.activeTab.id, path : 'images/icon_active.png'});
  }

  deactivateIcon (){
    chrome.pageAction.setIcon({ tabId : this.activeTab.id, path : 'images/icon_deactive.png'});
  }

  getOrCreatePost (url, title){
    if (url in this.background.savedPosts === false){
      // New post
      this.showPost(url, title, null, null, true);
      return this.pinboard.posts.add({
        url : url, 
        description : title 
      }).then(data => {
          this.background.savedPosts[url] = {
            href : url,
            description : title,
            extended : "",
            tags: ""
          };
      }).catch(error => {
        this.errorMessage('Error adding post to Pinboard: ' + error.message);
        this.deactivateIcon();
      });
    } else {
      // Existing post
      let post = this.background.savedPosts[url];
      return this.showPost(post.href, post.description, post.extended, post.tags, false);
    }
  }

  updatePost (url, title, description, tags){
    return this.pinboard.posts.add({
      url : url,
      replace : 'yes',
      description : title,
      extended : description,
      tags: tags
    }).then(() => {
      this.background.savedPosts[url] = {
        href : url,
        description : title,
        extended : description,
        tags: tags
      };
      window.close();
    }).catch(error => {
      this.errorMessage(error.message);
      this.deactivateIcon();
      window.close();    
    });
  }

  deletePost (url){
    return this.pinboard.posts.delete({
      url : url
    }).then(data => {
      delete this.background.savedPosts[url];
      chrome.pageAction.setIcon({ tabId : this.activeTab.id, path : 'images/icon_deactive.png'}, function(e){
        window.close();
      });
    }).catch(error => {
      this.errorMessage('Error deleting post from Pinboard: ' + error.message);
    });
  }

  setupTags (){
    var tagSuggest;
    return this.pinboard.tags.get().then(data => {
      tagSuggest = new TagSuggest(Object.keys(data), this.tagsEl);
    }).catch(error => {
      this.errorMessage('Error fetching tags from Pinboard: ' + error.message);
    });
  }

  errorMessage (message){
    this.errorEl.textContent = message;
  }

}


/* Init */
document.addEventListener('DOMContentLoaded', ev => {
  chrome.tabs.query({ active : true }, tabs => {
    let popup = new Popup(tabs[0]);
    // TODO: fetch the private and read later default options
    chrome.storage.sync.get(['apitoken', 'private', 'readlater'], data => {
      if (!data.hasOwnProperty('apitoken')) {
        popup.showLoginForm();
        return;
      }
      popup.login(data.apitoken);
      popup.getOrCreatePost(tabs[0].url, tabs[0].title)
        .then(() => popup.setupTags());

    });
  });
});
