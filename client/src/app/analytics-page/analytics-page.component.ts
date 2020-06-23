import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Chart } from 'chart.js';
import { AnalyticsService } from '../shared/services/analytics.service';
import { AnalyticsPage } from '../shared/interfaces';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-analytics-page',
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.scss'],
})
export class AnalyticsPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gain') gainRef: ElementRef;
  @ViewChild('order') orderRef: ElementRef;

  analyticsSub: Subscription;
  average: number;
  pending = true;

  constructor(private analyticsService: AnalyticsService) {}

  ngAfterViewInit(): void {
    const gainConfig: any = {
      label: 'Выручка',
      color: 'rgb(255, 99, 132)',
    };

    const orderConfig: any = {
      label: 'Заказы',
      color: 'rgb(54, 162, 235)',
    };

    this.analyticsSub = this.analyticsService
      .getAnalytics()
      .subscribe((data: AnalyticsPage) => {
        this.average = data.average;
        gainConfig.labels = data.chart.map((item) => item.label);
        gainConfig.data = data.chart.map((item) => item.gain);

        orderConfig.labels = data.chart.map((item) => item.label);
        orderConfig.data = data.chart.map((item) => item.order);

        const gainContext = this.gainRef.nativeElement.getContext('2d');
        const orderContext = this.orderRef.nativeElement.getContext('2d');
        gainContext.canvas.height = '300px';
        orderContext.canvas.height = '300px';

        new Chart(gainContext, createChartConfig(gainConfig));
        new Chart(orderContext, createChartConfig(orderConfig));

        this.pending = false;
      });
  }

  ngOnDestroy(): void {
    if (this.analyticsSub) {
      this.analyticsSub.unsubscribe();
    }
  }
}

function createChartConfig({ labels, data, label, color }) {
  return {
    type: 'line',
    options: {
      responsive: true,
    },
    data: {
      labels,
      datasets: [
        { label, data, borderColor: color, steppedLine: false, fill: false },
      ],
    },
  };
}
