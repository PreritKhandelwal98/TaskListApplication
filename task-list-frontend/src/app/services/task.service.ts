import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Task {
  _id?: number;
  date: string;
  entity_name: string;
  task_type: string;
  task_time: string;
  contact_person: { name: string };
  note?: string;
  status: string;
  showAddNoteButton: boolean;
}

export interface User {
  _id?: number;
  name: string;
  email: string;
  contact_number?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = 'https://tasklistapplication.onrender.com/tasks';

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks`);
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/tasks`, task);
  }

  filterTasks(filterCriteria: any): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks/filter`, { params: filterCriteria });
  }

  updateTask(taskId: string, updates: Partial<Task>): Observable<Task> {
    const url = `${this.apiUrl}/tasks/${taskId}`;
    return this.http.put<Task>(url, updates);
  }

  deleteTask(taskId: string): Observable<void> {
    const url = `${this.apiUrl}/tasks/${taskId}`;
    return this.http.delete<void>(url);
  }

  changeTaskStatus(taskId: string, status: string): Observable<Task> {
    const url = `${this.apiUrl}/tasks/${taskId}/status`;
    return this.http.put<Task>(url, { status });
  }

  getContactPersons(): Observable<User[]> {
    const url = `${this.apiUrl}/tasks/contacts`;
    return this.http.get<User[]>(url);
  }

  updateTaskNote(taskId: string, note: string): Observable<Task> {
    const url = `${this.apiUrl}/tasks/${taskId}/note`;
    return this.http.put<Task>(url, { note });
  }
}
