/* Pinboard API client */
var Pinboard = function(username, apitoken){
  this.username = username;
  this.authToken = username + ":" + apitoken;
}

Pinboard.endpoint = "https://api.pinboard.in/v1";

Pinboard.prototype = {

  request : function (resourceURI, params, callback) {
    var requestURL = Pinboard.endpoint + resourceURI;

    params.auth_token = this.authToken;
    params.format = "json";

    return $.getJSON(requestURL, params, callback);
  },

  getPost : function (params, callback) {
    return this.request("/posts/get", params, callback);
  },

  addPost : function (params, callback) {
    return this.request("/posts/add", params, callback);
  },

  deletePost : function (params, callback) {
    return this.request("/posts/delete", params, callback);
  },

  getTags: function (params, callback) {
    return this.request("/tags/get", params, callback);
  }

};