import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AuthService } from '../shared/services/auth.service';
import { MaterialService } from '../shared/classes/material.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit, OnDestroy {
  form: FormGroup;
  authSub: Subscription;
  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
    });

    this.route.queryParams.subscribe((params: Params) => {
      if (params['registered']) {
        MaterialService.toast('Используйте свои данные для входа в систему');
      } else if (params['accessDenied']) {
        MaterialService.toast(
          'Доступ запрещен! Авторизуйтесь для использования системы'
        );
      } else if (params['sessionExpired']) {
        MaterialService.toast('Истек срок сессии, войдите в систему заново');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  onSubmit() {
    this.form.disable();
    this.authSub = this.auth.login(this.form.value).subscribe(
      () => this.router.navigate(['/overview']),
      (e) => {
        MaterialService.toast(e.error.message);
        this.form.enable();
      }
    );
  }
}
