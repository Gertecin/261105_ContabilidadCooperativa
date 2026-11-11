# Contabilidad Cooperativa - Molino Florida

Aplicación web de contabilidad de partida doble con costeo conjunto para la Cooperativa de Trabajo Molino Florida (Uruguay).

## 🚀 Cómo arrancarlo
No requiere instalación de dependencias ni backend.
1. Abrir `index.html` directamente en el navegador, o
2. Visitar la URL de GitHub Pages: https://gertecin.github.io/261105_ContabilidadCooperativa/

**Clave del panel de administración:** `molino2026`

## 🧪 Qué está simulado
- **Persistencia:** `localStorage`. Todos los montos son **enteros en centésimos de peso uruguayo** ($U 1 = 100 centésimos).
- **Datos semilla precargados:** 65 cuentas, 70 clientes, 33 socios, 12 empleados no socios, ~260 asientos, ~91 moliendas y 6 meses cerrados.
- **Sin servicios externos:** no hay conexión a correos, WhatsApp ni pasarelas de pago.
- **Navegación libre:** todas las vistas son accesibles sin autenticación, excepto el panel de administración (`/admin`).

## 📊 Ejemplos resueltos (verificación manual)

### 1. Molienda de 12.000 kg (Costeo Conjunto)
**Costo Total:** (12.000 kg × 1.140 cent/kg) + (12.000 kg × 85 cent/kg) = **14.700.000 centésimos** ($U 147.000,00).
**Asignación por valor de venta relativo:** Harina 000 (52% = 6.240 kg × $U 28,00 = 17.472.000 cent. valor).
- Costo asignado H000: 14.700.000 × (17.472.000 / 28.872.000) = 8.895.761 centésimos.
- **Costo por kilo H000:** 8.895.761 / 6.240 = **1.425,60 centésimos ($U 14,2560)**.

### 2. Anticipo de Socio (40h nocturnas de 184h totales)
- Diurnas: 144h × 25.000 cent = 3.600.000 cent.
- Nocturnas: 40h × 25.000 cent × 1,20 = 1.200.000 cent.
- **Total: 4.800.000 centésimos ($U 48.000,00)**.

### 3. Distribución de Excedente
**Excedente:** 50.000.000 centésimos ($U 500.000,00).
- Reserva Legal (20%): 10.000.000 cent. | Fondo Educación (5%): 2.500.000 cent.
- Retorno Socios (75%): 37.500.000 cent.
- Reparto: 37.500.000 / horas totales socios. El redondeo al centésimo lo absorbe el último socio.

---

## 🔄 Cómo sustituir los datos de ejemplo
Los datos semilla se generan en `js/seed.js` mediante la función `generateSeed()`.
1. Edita el archivo `js/seed.js`.
2. Modifica los arreglos `accounts`, `products`, `partners`, `employees`, etc., según tus necesidades.
3. Para cambiar la cantidad de asientos/moliendas históricas, ajusta los bucles `for` en la sección "GENERADOR DE DATOS HISTÓRICOS".
4. La función `seededRandom(261105)` usa una semilla fija para que los datos aleatorios sean siempre idénticos. Cambia el número `261105` por otro valor si deseas generar un conjunto de datos diferente.
5. Para limpiar los datos actuales y cargar los nuevos, usa el botón **"Reiniciar datos semilla"** en el panel de administración.

## 👷 Por qué los empleados no socios no participan del excedente
Según los principios cooperativos (Ley 18.407 de Uruguay y principios de la ACI), **el excedente cooperativo se distribuye únicamente entre los socios** en proporción a su actividad (horas trabajadas, en este caso). 

Los empleados no socios mantienen una relación laboral convencional:
- Reciben un **sueldo fijo mensual** registrado en la cuenta "Sueldos y jornales" (R007).
- No tienen derecho a retornos cooperativos ni participan de la distribución del excedente.
Esta distinción es fundamental para mantener la naturaleza jurídica cooperativa de la empresa y cumplir con la normativa uruguaya.

## 🧮 Aclaración del contador
⚠️ **IMPORTANTE:** Los porcentajes de distribución del excedente (20% reserva legal, 5% fondo de educación cooperativa, 75% retorno a socios) y el recargo nocturno del 1,20 son **datos de ejemplo configurables**. 

**NO constituyen asesoramiento contable ni representan la norma uruguaya vigente.** Estos valores y métodos de asignación deben ser validados por un contador matriculado antes de su uso en un entorno de producción real.

## 🔐 Panel de Administración
- **Acceso:** hacer clic en la pestaña **"🔒 Admin"** en la navegación superior.
- **Clave demo:** `molino2026` (definida en la constante `ADMIN_PASSWORD` en `js/app.js`).
- **Para producción:** el integrador de backend debe reemplazar esta validación frontend por un endpoint seguro (`POST /api/auth/login`) con JWT/cookies, y mover la constante `ADMIN_PASSWORD` a variables de entorno del servidor.
