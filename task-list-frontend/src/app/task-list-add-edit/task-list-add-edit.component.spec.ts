import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskListAddEditComponent } from './task-list-add-edit.component';

describe('TaskListAddEditComponent', () => {
  let component: TaskListAddEditComponent;
  let fixture: ComponentFixture<TaskListAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskListAddEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskListAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
