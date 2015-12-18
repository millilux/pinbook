(function () {
  'use strict';

  function save_options() {
    var apitoken = document.getElementById('apitoken').value;
    var privateDefault = document.getElementById('private').value;
    var readLaterDefault = document.getElementById('readlater').value;

    chrome.storage.local.set({
      apitoken: apitoken,
      private: privateDefault,
      readlater: readLaterDefault
    }, function() {
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
    chrome.storage.local.get({
      apitoken: ""
    }, function(items) {
      document.getElementById('apitoken').value = items.apitoken;
    });
  }

  document.addEventListener('DOMContentLoaded', restore_options);
  document.getElementById('save').addEventListener('click', save_options);

}());