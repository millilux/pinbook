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
    this.privateEl      = document.querySelector('input[name=private]');
    this.readLaterEl    = document.querySelector('input[name=readlater]');
    this.dateEl         = document.getElementById('date');
    this.errorEl        = document.querySelector('.error');
    this.connErrorMsg   = 'Could not connect to Pinboard';

    this.setupEvents();

  }

  setupEvents() {

    // Update post
    this.editFormEl.addEventListener('submit', ev => {
      ev.preventDefault();
      this.updatePost({
        'url': this.activeTab.url,
        'description' : this.titleEl.value,
        'extended' : this.descriptionEl.value,
        'tags' : this.tagsEl.value,
        'shared' : this.privateEl.checked ? 'no' : 'yes',
        'toread' : this.readLaterEl.checked ? 'yes' : 'no'
      });
    });

    // Delete post
    this.deleteButtonEl.addEventListener('click', ev => {
      this.deletePost(this.activeTab.url);
    });

    // Login
    this.loginFormEl.addEventListener('submit', ev => {
      this.login(ev.target.apitoken.value);
      this.getOrCreatePost(this.activeTab.url, this.activeTab.title)
        .then(() => this.setupTags());
    });

  }

  login (apitoken) {
    this.pinboard = new Pinboard(apitoken);

    // Save Pinboard credentials for future API calls
    chrome.storage.sync.set({
      'apitoken' : apitoken
    });
  }

  defaults(opts){
    this._defaults = opts;
  }

  showLoginForm () {
    this.loginFormEl.style.display = 'block';
    this.editFormEl.style.display = 'none';
  }

  showPost (post, isNew){
    this.activateIcon();

    this.loginFormEl.style.display = 'none';
    this.editFormEl.style.display = 'block';
    document.getElementById('currentUser').style.display = 'block';
    document.getElementById('currentUser').textContent = this.pinboard.username;

    this.titleEl.value = post.description;
    this.descriptionEl.value = post.extended;
    this.tagsEl.value = post.tags;
    this.privateEl.checked = post.shared === 'no';
    this.readLaterEl.checked = post.toread === 'yes';
    if (isNew){
      document.getElementById('heading').textContent = 'Added to Pinboard!'; 
    }
    this.titleEl.select();
    return new Promise((resolve, reject) => {
      resolve(post);
    });
  }

  activateIcon (){
    chrome.pageAction.setIcon({ tabId : this.activeTab.id, path : 'images/icon_active.png'});
  }

  deactivateIcon (){
    chrome.pageAction.setIcon({ tabId : this.activeTab.id, path : 'images/icon_deactive.png'});
  }

  getOrCreatePost (url, title){
    if (url in this.background.savedPosts === true){
      // Existing post
      let post = this.background.savedPosts[url];
      return this.showPost(post, false);
    } else {
      // New post
      let post = {
        url : url, 
        description : title,
        extended : "",
        tags: "" ,
        shared: this._defaults.private ? 'no' : 'yes',
        toread: this._defaults.readlater ? 'yes' : 'no',
      };
      this.showPost(post, true);
      return this.pinboard.posts.add(post)
        .then(response => {
          this.background.savedPosts[url] = post;
      }).catch(error => {
        this.errorMessage('Error adding post to Pinboard: ' + error.message);
        this.deactivateIcon();
      });
    }
  }

  updatePost (post){
    let data = {'replace' : 'yes'};
    for (let prop in post){
      data[prop] = post[prop];
    }
    return this.pinboard.posts.add(data).then(response => {
      this.background.savedPosts[post.url] = post;
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
    }).then(response => {
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
    return this.pinboard.tags.get().then(response => {
      tagSuggest = new TagSuggest(Object.keys(response), this.tagsEl);
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
      popup.defaults({'private' : data.private, 'readlater': data.readlater });
      popup.getOrCreatePost(tabs[0].url, tabs[0].title)
        .then(() => popup.setupTags());
    });
  });
});
