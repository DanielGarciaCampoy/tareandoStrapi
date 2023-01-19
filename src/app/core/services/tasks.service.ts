import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task } from 'src/app/core/models/task.model';
import { environment } from 'src/environments/environment';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  private _tasks:Task[] = [];

  private _tasksSubject:BehaviorSubject<Task[]> = new BehaviorSubject(this._tasks);
  public taks$ = this._tasksSubject.asObservable();

  id:number = this._tasks.length+1;
  constructor(
    public api:ApiService
  ) {
    this.init();
  }

  async init(){
    this.api.get('/api/tasks?populate=picture').subscribe({
      next:data=>{
        console.log(data);
        this._tasks = (data.data as Array<any>).map<Task>(task=>{
          return {id:task.id,
                    name: task.attributes.name,
                    durationInSecs:task.attributes.durationInSecs,
                    picture:environment.api_url+task.attributes.picture.data.attributes.formats.thumbnail.url};
        });
        this._tasksSubject.next(this._tasks);
      },
      error:err=>{
        console.log(err)
      }
    });
  }

  getTasks(){
    return this._tasks;
  }

  getTaskById(id:number){
    return this._tasks.find(t=>t.id==id);
  }

  deleteTaskById(id:number){
    this._tasks = this._tasks.filter(t=>t.id != id); 
    this._tasksSubject.next(this._tasks);
  }

  addTask(task:Task){
    task.id = this.id++;
    this._tasks.push(task);
    this._tasksSubject.next(this._tasks);
  }

  updateTask(task:Task){
    var _task = this._tasks.find(t=>t.id==task.id);
    if(_task){
      _task.name = task.name;
      _task.durationInSecs = task.durationInSecs;
    }
    this._tasksSubject.next(this._tasks);
    
  }
}
