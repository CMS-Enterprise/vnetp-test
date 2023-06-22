import { Injectable } from '@angular/core';
import { IBaseAdapter } from '../../interfaces/IBaseAdapter.inetrface';
import { Observable } from 'rxjs';

@Injectable()
export class AdvancedSearchAdapter<T> implements IBaseAdapter<T> {
  public service: any;
  public methodName: string;

  constructor() {}

  setService(service: any) {
    this.service = service;
  }

  public setMethodName(methodName: string) {
    this.methodName = methodName;
  }

  public getMany(params: any): Observable<{ data: any[]; count: number; total: number; page: number; pageCount: number }> {
    const methodName = this.getMethodName('getMany');
    return this.service[methodName](params);
  }

  public getMethodName(subString: string): string {
    const propertyNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this.service));

    for (const name of propertyNames) {
      if (name.includes(subString) && typeof this.service[name] === 'function') {
        return name;
      }
    }

    return null;
  }
}
