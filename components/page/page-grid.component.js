/*
* PageGrid component
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

export class FtuiPageGrid extends FtuiElement {

  constructor(properties) {
    super(Object.assign(FtuiPageGrid.properties, properties));
  }

  static get properties() {
    return {
      minWidth: '150',
      gap: 20,
      padding: 20
    };
  }

  static get observedAttributes() {
    return [...this.convertToAttributes(FtuiPageGrid.properties), ...super.observedAttributes];
  }

  onAttributeChanged(name) {
    switch (name) {
      case 'min-width':
        this.style.gridTemplateColumns = 'repeat(auto-fit, minmax(' + this.minWidth + 'px , 1fr))';
        break;
      case 'gap':
        this.style.gridGap = this.gap + 'px';
        break;
      case 'padding':
        this.style.padding = '0 ' + this.padding + 'px';
        break;
    }
  }
  
  template() {
    return `<style> @import "components/page/page-grid.component.css"; </style>
    <slot></slot>`;
  }
}

window.customElements.define('ftui-page-grid', FtuiPageGrid);
