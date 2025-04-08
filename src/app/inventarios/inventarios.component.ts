import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InventarioService } from '../inventario/inventario.service';
import { InventarioComponent } from '../inventario/inventario.component';

@Component({
  selector: 'app-inventarios',
  standalone: true,
  imports: [CommonModule, InventarioComponent],
  providers: [InventarioService],
  templateUrl: './inventarios.component.html',
  styleUrl: './inventarios.component.scss'
})
export class InventariosComponent {
  meuInventario = new InventarioService();
  inv1 = new InventarioService();
  inv2 = new InventarioService();
  outrosInventarios = [this.inv1, this.inv2]

  constructor() {
    this.inv1.init(10);
    this.inv2.init(10);

    this.inv1.adicionarItem({ icon: '/gold.png' });
    this.inv2.adicionarItem({ icon: '/gold.png' });

    this.meuInventario.init(8)
    this.meuInventario.adicionarItem({ icon: `/gold.png` });
    this.meuInventario.adicionarItem({ icon: `/pocao-vida.png` });
    this.meuInventario.adicionarItem({ icon: `/pocao-mana.png` });
  }

  onItemDrop(event: { from: string; fromIndex: number; to: string; toIndex: number }) {
    const fromInv = this.getInventario(event.from)
    const toInv = this.getInventario(event.to)
    if (!fromInv || !toInv) return
    const item = fromInv.slots.value[event.fromIndex];
    if (!item) return;

    // remove do inventário de origem
    fromInv.slots.value[event.fromIndex] = null;
    fromInv.slots.next([...fromInv.slots.value]);

    // coloca no inventário destino
    toInv.slots.value[event.toIndex] = item;
    toInv.slots.next([...toInv.slots.value]);
  }

  getInventario(id) {
    if (this.meuInventario.id == id) {
      return this.meuInventario
    } else {
      return this.outrosInventarios.find(e => e.id == id)
    }
  }


}
