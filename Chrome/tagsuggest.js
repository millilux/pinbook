var TagSuggest = function (tags, inputElement, containerId) {
  var self = this;

  this.tags = tags;
  this.suggestions = [];
  this.inputEl = inputElement;
  this.containerEl = document.createElement('div');
  this.containerEl.className = 'tagSuggest';
  if (containerId){
    this.containerEl.id = containerId;
  }

  inputElement.parentNode.insertBefore(this.containerEl, this.inputEl);
  this.close();

  this.inputEl.addEventListener('keyup', this.onKeyUp.bind(this));
  this.inputEl.addEventListener('keydown', this.onKeyDown.bind(this));
  this.containerEl.addEventListener('mouseover', this.onMouseOver.bind(this));
  this.containerEl.addEventListener('click', this.onClick.bind(this));

};

TagSuggest.prototype = {
  open : function () {
    this.containerEl.style.display = 'block';
    this.isOpen = true;
    this.cursor = 0;
  },

  close : function () {
    this.containerEl.style.display = 'none';
    this.containerEl.innerHTML = '';
    this.suggestions.length = 0;
    this.isOpen = false;
    this.cursor = -1;
  },

  previous : function () {
    if (this.cursor > 0) {
      this.cursor -= 1;
      this.highlight(this.cursor);
    }
  },

  next : function () {
    if (this.cursor < this.suggestions.length-1) {
      this.cursor += 1;
      this.highlight(this.cursor);
    }
  },

  // Show suggestions for the current word fragment
  onKeyUp : function (e){

    if (e.keyIdentifier === "U+0009") {
      e.preventDefault();
    } else if (e.keyIdentifier === "Up") {
      e.preventDefault();
      this.previous();
    } else if (e.keyIdentifier === "Down") {
      e.preventDefault();
      this.next();
    } else {
      var words = e.target.value.split(/\s+/);
      var lastWord = words[words.length - 1];
      this.suggestTags(lastWord);

      if (this.cursor == -1 && this.suggestions.length > 0){
        // First char of this tag has been typed and there's a suggestion available
        this.open(); 
      }
      this.render();
    }
  },

  onKeyDown : function (e) {
    if (e.keyIdentifier === "U+0009" && this.isOpen) {
      // Use current suggestion when Tab is pressed
      e.preventDefault();
      this.useCurrentSuggestion();
    } else if (e.keyIdentifier === "Up" && this.isOpen) {
      // Prevent "Home" behaviour when tag suggest is open
      e.preventDefault();
    } else if (e.keyIdentifier === "Down" && this.isOpen) {
      // Prevent "End" behaviour when tag suggest is open
      e.preventDefault();
    }
  },

  // Update the cursor to match the tag the user is hovering over
  onMouseOver : function(e) {
    if (e.target.nodeName == 'LI'){
      var nodes = this.containerEl.getElementsByTagName('li');
      var arr = Array.prototype.slice.call(nodes);
      this.cursor = arr.indexOf(e.target);
      this.highlight(this.cursor);
    }
  },

  // Use the clicked suggestion
  onClick : function(e) {
    e.preventDefault();
    if (e.target.nodeName == 'LI'){
      this.useCurrentSuggestion();
    }
  },

  highlight : function (index) {

    // Clear the currently selected element
    var selectedEl = this.containerEl.querySelector('.selected');
    if (selectedEl) {
      selectedEl.className = '';
    }

    // Highlight the new selection
    selectedEl = this.containerEl.querySelectorAll('li')[index];
    selectedEl.className = 'selected';
  },

  suggestTags : function(text){
    var suggestions = [];
    var regex = new RegExp('^' + text, 'i');
    var i;

    if (text.length > 0){
      for (i = 0; i < this.tags.length; i++) {
        if (this.tags[i].match(regex)) {
          suggestions.push(this.tags[i]);
        }
      }
    }

    this.suggestions = suggestions;
  },

  currentSuggestionText : function(){
    return this.containerEl.querySelectorAll('li')[this.cursor].textContent;
  },

  useCurrentSuggestion : function () {
    // Replace the partly entered user string with the currently selected tag
    var enteredTags = this.inputEl.value.split(/\s+/);
    enteredTags[enteredTags.length - 1] = this.currentSuggestionText();
    this.inputEl.value = enteredTags.join(" ") + " ";
    this.inputEl.focus();
    this.close();
  },

  render : function () {
    if (this.suggestions.length > 0) {
      var lines = [];
      for (var i = 0; i < this.suggestions.length; i++){
        lines.push(
          '<li' + (i == this.cursor ? ' class=selected>' : '>')
          + this.suggestions[i]
          + '</li>'
        );
      }
      this.containerEl.innerHTML = "<ul>" + lines.join('') + "</ul>";
    } else {
      this.close();
    }
  },

};