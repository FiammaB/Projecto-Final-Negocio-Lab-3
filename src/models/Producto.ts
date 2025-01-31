export class Producto {
    id: number;
    codigoProducto: string;
    denominacion: string;
    precioVenta: number;
    
    constructor(id: number, codigoProducto: string, denominacion: string, precioVenta: number) {
        this.id = id ;
        this.codigoProducto = codigoProducto ;
        this.denominacion = denominacion ;
        this.precioVenta = precioVenta ;
    }
}