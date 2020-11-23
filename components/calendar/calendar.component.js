/*
* Calendar component
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
import  { FullCalendar }  from '../../modules/fullcalendar/main.js';

export class FtuiCalendar extends FtuiElement {
  constructor(properties) {

    super(Object.assign(FtuiCalendar.properties, properties));

    this.configuration = {
      locale: 'de',
      height: 'auto',
      initialView: 'listMonth',
      headerToolbar: {
        left: 'title',
        center: '',
        right: ''
      },
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        meridiem: false
      },
      dayHeaderDidMount: arg => {
        if (arg.isPast) {
          arg.el.classList.add('isPast');
        }
      },
      eventDidMount: arg => {
        if (arg.event.allDay) {
          arg.el.classList.add('allday')
          const title = arg.el.querySelector('.fc-list-event-title');
          title.colSpan = 3;
          let titleContent = title.querySelector('a');
          titleContent.style.backgroundColor= arg.backgroundColor;
        }

        const now = new Date();
        if (now.getTime() > arg.event.end.getTime()) {
          arg.el.classList.add('isPast');
        }
      },
      viewClassNames: arg => {
        this.updateTitle(arg.view.calendar, arg.view.title);
      }
    };

    this.calendarElement = this.shadowRoot.querySelector('#calendar');
    this.calendar = new FullCalendar.Calendar(this.calendarElement, this.configuration);

    this.dataElements = this.querySelectorAll('ftui-calendar-data');
    this.dataElements.forEach(dataElement => dataElement.addEventListener('ftuiDataChanged', () => this.onDataChanged()));
  }

  connectedCallback() {
    this.calendar.render();
    this.refresh();
  }

  template() {
    return `
      <style> @import "modules/fullcalendar/main.min.css"; </style>
      <style> @import "components/calendar/calendar.component.css"; </style>
      <div id="calendar"></div>
      <slot></slot>`;
  }

  static get properties() {
    return {
      height: 'auto',
      view: 'listWeek',
      noHeader: false
    };
  }

  static get observedAttributes() {
    return [...this.convertToAttributes(FtuiCalendar.properties), ...super.observedAttributes];
  }

  onAttributeChanged(name) {
    switch (name) {
      case 'height':
        this.calendar.setOption('height', this.height);
        this.updateTitle(this.calendar, this.calendar.view.title);
        break;
      case 'view':
        this.calendar.changeView(this.view);
        break;
      case 'no-header':
        this.calendar.setOption('headerToolbar', (this.noHeader) ? false : this.configuration.headerToolbar);
        break;
    }
  }

  refresh() {
    console.log('refresh', this.id)
    this.dataElements.forEach(dataElement => {
      dataElement.fetch();
    });
  }

  onDataChanged() {
    this.sources = [];

    this.calendar.getEventSources().forEach(source => {
      source.remove();
    });

    this.dataElements.forEach(dataElement => {
      const source = {
        color: dataElement.dataColor,
        events: dataElement.data
      };
      this.sources.push(source);
      this.calendar.addEventSource(source);
    });
  }

  updateTitle(calendar, text) {
    const tokens = text.split(' ');
    const year = tokens.pop();
    const rest = tokens.join(' ');
    const title = calendar.el.querySelector('.fc-toolbar-title');
    if (title) {
      title.innerHTML = '<span id="#title-rest">' + rest + '</span> <span id="title-year">' + year + '</span>';
    }
  }

}

window.customElements.define('ftui-calendar', FtuiCalendar);
