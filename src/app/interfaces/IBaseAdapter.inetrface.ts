/* eslint-disable */
import { Observable } from 'rxjs';

export interface IBaseAdapter<T> {
  getMany(methodName: string, params: any): Observable<{ data: any[]; count: number; total: number; page: number; pageCount: number }>;
}
