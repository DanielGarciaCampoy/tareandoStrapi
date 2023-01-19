import { Attribute, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Person } from '../models/person.model';
import { ApiService } from './api.service';
import { HttpClientProvider } from './http-client.provider';

@Injectable({
  providedIn: 'root'
})
export class PeopleService{

  private _people:Person[] = [];

  private _peopleSubject:BehaviorSubject<Person[]> = new BehaviorSubject(this._people);
  public _people$ = this._peopleSubject.asObservable();
  
  id:number = this._people.length+1;
  constructor(
    public api:ApiService
  ) {
    this.init();
  }
  
  async init(){
    this.api.get('/api/people?populate=picture').subscribe({
      next:data=>{
        console.log(data);
        this._people = (data.data as Array<any>).map<Person>(person=>{
          return {id:person.id,
                    name:person.attributes.name,
                    surname:person.attributes.surname,
                    nickname:person.attributes.nickname,
                    picture:environment.api_url+person.attributes.picture.data.attributes.formats.thumbnail.url};
        });
        this._peopleSubject.next(this._people);
      },
      error:err=>{
      }
    });
  }

  getPeople(){
    return this._people;

  }

  getPersonById(id:number) {
    return this._people.find(p=>p.id==id);
  }

  deletePersonById(id:number){
    this._people = this._people.filter(p=>p.id != id); 
    this._peopleSubject.next(this._people);
  }

  addPerson(person:Person){
    person.id = this.id++;
    this._people.push(person);
    this._peopleSubject.next(this._people);
  }

  updatePerson(person:Person){
    var _person = this._people.find(p=>p.id==person.id);
    if(_person){
      _person.name = person.name;
      _person.surname = person.surname;
      _person.nickname = person.nickname;
      _person.picture = person.picture;
      this._peopleSubject.next(this._people);
    }    
  }
}
