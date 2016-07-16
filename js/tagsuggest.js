'use strict';

class TagSuggest {
  constructor(tags, inputElement, containerId) {
    this.tags = tags;
    this.suggestions = [];
    this.inputEl = inputElement;
    this.containerEl = document.createElement('div');
    this.containerEl.className = 'tagSuggest';
    if (containerId) {
      this.containerEl.id = containerId;
    }

    this.inputEl.parentNode.insertBefore(this.containerEl, this.inputEl);
    let rect = this.inputEl.getBoundingClientRect();
    this.containerEl.style.position = 'absolute';
    this.containerEl.style.left = rect.left + 'px';
    this.containerEl.style.top = rect.bottom + 'px';
    this.containerEl.style.width = rect.width + 'px';
    this.close();

    this.inputEl.addEventListener('keyup', this.onKeyUp.bind(this));
    this.inputEl.addEventListener('keydown', this.onKeyDown.bind(this));
    this.containerEl.addEventListener('mouseover', this.onMouseOver.bind(this));
    this.containerEl.addEventListener('click', this.onClick.bind(this));
  }

  open() {
    this.containerEl.style.display = 'block';
    this.isOpen = true;
    this.cursor = 0;
  }

  close() {
    this.containerEl.style.display = 'none';
    this.containerEl.innerHTML = '';
    this.suggestions.length = 0;
    this.isOpen = false;
    this.cursor = -1;
  }

  getSuggestions(text) {
    const suggestions = [];
    const regex = new RegExp('^' + text, 'i');

    if (text.length > 0) {
      for (let tag of this.tags) {
        if (tag.match(regex)) {
          suggestions.push(tag);
        }
      }
    }

    this.suggestions = suggestions;
  }

  previousSuggestion() {
    if (this.cursor > 0) {
      this.cursor -= 1;
    }
    return this.suggestions[this.cursor];
  }

  nextSuggestion() {
    if (this.cursor < this.suggestions.length - 1) {
      this.cursor += 1;
    }
    return this.suggestions[this.cursor];
  }

  currentSuggestion() {
    return this.suggestions[this.cursor];
  }

  useCurrentSuggestion() {
    // Replace the partly entered user string with the currently selected suggestion
    const enteredTags = this.inputEl.value.split(/\s+/);
    enteredTags[enteredTags.length - 1] = this.currentSuggestion();
    this.inputEl.value = enteredTags.join(' ') + ' ';
    this.inputEl.focus();
    this.close();
  }

  onKeyDown(event) {
    if (event.keyIdentifier === 'U+0009' && this.isOpen) {
      // Use current suggestion when Tab is pressed
      event.preventDefault();
      this.useCurrentSuggestion();
    } else if (event.keyIdentifier === 'Up' && this.isOpen) {
      // Prevent 'Home' behaviour when tag suggest is open
      event.preventDefault();
    } else if (event.keyIdentifier === 'Down' && this.isOpen) {
      // Prevent 'End' behaviour when tag suggest is open
      event.preventDefault();
    }
  }

  onKeyUp(event) {
    if (event.keyIdentifier === 'U+0009') {
      event.preventDefault();
    } else if (event.keyIdentifier === 'Up') {
      event.preventDefault();
      this.previousSuggestion();
      this.highlight(this.cursor);
    } else if (event.keyIdentifier === 'Down') {
      event.preventDefault();
      this.nextSuggestion();
      this.highlight(this.cursor);
    } else {
      // Get suggestions for the current word fragment
      const words = event.target.value.split(/\s+/);
      const lastWord = words[words.length - 1];
      this.getSuggestions(lastWord);

      if (this.cursor === -1 && this.suggestions.length > 0) {
        // First char of this tag has been typed and there's a suggestion available
        this.open();
      }
      this.render();
    }
  }

  onMouseOver(event) {
    if (event.target.nodeName === 'LI') {
      // Highlight suggestion on mouse over
      const nodes = this.containerEl.getElementsByTagName('li');
      const arr = Array.prototype.slice.call(nodes);
      this.cursor = arr.indexOf(event.target);
      this.highlight(this.cursor);
    }
  }

  onClick(event) {
    event.preventDefault();
    if (event.target.nodeName === 'LI') {
      this.useCurrentSuggestion();
    }
  }

  highlight(index) {
    // Clear the currently highlighted element
    let selectedEl = this.containerEl.querySelector('.selected');
    if (selectedEl) {
      selectedEl.className = '';
    }

    // Highlight the new selection
    selectedEl = this.containerEl.querySelectorAll('li')[index];
    selectedEl.className = 'selected';
  }

  render() {
    if (this.suggestions.length > 0) {
      const lines = [];
      for (let i = 0; i < this.suggestions.length; i++) {
        lines.push(
          '<li' + (i === this.cursor ? ' class=selected>' : '>') + this.suggestions[i] + '</li>'
        );
      }
      this.containerEl.innerHTML = '<ul>' + lines.join('') + '</ul>';
    } else {
      this.close();
    }
  }

}
