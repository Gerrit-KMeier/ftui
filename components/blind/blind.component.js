/* 
* Blind widget for FTUI version 3
*
* https://github.com/knowthelist/ftui
*/

import { FtuiElement } from '../element.component.js';
import { FtuiIconMulticolor } from '../icon/icon-multicolor.component.js';
import { Rangeable } from '../../modules/rangeable/rangeable.min.js';
import { isVisible } from '../../modules/ftui/ftui.helper.js';
import { fhemService } from '../../modules/ftui/fhem.service.js';

export class FtuiBlind extends FtuiElement {

  constructor(properties) {
    super(Object.assign(FtuiBlind.properties, properties));

    this.input = this.shadowRoot.querySelector('input');
    this.elementIcon = this.shadowRoot.querySelector('#icon');
    this.elementButtonUp = this.shadowRoot.querySelector('#button-up');
    this.elementButtonStop = this.shadowRoot.querySelector('#button-stop');
    this.elementButtonDown = this.shadowRoot.querySelector('#button-down');

    this.currentIcon = 'blind_closed';

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

    this.elementButtonUp.addEventListener('click', () => this.onButtonClick(this.elementButtonUp));
    this.elementButtonStop.addEventListener('click', () => this.onButtonClick(this.elementButtonStop));
    this.elementButtonDown.addEventListener('click', () => this.onButtonClick(this.elementButtonDown));
    
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
    <style> @import "components/blind/blind.component.css"; </style>

    <div class="row" id="container">
      <div id="icon-container">
      <ftui-icon-multicolor id="icon" name="blind" iterations="-1" autoplay="0"></ftui-icon-multicolor>
      </div>
      <div id="right-container">
        <div class="row">
          <div id="label-container">
            <div id="label">${this.title}</div>
          </div>
          <div id="button-container">
            <div id="button-down">
              <ftui-icon name="chevron-down"></ftui-icon>
            </div>
            <div id="button-stop">
              <ftui-icon name="square"></ftui-icon>
            </div> 
            <div id="button-up">
              <ftui-icon name="chevron-up"></ftui-icon>
            </div> 
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
      title: 'BLIND',

      step: 1,
      min: 0,
      max: 100,
      value: -99,

      stop: '',
      
      path: 'icons/multicolor',
      type: 'svg',
      icon: 'blind',

      debounce: 2000
    };
  }

  static get observedAttributes() {
    return [...this.convertToAttributes(FtuiBlind.properties), ...super.observedAttributes];
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
        this.elementIcon.animationPosition = 1.0 - (Number(newValue) / this.max);
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
    if (sender === this.elementButtonUp) {
      this.value = this.max; 
    } else if (sender === this.elementButtonStop && this.stop.length > 0) {
         fhemService.updateFhem(this.stop);
    } else if (sender === this.elementButtonDown) {
       this.value = this.min;
    }
  }
}

window.customElements.define('ftui-blind', FtuiBlind);
