/*
* Dimmer component
*
* Copyright (c) 2019-2020 Tobias Wiedenmann <thyraz@gmail.com>
* Under MIT License (http://www.opensource.org/licenses/mit-license.php)
* 
*
* for FTUI version 3
*
* Copyright (c) 2019-2020 Mario Stephan <mstephan@shared-files.de>
* Under MIT License (http://www.opensource.org/licenses/mit-license.php)
*
* https://github.com/knowthelist/ftui
*/

import { FtuiElement } from '../element.component.js';
import { FtuiIconMulticolor } from '../icon/icon-multicolor.component.js';
import { Rangeable } from '../../modules/rangeable/rangeable.min.js';
import { isVisible } from '../../modules/ftui/ftui.helper.js';

export class FtuiDimmer extends FtuiElement {
  
  constructor(properties) {
    super(Object.assign(FtuiDimmer.properties, properties));

    this.input = this.shadowRoot.querySelector('input');
    this.elementIcon = this.shadowRoot.querySelector('#icon');
    this.elementButtonOn = this.shadowRoot.querySelector('#button-on');
    this.elementButtonOff = this.shadowRoot.querySelector('#button-off');

    this.currentIcon = 'bulb_off';

    this.rangeable = new Rangeable(this.input, {
      vertical: false,
      tooltips: true,
      min: this.min,
      max: this.max,
      step: this.step,
      onStart: () => this.onSliderStart(),
      onChange: (value) => this.onSliderChanged(Number(value)),
      onEnd: () => this.onSliderEnd()
    });

    this.elementButtonOn.addEventListener('click', () => this.onButtonClick(this.elementButtonOn));
    this.elementButtonOff.addEventListener('click', () => this.onButtonClick(this.elementButtonOff));
    
    // Force re-render on device rotation 
    window.addEventListener("orientationchange", () => setTimeout(() => this.rangeable.update(), 100) , false);

    // Force re-render if visible 
    document.addEventListener('tabVisiblityChanged', () => {
      if (isVisible(this)) {
        this.rangeable.update();
      }
    }, false);
  }

  template() {
    return `
    <style> @import "modules/rangeable/rangeable.min.css"; </style>
    <style> @import "components/dimmer/dimmer.component.css"; </style>

    <div class="row" id="container">
      <div id="icon-container">
        <ftui-icon-multicolor id="icon" iterations="2"></ftui-icon-multicolor>
      </div>
      <div id="right-container">
        <div class="row">
          <div id="label-container">
            <div id="label">${this.title}</div>
          </div>
          <div id="button-container">
            <div id="button-on">On</div>
            <div id="button-off">Off</div>
          </div>
        </div>
        <div class="row">
          <div id="range-container">
            <input class="range" type="range">
          </div>
        </div>
      </div>
      <div id="side-spacer"></div>
    </div>`;
  }

  static get properties() {
    return {
      title:   'LIGHT',

      step: 1,
      min: 0,
      max: 100,
      value: -99,
      
      path: 'icons/multicolor',
      type: 'svg',
      iconOn: 'bulb_on',
      iconOff: 'bulb_off',

      debounce: 500
    };
  }

  static get observedAttributes() {
    return [...this.convertToAttributes(FtuiDimmer.properties), ...super.observedAttributes];
  }

  onAttributeChanged(name, oldValue, newValue) {
    switch (name) {
      case 'path':
      case 'type':   
        this.elementIcon.path = this.path;
        this.elementIcon.type = this.type;
        break;
      case 'min':
      case 'max':
        this.input.min = this.min;
        this.input.max = this.max;
        this.rangeable.update();
        break;
      case 'value':
        if (!this.isDragging || (oldValue == this.min || newValue == this.min)) { 
          this.currentIcon = (this.value > this.min) ? this.iconOn : this.iconOff;
          this.elementIcon.name = this.currentIcon;
        }
        this.elementButtonOn.className = (this.value > this.min) ? "button-active" : "button-inactive";
        this.elementButtonOff.className = (this.value > this.min) ? "button-inactive" : "button-active";
        this.rangeable.setValue(Number(this.value));
        this.rangeable.update();
        break;
    }
  }

  onSliderStart() {
    this.isDragging = true;
  }
  
  onSliderChanged(value) {
    if (this.value !== null && this.value !== value) {
      if (this.isDragging ) {
        this.value = value;
      }
    }
  }

  onSliderEnd() {
    this.isDragging = false;
  }
  
  onButtonClick(sender) {
    if (sender === this.elementButtonOn) {
      this.value = this.max; 
    } else if (sender === this.elementButtonOff) {
      this.value = this.min; 
    }
  }
}

window.customElements.define('ftui-dimmer', FtuiDimmer);
