import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass, NgFor } from '@angular/common';
import { ProductosService } from './services/productos.service';
import { Product, Productos } from './interfaces/productos';
import { ChatComponent } from "./chat/chat.component";
import { CardComponent } from "./card/card.component";
import { BuscarComponent } from "./buscar/buscar.component";
import { PaginacionComponent } from "./paginacion/paginacion.component";

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [FormsModule, CardComponent, ChatComponent, BuscarComponent, PaginacionComponent],
  templateUrl: './chat-bot.component.html',
  styleUrl: './chat-bot.component.css'
})
export class ChatBotComponent implements OnInit {
  productos: Productos | undefined;

  constructor(private _srvProducto: ProductosService) { }

  ngOnInit(): void {
    this._srvProducto.getProductos().subscribe(pro => {
        this.productos = pro
    });
  }


  buscar(termino:string){

    if(!termino){
      this.ngOnInit();
      return;
    }

    if(!isNaN(Number(termino))){
      this._srvProducto.getProductos().subscribe(data => {
        const encontrado = data.products.find((p: Product) => p.id.toString() === termino);

        if (encontrado) {
          this.productos = {
            products: [encontrado],
            total: 1,
            skip: 0,
            limit: 1
          };
        } else {
          this.productos = undefined;
        }
      })
    }else{
      this._srvProducto.getProductoPornombre(termino).subscribe(data => {
        this.productos = data
      })
    }
  }


  paginacion(categoria:string){
    if(categoria === "all"){
      this.ngOnInit();
      return;
    }
    this._srvProducto.getProductosPorCategoria(categoria).subscribe(data => {
      this.productos = data
    })
  }

}
