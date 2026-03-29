import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import type { Unidad } from '@shared'; // 👈 Importación de tipos

const app = new Elysia()
  .use(cors())
  .get("/unidades", (): Unidad[] => {
    return [
      { id: 1, nombre: 'Unidad A', presupuesto: 12000, gastado: 4500, estado: 'en_obra' }
    ];
  })
  .listen(3000);