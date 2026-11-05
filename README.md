# Contabilidad Cooperativa - Molino Florida

Aplicación web de contabilidad de partida doble con costeo conjunto.

## 🚀 Cómo arrancarlo
1. Abrir `index.html` en el navegador o ver la URL de GitHub Pages.
2. **Clave de acceso:** `molino2026`

## 🧪 Qué está simulado
- Persistencia en `localStorage`. Montos en enteros (centésimos de $U).
- Datos semilla generados localmente (65 cuentas, 70 clientes, 15 socios).
- Sin servicios externos.

## 📊 Ejemplos resueltos (Para verificación manual de Kodarvia)

### 1. Molienda de 12.000 kg (Costeo Conjunto)
**Costo Total:** (12.000 kg × 1.140 cent/kg) + (12.000 kg × 85 cent/kg) = **14.700.000 centésimos**.
**Asignación por valor de venta relativo:**
- Harina 000: 6.240 kg × 2.800 = 17.472.000 (60,51% del valor total).
- Costo asignado H000: 14.700.000 × (17.472.000 / 28.872.000) = 8.895.760,59...
- La app redondea y asigna la diferencia al producto de mayor valor (H000) para que la suma sea **exactamente 14.700.000 centésimos**.
- **Costo por kilo H000:** 8.895.761 / 6.240 = **1.425,60 centésimos ($U 14,2560)**.

### 2. Anticipo de Socio (40h nocturnas de 184h totales)
- Diurnas: 144h × 25.000 cent = 3.600.000 cent.
- Nocturnas: 40h × 25.000 cent × 1,20 = 1.200.000 cent.
- **Total:** **4.800.000 centésimos ($U 48.000,00)**.

### 3. Distribución de Excedente (Simulador)
**Excedente:** 50.000.000 centésimos ($U 500.000,00).
- Reserva Legal (20%): 10.000.000 cent.
- Fondo Educación (5%): 2.500.000 cent.
- Retorno Socios (75%): 37.500.000 cent.
- **Reparto:** 37.500.000 / 2.760 horas totales (15 socios × 184h) = 13.586,95 cent/hora.
- 14 socios reciben 184 × 13.586 = 2.499.824 cent.
- **Último socio:** Recibe el ajuste (37.500.000 - 34.997.536) = **2.502.464 centésimos**.

## 🔐 Panel de Administración
- **Clave actual:** `molino2026` (definida en la constante `ADMIN_PASSWORD` en `js/app.js`).
- **Para cambiarla:** El integrador de backend debe reemplazar esta validación frontend por un endpoint seguro (`POST /api/auth/login`) y manejar la sesión con JWT/cookies.

## 🔄 Reiniciar datos
Botón "Reset" en la esquina superior derecha.
