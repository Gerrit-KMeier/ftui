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
        // // Swap columns
        // // const date = arg.el.querySelector('');
        // // const graphic = arg.el.querySelector('');
        // // const title = arg.el.querySelector('');
        const [date, graphic, title] = arg.el.childNodes;
        // arg.el.insertBefore(graphic, date);

        if (arg.event.allDay) {
          let titleContent = title.querySelector('a');
          titleContent.style.backgroundColor= 'var(--blue)';
          titleContent.style.padding = '2px 10px';
          titleContent.style.borderRadius = '5px';
          graphic.style.display = 'none';
          date.style.display = 'none';
          title.style.paddingLeft = '25px';
          title.colSpan = 3;
        }

        if (arg.isPast) {
          arg.el.classList.add('isPast');
        }
      },
      viewClassNames: arg => {
        this.updateTitle(arg.view.calendar, arg.view.title);
      }
    };

    this.calendarElement = this.shadowRoot.querySelector('#calendar');
    this.calendar = new FullCalendar.Calendar(this.calendarElement, this.configuration);
    this.calendar.render();

    this.dataElements = this.querySelectorAll('ftui-calendar-data');
    this.dataElements.forEach(dataElement => dataElement.addEventListener('ftuiDataChanged', () => this.onDataChanged()));
  }

  connectedCallback() {
    window.requestAnimationFrame(() => {
      this.refresh();
    })
  }

  template() {
    return `
      <style> @import "modules/fullcalendar/main.min.css"; </style>
      <style> @import "components/calendar/calendar.component.css"; </style>
      <div id="calendar"></div>`;
  }

  static get properties() {
    return {
      height: 'auto',
      view: 'listWeek'
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
        // color: dataElement.color,
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
    title.innerHTML = '<span id="#title-rest">' + rest + '</span> <span id="title-year">' + year + '</span>';
  }

}

window.customElements.define('ftui-calendar', FtuiCalendar);
