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
import { FtuiCalendarData } from './calendar-data.component.js';
import  { FullCalendar }  from '../../modules/fullcalendar/main.js';

export class FtuiCalendar extends FtuiElement {
  constructor(properties) {

    super(Object.assign(FtuiCalendar.properties, properties));

    this.windowWidth = 0;
    this.initialized = false;

    this.configuration = {
      locale: 'de',
      weekNumberCalculation: 'ISO',
      height: '100%',
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
        if (arg.view.type.includes('list') && arg.event.allDay) {
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

    window.addEventListener('resize', () => {
      if (this.windowWidth !== window.innerWidth) {
        clearTimeout(this.resizeTimerHandle);
        this.resizeTimerHandle = setTimeout(() => this.updateSize(), 500);
        this.windowWidth = window.innerWidth;
      }
    });
  }

  connectedCallback() {
    this.calendar.render();
    this.refresh();
  }

  template() {
    return `
      <style> @import "modules/fullcalendar/main.min.css"; </style>
      <style> @import "components/calendar/calendar.component.css"; </style>
      <div id="calendar" class="list"></div>
      <slot></slot>`;
  }

  static get properties() {
    return {
      height: 'auto',
      view: 'listWeek', // listWeek, dayGridMonth
      noHeader: false,
      width: '',
      height: ''
    };
  }

  static get observedAttributes() {
    return [...this.convertToAttributes(FtuiCalendar.properties), ...super.observedAttributes];
  }

  onAttributeChanged(name) {
    switch (name) {
      case 'height':
        this.calendar.setOption('height', (this.height === 'auto') ? 'auto' : '100%');
        this.updateTitle(this.calendar, this.calendar.view.title);
        this.style.height = this.height;
        break;
      case 'width':
        this.style.width = this.width;
        break;
      case 'no-header':
        this.calendar.setOption('headerToolbar', (this.noHeader) ? false : this.configuration.headerToolbar);
        this.updateTitle(this.calendar, this.calendar.view.title);
        break;
        case 'view':
          this.calendar.changeView(this.view);
          if (this.view.includes('list')) {
            this.calendarElement.classList.add('list');
            this.calendarElement.classList.remove('grid');
          } else {
            this.calendarElement.classList.add('grid');
            this.calendarElement.classList.remove('list');
          }
          break;
    }
  }

  refresh() {
    console.log('refresh', this.id)
    this.dataElements.forEach(dataElement => {
      dataElement.fetch();
    });
  }

  initialLoadFinished() {
    this.updateSize();
    if (this.calendarElement.querySelector('.fc-view-harness').clientHeight == 0) {
      this.calendar.setOption('height', 'auto'); // We're in a parent without fixed height, set to autosize based on content instead of container
      this.updateTitle(this.calendar, this.calendar.view.title);
    }
    this.initialized = true;
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

    if (!this.initialized) {
      this.initialLoadFinished();
    }
  }

  updateSize() {
    this.calendarElement.classList.remove("small-grid", "medium-grid", "large-grid");

    if (this.view.toLowerCase().includes('grid')) {
      if (this.calendarElement.clientWidth <= 500) {
        this.calendarElement.classList.add('small-grid');
        this.calendar.setOption('eventDisplay', 'list-item');
        this.calendar.setOption('dayMaxEventRows', false);
      } else if (this.calendarElement.clientWidth <= 700 || this.hideTime) {
        this.calendarElement.classList.add('medium-grid');
        this.calendar.setOption('eventDisplay', 'auto');
        this.calendar.setOption('dayMaxEventRows', true);
      } else {
        this.calendarElement.classList.add('large-grid');
        this.calendar.setOption('eventDisplay', 'auto');
        this.calendar.setOption('dayMaxEventRows', true);
      }
    }
    this.updateTitle(this.calendar, this.calendar.view.title);
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
