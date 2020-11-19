/*
* Calendar data component
*
* Copyright (c) 2020 Tobias Wiedenmann <thyraz@gmail.com>
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
import { fhemService } from '../../modules/ftui/fhem.service.js';
import * as ftuiHelper from '../../modules/ftui/ftui.helper.js';


export class FtuiCalendarData extends FtuiElement {
  constructor(properties) {

    super(Object.assign(FtuiCalendarData.properties, properties));
  }

  static get properties() {
    return {
      calendar: '',
      color: ''
    };
  }

  static get observedAttributes() {
    return [...this.convertToAttributes(FtuiCalendarData.properties), ...super.observedAttributes];
  }

  fetch() {
    this.fetchEvents(this.calendar);
  }

  fetchEvents(calendar) {
    const cmd = 'get ' + calendar + ' events format:custom="$U|$T1|$T2|$S|$L|$DS|$CA|$d" timeFormat:"%Y-%m-%dT%H:%M:%S"';
    fhemService.sendCommand(cmd)
      .then(response => response.text())
      .then((response) => {
        this.data = this.parseEvents(response);
        ftuiHelper.triggerEvent('ftuiDataChanged', this);
      })
  }

  parseEvents(response) {
    const data = [];
    let id, start, end, title, location, description, category, duration;
    const lines = response.split('\n');

    lines.forEach(line => {
      if (line.length > 0) {
        [id, start, end, title, location, description, category, duration] = line.split('|');
        let allDay = (start.trim().endsWith('00:00:00') && end.trim().endsWith('00:00:00'));
        data.push({ id, title, allDay, start, end, extendedProps: { location, description, category, duration } });
      }
    });

    this.dataColor = ftuiHelper.getStylePropertyValue('--color-base', this) || this.color;

    return data;
  }

  onAttributeChanged(name) {
    switch (name) {
      case 'update':
        this.fetch();
        break;
    }
    if (ftuiHelper.isDefined(this.data)) {
      ftuiHelper.triggerEvent('ftuiDataChanged', this);
    }
  }

}

window.customElements.define('ftui-calendar-data', FtuiCalendarData);
