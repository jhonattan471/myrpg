import { NotPossibleError } from "./errors";
import { Objeto, Player } from "./objeto";
import { Posicao } from "./posicao";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class Mundo {
    objetos: Objeto[] = []
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    controls: OrbitControls
    keys = {}
    player = new Player()

    constructor() {
        this.initScene();
    }

    private initScene(): void {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 10);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(800, 600);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 10, 5);
        this.scene.add(light);

        // Criando o chão
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        this.scene.add(ground);

        window.addEventListener("resize", () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        document.addEventListener('keydown', (event) => this.keys[event.key] = true);
        document.addEventListener('keyup', (event) => this.keys[event.key] = false);
        this.animate()
        console.log("mundo iniciado.")

    }

    _adicionarObjetos(objeto: Objeto): THREE.Mesh {
        const playerGeometry = new THREE.BoxGeometry(1, 2, 1);
        const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        let player = new THREE.Mesh(playerGeometry, playerMaterial);
        player.position.y = 1;
        this.scene.add(player);
    }

    adicionarObjeto(objeto: Objeto = new Objeto()): THREE.Mesh {
        if (this.pegarObjetoNaPosciao(objeto.posicao)) {
            throw new NotPossibleError();
        }
        this.objetos.push(objeto)
        this.scene.add(objeto.mesh);
        return objeto;
    }

    adicionarPlayer() {
        this.player = new Player()
        if (this.pegarObjetoNaPosciao(this.player.mesh.position)) {
            throw new NotPossibleError();
        }
        this.scene.add(this.player.mesh);
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

    getScene(): THREE.Scene {
        return this.scene;
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.movimentarPlayer()
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    movimentarPlayer() {
        console.log("movimentar player", this.keys, this.player.mesh.position.x)
        if (!this.player) return;
        if (this.keys['w']) this.player.mover({ z: this.player.mesh.position.z -= this.player.playerSpeed }, this)
        if (this.keys['s']) this.player.mover({ z: this.player.mesh.position.z += this.player.playerSpeed }, this)
        if (this.keys['a']) this.player.mover({ x: this.player.mesh.position.x -= this.player.playerSpeed }, this)
        if (this.keys['d']) this.player.mover({ x: this.player.mesh.position.x += this.player.playerSpeed }, this)
    }
}