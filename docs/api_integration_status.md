# Estado de Integración de API - Vistas Pendientes

Este documento detalla las vistas del frontend que actualmente utilizan datos simulados (mock data) y los contratos (interfaces) que deben implementarse en el backend para su integración final.

## 1. Alquiler Diario (`daily-rental`)
**Estado:** Pendiente de conexión.
**Contratos Definidos:**
- `DailyRentalStats`: Resumen de ocupación, tarifa media e ingresos.
- `Booking`: Información de huéspedes, fechas y plataforma (Airbnb, Booking, etc.).

## 2. Alquiler Mensual (`monthly-rental`)
**Estado:** Pendiente de conexión.
**Contratos Definidos:**
- `Tenant`: Información del inquilino actual, renta y fianza.
- `Transaction`: Historial de pagos mensuales.

## 3. Domótica (`domotica`)
**Estado:** Pendiente de conexión.
**Contratos Definidos:**
- `Camera`: Estado y URL de streaming/imagen de cámaras.
- `Light`: Control de encendido y nivel de brillo.

## 4. Evolución Patrimonial (`evolucion-patrimonial`)
**Estado:** Pendiente de conexión.
**Contratos Definidos:**
- `AmortizationMilestone`: Datos anuales de amortización de hipoteca (capital, intereses, balance pendiente).

## 5. Gestor de Gastos (`expenses-manager`)
**Estado:** Pendiente de conexión.
**Contratos Definidos:**
- `Expense`: Detalle de gastos individuales, categorías y estados de conciliación.

## 6. Finanzas de Obra (`finance-construction`)
**Estado:** Pendiente de conexión. (Nota: Esta vista es una versión más detallada que la integrada en `renovation-manager`).
**Contratos Definidos:**
- `PropertyStats`: Resumen financiero de la obra.
- `Phase`: Desglose de fases con presupuesto vs gastado.
- `Invoice`: Listado de facturas de proveedores.

---

## Recomendaciones para el Backend
Para completar la integración, el API en Go debería implementar los siguientes endpoints:

1. `GET /properties/:id/rental/daily`: Retornar `DailyRentalStats` y `[]Booking`.
2. `GET /properties/:id/rental/monthly`: Retornar `Tenant` y `[]Transaction`.
3. `GET /properties/:id/domotica`: Retornar `[]Camera` y `[]Light`.
4. `GET /properties/:id/mortgage/evolution`: Retornar `[]AmortizationMilestone`.
5. `GET /properties/:id/expenses`: Retornar `[]Expense`.
6. `GET /properties/:id/finance/construction`: Retornar `PropertyStats`, `[]Phase` y `[]Invoice`.
