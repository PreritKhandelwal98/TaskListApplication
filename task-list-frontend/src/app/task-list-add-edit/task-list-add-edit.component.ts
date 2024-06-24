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
  taskTypes: string[] = ['call', 'video call', 'meeting'];
  ampmOptions: string[] = ['AM', 'PM'];
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
      task_time: '',
      task_type: '',
      contact_number: '',
      contact_person: '',
      notes:''
    });
  }

  ngOnInit(): void {
    if (!this.data) {
      this.setDefaultDateTime();
    } else {
      this.taskForm.patchValue(this.data);
    }
  }

  onDateChange(event: any) {
    // Extract the date part from the event value (assuming event.value is a Date object)
    const selectedDate: Date = event.value;
  
    // Create a new Date object with the date part only (time set to midnight)
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  
    // Format the newDate to YYYY-MM-DD format (as a string)
    const formattedDate: string = newDate.toISOString().split('T')[0];
  
    // Update the form control with the formatted date
    this.taskForm.patchValue({
      date: formattedDate
    });
  }
  
  setDefaultDateTime() {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    const formattedTime = this.formatAMPM(currentDate); // Utilize the formatAMPM method here
    const ampm = currentDate.getHours() >= 12 ? 'PM' : 'AM';
    this.taskForm.patchValue({
      date: formattedDate,
      task_time: formattedTime,
      ampm: ampm
    });
  }

  formatAMPM(date: Date) {
    let hours = date.getHours();
    let minutes: any = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const strTime = hours + ':' + minutes;
    return strTime;
  }

  onFormSubmit() {
    if (this.taskForm.valid) {
      const formData = this.taskForm.value;
      console.log(formData);
      
      if (this.data) {
        // Update existing task
        this._taskService.updateTask(this.data._id!.toString(), formData).subscribe({
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
