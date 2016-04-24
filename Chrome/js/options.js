(function() {
  'use strict';

  function save_options() {
    var apitoken = document.getElementById('apitoken').value;
    var privateDefault = document.getElementById('private').checked;
    var readLaterDefault = document.getElementById('readlater').checked;

    chrome.storage.sync.set({
      apitoken: apitoken,
      private: privateDefault,
      readlater: readLaterDefault
    }, () => {
      // Update status to let user know options were saved.
      var status = document.getElementById('status');
      status.textContent = 'Ok!';
      status.className = 'success';
      setTimeout(function() {
        status.textContent = '';
        status.className = '';
      }, 800);
    });
  }

  function restore_options() {
    chrome.storage.sync.get({
      apitoken: "",
      private: true,
      readlater: false
    }, items => {
      document.getElementById('apitoken').value = items.apitoken;
      document.getElementById('private').checked = items.private;
      document.getElementById('readlater').checked = items.readlater;
    });
  }

  document.addEventListener('DOMContentLoaded', restore_options);
  document.getElementById('save').addEventListener('click', save_options);

}());