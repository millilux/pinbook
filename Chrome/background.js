// Add a listener so background knows when a tab has changed.
// You need 'tabs' persmission, that's why we added it to manifest file.
chrome.tabs.onUpdated.addListener(init);
//chrome.pageAction.onClicked.addListener(clickHandler);

var API_URL = "https://api.pinboard.in/v1";
var auth_token = "biscuitseverywhere:041ab87679e544eaa14d";
window.savedPosts = {}; // cache any URLs we know to be saved

function getJSON(url, callback){
    /* Basic version of jQuery's $.getJSON method */

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status == 200){
            var data = JSON.parse(xhr.responseText);
            callback(data, xhr);
        }
    };
    xhr.open("GET", url, true);
    xhr.send();    
}

function init(tabId, changeInfo, tab){

    /* Check if this tab's URL has been bookmarked already.
       We check the local cache first, and if that's empty fire off a request to the API.
       The icon's are toggled as appropriate;
    */
    // TODO: If pinboard is edited outside of Chrome, it'll be out of sync? Maybe don't bother with the cache?
    // Or give it an expiry time?
    if (savedPosts.hasOwnProperty(tab.url)){
        chrome.pageAction.setIcon({ tabId : tab.id, path : "icon_active.png"});
    } else {
        getPost(tab.url, function(data){
            if (data.posts.length > 0){
                chrome.pageAction.setIcon({ tabId : tab.id, path : "icon_active.png"});
                savedPosts[tab.url] = true;
            } else {
                chrome.pageAction.setIcon({ tabId : tab.id, path : "icon_deactive.png"});
            }
        });
    }

    chrome.pageAction.show(tabId);
}

function getPost(url, callback){
    var requestURL = API_URL + "/posts/get?format=json&auth_token=" + auth_token + "&url=" + encodeURIComponent(url);

    getJSON(requestURL, function(data){
        console.log(data);
        callback(data);
    });
}


function addPost(url, title, description, tags, callback){
    var requestURL = API_URL + "/posts/add?format=json&auth_token=" + auth_token + "&url=" + encodeURIComponent(url) + "&description=" + title;

    getJSON(requestURL, function(data){
        console.log(data);
        callback(data);
    });
}

function removePost(url, callback){
    var requestURL = API_URL + "/posts/delete?format=json&auth_token=" + auth_token + "&url=" + encodeURIComponent(url);

    getJSON(requestURL, function(data){
        console.log(data);
        callback(data);
    });
}

function clickHandler(tab){
    if (savedPosts.hasOwnProperty(tab.url)){
        removePost(tab.url, function(data){
            if (data.result_code === "done"){
                delete savedPosts[tab.url];
                chrome.pageAction.setIcon({ tabId : tab.id, path : "icon_deactive.png"});
            } else {
                alert("Error removing post from pinboard: " + data.result_code);
            }
        });
    } else {
        addPost(tab.url, tab.title, "", "", function(data){
            if (data.result_code === "done"){
                savedPosts[tab.url] = true;
                chrome.pageAction.setIcon({ tabId : tab.id, path : "icon_active.png"});
            } else {
                alert("Error adding post to pinboard: " + data.result_code);
            }
        });
    }
}

// TODO: when popup loads, add the post straight away
// then tags can be added


