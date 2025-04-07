import { AfterViewInit, Component } from '@angular/core';
import { Mundo } from './models/mundo';
import { Monstro, Objeto } from './models/objeto';
import { Inventario } from './models/inventario.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  mundo!: Mundo
  divInventario
  inventario = new Inventario(20);


  ngAfterViewInit(): void {
    this.divInventario = document.getElementById('inventario') as any;
    this.mundo = new Mundo()
    this.mundo.adicionarPlayer()
    this.adicionarMonstro()

    this.inventario.adicionarItem({ icon: `/gold.png` });
    this.inventario.adicionarItem({ icon: `/pocao-vida.png` });
    this.inventario.adicionarItem({ icon: `/pocao-mana.png` });

    this.renderInventario()
  }

  adicionarObjeto1() {
    const objeto = new Objeto(0, 0, -5)
    this.mundo.adicionarObjeto(objeto)
  }

  adicionarMonstro() {
    const monstro = new Monstro(0, -5, 0)
    this.mundo.adicionarObjeto(monstro)
  }

  renderInventario() {
    this.inventario.slots.forEach((item, index) => {
      const slot = document.createElement('div');
      slot.classList.add('slot');
      slot.classList.add('center-flex');
      slot.dataset['index'] = index + '';

      if (item) {
        const img = document.createElement('img');
        img.src = item.icon; // `icon` é uma URL do item, defina no seu modelo
        img.draggable = true;
        img.ondragstart = e => {
          e.dataTransfer?.setData("text/plain", index + '');
        };
        slot.appendChild(img);
      }

      slot.ondragover = e => e.preventDefault();
      slot.ondrop = e => {
        const fromIndex = parseInt(e.dataTransfer?.getData("text/plain") || '0');
        const toIndex = parseInt(slot.dataset['index'] || '0');
        this.inventario.moverItem(fromIndex, toIndex);
        this.renderInventario();
      };
      console.log("!!")
      console.log(slot, this.divInventario)

      this.divInventario.appendChild(slot);

    });
  }
}
