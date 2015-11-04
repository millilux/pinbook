//'use strict';

//var https = require('https');

/* Pinboard API client */
var Pinboard = (function() {

  var API_BASE = 'https://api.pinboard.in/v1', 
      username,
      apitoken;

  var config = function(_username, _apitoken) {
    username = _username;
    apitoken = _apitoken;
  };

  // Handles requests to Pinboard API  
  var request = function (uri, params) {
    var url = API_BASE + uri;

    if (params){
      url += '?' + param(params);
    }

    return new Promise( function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);

      xhr.onload = function () {
        if (xhr.status === 200) {
          var data = JSON.parse(xhr.response);
          resolve(data);
        } else {
          reject(Error(xhr.statusText));
        }
      };

      xhr.onerror = function () {
        reject(Error('Connection error'));
      };

      xhr.send();
    });

  };

  // Creates a function that handles requests for a given Pinboard API method
  var method = function (uri) {
    return function(params){
      if (!params){
        params = {};
      }
      params.auth_token = username + ':' + apitoken;
      params.format = 'json';
      return request(uri, params);
    };
  };

  return {
    'config' : config,
    'posts' : {
      'add' : method('/posts/add'),
      'delete' : method('/posts/delete'),
      'get' : method('/posts/get'),
      'dates' : method('/posts/dates'),
      'recent' : method('/posts/recent'),
      'all' : method('/posts/all'),
      'suggest' : method('/posts/suggest')
    }, 
    'tags' : {
      'get' : method('/tags/get'),
      'delete' : method('/tags/delete'),
      'rename' : method('/tags/rename')
    }, 
    'user' : {
      'secret' : method('/user/secret'),
      'api_token' : method('/user/api_token')
    },
    'notes' : {
      'list' : method('/notes/list')
    }
  }

}());

// Creates a query string from an object's properties
function param(obj) {
  var qs = '';
  //if (Object.keys(params).length > 0){
  //  qs += '?';
    var pairs = [];
    for (var prop in obj){
      if (obj.hasOwnProperty(prop)){
        pairs.push(encodeURIComponent(prop) + '=' + encodeURIComponent(obj[prop]));
      }
    }
    qs += pairs.join('&');
  //}
  return qs;
}

/*
var Pinboard = function(username, apitoken){
  this.username = username;
  this.apitoken = apitoken;
};

Pinboard.endpoint = "https://api.pinboard.in/v1";

Pinboard.prototype = {

  method : function (URI){
    var self = this;
    return function(params, callback){
      return Pinboard.request(URI, params, callback);
    };
  },

  request : function (resourceURI, params, callback) {
    var requestURL = Pinboard.endpoint + resourceURI;

    params.auth_token = this.username + ":" + this.apitoken;
    params.format = "json";

    //return $.getJSON(requestURL, params, callback);
    return request(resourceURI, params, callback);
  },

  posts : function (){
    return {
      "get" : self.method("/posts/get"),
      "add" : self.method("/posts/add"),
      "delete" : self.method("/posts/delete")
    };
  }, 

  tags : function (){
    var self = this;
    return {
      "get" : self.method("/tags/get")
    };
  }

};

*/

//module.exports = Pinboard;

