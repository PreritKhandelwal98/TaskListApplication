import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


export interface Task {
  id?: number; // id is optional for new tasks
  date: string;
  entity_name: string;
  task_type: string;
  task_time: string;
  contact_person: string;
  note?: string; // note is optional
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = 'http://127.0.0.1:5000/tasks';
  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(taskId: string, updates: Partial<Task>): Observable<Task> {
    const url = `${this.apiUrl}/${taskId}`;
    return this.http.put<Task>(url, updates);
  }

  deleteTask(taskId: string): Observable<void> {
    const url = `${this.apiUrl}/${taskId}`;
    return this.http.delete<void>(url);
  }

  changeTaskStatus(taskId: string, status: string): Observable<Task> {
    const url = `${this.apiUrl}/${taskId}/status`;
    return this.http.put<Task>(url, { status });
  }
}