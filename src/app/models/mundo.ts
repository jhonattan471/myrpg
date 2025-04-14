import { interval, Subject, throttle, throttleTime } from "rxjs";
import { InventariosComponent } from "../inventarios/inventarios.component";
import { NotPossibleError } from "./errors";
import { Monstro, MonstroMorto, Objeto, Piso, Player } from "./objeto";
import { Posicao } from "./posicao";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { instance } from "three/src/nodes/TSL.js";

export class Mundo {
    scene!: THREE.Scene
    camera!: THREE.PerspectiveCamera
    renderer!: THREE.WebGLRenderer
    controls!: OrbitControls
    keys = {}
    player = new Player()
    tamanho = 100
    mapa: Posicao[][] = []
    atualizar$ = new Subject()

    constructor(public inventarios: InventariosComponent) {
        this.initScene();
        this.adicionarRaycastSelecao()
    }

    private initScene(): void {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 10);

        const container = document.getElementById('world-container')

        this.renderer = new THREE.WebGLRenderer();
        // this.renderer.setSize(800, 600);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        container?.appendChild(this.renderer.domElement)

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 10, 5);
        this.scene.add(light);


        window.addEventListener("resize", () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        this.gerarChaoGrid()
        this.animate()

        interval(70).subscribe(() => {
            for (let row of this.mapa) {
                for (let posicao of row) {
                    for (let objeto of posicao.objetos) {
                        if (objeto instanceof Piso) continue
                        if (objeto instanceof MonstroMorto) continue
                        this.updateHealthBar(objeto);
                    }
                }
            }
        });

        // console.log()

    }

    gerarChaoGrid() {
        for (let x = 0; x < this.tamanho; x++) {
            let linha: Posicao[] = []
            this.mapa[x] = []
            for (let z = 0; z < this.tamanho; z++) {
                const isPreto = (x + z) % 2 === 0;
                const corTile = isPreto ? 0x000000 : 0xffffff; // preto e branco
                const piso = new Piso(x, z, -1, corTile)
                this.scene.add(piso.mesh);
                linha.push(new Posicao(x, 0, z, [piso]));
            }
            this.mapa[x].push(...linha)
        }
    }

    adicionarObjeto(objeto: Objeto = new Objeto()): THREE.Mesh {
        if (objeto.bloqueia && this.posicaoEstaIndisponivel(objeto.mesh.position.x, objeto.mesh.position.z)) {
            throw new NotPossibleError();
        }
        this.mapa[objeto.x][objeto.z].objetos.push(objeto)
        this.scene.add(objeto.mesh);
        return objeto.mesh;
    }

    adicionarPlayer(mesh) {
        this.player = new Player(4, 4, 0, mesh)

        if (this.posicaoEstaIndisponivel(this.player.mesh.position.x, this.player.mesh.position.z)) {
            throw new NotPossibleError();
        }

        this.mapa[this.player.x][this.player.z].objetos.push(this.player)
        this.scene.add(this.player.mesh);
    }

    movimentoEstaDisponivel(objeto: Objeto, x, z) {
        if (this.posicaoEstaIndisponivel(x, z)) {
            throw new NotPossibleError();
        }
    }

    posicaoEstaIndisponivel(x, z) {
        let tile
        if (x >= 0 && z >= 0 && x < this.mapa.length && z < this.mapa[x].length) {
            tile = this.mapa[x][z];
        }
        if (!tile) return true
        tile = this.mapa[x][z]
        const bloqueada = tile.objetos.filter(e => e.bloqueia == true).length
        return bloqueada;
    }

    getScene(): THREE.Scene {
        return this.scene;
    }

    intervalo = 1000; // milissegundos (0.2s entre movimentos)

    movimentarObjeto(objeto: Objeto) {
        const agora = performance.now();
        if (agora - objeto.ultimoMovimento < this.intervalo) return;

        const input = new THREE.Vector3();
        if (objeto.controle.keys['w']) input.z += 1;
        if (objeto.controle.keys['s']) input.z -= 1;
        if (objeto.controle.keys['a']) input.x += 1;
        if (objeto.controle.keys['d']) input.x -= 1;

        if (input.length() === 0) return;

        input.normalize();

        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();

        const angle = Math.atan2(cameraDirection.x, cameraDirection.z);
        input.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);

        const stepX = Math.round(input.x);
        const stepZ = Math.round(input.z);

        const novoX = objeto.mesh.position.x + stepX;
        const novoZ = objeto.mesh.position.z + stepZ;
        const disponivel = this.posicaoEstaIndisponivel(novoX, novoZ);

        if (disponivel) return console.log("posição indisponível.");

        let currentTile = this.mapa[objeto.mesh.position.x][objeto.mesh.position.z];
        let nextTile = this.mapa[novoX][novoZ];

        currentTile.objetos = currentTile.objetos.filter(e => e.id != objeto.id);
        nextTile.objetos.push(objeto);
        objeto.mesh.position.x = novoX;
        objeto.mesh.position.z = novoZ;
        const anguloRotacao = Math.atan2(input.x, input.z);
        objeto.mesh.rotation.y = anguloRotacao;
        objeto.ultimoMovimento = agora;
    }

    renderTile(posicao: Posicao) {
        for (let objeto of posicao.objetos) {
            objeto.mesh.position.set(posicao.x, objeto.mesh.position.y, posicao.z);
        }
    }

    get objetos(): Objeto[] {
        const todosObjetos: any[] = [];

        for (const linha of this.mapa) {
            for (const posicao of linha) {
                if (posicao.objetos) {
                    todosObjetos.push(...posicao.objetos);
                }
            }
        }

        return todosObjetos;
    }



    gerenciarAtaques() {
        if (!this.player.podeAtacar) return
        if (!this.player.controle.objetoSelecionado) return

        // this.player.atacar()
        if (this.player.podeAtacar) {
            this.player.atacar(this.player.controle.objetoSelecionado)
        }
    }

    gerarMorte(objeto: Objeto) {
        if (!objeto.morto) return
        let newObjeto = objeto.gerarObjetoMorto()
        this.scene.remove(objeto.mesh)
        this.adicionarObjeto(newObjeto)
    }

    fecharInventariosIndisponiveis() {
        for (let objeto of this.inventarios.outrosObjetos) {
            const distancia = this.calcularDistancia(this.player, objeto)
            if (distancia > 1.9) {
                this.inventarios.outrosObjetos = this.inventarios.outrosObjetos.filter(e => e.id != objeto.id)
            }
        }
    }

    calcularDistancia(target: { x: number; z: number }, alvo: { x: number; z: number }): number {
        const dx = Math.abs(target.x - alvo.x);
        const dz = Math.abs(target.z - alvo.z);
        return Math.max(dx, dz);
    }

    updateHealthBar(objeto: Objeto) {
        const pos = objeto.mesh.position.clone();
        pos.y += 1.5; // altura acima da cabeça

        const vector = pos.project(this.camera); // projeta no espaço de tela

        const widthHalf = this.renderer.domElement.clientWidth / 2;
        const heightHalf = this.renderer.domElement.clientHeight / 2;

        const screenX = vector.x * widthHalf + widthHalf;
        const screenY = -vector.y * heightHalf + heightHalf;

        objeto.healthBarElement.style.left = `${screenX - 20}px`;
        objeto.healthBarElement.style.top = `${screenY}px`;
        objeto.healthBarElement.style.display = 'block';

        const percent = objeto.health / objeto.maxHealth;
        (objeto.healthBarElement.querySelector('.fill') as HTMLDivElement).style.width = `${percent * 100}%`;
    }

    ultimaUI = 0;
    atualizarControleUI(agora: number) {
        if (agora - this.ultimaUI > 200) { // executa a cada 200ms
            this.fecharInventariosIndisponiveis();
            this.gerenciarAtaques();
            this.ultimaUI = agora;
        }
    }

    adicionarRaycastSelecao() {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        this.renderer.domElement.addEventListener('click', (event: MouseEvent) => {
            const rect = this.renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);
            const meshes = this.objetos.map(obj => obj.mesh);
            const intersects = raycaster.intersectObjects(meshes);

            let objetosSelecionados: Objeto[] = []

            for (let meshAtravessado of intersects) {

                const objetoCorrespondente = this.objetos.find(obj => obj.mesh === meshAtravessado.object);
                if (objetoCorrespondente) {
                    objetosSelecionados.push(objetoCorrespondente)
                }
            }

            objetosSelecionados.forEach(e => {
                if (e instanceof Monstro) {
                    this.player.controle.objetoSelecionado = e
                }
                if (e.inventario) {
                    this.inventarios.adicionarObjeto(e)
                }
            })

            let pisoSelecionado = objetosSelecionados.find(e => e instanceof Piso)
            if (!pisoSelecionado) return
            let posicaoSelecionado = this.mapa[pisoSelecionado.x][pisoSelecionado.z]
            this.player.controle.objetoSelecionado = posicaoSelecionado.objetos.find(e => e instanceof Monstro)


            console.log('intersects', intersects)
            console.log('objetos != piso', this.objetos.filter(e => (e instanceof Piso) == false))
            console.log('objetosSelecionados', objetosSelecionados)
            console.log(this.mapa)




        });
    }

    animate(): void {
        requestAnimationFrame(() => this.animate());

        const agora = performance.now();

        for (let row of this.mapa) {
            for (let posicao of row) {
                for (let objeto of posicao.objetos) {

                    if (objeto instanceof Piso || objeto instanceof MonstroMorto) {

                    } else {
                        this.movimentarObjeto(objeto)
                    }
                    objeto.mesh.position.x = posicao.x
                    objeto.mesh.position.z = posicao.z
                    objeto.mesh.position.y = objeto.y
                    objeto.x = posicao.x
                    objeto.z = posicao.z
                    this.gerarMorte(objeto)
                }
                posicao.objetos = posicao.objetos.filter(e => !e.morto)
            }
        }

        this.player.controle.objetoSelecionado?.destacarNaCena(this.scene)
        this.controls.update();

        if (this.player.mesh) {
            // this.camera.position.x = this.player.mesh.position.x + 0;
            // this.camera.position.z = this.player.mesh.position.z + 10;
            // this.camera.position.y = this.player.mesh.position.y + 10;
            // this.camera.lookAt(this.player.mesh.position);
        }
        this.atualizarControleUI(agora)

        this.renderer.render(this.scene, this.camera);
    }


}

