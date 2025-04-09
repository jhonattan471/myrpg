import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InventarioComponent } from '../inventario/inventario.component';
import { Inventario } from '../models/inventario';
import { Objeto } from '../models/objeto';

@Component({
  selector: 'app-inventarios',
  standalone: true,
  imports: [CommonModule, InventarioComponent],
  providers: [],
  templateUrl: './inventarios.component.html',
  styleUrl: './inventarios.component.scss'
})
export class InventariosComponent {
  meuInventario = new Inventario();
  outrosObjetos: Objeto[] = []

  constructor() {
    this.meuInventario.adicionarItem({ icon: `/gold.png` });
    this.meuInventario.adicionarItem({ icon: `/pocao-vida.png` });
    this.meuInventario.adicionarItem({ icon: `/pocao-mana.png` });
  }

  onItemDrop(event: { from: string; fromIndex: number; to: string; toIndex: number }) {
    const fromInv = this.getInventario(event.from)
    const toInv = this.getInventario(event.to)
    if (!fromInv || !toInv) return
    const itemOrigem = fromInv.slots.value[event.fromIndex];
    const itemDestino = toInv.slots.value[event.toIndex];
    if (!itemOrigem) return;

    // remove do inventário de origem


    fromInv.slots.value[event.fromIndex] = null;
    if (itemDestino) {
      fromInv.slots.value[event.fromIndex] = itemDestino
    }
    fromInv.slots.next([...fromInv.slots.value]);

    // coloca no inventário destino
    toInv.slots.value[event.toIndex] = itemOrigem;
    toInv.slots.next([...toInv.slots.value]);
  }

  getInventario(id) {
    if (this.meuInventario.id == id) {
      return this.meuInventario
    } else {
      return this.outrosObjetos.map(e => e.inventario).find(e => e?.id == id)
    }
  }

  adicionarObjeto(objeto: Objeto) {
    if (this.getInventario(objeto.inventario?.id)) return
    this.outrosObjetos.unshift(objeto)
  }
}
