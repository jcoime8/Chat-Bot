import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-buscar',
  standalone: true,
  imports: [],
  templateUrl: './buscar.component.html',
  styleUrl: './buscar.component.css'
})
export class BuscarComponent {

  @Output() eventTermino = new EventEmitter<string>();


  buscar(termino:string){
    this.eventTermino.emit(termino);
  }
}
