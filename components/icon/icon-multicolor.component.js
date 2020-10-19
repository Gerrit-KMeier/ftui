/*
 * Multicolor Icon widget for FTUI version 3
 *
 * https://github.com/knowthelist/ftui
 */

import { FtuiIcon } from "../icon/icon.component.js";

export class FtuiIconMulticolor extends FtuiIcon {
  constructor(properties) {
    super(Object.assign(FtuiIconMulticolor.properties, properties));

    this.animations = [];

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
    this.applyThemeColors();
    this.loadAnimations();

    this.animate();
  }

  applyThemeColors() {
    const colorElements = this.elementIcon.querySelectorAll('[id*=color_]');
    colorElements.forEach((colorElement) => {
      const color = '--' + colorElement.id.split('_')[1];

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

  /* Creates animations based on svg group element class names. */
  /* Example wiggle animation: rotate_0_0_25_-5_50_0_75_5_100_0 -> 0%: 0°, 25%: -5°, 50%: 0°, 75%: 5°, 100%: 0° */
  loadAnimations() {
    this.animations = [];
    const animElements = this.elementIcon.querySelectorAll('[id*=rotate_], [id*=translate_]');

    animElements.forEach((animElement) => {
      const tokens = animElement.id.split('_')
      const type = tokens.shift();
      const keyframes = [];
      var tokensPerKeyframe = 0;

      switch (type) {
        case 'rotate':
        case 'color':
          tokensPerKeyframe = 2;
          break;
        case 'translate':
          tokensPerKeyframe = 3;
          break;
      }

      for (var i = 0; i < tokens.length/tokensPerKeyframe; i++) {
        var offset = (tokens[i*tokensPerKeyframe] / 100);
        var transform = '';

        switch (type) {
          case 'rotate':
            transform = 'translate3D(50%, 50%, 0) rotate(' + tokens[i*tokensPerKeyframe+1] + 'deg) translate3D(-50%, -50%, 0)';  // Rotate around center instead the default (top left corner)
            break;
          case 'translate':
            transform = 'translate3D(' + tokens[i*tokensPerKeyframe+1] + 'px, ' + tokens[i*tokensPerKeyframe+2] + 'px, 0)';  // Rotate around center instead the default (top left corner)
            break;
        }

        keyframes.push({ offset, transform });
      }

      this.animations.push({ element: animElement, keyframes: keyframes });
    });
  }

  animate() {
    this.animations.forEach(({element, keyframes}) => {
      element.animate(keyframes, {duration: 500, iterations: 2});
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
