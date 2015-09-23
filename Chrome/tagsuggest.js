var TagSuggest = function (tags, inputElement) {
  var self = this;

  this.tags = tags;
  this.inputEl = inputElement;
  this.listEl = document.getElementById('tagSuggestions');
  this.cursor = -1;
  this.hide();

  this.inputEl.addEventListener('keydown', function (e) {
    
    if (e.keyIdentifier === "U+0009" && self.isOpen) {
      // Use current suggestion when Tab is pressed
      e.preventDefault();
      self.useCurrentSuggestion();
    } else if (e.keyIdentifier === "Up" && self.isOpen) {
      // Prevent "Home" behaviour when tag suggest is open
      e.preventDefault();
    } else if (e.keyIdentifier === "Down" && self.isOpen) {
      // Prevent "End" behaviour when tag suggest is open
      e.preventDefault();
    }

  });

  this.inputEl.addEventListener('keyup', function (e) {

    var userTags = e.target.value.split(/\s+/);
    var currentTag = userTags[userTags.length - 1];

    if (e.keyIdentifier === "Up") {
      e.preventDefault();
      self.previous();
    } else if (e.keyIdentifier === "Down") {
      e.preventDefault();
      self.next();
    } else {
      self.showSuggestions(currentTag);
    }

  });

};

TagSuggest.prototype = {
  show : function () {
    this.listEl.style.display = 'block';
    this.isOpen = true;
  },

  hide : function () {
    this.listEl.style.display = 'none';
    this.isOpen = false;
  },

  previous : function () {
    if (this.cursor > 0) {
      this.cursor -= 1;
      this.highlight(this.cursor);
    }
  },

  next : function () {
    if (this.cursor < this.tags.length) {
      this.cursor += 1;
      this.highlight(this.cursor);
    }
  },

  highlight : function (index) {

    // Clear the currently selected element
    var selectedEl = this.listEl.querySelector('.selected');
    if (selectedEl) {
      selectedEl.className = '';
    }

    // Highlight the new selection
    selectedEl = this.listEl.querySelectorAll('li')[index];
    selectedEl.className = 'selected';
  },

  useCurrentSuggestion : function () {
    // Replace the partly entered user string with the currently selected tag
    var enteredTags = this.inputEl.value.split(/\s+/);
    enteredTags[enteredTags.length - 1] = this.listEl.querySelectorAll('li')[this.cursor].textContent;
    this.inputEl.value = enteredTags.join(" ") + " ";
    this.clear();
  },

  showSuggestions : function (text) {

    var suggestions = [];
    var regex = new RegExp('^' + text, 'i');
    var i;

    this.clear();

    if (text.length < 1) {
      // Prevents all tags showing
      this.hide();
      return;
    }

    for (i = 0; i < this.tags.length; i++) {
      if (this.tags[i].match(regex)) {
        suggestions.push(this.tags[i]);
      }
    }

    if (suggestions.length > 0) {
      this.show();
      this.listEl.innerHTML = "<li>" + suggestions.join("</li><li>") + "</li>";
      this.cursor = 0;
      this.highlight(this.cursor);
    } else {
      this.hide();
      this.clear();
    }

  },

  clear : function () {
    this.listEl.innerHTML = "";
    this.cursor = -1;
  }
};