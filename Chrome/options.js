function save_options() {
  var username = document.getElementById('username').value;
  var apitoken = document.getElementById('apitoken').value;
  //var likesColor = document.getElementById('like').checked;
  chrome.storage.local.set({
    username: username,
    apitoken: apitoken
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.local.get({
    username: "",
    apitoken: ""
    //favoriteColor: 'red',
    //likesColor: true
  }, function(items) {
    document.getElementById('username').value = items.username;
    document.getElementById('apitoken').value = items.apitoken;
    //document.getElementById('like').checked = items.likesColor;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);