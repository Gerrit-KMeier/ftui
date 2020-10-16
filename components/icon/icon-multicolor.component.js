/*
 * Multicolor Icon widget for FTUI version 3
 *
 * https://github.com/knowthelist/ftui
 */

import { FtuiIcon } from "../icon/icon.component.js";

export class FtuiIconMulticolor extends FtuiIcon {
  constructor(properties) {
    super(Object.assign(FtuiIconMulticolor.properties, properties));

    const observerOptions = {
      childList: true,
      attributes: false,
      subtree: false,
    };

    const observer = new MutationObserver(() => {
      this.onIconChanged();
    });
    observer.observe(this.elementIcon, observerOptions);
  }

  template() {
    return `
        <style> @import "components/icon/icon-multicolor.component.css"; </style>
        <span id="icon"></span>
        <slot></slot>
      `;
  }

  onIconChanged() {
    const colorElements = this.elementIcon.querySelectorAll('[class*=color_]');
    colorElements.forEach((colorElement) => {
      const color = '--' + colorElement.classList[0].split('_')[1];

      const fillElements = colorElement.querySelectorAll('[fill]')
      fillElements.forEach(fillElement => {
        const fill = 'var(' + color + ', ' + fillElement.getAttribute('fill') + ')';
        fillElement.setAttribute('fill', fill);
      });

      const strokeElements = colorElement.querySelectorAll('[stroke]')
      strokeElements.forEach(strokeElement => {
        const stroke = 'var(' + color + ', ' + strokeElement.getAttribute('stroke') + ')';
        strokeElement.setAttribute('stroke', stroke);
      });
    });
  }

  static get properties() {
    return {
      path: 'icons/multicolor',
      duration: 1,
      iterations: 1,
    };
  }
}

window.customElements.define("ftui-icon-multicolor", FtuiIconMulticolor);
