import { AfterViewInit, Component } from '@angular/core';
import { Mundo } from './models/mundo';
import { Monstro, Objeto } from './models/objeto';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  mundo!: Mundo
  ngAfterViewInit(): void {
    this.mundo = new Mundo()
    this.mundo.adicionarPlayer()
    // this.adicionarObjeto1()
    // this.adicionarMonstro()
  }

  adicionarObjeto1() {
    const objeto = new Objeto(0, 0, -5)
    this.mundo.adicionarObjeto(objeto)
  }

  adicionarMonstro() {
    const monstro = new Monstro(0, 0, 0)
    this.mundo.adicionarObjeto(monstro)
  }
}
