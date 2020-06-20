import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MaterialService } from '../../classes/material.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements AfterViewInit {
  @ViewChild('floatButton') floatButtonRef: ElementRef;

  links = [
    {
      url: '/overview',
      name: 'Обзор',
    },
    {
      url: '/analytics',
      name: 'Аналитика',
    },
    {
      url: '/history',
      name: 'История',
    },
    {
      url: '/order',
      name: 'Добавить заказ',
    },
    {
      url: '/categories',
      name: 'Ассортимент',
    },
  ];

  constructor(private auth: AuthService, private router: Router) {}

  ngAfterViewInit(): void {
    MaterialService.initFloatButton(this.floatButtonRef);
  }

  logout($event: Event) {
    $event.preventDefault();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
