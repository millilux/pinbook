(function() {
  'use strict';

  function saveOptions() {
    const apitoken = document.getElementById('apitoken').value;
    const privateDefault = document.getElementById('private').checked;
    const readLaterDefault = document.getElementById('readlater').checked;
    const showCheckboxes = document.getElementById('showcheckboxes').checked;

    chrome.storage.sync.set({
      apitoken: apitoken,
      private: privateDefault,
      readlater: readLaterDefault,
      showcheckboxes: showCheckboxes
    }, () => {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.textContent = 'Ok!';
      status.className = 'success';
      setTimeout(() => {
        status.textContent = '';
        status.className = '';
      }, 800);
    });
  }

  function restoreOptions() {
    chrome.storage.sync.get({
      apitoken: '',
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

  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.getElementById('save').addEventListener('click', saveOptions);
}());