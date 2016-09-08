'use strict';

class Popup {
  constructor(activeTab) {
    this.background = chrome.extension.getBackgroundPage();
    this.activeTab = activeTab;
    this.errorOccurred = false;

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
    this.optionsEl      = document.getElementById('options');
    this.errorEl        = document.querySelector('.error');
    this.headingEl      = document.getElementById('heading');
    this.connErrorMsg   = 'Could not connect to Pinboard';

    this.setupEvents();
  }

  setupEvents() {
    // Submit form / Update post
    this.editFormEl.addEventListener('submit', ev => {
      if (this.errorOccurred) {
        this.deactivateIcon(() =>
          window.close()
        );
      } else {
        ev.preventDefault();
        this.updatePost({
          url: this.activeTab.url,
          description: this.titleEl.value,
          extended: this.descriptionEl.value,
          tags: this.tagsEl.value,
          shared: this.privateEl.checked ? 'no' : 'yes',
          toread: this.readLaterEl.checked ? 'yes' : 'no'
        });
      }
    });

    // Delete post
    this.deleteButtonEl.addEventListener('click', ev => {
      this.deletePost(this.activeTab.url);
    });

    // Login
    this.loginFormEl.addEventListener('submit', ev => {
      this.login(ev.target.apitoken.value);
      this.getOrCreatePost(this.activeTab.url, this.activeTab.title);
    });

    // Options
    this.optionsEl.addEventListener('click', ev => {
      chrome.runtime.openOptionsPage();
    });
  }

  login(apitoken) {
    this.pinboard = new Pinboard(apitoken);

    // Save Pinboard credentials for future API calls
    chrome.storage.sync.set({
      apitoken: apitoken
    });
  }

  showCheckboxes() {
    document.getElementById('checkboxes').style.display = 'block';
  }

  defaults(opts) {
    this._defaults = opts;
  }

  showLoginForm() {
    this.loginFormEl.style.display = 'block';
    this.editFormEl.style.display = 'none';
  }

  showPost(post, isNew) {
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
    if (isNew) {
      this.headingEl.textContent = 'Added to Pinboard!';
    }
    this.titleEl.select();
    return new Promise((resolve, reject) => {
      resolve(post);
    });
  }

  activateIcon(callback) {
    chrome.browserAction.setIcon({ tabId: this.activeTab.id, path: 'images/icon_active.png' }, () => {
      chrome.browserAction.setTitle({ tabId: this.activeTab.id, title: 'Edit' });
      if (callback) callback();
    });
  }

  deactivateIcon(callback) {
    chrome.browserAction.setIcon({ tabId: this.activeTab.id, path: 'images/icon_deactive.png' }, () => {
      chrome.browserAction.setTitle({ tabId: this.activeTab.id, title: 'Save current URL to Pinboard.in' });
      if (callback) callback();
    });
  }

  getOrCreatePost(url, title) {
    let promise;
    let post;
    if (url in this.background.savedPosts === true) {
      // Existing post
      post = this.background.savedPosts[url];
      promise = this.showPost(post, false);
    } else {
      // New post
      post = {
        url: url,
        description: title,
        extended: '',
        tags: '',
        shared: this._defaults.private ? 'no' : 'yes',
        toread: this._defaults.readlater ? 'yes' : 'no',
      };
      this.showPost(post, true);
      promise = this.pinboard.posts.add(post);
    }
    return promise
      .then(() => {
        this.background.savedPosts[url] = post;
        this.setupTags();
      })
      .catch(error => {
        this.errorMessage('Add failed: ' + error.message);
        this.deactivateIcon();
        this.headingEl.textContent = 'Pinboard';
      });
  }

  updatePost(post) {
    const data = { replace: 'yes' };
    for (let prop in post) {
      data[prop] = post[prop];
    }
    return this.pinboard.posts.add(data).then(response => {
      this.background.savedPosts[post.url] = post;
      window.close();
    }).catch(error => {
      this.errorMessage('Update failed: ' + error.message);
      this.deactivateIcon();
    });
  }

  deletePost(url) {
    return this.pinboard.posts.delete({
      url : url
    }).then(response => {
      delete this.background.savedPosts[url];
      this.deactivateIcon(() => window.close());
    }).catch(error => {
      this.errorMessage('Delete failed: ' + error.message);
    });
  }

  setupTags() {
    return this.pinboard.tags.get().then(response => {
      this.tagSuggest = new TagSuggest(Object.keys(response), this.tagsEl);
    });
    // .catch(error => {
    //   this.errorMessage('Couldn\'t fetch tags: ' + error.message);
    // });
  }

  errorMessage(message) {
    this.errorEl.textContent = message;
    this.errorOccurred = true;
  }

}

/* Init */
document.addEventListener('DOMContentLoaded', ev => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const popup = new Popup(tabs[0]);

    if (!tabs[0].url.match(/^http/)) {
      popup.errorMessage('Pinboard only saves "http" and "https" pages');
      return;
    }

    chrome.storage.sync.get(['apitoken', 'private', 'readlater', 'showcheckboxes'], data => {
      if (!data.hasOwnProperty('apitoken') || !data.apitoken) {
        popup.showLoginForm();
        return;
      }
      if (data.showcheckboxes) {
        popup.showCheckboxes();
      }
      popup.login(data.apitoken);
      popup.defaults({ private: data.private, readlater: data.readlater });
      popup.getOrCreatePost(tabs[0].url, tabs[0].title);
    });
  });
});
