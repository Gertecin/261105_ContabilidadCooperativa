# Contabilidad Cooperativa - Molino Florida

Aplicación web de contabilidad de partida doble con costeo conjunto para la Cooperativa de Trabajo Molino Florida. 

## 🚀 Cómo arrancarlo
No requiere instalación de dependencias ni backend. 
1. Abre el archivo `index.html` directamente en tu navegador, o
2. Súbelo a la rama `main` (o `gh-pages`) de este repositorio para visualizarlo en GitHub Pages.

## 🧪 Qué está simulado
- **Sin backend:** Toda la persistencia se maneja mediante `localStorage`.
- **Datos de ejemplo:** Se generan automáticamente al primer carga (65 cuentas del plan, 70 clientes, 15 socios, rendimientos de molienda y precios de referencia según el briefing).
- **Servicios externos:** No hay conexión a correos, WhatsApp ni pasarelas de pago. Los flujos están cableados con datos locales.
- **Lógica contable y de costeo:** 
  - Partida doble estricta (Debe = Haber). Los asientos confirmados son inmutables.
  - Costeo conjunto por valor de venta relativo. La merma no absorbe costo y el redondeo va al producto de mayor valor.
  - Anticipos de socios calculados con recargo nocturno (1.20) sobre las horas correspondientes.
  - Montos manejados estrictamente en **enteros (centésimos de peso uruguayo)** para evitar errores de punto flotante.

## 🔄 Cómo reiniciar los datos de ejemplo
En la pantalla principal, en el encabezado superior derecho, hay un botón rojo **"Reset"**. Al presionarlo, se borra el `localStorage` y la aplicación vuelve a generar los datos semilla originales.

## 🔐 Panel de Administración
Al ser una demo frontend, no hay clave de acceso real. Para simular un cambio de clave en un entorno real, el integrador de backend deberá envolver el componente `<App />` en un `AuthProvider` que valide credenciales contra la API antes de renderizar la interfaz.

## 🎨 Identidad Visual
- **Paleta:** Tonos harina (#FBF8F1), trigo maduro/dorados (#D9A441), verde campo (#5E7D3A) y tierra (#3B2F1E).
- **Tipografía:** Roboto Slab (títulos) e Inter (texto).
- **Enfoque:** Mobile-first, tablas limpias y explicaciones breves para transparencia en asamblea.
