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

  // Computed getter for seperated events for each day of an multiday-event, so we see enough dots in the dot-view
  get splittedData() {
    let events = [];

    if (this.data) {
      this.data.forEach(event => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);

        if (!this.isSameDay(eventStart, eventEnd)) {
          const startDay = new Date(eventStart.getTime()).setHours(0,0,0,0);
          const endDay = new Date(eventEnd.getTime()).setHours(0,0,0,0);
          const days = Math.round(endDay - startDay) / 86400000;
          const format = 'YYYY-MM-DDThh:mm:ss'

          let currentDayStart = new Date(startDay);
          let nextDayStart = new Date(currentDayStart)
          nextDayStart.setDate(nextDayStart.getDate() + 1);
          for (let i = 0; i < days; i++) { 
            let clone = {...event};
            if (i == 0) {
              clone.start = ftuiHelper.dateFormat(eventStart, format);
              clone.end = ftuiHelper.dateFormat(nextDayStart, format);
            } else if (i == days) {
              clone.start = ftuiHelper.dateFormat(currentDayStart, format);
              clone.end = ftuiHelper.dateFormat(eventEnd, format);
            } else {
              clone.start = ftuiHelper.dateFormat(currentDayStart, format);
              clone.end = ftuiHelper.dateFormat(nextDayStart, format);
            }
            clone.id += '_' + i;
            events.push(clone);

            currentDayStart = nextDayStart;
            nextDayStart = new Date(currentDayStart)
            nextDayStart.setDate(currentDayStart.getDate() + 1);
          }
        } else {
          events.push(event);
        }
      });
    }

    return events;
  }

  fetch() {
    this.fetchEvents(this.calendar);
  }

  fetchEvents(calendar) {
    const cmd = 'get ' + calendar + ' events format:custom="$U|$T1|$T2|$S|$L|$DS|$CA|$d" timeFormat:"%Y-%m-%dT%H:%M:%S" limit:from=-31d,to=+31d';
    fhemService.sendCommand(cmd)
      .then(response => response.text())
      .then((response) => {
        this.data = this.parseEvents(response);
        this.dataColor = ftuiHelper.getStylePropertyValue('--color-base', this) || this.color;
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

        // // Fake data for anonymized screenshots
        // const words = 'Lorem Ipsum Dolor Consectetur Adipiscing Elit'.split(' ');
        // title = words[Math.floor(Math.random()*words.length)]; 

        let allDay = (start.trim().endsWith('00:00:00') && end.trim().endsWith('00:00:00'));
        data.push({ id, title, allDay, start, end, extendedProps: { location, description, category, duration } });
      }
    });

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

  isSameDay(date1, date2) {
    date2.setSeconds(date2.getSeconds() -1); // Remove one seconds, so 00:00 enddates only count to the day before
    return date1.getFullYear() === date2.getFullYear() 
      &&
      date1.getMonth() === date2.getMonth() 
      &&
      date1.getDate() === date2.getDate();
  }

}

window.customElements.define('ftui-calendar-data', FtuiCalendarData);
