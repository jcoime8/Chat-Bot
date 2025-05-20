import { Component, Input } from '@angular/core';
import { Productos } from '../interfaces/productos';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgFor],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() productos:Productos | undefined;

}
