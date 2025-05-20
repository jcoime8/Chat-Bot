import { NgFor } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-paginacion',
  standalone: true,
  imports: [ NgFor],
  templateUrl: './paginacion.component.html',
  styleUrl: './paginacion.component.css'
})
export class PaginacionComponent {
  @Output() eventCategoria = new EventEmitter<string>();

  categoriaAliasMap: { [key: string]: string } = {
    "Todos": "all",
    "belleza": "beauty",
    "perfumes": "fragrances",
    "fragancias": "fragrances",
    "muebles": "furniture",
    "comestibles": "groceries",
    "comida": "groceries",
    "decoración": "home-decoration",
    "decoracion": "home-decoration",
    "accesorios de cocina": "kitchen-accessories",
    "cocina": "kitchen-accessories",
    "laptops": "laptops",
    "notebooks": "laptops",
    "camisas hombre": "mens-shirts",
    "ropa hombre": "mens-shirts",
    "zapatillas hombre": "mens-shoes",
    "zapatos hombre": "mens-shoes",
    "relojes hombre": "mens-watches",
    "accesorios móviles": "mobile-accessories",
    "accesorios": "mobile-accessories",
    "motocicletas": "motorcycle",
    "moto": "motorcycle",
    "cuidado de la piel": "skin-care",
    "piel": "skin-care",
    "celulares": "smartphones",
    "smartphones": "smartphones",
    "teléfonos": "smartphones",
    "deportes": "sports-accessories",
    "accesorios deportivos": "sports-accessories",
    "gafas de sol": "sunglasses",
    "lentes de sol": "sunglasses",
    "tablets": "tablets",
    "tops": "tops",
    "vehículos": "vehicle",
    "vehiculo": "vehicle",
    "bolsos mujer": "womens-bags",
    "carteras mujer": "womens-bags",
    "vestidos mujer": "womens-dresses",
    "ropa mujer": "womens-dresses",
    "joyas mujer": "womens-jewellery",
    "joyería": "womens-jewellery",
    "zapatos mujer": "womens-shoes",
    "zapatillas mujer": "womens-shoes",
    "relojes mujer": "womens-watches"
  };


  getCategorias(): string[] {
    return Object.keys(this.categoriaAliasMap);
  }


  selecCategoria(categoria:string){
    this.eventCategoria.emit(categoria)
  }
}
