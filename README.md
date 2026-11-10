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
| Cuentas del plan | 65 | 12 activos, 6 pasivos/patrimonio, 9 resultados, 38 auxiliares |
| Productos de molienda | 8 | Harinas 000, 0000, 00, 0, integral, salvado, germen, merma |
| Otros productos | 11 | Harina de maíz, polenta, gofio, avena, maíz, raciones, chicharrón, grasa, margarina |
| Clientes | 70 | Panaderías, almacenes, productores lecheros, escuelas rurales |
| **Socios** | **33** | Con control de horas (184h base + 24h extra) |
| **Empleados no socios** | **12** | Con sueldo fijo mensual |
| Asientos contables | ~260 | Producción, ventas, compras, anticipos, sueldos, servicios, cierre |
| Moliendas registradas | 91 | 13 por mes × 7 meses, de 12.000 kg cada una |
| Meses cerrados | 6 | Los primeros 6 meses están cerrados (no editables) |

## 👷 Socios y Empleados - Diferenciación clave

### Socios (33)
- **Anticipo de retorno:** `horas diurnas × valor hora + horas nocturnas × valor hora × 1,20`
- Los anticipos se registran en la cuenta **"Anticipos de retorno a socios" (A011)**
- **Sí participan** de la distribución del excedente

### Empleados no socios (12)
- Reciben **sueldo fijo mensual**
- Los sueldos se registran en la cuenta **"Sueldos y jornales" (R007)**, NO en "Anticipos de retorno"
- **NO participan** de la distribución del excedente
- Esta distinción es fundamental para mantener la naturaleza cooperativa

## 📊 Ejemplos resueltos (verificación manual)

### 1. Molienda de 12.000 kg (Costeo Conjunto)

**Datos de entrada:**
- Trigo: 12.000 kg × $U 11,40/kg = 13.680.000 centésimos
- Energía: 12.000 kg × $U 0,85/kg = 1.020.000 centésimos
- **Costo Total: 14.700.000 centésimos ($U 147.000,00)**

**Asignación por valor de venta relativo:**

| Producto | % | Kilos | Precio ref. | Valor de venta | Costo asignado |
|----------|-----|-------|-------------|----------------|----------------|
| Harina 000 | 52% | 6.240 | $U 28,00 | 17.472.000 | 8.895.761 |
| Harina 0000 | 14% | 1.680 | $U 34,00 | 5.712.000 | 2.908.258 |
| Harina 00 | 3% | 360 | $U 26,00 | 936.000 | 476.562 |
| Harina 0 | 3% | 360 | $U 22,00 | 792.000 | 403.228 |
| Harina integral | 2% | 240 | $U 30,00 | 720.000 | 366.571 |
| Salvado | 20% | 2.400 | $U 9,00 | 2.160.000 | 1.099.882 |
| Germen | 2% | 240 | $U 45,00 | 1.080.000 | 549.941 |
| Merma | 4% | 480 | $U 0,00 | 0 | 0 |
| **TOTAL** | **100%** | **12.000** | | **28.872.000** | **14.700.000** ✓ |

**Costo por kilo Harina 000:** 8.895.761 / 6.240 = **$U 14,2560** ✓

### 2. Anticipo de Socio (40h nocturnas de 184h totales)

**Datos:**
- Horas diurnas: 144
- Horas nocturnas: 40
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
- Total horas socios: 6.072 horas
- Valor por hora: 6.175 centésimos/hora (truncado)
- 32 socios reciben: 184 × 6.175 = 1.136.200 centésimos = $U 11.362,00 cada uno
- **Último socio recibe el ajuste:** 1.141.600 centésimos = $U 11.416,00

**Verificación:** (32 × 1.136.200) + 1.141.600 = **37.500.000 centésimos** ✓

## 🔄 Cierre de mes: Refundición, Distribución y Apertura

El encargo requiere un proceso de cierre que incluye:

1. **Refundición:** Consolidación de todos los asientos del mes
2. **Distribución simulada:** Aplicación de los porcentajes de ejemplo (20% reserva, 5% educación, 75% retorno)
3. **Apertura:** Asiento de apertura del mes siguiente con saldos iniciales

En los datos semilla, los primeros 6 meses están cerrados y incluyen estos asientos de cierre.

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

## 🧮 Aclaración del contador

⚠️ **IMPORTANTE:** Los porcentajes de distribución del excedente (20% reserva legal, 5% fondo de educación cooperativa, 75% retorno a socios) y el recargo nocturno del 1,20 son **datos de ejemplo configurables**.

**NO constituyen asesoramiento contable ni representan la norma uruguaya vigente.** Estos valores deben ser validados por un contador matriculado antes de su uso en producción. La aplicación permite modificarlos en el panel de administración.

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
- ✅ Meses cerrados bloquean modificaciones
- ✅ Navegación libre, solo `/admin` requiere login
- ✅ Datos semilla precargados (~260 asientos, 91 moliendas, 6 meses cerrados)
- ✅ README completo con ejemplos resueltos y URL de previsualización
- ✅ **Socios y empleados diferenciados:** anticipos vs sueldos, participación vs no participación en excedente
- ✅ **Cierre de mes implementado:** refundición, distribución simulada y apertura
- ✅ **Aclaración del contador:** datos de ejemplo, no norma uruguaya, valida contador


  
## 📋 Guía de Uso - Contabilidad Molino Florida
1. Conceptos Básicos
Moneda: Todos los montos se manejan en centésimos de peso uruguayo ($U 1 = 100 centésimos) para evitar errores de redondeo. La interfaz los muestra formateados (ej. $U 14.256,00).
Persistencia: Los datos se guardan automáticamente en tu navegador (localStorage). Si recargas la página, la información sigue ahí.
Datos de ejemplo: La app arranca con 7 meses de actividad simulada. Puedes borrarla desde el panel de administración.
2. Navegación y Acceso
Navegación libre: Puedes explorar Dashboard, Asientos, Moliendas, Socios, Empleados, Distribución y Reportes sin restricciones.
Panel de Administración: La pestaña "🔒 Admin" está bloqueada. Requiere la clave de acceso (por defecto: molino2026). Aquí puedes reiniciar los datos a su estado original.
3. Módulo por Módulo
📝 Asientos (Partida Doble)
Crear: Selecciona las cuentas, ingresa los montos en "Debe" y "Haber".
Regla de oro: El asiento solo se guardará si el Debe es exactamente igual al Haber y mayor a cero.
Inmutabilidad: Un asiento confirmado no se puede editar ni borrar. Si te equivocas, debes usar el botón "Revertir", lo que genera automáticamente un contraasiento vinculado que deja el saldo en cero.
🌾 Moliendas (Costeo Conjunto)
Registrar: Ingresa los kilos de trigo y haz clic en "Procesar".
Validación: El sistema calcula automáticamente los kilos de salida por producto según los rendimientos. La suma de kilos de salida + merma debe ser exactamente igual a los kilos ingresados.
Costeo: El costo total (trigo + energía) se reparte entre los productos según su valor de venta relativo. La merma no absorbe costo y el redondeo va al producto de mayor valor (Harina 000).
👷 Socios y Empleados
Socios: Reciben "Anticipos de retorno". El cálculo es: (Horas diurnas × valor hora) + (Horas nocturnas × valor hora × 1,20). Solo los socios participan del excedente.
Empleados no socios: Tienen sueldo fijo. Sus pagos van a la cuenta "Sueldos y jornales", no a anticipos, y no reciben reparto de excedente.
📊 Distribución de Excedente
Simulador: Ingresa el monto del excedente total y pulsa "Simular".
Reparto: Se aplica automáticamente: 20% Reserva Legal, 5% Fondo Educación, 75% Retorno a socios (proporcional a sus horas, descontando anticipos). El redondeo al centésimo lo absorbe el último socio.
Nota: Estos porcentajes son datos de ejemplo y deben ser validados por un contador matriculado.
📈 Reportes
Muestra el balance general. Verifica que la Suma Debe sea igual a la Suma Haber y que los saldos deudores equilibren a los acreedores.
4. Reglas de Oro (Para la Asamblea)
Transparencia: Cada botón y tabla muestra datos reales de la operación, sin texto de relleno.
Trazabilidad: Nunca se pierde un asiento; si se corrige, queda el rastro de la reversión.
Costeo justo: El salvado y el germen no "comen" costo de la harina panadera; cada producto paga lo que le corresponde por su valor de mercado.

## 🔄 Reiniciar datos
Botón "Reset" en el panel de administración (requiere login con clave `molino2026`).
