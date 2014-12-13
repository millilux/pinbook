//pinboard.init("biscuitseverywhere:041ab87679e544eaa14d");

var savedPosts = {};
var savedTags = {};
var currentTab;
var pinboard = pinboard;
var formEl,
  loginFormEl,
  removeButtonEl,
  titleEl,
  descriptionEl,
  tagsEl,
  dateEl;

/*
    As soon as the popup loads, we want to add the URL to pinboard
*/
document.addEventListener('DOMContentLoaded', function () {

  formEl         = document.getElementById('editPost');
  loginFormEl    = document.getElementById('login');
  removeButtonEl = document.getElementById('removePost');
  titleEl        = formEl.querySelector('input[name=title]');
  descriptionEl  = formEl.querySelector('textarea[name=description]');
  tagsEl         = formEl.querySelector('input[name=tags]');
  dateEl         = document.getElementById('date');

  chrome.storage.local.get(["username", "apitoken"], function (data) {

    if (!data.hasOwnProperty("username")) {
      // Missing user credentials, so show login form
      formEl.style.display = "none";
      return;
    }

    loginFormEl.style.display = "none";
    pinboard.init(data.username, data.apitoken);

    getCurrentTab(function (tab) {

      currentTab = tab;
      titleEl.value = currentTab.title;   // Set the title to make everything appear quick

      //  Check to see if this URL has already been saved
      pinboard.getPost({ url : currentTab.url }, function (data) {
        console.log(data);
        if (data.posts.length > 0) {
          // URL is already saved in Pinboard, so let's allow the user to edit it
          var post = data.posts[0];
          titleEl.value = post.description;
          titleEl.select();
          descriptionEl.value = post.extended;
          tagsEl.value = post.tags;

          //var now = new Date();
          //var date = new Date(data.date);

          //dateEl.textContent = date;

        } else {
          // It's a new URL, so save it to Pinboard 
          pinboard.addPost({ url : currentTab.url, description : currentTab.title }, function (data) {
            if (data.result_code === "done") {
              postAdded(data);
              titleEl.value = currentTab.title;
            } else {
              alert("Error adding post to pinboard: " + data.result_code);
            }
          });
        }
      });

      pinboard.getTags({}, function (data) {
        savedTags = data;
        //for (var tag in savedTags){
        //    if (savedTags.hasOwnProperty(tag)){
        //        tagsEl.value += " " + tag;
        //    }
        //}
      });
    });
  });

  removeButtonEl.addEventListener("click", function () {
    pinboard.deletePost({ url : currentTab.url }, function (data) {
      if (data.result_code === "done") {
        postRemoved(data);
      } else {
        alert("Error removing post from pinboard: " + data.result_code);
      }
    });
  });

  tagsEl.addEventListener("keyup", tagKeyUpHandler);
  formEl.addEventListener("submit", submitEditHandler);
  loginFormEl.addEventListener("submit", submitLoginHandler);

});

function tagKeyUpHandler(e) {

  var input = e.target.value,
    tagCompleteEl = document.getElementById("tagComplete"),
    tagCompleteListItems = [],
    currentWord,
    tag;

  for (tag in savedTags) {
    if (savedTags.hasOwnProperty(tag)) {
      if (tag.toLowerCase().match(input.toLowerCase())) {
        tagCompleteListItems.push("<li>" + tag + "</li>");
      }
    }
  }
  tagCompleteEl.innerHTML = tagCompleteListItems.join(" ");
}

// User is editing an existing post
function submitEditHandler(e) {
  e.preventDefault();

  pinboard.addPost({
    url : currentTab.url,
    replace : "yes",
    description : titleEl.value,
    extended : descriptionEl.value,
    tags: tagsEl.value
  }, postUpdated);
}

function submitLoginHandler(e) {

  e.preventDefault();

  var username = e.target.username.value,
    apitoken = e.target.apitoken.value;

  chrome.storage.local.set({
    "username" : username,
    "apitoken" : apitoken
  }, function () {
    // Hide the login form and show the edit post form
    document.getElementById('login').style.display = "none";
    document.getElementById('editPost').style.display = "block";

    // We can now set the credentials
    pinboard.init(username, apitoken);

    e.target.submit();
  });
}

function postAdded(data) {
  //savedPosts[tab.url] = true;
  chrome.pageAction.setIcon({ tabId : currentTab.id, path : "icon_active.png"});
}

function postUpdated(data) {
  window.close();
}

function postRemoved(data) {
  chrome.pageAction.setIcon({ tabId : currentTab.id, path : "icon_deactive.png"}, function () {
    window.close();
  });
}

function getCurrentTab(callback) {
  chrome.tabs.query({ active : true }, function (tabs) {
    callback(tabs[0]);
  });
}
