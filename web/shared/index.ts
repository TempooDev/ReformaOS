export interface Unidad {
  id: number;
  nombre: string;
  presupuesto: number;
  gastado: number;
  estado: 'en_obra' | 'listo' | 'alquilado';
}