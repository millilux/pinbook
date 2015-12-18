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

  this.inputEl.parentNode.insertBefore(this.containerEl, this.inputEl);
  var rect = this.inputEl.getBoundingClientRect();
  this.containerEl.style.position = 'absolute';
  this.containerEl.style.left = rect.left + 'px';
  this.containerEl.style.top = rect.bottom + 'px';
  this.containerEl.style.width = rect.width + 'px';
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

  getSuggestions : function (text){
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

  previousSuggestion : function () {
    if (this.cursor > 0) {
      this.cursor -= 1;
    }
    return this.suggestions[this.cursor];
  },

  nextSuggestion : function () {
    if (this.cursor < this.suggestions.length-1) {
      this.cursor += 1;
    }
    return this.suggestions[this.cursor];
  },

  currentSuggestion : function () {
    return this.suggestions[this.cursor];
  },

  useCurrentSuggestion : function () {
    // Replace the partly entered user string with the currently selected suggestion
    var enteredTags = this.inputEl.value.split(/\s+/);
    enteredTags[enteredTags.length - 1] = this.currentSuggestion();
    this.inputEl.value = enteredTags.join(" ") + " ";
    this.inputEl.focus();
    this.close();
  },

  onKeyDown : function (event) {
    if (event.keyIdentifier === "U+0009" && this.isOpen) {
      // Use current suggestion when Tab is pressed
      event.preventDefault();
      this.useCurrentSuggestion();
    } else if (event.keyIdentifier === "Up" && this.isOpen) {
      // Prevent "Home" behaviour when tag suggest is open
      event.preventDefault();
    } else if (event.keyIdentifier === "Down" && this.isOpen) {
      // Prevent "End" behaviour when tag suggest is open
      event.preventDefault();
    }
  },

  onKeyUp : function (event){
    if (event.keyIdentifier === "U+0009") {
      event.preventDefault();
    } else if (event.keyIdentifier === "Up") {
      event.preventDefault();
      this.previousSuggestion();
      this.highlight(this.cursor);
    } else if (event.keyIdentifier === "Down") {
      event.preventDefault();
      this.nextSuggestion();
      this.highlight(this.cursor);
    } else {
      // Get suggestions for the current word fragment
      var words = event.target.value.split(/\s+/);
      var lastWord = words[words.length - 1];
      this.getSuggestions(lastWord);

      if (this.cursor == -1 && this.suggestions.length > 0){
        // First char of this tag has been typed and there's a suggestion available
        this.open(); 
      }
      this.render();
    }
  },

  // Highlight suggestion on mouse over
  onMouseOver : function(event) {
    if (event.target.nodeName == 'LI'){
      var nodes = this.containerEl.getElementsByTagName('li');
      var arr = Array.prototype.slice.call(nodes);
      this.cursor = arr.indexOf(event.target);
      this.highlight(this.cursor);
    }
  },

  onClick : function (event) {
    event.preventDefault();
    if (event.target.nodeName == 'LI'){
      this.useCurrentSuggestion();
    }
  },

  highlight : function (index) {
    // Clear the currently highlighted element
    var selectedEl = this.containerEl.querySelector('.selected');
    if (selectedEl) {
      selectedEl.className = '';
    }

    // Highlight the new selection
    selectedEl = this.containerEl.querySelectorAll('li')[index];
    selectedEl.className = 'selected';
  },

  render : function () {
    if (this.suggestions.length > 0) {
      var lines = [];
      for (var i = 0; i < this.suggestions.length; i++){
        lines.push(
          '<li' + (i == this.cursor ? ' class=selected>' : '>') + this.suggestions[i] + '</li>'
        );
      }
      this.containerEl.innerHTML = '<ul>' + lines.join('') + '</ul>';
    } else {
      this.close();
    }
  },

};