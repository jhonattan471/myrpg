import { AfterViewInit, Component, inject } from '@angular/core';
import { Mundo } from './models/mundo';
import { Monstro, Objeto } from './models/objeto';
import { InventarioService } from './inventario/inventario.service';
import { CommonModule } from '@angular/common';
import { InventariosComponent } from "./inventarios/inventarios.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [CommonModule, InventariosComponent],
  providers: [InventarioService]
})
export class AppComponent implements AfterViewInit {

  mundo!: Mundo
  divInventario

  ngAfterViewInit(): void {
    this.divInventario = document.getElementById('inventario') as any;
    this.mundo = new Mundo()
    this.mundo.adicionarPlayer()
    this.adicionarMonstro()
  }

  adicionarObjeto1() {
    const objeto = new Objeto(0, 0, -5)
    this.mundo.adicionarObjeto(objeto)
  }

  adicionarMonstro() {
    const monstro = new Monstro(0, -5, 0)
    this.mundo.adicionarObjeto(monstro)
  }
}
