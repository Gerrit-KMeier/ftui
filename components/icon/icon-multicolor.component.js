/*
 * Multicolor Icon widget for FTUI version 3
 *
 * https://github.com/knowthelist/ftui
 */

import { FtuiIcon } from "../icon/icon.component.js";
import * as ftui from '../../modules/ftui/ftui.helper.js';

export class FtuiIconMulticolor extends FtuiIcon {
  constructor(properties) {
    super(Object.assign(FtuiIconMulticolor.properties, properties));
    
    this.keyframes = [];
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

  set animationPosition(position) {
    const paused = (this.animations?.[0]?.playState === 'paused');
    position = (position == 1) ? 0.999 : position; // currentTime equal to the end of the animation will reset the animaton
    this.animations.forEach(animation => {
      if (!paused) {
        animation.play();
        animation.pause();
      } 
      animation.currentTime = position * this.duration * 1000;
    });
  }

  get animationOptions() {
    return {
      duration: this.duration * 1000, 
      iterations: (this.iterations == -1) ? Infinity : this.iterations,
      direction: this.direction
    };
  }

  static get properties() {
    return {
      path: 'icons/multicolor',
      duration: 1.0,            // in seconds
      iterations: 1,            // -1 for infinite
      direction: 'normal',      // normal, reverse, alternate, alternate-reverse
      autoplay: 1               // start animation automatically when the icon changed
    };
  }

  static get observedAttributes() {
    return [...this.convertToAttributes(FtuiIconMulticolor.properties), ...super.observedAttributes];
  }

  onAttributeChanged(name, oldValue, newValue) {
    super.onAttributeChanged(name, oldValue, newValue);
    const running = (this.animations?.[0]?.playState === 'running');
    switch (name) {
      case 'duration':
      case 'iterations':
      case 'direction':
        this.prepareAnimations();
        if (running) {
          this.animate();
        } 
        break;
    }
  }

  onIconChanged() {
    this.applyThemeColors();
    this.loadKeyframes();
    this.prepareAnimations();

    if (this.autoplay) {
      this.animate();
    } 
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

  loadKeyframes() {
    this.keyframes = [];
    const animElements = this.elementIcon.querySelectorAll('[id*=rotate_], [id*=translate_]');

    animElements.forEach((animElement) => {
      const tokens = animElement.id.split('_')
      const type = tokens.shift();
      const currentKeyframes = [];
      var tokensPerKeyframe = 0;
      var keyframeCount = 0;

      switch (type) {
        case 'rotate':
        case 'color':
          tokensPerKeyframe = 2;
          break;
        case 'translate':
          tokensPerKeyframe = 3;
          break;
      }

      keyframeCount = Math.floor(tokens.length / tokensPerKeyframe); // round to floor because Figma adds addtional _2, _3, ... to identical id names which need to be ignored

      for (var i = 0; i < keyframeCount; i++) {
        var offset = (tokens[i * tokensPerKeyframe] / 100);
        var transform = '';

        switch (type) {
          case 'rotate':
            transform = 'translate3D(50%, 50%, 0) rotate(' + tokens[i*tokensPerKeyframe+1] + 'deg) translate3D(-50%, -50%, 0)';  // Rotate around center instead the default (top left corner)
            break;
          case 'translate':
            transform = 'translate3D(' + tokens[i*tokensPerKeyframe+1] + 'px, ' + tokens[i*tokensPerKeyframe+2] + 'px, 0)';  // Rotate around center instead the default (top left corner)
            break;
        }
        currentKeyframes.push({ offset, transform });
      }
      
      this.keyframes.push({element: animElement, keyframes: currentKeyframes });
    });
  }

  prepareAnimations() {
    this.animations = [];

    this.keyframes.forEach(({element, keyframes}) => {
      const animation = element.animate(keyframes, this.animationOptions);
      animation.pause();
      this.animations.push(animation);
    });
  }

  animate() {
    this.animations.forEach(animation => {
      animation.play();
    });
  }
}

window.customElements.define("ftui-icon-multicolor", FtuiIconMulticolor);
