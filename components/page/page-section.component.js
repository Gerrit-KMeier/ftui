/*
* PageSection component
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

export class FtuiPageSection extends FtuiElement {

  constructor(properties) {
    super(properties);
  }
  
  template() {
    return `<style> @import "components/page/page-section.component.css"; </style>
    <slot></slot>`;
  }
}

window.customElements.define('ftui-page-section', FtuiPageSection);
