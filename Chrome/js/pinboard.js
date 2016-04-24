/* Pinboard API error */
var PinboardError = function(message){
  'use strict';
  Error.call(this);
  this.name = 'PinboardError';
  this.message = message;
};

PinboardError.prototype = Object.create(Error.prototype);
PinboardError.prototype.constructor = PinboardError;

/* Pinboard API client */
var Pinboard = (function() {
  'use strict';

  var API_BASE = 'https://api.pinboard.in/v1', 
      apitoken;

  var config = function(_apitoken) {
    apitoken = _apitoken;
  };

  var re = /^https?:\/\//;

  /* Handles requests to Pinboard API */
  var request = function (uri, params) {
    var url = API_BASE + uri;

    if (params){
      url += '?' + param(params);
    }

    return new Promise( function (resolve, reject) {
      if (params && params.hasOwnProperty('url') && !params.url.match(re)){
        reject(new PinboardError('Invalid URL'));
      }

      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);

      xhr.onload = function () {
        if (xhr.status === 200) {
          var data = JSON.parse(xhr.response);
          // result_code only appears for actions, rather than queries
          if (data.hasOwnProperty('result_code') && data.result_code !== 'done'){
            reject(new PinboardError(data.result_code));
          } else {
            resolve(data);
          }
        } else {
          reject(new PinboardError(xhr.status + " " + xhr.statusText));
        }
      };

      xhr.onerror = function () {
        reject(new PinboardError('Connection error'));
      };

      xhr.send();
    });

  };

  /* Creates a function that handles requests for a given Pinboard API method */
  var method = function (uri) {
    return function(params){
      if (!params){
        params = {};
      }
      params.auth_token = apitoken;
      params.format = 'json';
      return request(uri, params);
    };
  };

  var username = function () {
    return apitoken.split(':')[0];
  };

  return {
    'config' : config,
    'username' : username,
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
  };

}());

/* Helper to create a query string from key/value properties */
function param(obj) {
  var qs = '';
  var pairs = [];
  for (var prop in obj){
    if (obj.hasOwnProperty(prop)){
      pairs.push(encodeURIComponent(prop) + '=' + encodeURIComponent(obj[prop]));
    }
  }
  qs += pairs.join('&');
  return qs;
}


