//pinboard.init("biscuitseverywhere:041ab87679e544eaa14d");

var savedPosts = {};
var savedTags = {};
var currentTab;



/*
    As soon as the popup loads, we want to add the URL to pinboard
*/
document.addEventListener('DOMContentLoaded', function() {

    var formEl         = document.getElementById('editPost'), 
        loginFormEl    = document.getElementById('login'),
        removeButtonEl = document.getElementById('removePost'),
        titleEl        = formEl.querySelector('input[name=title]'),
        descriptionEl  = formEl.querySelector('[name=description]'),
        tagsEl         = formEl.querySelector('[name=tags]');

    if (! pinboard.authToken){
        formEl.style.display = "none";
        return;
    }

    chrome.tabs.query({ active : true }, function(tabs){
        currentTab = tabs[0];

        pinboard.getPost({ url : currentTab.url }, function(data){

            if (data.posts.length > 0){
                /* URL is already in Pinboard, so update the form fields */
                titleEl.value = data.posts[0].description;
                titleEl.select();
                descriptionEl.value = data.posts[0].extended;
            } else {
                /* URL isn't in Pinboard, so add it */
                pinboard.addPost({ url : currentTab.url, description : currentTab.title }, function(data){
                    if (data.result_code === "done"){
                        postAdded(data);
                        titleEl.value = currentTab.title;
                    } else {
                        alert("Error adding post to pinboard: " + data.result_code);
                    }
                });
            }

        });

        pinboard.getTags({}, function(data){
            savedTags = data;
            //for (var tag in savedTags){
            //    if (savedTags.hasOwnProperty(tag)){
            //        tagsEl.value += " " + tag;
            //    }
            //}
        });

    });

    removeButtonEl.addEventListener("click", function(){
        pinboard.deletePost({ url : currentTab.url }, function(data){
            if (data.result_code === "done"){
                postRemoved(data);
            } else {
                alert("Error removing post from pinboard: " + data.result_code);
            }     
        })
    });

    tagsEl.addEventListener("keyup", tagKeyUpHandler);
    formEl.addEventListener("submit", submitEditHandler);
    loginFormEl.addEventListener("submit", submitLoginHandler);

});

function tagKeyUpHandler(e){
    var input = e.target.value, 
        tagCompleteEl = document.getElementById("tagComplete"),
        tagCompleteListItems = [];

    for (var tag in savedTags){
        if (tag.toLowerCase().match(input.toLowerCase())){
            tagCompleteListItems.push("<li>" + tag + "</li>");
        }
    }
    tagCompleteEl.innerHTML = tagCompleteListItems.join(" ");   
}

function submitEditHandler(e){
    e.preventDefault();

    pinboard.addPost({
        url : currentTab.url,
        replace : "yes",
        description : e.target.querySelector("input[name=title]").value,
        extended : e.target.querySelector("input[name=description]").value
    }, function(data){
        postUpdated(data);
    });
}

function submitLoginHandler(e){

    e.preventDefault();

    alert("YO");

    chrome.storage.local.set({
        //"userName" : e.target.username.value,
        //"apiToken" : e.target.apitoken.value
        "authToken" : e.target.authtoken.value
    }, function(){
        e.target.submit();
    });
}

function postAdded(data){
    //savedPosts[tab.url] = true;
    chrome.pageAction.setIcon({ tabId : currentTab.id, path : "icon_active.png"});
}

function postUpdated(data){
    window.close();
}

function postRemoved(data){
    chrome.pageAction.setIcon({ tabId : currentTab.id, path : "icon_deactive.png"}, function(){
        window.close();
    });
}


