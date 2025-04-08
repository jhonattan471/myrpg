import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class InventarioService {
    slots = new BehaviorSubject<(Item | null)[]>([]);
    maxSlots: number = 20;

    init(maxSlots: number) {
        this.maxSlots = maxSlots;
        this.slots.next(Array(this.maxSlots).fill(null));
    }

    adicionarItem(item: { icon: string }): boolean {
        const index = this.slots.value.findIndex(slot => slot === null);
        if (index !== -1) {
            this.slots.value[index] = item;
            return true;
        }
        return false;
    }

    moverItem(origem: number, destino: number) {
        const temp = this.slots.value[destino];
        this.slots.value[destino] = this.slots.value[origem];
        this.slots.value[origem] = temp;
    }
}

export class Item {
    icon
}