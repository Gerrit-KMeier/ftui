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

  constructor() {
    const properties = {
      
    };
    super(properties);
  }
  
  template() {
    return `<style> @import "components/page/page-grid.component.css"; </style>
    <slot></slot>`;
  }
}

window.customElements.define('ftui-page-grid', FtuiPageGrid);
