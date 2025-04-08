// import { CommonModule } from '@angular/common';
// import { Component, inject } from '@angular/core';
// import { InventarioService } from './inventario.service';

// @Component({
//   selector: 'app-inventario',
//   imports: [
//     CommonModule
//   ],
//   templateUrl: './inventario.component.html',
//   styleUrl: './inventario.component.scss'
// })
// export class InventarioComponent {
//   inventario = inject(InventarioService)

//   constructor() { }
// }
import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventarioService } from './inventario.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule],
  providers: [InventarioService],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.scss'
})
export class InventarioComponent {
  @Input() inventario!: InventarioService;

  outrosInventarios

  onDragStart(event: DragEvent, index: number) {
    event.dataTransfer?.setData('text/plain', index.toString());
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent, toIndex: number) {
    event.preventDefault();
    const fromIndex = parseInt(event.dataTransfer?.getData('text/plain') || '-1');
    if (fromIndex >= 0 && fromIndex !== toIndex) {
      this.inventario.moverItem(fromIndex, toIndex);
    }
  }

}
