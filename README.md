# Contabilidad Cooperativa - Molino Florida

Aplicación web de contabilidad de partida doble con costeo conjunto.

## 🚀 Cómo arrancarlo
1. Abrir `index.html` en el navegador o visitar: https://gertecin.github.io/261105_ContabilidadCooperativa/
2. **Clave de acceso (Admin):** `molino2026`

## 🧪 Qué está simulado
- Persistencia en `localStorage`. Montos en enteros (centésimos de $U).
- Datos semilla: 65 cuentas, 70 clientes, 33 socios, 12 empleados, ~260 asientos, ~90 moliendas.
- **Reglas de negocio:** Cupo de 12.000 kg por turno, límite de 184h + 24h extra por socio, reparto martes/jueves.

## 📊 Ejemplos resueltos
### 1. Molienda de 12.000 kg
Costo Total: (12.000 × 1.140) + (12.000 × 85) = 14.700.000 centésimos.
Asignación por valor relativo. Harina 000: 8.895.761 cent. Costo/kg: $U 14,2560.

### 2. Anticipo de Socio (40h nocturnas)
Diurnas: 144h × 25.000 = 3.600.000. Nocturnas: 40h × 25.000 × 1,20 = 1.200.000. Total: $U 48.000,00.

## 🔄 Cómo sustituir datos
Editar `js/seed.js`. La función `generateSeed()` usa una semilla fija. Cambiar el número `261105` para generar datos distintos.

## 👷 Empleados no socios
Reciben sueldo fijo en "Sueldos y jornales". No participan del excedente (Ley 18.407 Uruguay).

## 🧮 Aclaración del contador
Los porcentajes (20% reserva, 5% educación, 75% retorno) y recargo nocturno (1,20) son datos de ejemplo. Deben ser validados por un contador matriculado.

## 🔐 Panel de Administración
- Clave: `molino2026` (en `js/app.js`).
- Para producción: reemplazar por endpoint seguro (`POST /api/auth/login`) con JWT.

## 🔄 Reiniciar datos
Botón "Reset" en el panel de administración.
