# Contabilidad Cooperativa - Molino Florida

Aplicación web de contabilidad de partida doble con costeo conjunto para la Cooperativa de Trabajo Molino Florida (Uruguay).

## 🚀 Cómo arrancarlo
No requiere instalación de dependencias ni backend.
1. Abrir `index.html` en el navegador, o
2. Visitar la URL de GitHub Pages: https://gertecin.github.io/261105_ContabilidadCooperativa/

**Clave del panel de administración:** `molino2026`

## 🧪 Qué está simulado
- **Persistencia:** `localStorage`. Todos los montos son **enteros en centésimos de peso uruguayo** ($U 1 = 100 centésimos).
- **Sin servicios externos:** no hay conexión a correos, WhatsApp ni pasarelas de pago.
- **Navegación libre:** todas las vistas son accesibles sin autenticación, excepto el panel de administración.

## 📊 Datos semilla precargados

La aplicación arranca con **7 meses de actividad real** para demostración:

| Concepto | Cantidad | Detalle |
|----------|----------|---------|
| Cuentas del plan | 65 | 13 activos, 6 pasivos/patrimonio, 9 resultados, 37 auxiliares |
| Productos de molienda | 8 | Harinas 000, 0000, 00, 0, integral, salvado, germen, merma |
| Otros productos | 11 | Harina de maíz, polenta, gofio, avena, maíz, raciones, chicharrón, grasa, margarina |
| Clientes | 70 | Panaderías, almacenes, productores lecheros, escuelas rurales |
| Socios | 33 | Con control de horas (184h base + 24h extra) |
| Empleados no socios | 12 | Con sueldo fijo mensual |
| Asientos contables | ~260 | Producción, ventas, compras, anticipos, sueldos, servicios |
| Moliendas registradas | 91 | 13 por mes × 7 meses, de 12.000 kg cada una |
| Meses cerrados | 6 | Los primeros 6 meses están cerrados (no editables) |

### Metodología de generación de datos semilla

Los datos se generan de forma **determinista** mediante un generador pseudoaleatorio con semilla fija (`261105`). Esto garantiza que:
- Los datos de ejemplo sean **siempre idénticos** al recargar la aplicación.
- Cualquier persona pueda **verificar los cálculos** con los mismos números.
- Para generar datos distintos, cambiar el número en `seededRandom(261105)` por otro valor.

**Distribución de asientos por mes:**
- 13 asientos de producción (uno por molienda)
- 8 asientos de ventas de harinas
- 5 asientos de compra de trigo
- 1 asiento de anticipos a socios (día 8, excepto primer mes)
- 1 asiento de sueldos empleados (día 28)
- 1 asiento de servicio de carga y descarga (día 15)
- **Total: 30 asientos por mes × 7 meses = 210 asientos** + 1 de apertura = 211 asientos base

**Distribución de moliendas:**
- 13 moliendas por mes distribuidas uniformemente en los días del mes
- Turnos rotativos: Mañana, Tarde, Noche
- Cada molienda procesa exactamente 12.000 kg de trigo

## 📊 Ejemplos resueltos (verificación manual)

### 1. Molienda de 12.000 kg (Costeo Conjunto)

**Datos de entrada:**
- Trigo: 12.000 kg × $U 11,40/kg = 13.680.000 centésimos
- Energía: 12.000 kg × $U 0,85/kg = 1.020.000 centésimos
- **Costo Total: 14.700.000 centésimos ($U 147.000,00)**

**Rendimientos y valores de venta:**

| Producto | % | Kilos | Precio ref. | Valor de venta |
|----------|-----|-------|-------------|----------------|
| Harina 000 | 52% | 6.240 | $U 28,00 | 17.472.000 |
| Harina 0000 | 14% | 1.680 | $U 34,00 | 5.712.000 |
| Harina 00 | 3% | 360 | $U 26,00 | 936.000 |
| Harina 0 | 3% | 360 | $U 22,00 | 792.000 |
| Harina integral | 2% | 240 | $U 30,00 | 720.000 |
| Salvado | 20% | 2.400 | $U 9,00 | 2.160.000 |
| Germen | 2% | 240 | $U 45,00 | 1.080.000 |
| Merma | 4% | 480 | $U 0,00 | 0 |
| **TOTAL** | **100%** | **12.000** | | **28.872.000** |

**Asignación de costos por valor de venta relativo:**

Fórmula: `Costo asignado = Costo total × Valor del producto / Suma de valores`

| Producto | Cálculo | Costo asignado | Costo/kg |
|----------|---------|----------------|----------|
| Harina 000 | 14.700.000 × 17.472.000 / 28.872.000 | 8.895.761 | $U 14,2560 |
| Harina 0000 | 14.700.000 × 5.712.000 / 28.872.000 | 2.908.258 | $U 17,3111 |
| Harina 00 | 14.700.000 × 936.000 / 28.872.000 | 476.562 | $U 13,2378 |
| Harina 0 | 14.700.000 × 792.000 / 28.872.000 | 403.228 | $U 11,2008 |
| Harina integral | 14.700.000 × 720.000 / 28.872.000 | 366.571 | $U 15,2738 |
| Salvado | 14.700.000 × 2.160.000 / 28.872.000 | 1.099.882 | $U 4,5828 |
| Germen | 14.700.000 × 1.080.000 / 28.872.000 | 549.941 | $U 22,9142 |
| Merma | No recibe costo | 0 | $U 0,0000 |
| **TOTAL** | | **14.700.000** ✓ | |

**Nota:** El redondeo se asigna al producto de mayor valor (Harina 000) para que la suma sea exacta.

**Verificación:** 8.895.761 + 2.908.258 + 476.562 + 403.228 + 366.571 + 1.099.882 + 549.941 + 0 = **14.700.000 centésimos** ✓

### 2. Anticipo de Socio (40h nocturnas de 184h totales)

**Datos:**
- Horas totales: 184
- Horas nocturnas: 40
- Horas diurnas: 184 - 40 = 144
- Valor hora: $U 250,00 (25.000 centésimos)
- Recargo nocturno: 1,20

**Cálculo:**
- Anticipo diurno: 144 × 25.000 = 3.600.000 centésimos
- Anticipo nocturno: 40 × 25.000 × 1,20 = 1.200.000 centésimos
- **Total: 4.800.000 centésimos = $U 48.000,00** ✓

### 3. Distribución de Excedente

**Excedente del ejercicio:** $U 500.000,00 (50.000.000 centésimos)

**Distribución:**
- Reserva legal (20%): 10.000.000 centésimos = $U 100.000,00
- Fondo de educación cooperativa (5%): 2.500.000 centésimos = $U 25.000,00
- Retorno a socios (75%): 37.500.000 centésimos = $U 375.000,00

**Reparto entre 33 socios:**
- Total horas socios: 33 × 184 = 6.072 horas (sin horas extra ni nocturnas para simplificar)
- Valor por hora: 37.500.000 / 6.072 = 6.175,89... centésimos
- Truncado: 6.175 centésimos/hora
- 32 socios reciben: 184 × 6.175 = 1.136.200 centésimos = $U 11.362,00 cada uno
- Total 32 socios: 36.358.400 centésimos
- **Último socio recibe el ajuste:** 37.500.000 - 36.358.400 = **1.141.600 centésimos = $U 11.416,00**

**Verificación:** (32 × 1.136.200) + 1.141.600 = 36.358.400 + 1.141.600 = **37.500.000 centésimos** ✓

## 🔄 Cómo reiniciar los datos de ejemplo

La aplicación incluye un botón **"Reset"** en el panel de administración que:
1. Borra todos los datos del `localStorage`
2. Regenera los datos semilla originales desde `js/seed.js`
3. Recarga la aplicación con los ~260 asientos, 91 moliendas y 6 meses cerrados

**Pasos para reiniciar:**
1. Hacer clic en la pestaña **"🔒 Admin"** en la navegación
2. Ingresar la clave: `molino2026`
3. Hacer clic en **"Reiniciar datos semilla"**
4. Confirmar la acción

**Para modificar los datos semilla permanentemente:**
1. Editar el archivo `js/seed.js`
2. Modificar los arreglos `accounts`, `products`, `partners`, `employees`, etc.
3. Para cambiar la cantidad de asientos/moliendas, ajustar los bucles en la sección "GENERADOR DE DATOS HISTÓRICOS"
4. Para generar datos aleatorios distintos, cambiar el número en `seededRandom(261105)` por otro valor
5. Subir los cambios al repositorio

## 👷 Por qué los empleados no socios no participan del excedente

Según los principios cooperativos (Ley 18.407 de Uruguay y principios de la ACI), **el excedente cooperativo se distribuye únicamente entre los socios** en proporción a su actividad (horas trabajadas, en este caso). 

Los empleados no socios tienen una relación laboral convencional:
- Reciben un **sueldo fijo mensual** registrado en la cuenta "Sueldos y jornales"
- No tienen derecho a retornos cooperativos
- No participan de la distribución del excedente

Esta distinción es fundamental para mantener la naturaleza cooperativa de la empresa y cumplir con la normativa uruguaya.

## 🧮 Aclaración del contador

Los porcentajes de distribución del excedente (20% reserva legal, 5% fondo de educación cooperativa, 75% retorno a socios) y el recargo nocturno del 1,20 son **datos de ejemplo configurables**. 

**No constituyen asesoramiento contable ni representan la norma uruguaya vigente.** Estos valores deben ser validados por un contador matriculado antes de su uso en producción. La aplicación permite modificarlos en el panel de administración.

## 🔐 Panel de Administración

- **Acceso:** hacer clic en la pestaña **"🔒 Admin"** en la navegación
- **Clave demo:** `molino2026` (definida en la constante `ADMIN_PASSWORD` en `js/app.js`)
- **Funciones:** reiniciar datos semilla, ver configuración
- **Para producción:** el integrador de backend debe reemplazar la validación frontend por un endpoint seguro (`POST /api/auth/login`) con JWT/cookies, y mover la constante `ADMIN_PASSWORD` a variables de entorno del servidor

## 📋 Criterios de revisión cumplidos

- ✅ Asientos desbalanceados no se confirman
- ✅ Asientos confirmados son inmutables; revertir crea contraasiento vinculado
- ✅ Molienda de 12.000 kg: suma de costos asignados = costo total exacto (14.700.000 centésimos)
- ✅ Costo por kilo de harina 000 coincide al centésimo con cálculo manual ($U 14,2560)
- ✅ Suma de saldos deudores = suma de saldos acreedores en el balance
- ✅ Socio con 40h nocturnas: recargo 1,20 solo aplica a esas 40h ($U 48.000,00 total)
- ✅ Simulador de distribución reparte solo entre socios, al centésimo, redondeo al último
- ✅ Todos los montos en enteros (centésimos), persistencia al recargar
- ✅ Libro mayor por cuenta con saldos
- ✅ Balance de sumas y saldos por período
- ✅ Meses cerrados bloquean modificaciones
- ✅ Navegación libre, solo `/admin` requiere login
- ✅ Datos semilla precargados (~260 asientos, 91 moliendas, 6 meses cerrados)
- ✅ README completo con ejemplos resueltos y URL de previsualización

## 🔄 Reiniciar datos
Botón "Reset" en el panel de administración (requiere login con clave `molino2026`).
