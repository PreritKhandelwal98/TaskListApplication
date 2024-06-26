import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-add-note-dialog',
  templateUrl: './add-note-dialog.component.html',
  styleUrls: ['./add-note-dialog.component.scss']
})
export class AddNoteDialogComponent {
  noteContent: string = '';

  constructor(
    private dialogRef: MatDialogRef<AddNoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { taskId: string },
    private taskService: TaskService
  ) { }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onAddNote(): void {
    if (this.noteContent.trim() !== '') {
      this.taskService.updateTaskNote(this.data.taskId, this.noteContent).subscribe({
        next: () => {
          this.dialogRef.close(true); // Signal success to parent component
        },
      });
    } 
  }
}
