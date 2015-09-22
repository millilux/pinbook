

function getJSON(url, callback) {
  /* Basic version of jQuery's $.getJSON method */

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var data = JSON.parse(xhr.responseText);
      callback(data, xhr);
    }
  };
  xhr.open("GET", url, true);
  xhr.send();
}

function param(obj) {
  /* Basic version of jQuery's $.param method */
  var parts = [], i;
  for (i in obj) {
    if (obj.hasOwnProperty(i)) {
      parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
    }
  }
  return parts.join("&");
}

pinboard = {

  endpoint : "https://api.pinboard.in/v1",

  /* Setup user credentials */
  init : function (username, apitoken) {
    this.username = username;
    this.authToken = username + ":" + apitoken;
  },

  /* Handles all HTTP requests */
  request : function (resourceURI, params, callback) {
    var requestURL = this.endpoint
      + resourceURI
      + "?" + param(params)
      + "&auth_token=" + this.authToken
      + "&format=json";

    getJSON(requestURL, function (data) {
      callback(data);
    });
  },

  getPost : function (params, callback) {
    this.request("/posts/get", params, callback);
  },

  addPost : function (params, callback) {
    this.request("/posts/add", params, callback);
  },

  deletePost : function (params, callback) {
    this.request("/posts/delete", params, callback);
  },

  getTags: function (params, callback) {
    this.request("/tags/get", params, callback);
  }

};