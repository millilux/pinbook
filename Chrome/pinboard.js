var API_URL = "https://api.pinboard.in/v1"


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

function param(obj) {
    var parts = [];
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
        }
    }
    return parts.join("&");
}

pinboard = {

    /* Setup user credentials */
    init : function(authToken){
        this.authToken = authToken;
    },

    /* Handles all HTTP requests */
    request : function(resourceURI, params, callback){
        var requestURL = API_URL
            + resourceURI
            + "?" + param(params)
            + "&auth_token=" + this.authToken
            + "&format=json";

        getJSON(requestURL, function(data){
            callback(data);
        })
    },

    getPost : function(params, callback){
        this.request("/posts/get", params, callback);
    },

    addPost : function(params, callback){
        this.request("/posts/add", params, callback);
    },

    deletePost : function(params, callback){
        this.request("/posts/delete", params, callback);
    },

    getTags: function(params, callback){
        this.request("/tags/get", params, callback);
    }

}