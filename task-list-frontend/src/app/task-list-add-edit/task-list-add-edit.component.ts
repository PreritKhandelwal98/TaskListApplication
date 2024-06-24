import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CoreService } from '../core/core.service';
import { TaskService, Task } from '../services/task.service';
import { TASK_TYPE_ICONS, TaskTypeIcons } from '../constants'; // Import task type icons and interface

@Component({
  selector: 'app-task-list-add-edit',
  templateUrl: './task-list-add-edit.component.html',
  styleUrls: ['./task-list-add-edit.component.scss']
})
export class TaskListAddEditComponent implements OnInit {
  taskForm: FormGroup;
  taskTypes: string[] = ['call', 'video call', 'meeting'];
  taskTypeIcons: TaskTypeIcons = TASK_TYPE_ICONS; // Use the interface for type safety

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
      notes:'',
      ampm:''
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

  getTaskTypeIcon(taskType: string): string {
    const lowerCaseTaskType = taskType.toLowerCase() as keyof TaskTypeIcons;
    return this.taskTypeIcons[lowerCaseTaskType] || '';
  }
  
  setDefaultDateTime() {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    const formattedTime = this.formatAMPM(currentDate.getHours(), currentDate.getMinutes());
    this.taskForm.patchValue({
      date: formattedDate,
      task_time: formattedTime,
    });
  }
  ampmOptions: string[] = ['AM', 'PM'];

  formatAMPM(hours: number, minutes: number): string {
    const formattedHours = ('0' + (hours % 12 || 12)).slice(-2);
    const formattedMinutes = ('0' + minutes).slice(-2);
    return `${formattedHours}:${formattedMinutes}`;
  }

  onFormSubmit() {
    if (this.taskForm.valid) {
      let formData = { ...this.taskForm.value };
  
      // Format task_time if necessary (ensure it aligns with backend expectations)
      formData.task_time = `${formData.task_time} ${formData.ampm}`;  
      // Append ampm to formData
      formData.ampm = formData.ampm || ''; // Ensure ampm is defined
  
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
  

  formatTimeTo24Hour(time: string): string {
    const [timePart, period] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);

    if (period === 'PM' && hours < 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${('0' + hours).slice(-2)}:${('0' + minutes).slice(-2)}`;
  }
}
