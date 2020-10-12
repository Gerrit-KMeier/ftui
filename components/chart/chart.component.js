/* 
* Chart component for FTUI version 3
*
* Copyright (c) 2020 Mario Stephan <mstephan@shared-files.de>
* Under MIT License (http://www.opensource.org/licenses/mit-license.php)
* 
* https://github.com/knowthelist/ftui
*/

import { FtuiElement } from '../element.component.js';
import { FtuiChartData } from './chart-data.component.js';
import { Chart } from '../../modules/chart.js/chart.js';
import '../../modules/chart.js/chartjs-adapter-date-fns.bundle.min.js';


export class FtuiChart extends FtuiElement {
  constructor(properties) {

    super(Object.assign(FtuiChart.properties, properties));

    this.dataElements = this.querySelectorAll('ftui-chart-data');
    this.chartElement = this.shadowRoot.querySelector('#chart');

    this.configuration = {
      type: 'line',
      data: {
        datasets: []
      },
      options: {
        responsive: true,
        title: {
          display: true,
          text: 'Custom Chart Title',
          font: {
            size: getComputedStyle(this).getPropertyValue('--chart-title-font-size').trim() || 16,
            style: '500',
            color: getComputedStyle(this).getPropertyValue('--light-color').trim()
          }
        },
        legend: {
          labels: {
            usePointStyle: true,
            boxWidth: 6,
            padding: 8,
            font: {
              size: getComputedStyle(this).getPropertyValue('--chart-legend-font-size').trim() || 13
            }
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              parser: 'yyyy-MM-dd_HH:mm:ss',
              displayFormats: { millisecond: 'HH:mm:ss.SSS', second: 'HH:mm:ss', minute: 'HH:mm', hour: 'HH:mm', day: 'D. MMM' } 
            },
            gridLines: {
              color: getComputedStyle(this).getPropertyValue('--dark-color').trim()
            },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              autoSkipPadding: 30,
              font: {
                size: getComputedStyle(this).getPropertyValue('--chart-tick-font-size').trim() || 11
              }
            }
          },
          y: {
            scaleLabel: {
              labelString: 'value'
            },
            gridLines: {
              color: getComputedStyle(this).getPropertyValue('--dark-color').trim()
            },
            ticks: {
              autoSkip: true,
              autoSkipPadding: 30,
              font: {
                size: getComputedStyle(this).getPropertyValue('--chart-tick-font-size').trim() || 11
              }
            }
          }
        }
      }
    };

    this.dataElements.forEach(dataElement => dataElement.addEventListener('ftuiDataChanged', () => this.updateDatasets()));

    Chart.defaults.font.color = getComputedStyle(this).getPropertyValue('--medium-color').trim(); /* Default font color */
    Chart.defaults.font.family = getComputedStyle(this).getPropertyValue('--font-family').trim();
    this.chart = new Chart(this.chartElement, this.configuration);

    // TODO: Why does the size not fit sometimes?
    this.chartElement.style.height = this.width;
    this.chartElement.style.width = this.height;

    this.updateDatasets();
  }

  template() {
    return `
      <style> @import "components/chart/chart.component.css"; </style>

      <canvas id="chart"></canvas>
      <slot></slot>`;
  }

  static get properties() {
    return {
      title: '',
      height: '100%',
      width: '100%'
    };
  }

  static get observedAttributes() {
    return [...Object.keys(FtuiChart.properties), ...super.observedAttributes];
  }

  onAttributeChanged(name) {
    switch (name) {
      case 'title':
        this.configuration.options.title.text = this.title;
        this.configuration.options.title.display = (this.title?.length > 0);
        this.chart.update();
        break;
    }
  }

  updateDatasets() {
    this.configuration.data.datasets = [];
    this.dataElements.forEach(dataElement => {
      const dataset = {};
      Object.keys(FtuiChartData.properties).forEach(property => {
        dataset[property] = dataElement[property];
      });
      dataset.borderColor = getComputedStyle(this).getPropertyValue('--' + dataset.borderColor).trim() || dataset.borderColor;
      dataset.backgroundColor = (dataset.backgroundColor.length === 0) ? Chart.helpers.color(dataset.borderColor).alpha(0.2).rgbString() : dataset.backgroundColor;
      dataset.pointBackgroundColor = dataset.borderColor;
      dataset.data = dataElement.data;
      this.configuration.data.datasets.push(dataset);
    });
    this.chart.update();
  }

}

window.customElements.define('ftui-chart', FtuiChart);
