import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  // it(`should have the 'myrpg' title`, () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   const app = fixture.componentInstance;
  //   expect(app.title).toEqual('myrpg');
  // });

  // it('should render title', () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  //   const compiled = fixture.nativeElement as HTMLElement;
  //   expect(compiled.querySelector('h1')?.textContent).toContain('Hello, myrpg');
  // });


  it(`Dois corpos não podem ser criados no mesmo espaço`, () => {
    console.log("testing...")
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    const objeto1 = new Objeto();
    const objeto2 = new Objeto();
    const mundo = new Mundo();

    objeto1.posicao = { x: 0, y: 0, z: 0 };
    objeto2.posicao = { x: 0, y: 0, z: 0 };

    mundo.adicionarObjetos(objeto1);

    expect(() => mundo.adicionarObjetos(objeto2)).toThrowError(NotPossibleError);
  });

});

class Objeto {
  posicao: Posicao = new Posicao()
  tamanho = 1

  mover(posicao: Posicao, mundo: Mundo) {
    mundo.movimentoEstaDisponivel(this, posicao)
  }
}

class Posicao {
  x: number = 0
  y: number = 0
  z: number = 0
}

class Mundo {
  objetos: Objeto[] = []

  adicionarObjetos(objeto: Objeto) {
    if (this.pegarObjetoNaPosciao(objeto.posicao)) {
      throw new NotPossibleError();
    }
    this.objetos.push(objeto)
  }

  movimentoEstaDisponivel(objeto: Objeto, posicao: Posicao) {
    if (this.pegarObjetoNaPosciao(posicao)) {
      throw new NotPossibleError();
    }
  }

  pegarObjetoNaPosciao(posicao: Posicao) {
    return this.objetos.find(o => {
      const sameX = o.posicao.x == posicao.x
      const sameY = o.posicao.y == posicao.y
      const sameZ = o.posicao.z == posicao.z

      if (sameX && sameY && sameZ) {
        return true
      }
      return false
    })
  }
}

class NotPossibleError extends Error {
  constructor() {
    super("Movimento não permitido: posição já ocupada");
    this.name = "NotPossibleError";
  }
}