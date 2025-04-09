import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Inventario } from '../models/inventario';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule],
  providers: [],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.scss'
})
export class InventarioComponent {
  @Input() inventario!: Inventario;
  @Output() itemDrop = new EventEmitter<{ from: string, fromIndex: number, to: string, toIndex: number }>();

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragStart(event: DragEvent, index: number) {
    event.dataTransfer?.setData('text/plain', JSON.stringify({
      from: this.inventario.id,
      index: index
    }));
  }

  onDrop(event: DragEvent, toIndex: number) {
    event.preventDefault();
    const data = JSON.parse(event.dataTransfer?.getData('text/plain') || '{}');

    if (data.index !== undefined && data.from !== undefined) {
      this.itemDrop.emit({
        from: data.from,
        fromIndex: data.index,
        to: this.inventario.id,
        toIndex
      });
    }
  }
}
