import { Injectable } from '@angular/core';
import { IBaseService } from '../interfaces/IBaseService.inetrface';
import { Observable } from 'rxjs';

@Injectable()
export class GenericService<T> implements IBaseService<T> {
  private service: any;
  public methodName: string;

  constructor() {}

  setService(service: any) {
    this.service = service;
  }

  setMethodName(methodName: string) {
    this.methodName = methodName;
  }

  getMany(params: any): Observable<{ data: any[]; count: number; total: number; page: number; pageCount: number }> {
    return this.service[this.methodName](params);
  }
}
