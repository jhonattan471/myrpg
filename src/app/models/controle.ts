import { Mundo } from "./mundo";
import { Objeto } from "./objeto";

export class Controle {
    keys = {
        w: false,
        a: false,
        s: false,
        d: false
    }

    speed = 1
    objetoSelecionado?: Objeto

    constructor(public objetoControlado?: Objeto) {

    }

    selecionarObjeto(objeto: Objeto) {
        this.objetoSelecionado = objeto
    }
}

export class ControleIA extends Controle {
    intervaloDirecao: any;
    tempoDirecao = 1000; // tempo em ms entre decisões
    direcaoAtual = { x: 0, z: 0 }
    direcoesPossiveis = [
        { x: -1, z: -1 }, // canto superior esquerdo
        { x: -1, z: 0 }, // esquerda
        { x: -1, z: 1 }, // canto inferior esquerdo
        { x: 0, z: -1 }, // cima
        { x: 0, z: 1 }, // baixo
        { x: 1, z: -1 }, // canto superior direito
        { x: 1, z: 0 }, // direita
        { x: 1, z: 1 }, // canto inferior direito
    ];

    constructor(objeto, public mundo: Mundo) {
        super(objeto);
        this.iniciarIA()
    }

    iniciarIA() {
        this.intervaloDirecao = setInterval(() => {
            if (!this.objetoControlado) return;

            const objeto = this.objetoControlado;
            const spawn = objeto.spawnPoint;
            const maxDist = objeto.distanceAllowedFromSpawn;

            const opcoes: { x, z }[] = [];

            // Verifica cada direção possível
            for (const dir of this.direcoesPossiveis) {
                let newPos = {
                    x: this.objetoControlado.mesh.position.x + dir.x,
                    z: this.objetoControlado.mesh.position.z + dir.z
                }
                const isDisponivel = !this.mundo.posicaoEstaIndisponivel(newPos.x, newPos.z)
                const distance = this.mundo.calcularDistancia(this.objetoControlado.mesh.position, spawn)
                if (isDisponivel && distance <= maxDist) {
                    opcoes.push(dir)
                }
            }

            const pesos: { x, z }[] = [];

            for (const opcao of opcoes) {
                pesos.push(opcao);
            }

            const direcaoEscolhida = pesos[Math.floor(Math.random() * pesos.length)];
            this.direcaoAtual = direcaoEscolhida;
            this.keys = { w: false, a: false, s: false, d: false };

            if (!this.direcaoAtual) return

            // if (direcaoEscolhida.z > 0) this.keys['s'] = true;
            // if (direcaoEscolhida.z < 0) this.keys['w'] = true;
            // if (direcaoEscolhida.x < 0) this.keys['a'] = true;
            // if (direcaoEscolhida.x > 0) this.keys['d'] = true;
            //converter para valroes de keys a posicao escolhida
            // this.keys = { w: ?, a: ?, s: ?, d: ? };
        }, this.tempoDirecao);
    }

    destruir() {
        clearInterval(this.intervaloDirecao);
    }
}

export class ControlePlayer extends Controle {
    constructor() {
        super();
        document.addEventListener('keydown', (event) => {
            this.keys[event.key] = true
        })
        document.addEventListener('keyup', (event) => {
            this.keys[event.key] = false
        });
    }
}   
