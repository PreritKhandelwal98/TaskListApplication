import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TaskListAddEditComponent } from './task-list-add-edit/task-list-add-edit.component';
import { TaskService, Task } from './services/task.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CoreService } from './core/core.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  displayedColumns: string[] = [
    'date',
    'entity_name',
    'task_type',
    'task_time',
    'contact_person',
    'note',
    'status',
    'action'
  ];
  dataSource!: MatTableDataSource<Task>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private _dialog: MatDialog,
    private _taskService: TaskService,
    private _coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.getTaskList();
  }

  openAddEditTaskForm() {
    const dialogRef = this._dialog.open(TaskListAddEditComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getTaskList();
        }
      },
    });
  }

  getTaskList() {
    this._taskService.getTasks().subscribe({
      next: (res) => {
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      error: console.log,
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  changeStatusToClose(taskId: string) {
    console.log("this function called");
    
    this._taskService.changeTaskStatus(taskId, 'closed').subscribe({
      next: (res) => {
        this._coreService.openSnackBar('Task status updated!', 'done');
        this.getTaskList();
      },
      error: console.log,
    });
  }

  openEditForm(data: any) {
    const dialogRef = this._dialog.open(TaskListAddEditComponent, {
      data,
    });

    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getTaskList();
        }
      },
    });
  }
  deleteTask(taskId: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      this._taskService.deleteTask(taskId).subscribe({
        next: () => {
          this._coreService.openSnackBar('Task deleted successfully');
          this.getTaskList();
        },
        error: console.error
      });
    }
  }

}
