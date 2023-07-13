function getSelectTemplate(selectClass, tabIndex) { 
  return `
          <svg display="none">
            <symbol viewBox="0 0 24 24" id="chevron-icon">
              <g id="Complete">
                <g id="F-Chevron">
                  <polyline fill="none" id="Down" points="5 8.5 12 15.5 19 8.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                </g>
              </g>
            </symbol>
          </svg>

          <div class= "${selectClass}__input" data-type="select_input" tabindex="${tabIndex}"
            aria-controls="[data-select]">
            <span data-type="select_input_content"></span>
            <svg>
              <use xlink:href="#chevron-icon">
            </svg>
          </div>
          <div class="${selectClass}__dropdown" data-type="select_dropdown" data-hidden>
            <ul data-type="select_options_list"></ul>
          </div>  
        `;
}

export class Select {
  constructor($insetElement, {
    options = [],
    indexOfSelectedOption = 0,
    selectClass = 'ui-select',
    tabIndex = '1'
  } = {}) {
    this.selectClass = String(selectClass);
    this.tabIndex = String(tabIndex);
    this.$insetElement = $insetElement;
    this.options = options;
    this.indexOfSelectedOption = Number(indexOfSelectedOption);

    if (!(this.$insetElement instanceof HTMLElement)) {
      throw new Error('Selected Element is not HTML element');
    }

    if (!Array.isArray(this.options)) throw new Error('Options element must be Array');

    this.options.forEach(option => {
      option = String(option);
    });

    this.#render(this.$insetElement);
    this.#setup();
  }
  
  get $selectInput() {
    return this.$insetElement.querySelector('[data-type="select_input"]');
  }

  get $selectDropdown() {
    return this.$insetElement.querySelector('[data-type="select_dropdown"]');
  }

  get $selectChevronIcon() {
    return this.$selectInput.querySelector('svg');
  }

  get $selectOptionsList() {
    return this.$insetElement.querySelector('ul[data-type="select_options_list"]');
  }

  get isOpen() {
    const dropdownDataHidden = Object.keys(this.$selectDropdown.dataset);

    if (dropdownDataHidden.includes('hidden')) return false;
    return true;
  }

  #render(insetElement) {
    const $select = document.createElement('div');

    $select.className = this.selectClass;
    $select.dataset.select = '';
    $select.innerHTML = getSelectTemplate(this.selectClass, this.tabIndex);

    const $selectOptionsList = $select.querySelector('ul[data-type="select_options_list"]'),
          $selectInputField = $select.querySelector('span[data-type="select_input_content"]'),
          selectInputValue = this.options[this.indexOfSelectedOption];

    $selectInputField.dataset.value = selectInputValue;
    $selectInputField.innerHTML = $selectInputField.dataset.value;

    if (this.options.length) {
      for (let index = 0; index < this.options.length; index++) {
        const $listOptionItem = document.createElement('li');
        $listOptionItem.dataset.type = 'select__option';
        $listOptionItem.setAttribute('tabindex', String(Number(this.tabIndex) + index));
        $listOptionItem.dataset.value = this.options[index];
        $listOptionItem.innerHTML = this.options[index];

        $selectOptionsList.append($listOptionItem);
      }
    }

    insetElement.innerHTML = '';
    insetElement.prepend($select);
  }

  #setup() {
    this.$selectInput.addEventListener('click', this.#selectClickHandler.bind(this));
    window.addEventListener('click', this.#windowClickHandler.bind(this));
    window.addEventListener('keydown', this.#windowKeyHandler.bind(this));
    this.$selectOptionsList.addEventListener('click', this.#selectListOptionHandler.bind(this));
  }

  #selectClickHandler() {
    return this.isOpen ? this.close() : this.open();
  }

  #windowClickHandler(event) {
    if (!event.target.closest('[data-select]') && this.isOpen === true) {
      return this.close();
    }
  }

  #windowKeyHandler(event) {
    if (event.key === 'Escape' && this.isOpen === true) {
      return this.close();
    }
  }

  #selectListOptionHandler(event) {
    if (event.target.closest('li[data-type="select__option"]')) {
      const $selectedOption = event.target.closest('li[data-type="select__option"]'),
            $selectInputField = event.target.closest('[data-select]')
              .querySelector('[data-type="select_input_content"]');

      $selectInputField.dataset.value = $selectedOption.dataset.value;
      $selectInputField.innerHTML = $selectInputField.dataset.value;
      this.close();
    }
  }

  open() {
    delete this.$selectDropdown.dataset.hidden;
    this.$selectChevronIcon.dataset.show = '';
  }

  close() {
    this.$selectDropdown.dataset.hidden = '';
    delete this.$selectChevronIcon.dataset.show;
  } 

  remove() {
    this.$insetElement.remove();
    window.removeEventListener('click', this.#windowClickHandler.bind(this));
    window.removeEventListener('keydown', this.#windowKeyHandler.bind(this));
    this.$selectOptionsList.removeEventListener('click', this.#selectListOptionHandler.bind(this));
  }
}