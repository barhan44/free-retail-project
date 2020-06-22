import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import {
  MaterialInstance,
  MaterialService,
} from '../shared/classes/material.service';
import { OrderService } from './order.service';
import { Order, OrderPosition } from '../shared/interfaces';
import { OrdersService } from '../shared/services/orders.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-order-page',
  templateUrl: './order-page.component.html',
  styleUrls: ['./order-page.component.scss'],
  providers: [OrderService],
})
export class OrderPageComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('modal') modalRef: ElementRef;
  modal: MaterialInstance;
  isRootPage: boolean;
  pending = false;
  orderSub: Subscription;

  constructor(
    private router: Router,
    public orderService: OrderService,
    private ordersService: OrdersService
  ) {}

  ngOnInit(): void {
    this.isRootPage = this.router.url === '/order';
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isRootPage = this.router.url === '/order';
      }
    });
  }

  ngOnDestroy(): void {
    this.modal.destroy();
    if (this.orderSub) {
      this.orderSub.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    this.modal = MaterialService.initModal(this.modalRef);
  }

  openModal() {
    this.modal.open();
  }

  closeModal() {
    this.modal.close();
  }

  submitOrder() {
    this.pending = true;

    const order: Order = {
      list: this.orderService.list.map((item) => {
        delete item._id;
        return item;
      }),
    };

    this.orderSub = this.ordersService.create(order).subscribe(
      (newOrder) => {
        MaterialService.toast(`Заказ №${newOrder.order} успешно добавлен!`);
        this.orderService.clear();
      },
      (e) => MaterialService.toast(e.error.message),
      () => {
        this.modal.close();
        this.pending = false;
      }
    );
  }

  removePosition(orderPosition: OrderPosition) {
    this.orderService.remove(orderPosition);
  }
}
