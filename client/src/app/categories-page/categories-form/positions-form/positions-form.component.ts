import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { PositionsService } from '../../../shared/services/positions.service';
import { Position } from '../../../shared/interfaces';
import {
  MaterialInstance,
  MaterialService,
} from '../../../shared/classes/material.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-positions-form',
  templateUrl: './positions-form.component.html',
  styleUrls: ['./positions-form.component.scss'],
})
export class PositionsFormComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @Input('categoryID') categoryID: string;
  @ViewChild('modal') modalRef: ElementRef;

  positions: Position[] = [];
  loading = false;
  positionID = null;
  modal: MaterialInstance;
  form: FormGroup;

  constructor(private positionsService: PositionsService) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      cost: new FormControl(null, [Validators.required, Validators.min(1)]),
    });

    this.loading = true;
    this.positionsService
      .fetchAllPositions(this.categoryID)
      .subscribe((positions) => {
        this.positions = positions;
        this.loading = false;
      });
  }

  ngOnDestroy(): void {
    this.modal.destroy();
  }

  ngAfterViewInit(): void {
    this.modal = MaterialService.initModal(this.modalRef);
  }

  onSelectPosition(position: Position) {
    this.positionID = position._id;
    this.form.patchValue({
      name: position.name,
      cost: position.cost,
    });
    this.modal.open();
    MaterialService.updateTextInputs();
  }

  onAddPosition() {
    this.positionID = null;
    this.modal.open();
    this.form.reset();
  }

  onCancel() {
    this.modal.close();
  }

  onSubmit() {
    this.form.disable();
    const newPosition: Position = {
      name: this.form.value.name,
      cost: this.form.value.cost,
      category: this.categoryID,
    };

    if (this.positionID) {
      newPosition._id = this.positionID;
      this.positionsService.update(newPosition).subscribe(
        (position: Position) => {
          const idx = this.positions.findIndex((p) => p._id === position._id);
          this.positions[idx] = position;
          MaterialService.toast('Позиция успешно отредактирована!');
        },
        (e) => MaterialService.toast(e.error.message),
        () => {
          this.modal.close();
          this.form.reset();
          this.form.enable();
        }
      );
    } else {
      this.positionsService.create(newPosition).subscribe(
        (position: Position) => {
          MaterialService.toast('Позиция успешно создана!');
          this.positions.push(position);
        },
        (e) => MaterialService.toast(e.error.message),
        () => {
          this.modal.close();
          this.form.reset();
          this.form.enable();
        }
      );
    }
  }

  onDeletePosition($event: Event, position: Position) {
    $event.stopPropagation();
    const deleteConfirmed = window.confirm(
      `Удалить позицию: ${position.name}?`
    );
    if (deleteConfirmed) {
      this.positionsService.delete(position).subscribe(
        (response) => {
          const idx = this.positions.findIndex((p) => p._id === position._id);
          this.positions.splice(idx, 1);
          MaterialService.toast(response.message);
        },
        (e) => MaterialService.toast(e.error.message)
      );
    }
  }
}
