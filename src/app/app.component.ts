import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { Mundo } from './models/mundo';
import { Monstro, Objeto } from './models/objeto';
import { CommonModule } from '@angular/common';
import { InventariosComponent } from "./inventarios/inventarios.component";
import { InventarioComponent } from './inventario/inventario.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [CommonModule, InventariosComponent],
  providers: []
})
export class AppComponent implements AfterViewInit {

  mundo!: Mundo
  @ViewChild(InventariosComponent) inventarioComponent

  ngAfterViewInit(): void {
    this.mundo = new Mundo(this.inventarioComponent)
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
