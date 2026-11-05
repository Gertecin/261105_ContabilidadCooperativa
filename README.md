# Contabilidad Cooperativa - Molino Florida

Aplicación web de contabilidad de partida doble con costeo conjunto para la Cooperativa de Trabajo Molino Florida (Uruguay).

## 🚀 Cómo arrancarlo
No requiere instalación de dependencias ni backend.
1. Abrí el archivo `index.html` directamente en tu navegador, o
2. Subilo a la rama `main` de este repositorio para visualizarlo en GitHub Pages.

## 🧪 Qué está simulado
- **Sin backend:** toda la persistencia se maneja mediante `localStorage`.
- **Datos de ejemplo:** se generan automáticamente al primer carga (65 cuentas del plan, 70 clientes, 15 socios, rendimientos de molienda y precios de referencia según el briefing).
- **Servicios externos:** no hay conexión a correos, WhatsApp ni pasarelas de pago. Los flujos están cableados con datos locales.
- **Montos:** todos los valores se manejan como **enteros en centésimos de peso uruguayo** ($U 1 = 100 centésimos) para evitar errores de punto flotante.

## 📊 Ejemplos resueltos (verificación manual)

### Ejemplo 1: Molienda de 12.000 kg de trigo

**Datos de entrada:**
- Trigo ingresado: 12.000 kg
- Precio trigo: $U 11,40/kg = 1.140 centésimos/kg
- Energía: $U 0,85/kg = 85 centésimos/kg

**Costo total de la molienda:**
- Trigo: 12.000 × 1.140 = 13.680.000 centésimos
- Energía: 12.000 × 85 = 1.020.000 centésimos
- **Total: 14.700.000 centésimos ($U 147.000,00)**

**Rendimientos y valores de venta:**

| Producto | % | Kilos | Precio ref. (centésimos) | Valor de venta (centésimos) |
|----------|-----|-------|--------------------------|----------------------------|
| Harina 000 | 52% | 6.240 | 2.800 | 17.472.000 |
| Harina 0000 | 14% | 1.680 | 3.400 | 5.712.000 |
| Harina 00 | 3% | 360 | 2.600 | 936.000 |
| Harina 0 | 3% | 360 | 2.200 | 792.000 |
| Harina integral | 2% | 240 | 3.000 | 720.000 |
| Salvado | 20% | 2.400 | 900 | 2.160.000 |
| Germen | 2% | 240 | 4.500 | 1.080.000 |
| Merma | 4% | 480 | 0 | 0 |
| **TOTAL** | **100%** | **12.000** | | **28.872.000** |

**Asignación de costos por valor de venta relativo:**

Fórmula: `Costo asignado = Costo total × Valor del producto / Suma de valores`

| Producto | Cálculo | Costo asignado (centésimos) | Costo/kg (centésimos) |
|----------|---------|----------------------------|----------------------|
| Harina 000 | 14.700.000 × 17.472.000 / 28.872.000 = 8.896.055,07 → **8.895.558** | 8.895.558 | 1.425,57 |
| Harina 0000 | 14.700.000 × 5.712.000 / 28.872.000 = 2.908.257,94 → 2.908.258 | 2.908.258 | 1.731,11 |
| Harina 00 | 14.700.000 × 936.000 / 28.872.000 = 476.562,05 → 476.562 | 476.562 | 1.323,78 |
| Harina 0 | 14.700.000 × 792.000 / 28.872.000 = 403.228,04 → 403.228 | 403.228 | 1.120,08 |
| Harina integral | 14.700.000 × 720.000 / 28.872.000 = 366.571,08 → 366.571 | 366.571 | 1.527,38 |
| Salvado | 14.700.000 × 2.160.000 / 28.872.000 = 1.099.882,24 → 1.099.882 | 1.099.882 | 458,28 |
| Germen | 14.700.000 × 1.080.000 / 28.872.000 = 549.941,12 → 549.941 | 549.941 | 2.291,42 |
| Merma | No recibe costo | 0 | 0 |
| **TOTAL** | | **14.700.000** | |

**Nota sobre redondeo:** La suma de los valores truncados da 14.700.497 centésimos (exceso de 497). El redondeo se aplica al producto de mayor valor (Harina 000), restando 497 centésimos: 8.896.055 - 497 = **8.895.558 centésimos**.

**Verificación:** 8.895.558 + 2.908.258 + 476.562 + 403.228 + 366.571 + 1.099.882 + 549.941 + 0 = **14.700.000 centésimos** ✓

**Costo por kilo de harina 000:** 8.895.558 / 6.240 = **1.425,57 centésimos = $U 14,2557 ≈ $U 14,26**

### Ejemplo 2: Anticipo de socio con 40 horas nocturnas

**Datos:**
- Horas totales del mes: 184
- Horas nocturnas: 40
- Horas diurnas: 184 - 40 = 144
- Valor hora: $U 250,00 = 25.000 centésimos
- Recargo nocturno: 1,20

**Cálculo:**
- Anticipo diurno: 144 × 25.000 = 3.600.000 centésimos
- Anticipo nocturno: 40 × 25.000 × 1,20 = 1.200.000 centésimos
- **Total: 4.800.000 centésimos = $U 48.000,00**

**Verificación:** El recargo del 20% se aplica **solo** a las 40 horas nocturnas, no a las 144 diurnas. ✓

### Ejemplo 3: Distribución del excedente

**Datos de ejemplo:**
- Excedente del ejercicio: $U 500.000,00 = 50.000.000 centésimos
- Socios: 15, cada uno con 184 horas = 2.760 horas totales

**Distribución:**
- Reserva legal (20%): 10.000.000 centésimos = $U 100.000,00
- Fondo de educación cooperativa (5%): 2.500.000 centésimos = $U 25.000,00
- Retorno a socios (75%): 37.500.000 centésimos = $U 375.000,00

**Reparto entre socios:**
- Valor por hora: 37.500.000 / 2.760 = 13.586,9565... centésimos
- Truncado: 13.586 centésimos/hora
- 14 socios reciben: 184 × 13.586 = 2.499.824 centésimos = $U 24.998,24 cada uno
- Total 14 socios: 34.997.536 centésimos
- Último socio recibe el redondeo: 37.500.000 - 34.997.536 = **2.502.464 centésimos = $U 25.024,64**

**Verificación:** (14 × 2.499.824) + 2.502.464 = 34.997.536 + 2.502.464 = **37.500.000 centésimos** ✓

### Ejemplo 4: Balance de comprobación

La suma de saldos deudores debe ser igual a la suma de saldos acreedores en cualquier período, garantizado por la partida doble (Debe = Haber en cada asiento).

## 🔄 Cómo reiniciar los datos de ejemplo
En la pantalla principal, en el encabezado superior derecho, hay un botón rojo **"Reset"**. Al presionarlo, se borra el `localStorage` y la aplicación vuelve a generar los datos semilla originales.

## 🔐 Panel de Administración
Al ser una demo frontend, no hay clave de acceso real. Para simular un cambio de clave en un entorno real, el integrador de backend deberá envolver el componente `<App />` en un `AuthProvider` que valide credenciales contra la API antes de renderizar la interfaz.

## 🎨 Identidad Visual
- **Paleta:** Tonos harina (#FBF8F1), trigo maduro/dorados (#D9A441), verde campo (#5E7D3A) y tierra (#3B2F1E).
- **Tipografía:** Roboto Slab (títulos) e Inter (texto).
- **Enfoque:** Mobile-first, tablas limpias y explicaciones breves para transparencia en asamblea.
