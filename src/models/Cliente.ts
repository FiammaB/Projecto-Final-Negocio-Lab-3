export class Cliente {
    id: number;
    cuit: string;
    razonSocial: string;

    constructor(id: number, cuit: string, razonSocial: string) {
        this.id = id;
        this.cuit = cuit;
        this.razonSocial = razonSocial;
    }
}