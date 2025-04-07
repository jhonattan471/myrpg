// import { TestBed } from '@angular/core/testing';
// import { AppComponent } from './app.component';
// import { Objeto } from './models/objeto';
// import { Mundo } from './models/mundo';
// import { NotPossibleError } from './models/errors';
// import * as THREE from 'three';
// import { Posicao } from './models/posicao';

// describe('AppComponent', () => {
//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [AppComponent],
//     }).compileComponents();
//   });

//   it('should create the app', () => {
//     const fixture = TestBed.createComponent(AppComponent);
//     const app = fixture.componentInstance;
//     expect(app).toBeTruthy();
//   });

//   it('Deve iniciar o espaço 3D', () => {
//     const mundo = new Mundo()
//     expect(mundo.getScene()).toBeDefined();
//     expect(mundo.getScene() instanceof THREE.Scene).toBeTrue();
//   });

//   it('Deve criar um objeto no mundo', () => {
//     const mundo = new Mundo()

//     const object = mundo.adicionarObjeto(new Objeto());
//     expect(object).toBeDefined();
//     expect(mundo.getScene().children.includes(object)).toBeTrue();
//   });

//   it(`Dois corpos não podem ser criados no mesmo espaço`, () => {
//     const mundo = new Mundo();
//     const objeto1 = new Objeto();
//     const objeto2 = new Objeto();

//     objeto1.posicao = { x: 0, y: 0, z: 0 };
//     objeto2.posicao = { x: 0, y: 0, z: 0 };

//     mundo.adicionarObjeto(objeto1);

//     expect(() => mundo.adicionarObjeto(objeto2)).toThrowError(NotPossibleError);
//   });


//   it(`Dois corpos não podem ser movimentados no mesmo espaço`, () => {
//     const mundo = new Mundo();
//     const objeto1 = new Objeto();
//     const objeto2 = new Objeto();

//     objeto1.posicao = { x: 0, y: 0, z: 0 };
//     objeto2.posicao = { x: 0, y: 1, z: 0 };

//     mundo.adicionarObjeto(objeto1);
//     mundo.adicionarObjeto(objeto2);
//     mundo.movimentarPlayer()
//     expect(() => objeto2.mover({ x: 0, y: 0, z: 0 }, mundo)).toThrowError(NotPossibleError);
//   });

//   it(`Dois corpos podem ser criados em locais diferentes`, () => {
//     const mundo = new Mundo();
//     const objeto1 = new Objeto();
//     const objeto2 = new Objeto();

//     objeto1.posicao = { x: 0, y: 0, z: 0 };
//     objeto2.posicao = { x: 0, y: 1, z: 0 };

//     mundo.adicionarObjeto(objeto1);
//     mundo.adicionarObjeto(objeto2);

//     expect(mundo.objetos.length).toBe(2);
//     expect(objeto1.posicao).not.toEqual(objeto2.posicao);
//     expect(objeto1.posicao).toEqual({ x: 0, y: 0, z: 0 });
//     expect(objeto2.posicao).toEqual({ x: 0, y: 1, z: 0 });
//   });



//   // it(`Dois corpos não podem ser movidos para o mesmo espaço`, () => {
//   // });

// });

