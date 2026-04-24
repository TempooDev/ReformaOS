# ReformaOS - Datos de Inicio de Sesión (Pruebas)

Este proyecto cuenta con usuarios de prueba para validar los diferentes niveles de acceso (Roles). 
Por el momento, el inicio de sesión no requiere contraseña real, solo la selección del perfil.

## Usuarios de Prueba

| Rol | Email | ID de Usuario | Permisos |
| :--- | :--- | :--- | :--- |
| **Dueño** | `dueno@reformaos.com` | `USR-OWNER` | Acceso total (Lectura/Escritura) |
| **Arquitecto** | `arquitecto@reformaos.com` | `USR-ARCH` | Gestión de obra y documentos. No puede modificar presupuestos. |
| **Gestor** | `gestor@reformaos.com` | `USR-MGR` | Solo lectura en todas las secciones. |

## Propiedad Inicial
- **Nombre:** Casa Arroyo
- **Dirección:** Calle Jardines, 3 Sedella
- **Ref. Catastral:** `9876543AA1234B0001XY`

## Cómo probar los Roles
1. Accede a la página de **Login** (se muestra automáticamente si no hay sesión).
2. Selecciona uno de los perfiles.
3. El sistema enviará el ID y el Rol en las cabeceras `X-User-Id` y `X-User-Role` (simulado por el middleware del backend).
