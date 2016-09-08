'use strict';

class PinboardError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PinboardError';
    this.message = message;
  }
}

/* Pinboard API client */
class Pinboard {
  constructor(apitoken) {
    this.apitoken = apitoken;
  }

  static get API_BASE() {
    return 'https://api.pinboard.in/v1';
  }

  /* Handles requests to Pinboard API */
  request(uri, params) {
    let url = Pinboard.API_BASE + uri;
    let re = /^https?:\/\//;

    if (params) {
      params.format = 'json';
      params.auth_token = this.apitoken;
      url += '?' + param(params);
    }

    return new Promise((resolve, reject) => {
      if (params && params.hasOwnProperty('url') && !params.url.match(re)) {
        reject(new PinboardError('Invalid URL'));
      }

      if (!this.apitoken) {
        reject(new PinboardError('Missing auth token'));
      }

      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);

      xhr.onload = () => {
        if (xhr.status === 200) {
          let data;
          try {
            data = JSON.parse(xhr.response);
          } catch (SyntaxError) {
            // Pinboard API returns XHTML when it's down...
            reject(new PinboardError('Pinboard API appears to be down'));
            return;
          }
          // result_code only appears for actions, rather than queries
          if (data.hasOwnProperty('result_code') && data.result_code !== 'done') {
            reject(new PinboardError(data.result_code));
          } else {
            resolve(data);
          }
        } else {
          reject(new PinboardError(xhr.status + ' ' + xhr.statusText));
        }
      };

      xhr.onerror = () => {
        reject(new PinboardError('Connection error'));
      };

      xhr.send();
    });
  }

  /* Creates a function that handles requests for a given Pinboard API method */
  method(uri) {
    return params => {
      return this.request(uri, params || {});
    };
  }

  get username() {
    return this.apitoken.split(':')[0];
  }

  get apitoken() {
    return this._apitoken;
  }

  set apitoken(val) {
    this._apitoken = val;
  }

  get posts() {
    return {
      add: this.method('/posts/add'),
      delete: this.method('/posts/delete'),
      get: this.method('/posts/get'),
      dates: this.method('/posts/dates'),
      recent: this.method('/posts/recent'),
      all: this.method('/posts/all'),
      suggest: this.method('/posts/suggest')
    };
  }

  get tags() {
    return {
      delete: this.method('/tags/delete'),
      get: this.method('/tags/get'),
      rename: this.method('/tags/rename')
    };
  }

  get user() {
    return {
      secret: this.method('/user/secret'),
      api_token: this.method('/tags/api_token')
    };
  }

  get notes() {
    return {
      list: this.method('/notes/list')
    };
  }

}

/* Helper to create a query string from key/value properties */
function param(obj) {
  const pairs = [];
  for (let prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      pairs.push(encodeURIComponent(prop) + '=' + encodeURIComponent(obj[prop]));
    }
  }
  return pairs.join('&');
}
