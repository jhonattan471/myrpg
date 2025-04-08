import { AfterViewInit, Component, inject } from '@angular/core';
import { Mundo } from './models/mundo';
import { Monstro, Objeto } from './models/objeto';
import { InventarioComponent } from "./inventario/inventario.component";
import { InventarioService } from './inventario/inventario.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [InventarioComponent, CommonModule],
  providers: [InventarioService]
})
export class AppComponent implements AfterViewInit {

  mundo!: Mundo
  divInventario
  meuInventario = inject(InventarioService)

  inv1 = new InventarioService();
  inv2 = new InventarioService();
  inv3 = new InventarioService();
  outrosInventarios: InventarioService[] = [this.inv1, this.inv2, this.inv3]

  ngAfterViewInit(): void {
    this.divInventario = document.getElementById('inventario') as any;
    this.mundo = new Mundo()
    this.mundo.adicionarPlayer()
    this.adicionarMonstro()

    this.meuInventario.init(8)
    this.meuInventario.adicionarItem({ icon: `/gold.png` });
    this.meuInventario.adicionarItem({ icon: `/pocao-vida.png` });
    this.meuInventario.adicionarItem({ icon: `/pocao-mana.png` });

    this.teste()
  }

  adicionarObjeto1() {
    const objeto = new Objeto(0, 0, -5)
    this.mundo.adicionarObjeto(objeto)
  }

  adicionarMonstro() {
    const monstro = new Monstro(0, -5, 0)
    this.mundo.adicionarObjeto(monstro)
  }

  teste() {
    this.inv1.init(2);
    this.inv2.init(4);
    this.inv3.init(6);
  }
}
