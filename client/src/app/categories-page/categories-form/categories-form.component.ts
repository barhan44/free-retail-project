import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { CategoriesService } from '../../shared/services/categories.service';
import { MaterialService } from '../../shared/classes/material.service';
import { Category } from '../../shared/interfaces';

@Component({
  selector: 'app-categories-form',
  templateUrl: './categories-form.component.html',
  styleUrls: ['./categories-form.component.scss'],
})
export class CategoriesFormComponent implements OnInit {
  @ViewChild('file') fileRef: ElementRef;

  form: FormGroup;
  image: File;
  imagePreview: string | ArrayBuffer = '';
  isNew = true;
  category: Category;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoriesService: CategoriesService
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
    });

    this.form.disable();

    this.route.params
      .pipe(
        switchMap((params: Params) => {
          if (params['id']) {
            this.isNew = false;
            return this.categoriesService.getByID(params['id']);
          }
          return of(null);
        })
      )
      .subscribe(
        (category: Category) => {
          if (category) {
            this.category = category;
            this.form.patchValue({
              name: category.name,
            });
            this.imagePreview = category.imageSrc;
            MaterialService.updateTextInputs();
          }
          this.form.enable();
        },
        (e) => {
          MaterialService.toast(e.error.message);
        }
      );
  }

  onSubmit() {
    let obs$;
    this.form.disable();
    if (this.isNew) {
      obs$ = this.categoriesService.create(this.form.value.name, this.image);
    } else {
      obs$ = this.categoriesService.update(
        this.category._id,
        this.form.value.name,
        this.image
      );
    }
    obs$.subscribe(
      (category) => {
        this.category = category;
        MaterialService.toast('Категория сохранена!');
        this.form.enable();
        this.router.navigate(['/categories']);
      },
      (e) => {
        MaterialService.toast(e.error.message);
        this.form.enable();
      }
    );
  }

  triggerClick() {
    this.fileRef.nativeElement.click();
  }

  onFileUpload($event: any) {
    const file = $event.target.files[0];
    this.image = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview = reader.result;
    };

    reader.readAsDataURL(file);
  }

  deleteCategory() {
    const deleteConfirmed = window.confirm(
      `Подтвердите удаление категории: ${this.category.name}`
    );
    if (deleteConfirmed) {
      this.categoriesService.delete(this.category._id).subscribe(
        (response) => MaterialService.toast(response.message),
        (e) => {
          MaterialService.toast(e.error.message);
        },
        () => {
          this.router.navigate(['/categories']);
        }
      );
    }
  }
}
