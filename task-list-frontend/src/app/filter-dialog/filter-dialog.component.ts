import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TASK_TYPE_ICONS, TaskTypeIcons } from '../constants'; // Import task type icons and interface

@Component({
  selector: 'app-filter-dialog',
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['./filter-dialog.component.scss']
})
export class FilterDialogComponent {
  filterValue: string = '';
  date: Date | null = null;
  taskType: { call: boolean; meeting: boolean; videoCall: boolean } = { call: false, meeting: false, videoCall: false };
  taskTypeIcons: TaskTypeIcons = TASK_TYPE_ICONS; // Use the interface for type safety


  constructor(
    public dialogRef: MatDialogRef<FilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient // Inject HttpClient for making HTTP requests
  ) {
    if (data.column === 'task_type') {
      this.taskType = data.value || { call: false, meeting: false, videoCall: false };
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getTaskTypeIcon(taskType: string): string {
    const lowerCaseTaskType = taskType.toLowerCase() as keyof TaskTypeIcons;
    return this.taskTypeIcons[lowerCaseTaskType] || '';
  }

  onApply(): void {
    let value: any;
    if (this.data.column === 'date') {
      value = this.date ? this.formatDate(this.date) : null;
    } else if (this.data.column === 'task_type') {
      value = this.serializeTaskType(this.taskType);
    } else {
      value = this.filterValue;
    }

    // Make HTTP request to filter endpoint
    const params = this.buildQueryParams(this.data.column, value);
    this.http.get('/tasks/filter', { params })
      .subscribe(
        (error) => {
          console.error('Error filtering tasks:', error);
          // Handle error as needed
        }
      );

    this.dialogRef.close({ column: this.data.column, value });
  }

  private formatDate(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  private serializeTaskType(taskType: { call: boolean; meeting: boolean; videoCall: boolean }): string {
    const selectedTypes = [];
    if (taskType.call) {
      selectedTypes.push('call');
    }
    if (taskType.meeting) {
      selectedTypes.push('meeting');
    }
    if (taskType.videoCall) {
      selectedTypes.push('Video Call');
    }
    return selectedTypes.join(',');
  }

  private buildQueryParams(column: string, value: any): HttpParams {
    let params = new HttpParams();
    params = params.append(column, value);
    return params;
  }
}
