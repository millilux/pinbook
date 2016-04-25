(function() {
  'use strict';

  function save_options() {
    let apitoken = document.getElementById('apitoken').value;
    let privateDefault = document.getElementById('private').checked;
    let readLaterDefault = document.getElementById('readlater').checked;
    let showCheckboxes = document.getElementById('showcheckboxes').checked;

    chrome.storage.sync.set({
      apitoken: apitoken,
      private: privateDefault,
      readlater: readLaterDefault,
      showcheckboxes: showCheckboxes
    }, () => {
      // Update status to let user know options were saved.
      let status = document.getElementById('status');
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
      readlater: false,
      showcheckboxes: true
    }, items => {
      document.getElementById('apitoken').value = items.apitoken;
      document.getElementById('private').checked = items.private;
      document.getElementById('readlater').checked = items.readlater;
      document.getElementById('showcheckboxes').checked = items.showcheckboxes;
    });
  }

  document.addEventListener('DOMContentLoaded', restore_options);
  document.getElementById('save').addEventListener('click', save_options);

}());