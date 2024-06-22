import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CoreService } from '../core/core.service';
import { TaskService, Task } from '../services/task.service';

@Component({
  selector: 'app-task-list-add-edit',
  templateUrl: './task-list-add-edit.component.html',
  styleUrls: ['./task-list-add-edit.component.scss']
})
export class TaskListAddEditComponent implements OnInit {
  taskForm: FormGroup;
  taskTypes: string[] = ['Call', 'Video Call', 'Meeting'];

  constructor(
    private _fb: FormBuilder,
    private _taskService: TaskService,
    private _dialogRef: MatDialogRef<TaskListAddEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Task,
    private _coreService: CoreService
  ) {
    this.taskForm = this._fb.group({
      entity_name: '',
      date: '',
      time: '',
      task_type: '',
      contact_number: '',
      contact_person: ''
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.taskForm.patchValue(this.data);
    }
  }

  onFormSubmit() {
    if (this.taskForm.valid) {
      const formData = this.taskForm.value;

      if (this.data) {
        // Update existing task
        this._taskService.updateTask(this.data.id!.toString(), formData).subscribe({
          next: () => {
            this._coreService.openSnackBar('Task detail updated!');
            this._dialogRef.close(true);
          },
          error: (err: any) => {
            console.error(err);
          }
        });
      } else {
        // Create new task
        this._taskService.createTask(formData).subscribe({
          next: () => {
            this._coreService.openSnackBar('Task added successfully');
            this._dialogRef.close(true);
          },
          error: (err: any) => {
            console.error(err);
          }
        });
      }
    }
  }
}
