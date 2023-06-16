import { Observable } from 'rxjs';

export interface IBaseService<T> {
  getMany(methodName: string, params: any): Observable<{ data: any[]; count: number; total: number; page: number; pageCount: number }>;
}
