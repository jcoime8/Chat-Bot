import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product, Productos } from '../interfaces/productos';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private baseUrl = 'https://dummyjson.com/products';

  constructor(private http: HttpClient) {}

  getProductosPorCategoria(categoria: string): Observable<Productos> {
    return this.http.get<Productos>(`${this.baseUrl}/category/${categoria}`);
  }

  getProductoPornombre(id:string): Observable<Productos>{
    return this.http.get<Productos>(`${this.baseUrl}/search?q=${id}`)
  }

  getProductos():Observable<Productos>{
    return this.http.get<Productos>(`${this.baseUrl}?limit=161`)
  }
}
