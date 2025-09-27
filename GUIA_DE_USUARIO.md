# Guía de Usuario - Rastreador de Cartera de Acciones

![Rastreador de Cartera de Acciones](https://github.com/user-attachments/assets/8df2d6a8-aa46-4530-97d9-b65a8bc5eb06)

## Índice
1. [Descripción General](#descripción-general)
2. [Componentes de la Aplicación](#componentes-de-la-aplicación)
3. [Funcionalidades del Usuario](#funcionalidades-del-usuario)
4. [Guía de Configuración](#guía-de-configuración)
5. [Gestión de Transacciones](#gestión-de-transacciones)
6. [Análisis y Reportes](#análisis-y-reportes)
7. [Importación y Exportación de Datos](#importación-y-exportación-de-datos)
8. [Arquitectura Técnica](#arquitectura-técnica)

## Descripción General

El **Rastreador de Cartera de Acciones** es una aplicación web desarrollada en React que permite a los usuarios monitorear sus inversiones en acciones y calcular su rentabilidad en tiempo real. La aplicación ofrece herramientas completas para:

- Registrar transacciones de compra y venta de acciones
- Visualizar el rendimiento de la cartera con gráficos interactivos
- Calcular ganancias/pérdidas realizadas y no realizadas
- Gestionar precios actuales de las acciones
- Importar/exportar datos en formato CSV
- Analizar la distribución y evolución de la cartera

## Componentes de la Aplicación

### 1. Panel de Control (ControlPanel)
**Ubicación:** Lado izquierdo de la interfaz

**Funciones principales:**
- **Registrar Transacción:** Formulario para añadir nuevas operaciones
- **Gestión de Datos:** Herramientas de importación/exportación CSV
- **Precios Actuales:** Actualización manual de precios de acciones

### 2. Dashboard Principal
**Ubicación:** Lado derecho de la interfaz

**Secciones incluidas:**
- **Tarjetas de resumen:** Métricas clave de la cartera
- **Gráficos interactivos:** Evolución temporal y distribución
- **Tabla de resumen por acción:** Análisis detallado por ticker
- **Detalle de transacciones:** Historial completo de operaciones

### 3. Modales Interactivos
- **Modal de Edición:** Para modificar transacciones existentes
- **Modal de Confirmación:** Para eliminar transacciones

## Funcionalidades del Usuario

### A. Gestión de Transacciones

#### Añadir Nueva Transacción
1. **Fecha:** Seleccionar la fecha de la operación (por defecto: fecha actual)
2. **Ticker/Acción:** Introducir el símbolo de la acción (ej: AAPL, MSFT)
3. **Cantidad:** 
   - Número positivo para **compras**
   - Número negativo para **ventas**
   - Soporta decimales para acciones fraccionarias
4. **Precio/Acción:** Precio al que se ejecutó la operación (hasta 6 decimales)
5. **Comisión (opcional):** Comisiones de la operación

**Validaciones automáticas:**
- Los campos obligatorios no pueden estar vacíos
- La cantidad no puede ser 0
- El precio debe ser positivo
- Los tickers se convierten automáticamente a mayúsculas

#### Editar Transacciones Existentes
1. Localizar la transacción en la tabla "Detalle de Compras"
2. Hacer clic en el botón **"Editar"**
3. Modificar los campos necesarios en el modal
4. Confirmar con **"Guardar Cambios"** o cancelar

#### Eliminar Transacciones
1. Hacer clic en **"Eliminar"** junto a la transacción deseada
2. Confirmar la eliminación en el modal de confirmación
3. La transacción se eliminará permanentemente

### B. Visualización de Datos

#### Métricas de Resumen
La aplicación muestra 6 tarjetas principales:

1. **Valor de Cartera:** Valor actual total de todas las posiciones
2. **Coste Total:** Inversión total realizada (incluyendo comisiones)
3. **G/P Total:** Ganancia o pérdida total actual
4. **Rentabilidad:** Porcentaje de rentabilidad de la cartera
5. **Ganancias Realizadas:** Beneficios obtenidos de ventas completadas
6. **Ganancias No Realizadas:** Beneficios/pérdidas de posiciones abiertas

#### Gráficos Interactivos

**Evolución de la Cartera (Gráfico de Líneas):**
- Muestra la evolución temporal del coste total vs valor actual
- Permite identificar tendencias y momentos clave
- Interactivo con tooltips informativos

**Distribución de la Cartera (Gráfico Circular):**
- Visualiza el peso porcentual de cada acción en la cartera
- Colores distintivos para cada posición
- Leyenda interactiva

#### Tabla de Resumen por Acción
Información detallada para cada ticker:
- **Cantidad total:** Posición neta actual
- **Precio medio:** Precio promedio ponderado de compra
- **Coste total:** Inversión total en esa acción
- **Precio actual:** Último precio configurado
- **Valor actual:** Valoración actual de la posición
- **Ganancia total:** Beneficio/pérdida absoluta
- **Ganancia media por acción:** Beneficio por unidad
- **Ganancia tras impuestos (19%):** Beneficio neto después de impuestos
- **Rentabilidad (%):** Porcentaje de rentabilidad

### C. Filtrado y Búsqueda

#### Filtros en Detalle de Compras
1. **Por ticker:** Dropdown para seleccionar una acción específica
2. **Por rango de fechas:** Filtros de fecha desde/hasta
3. **Botón "Limpiar":** Restablecer todos los filtros

### D. Gestión de Precios Actuales

#### Actualización Manual de Precios
1. Localizar la sección "Precios Actuales" en el panel izquierdo
2. Modificar el precio de cualquier acción
3. Los cambios se reflejan automáticamente en todos los cálculos
4. Los precios se guardan automáticamente en el navegador

**Nota importante:** La aplicación no obtiene precios automáticamente. Los usuarios deben actualizar los precios manualmente para obtener valoraciones precisas.

## Guía de Configuración

### Persistencia de Datos
La aplicación utiliza **localStorage** del navegador para guardar:
- Todas las transacciones registradas
- Precios actuales de las acciones
- Los datos persisten entre sesiones del navegador

### Configuración Inicial
La aplicación incluye datos de ejemplo para demostración:
- Transacciones de ORO, NVIDIA y S&P500
- Precios iniciales predefinidos
- Los usuarios pueden eliminar estos datos y comenzar desde cero

### Copias de Seguridad
**Recomendación importante:** Realizar exportaciones CSV periódicas como copia de seguridad, ya que los datos se almacenan solo localmente.

## Gestión de Transacciones

### Tipos de Operaciones Soportadas

#### Compras (Cantidad Positiva)
- Aumentan la posición en la acción
- Se suman al coste total
- Afectan al precio medio ponderado

#### Ventas (Cantidad Negativa)
- Reducen la posición en la acción
- Generan ganancias/pérdidas realizadas
- El coste se reduce proporcionalmente

### Cálculos Automáticos

#### Precio Medio Ponderado
El sistema calcula automáticamente el precio medio considerando:
- Solo las operaciones de compra
- Las cantidades compradas
- Las comisiones asociadas

#### Ganancias/Pérdidas
- **Realizadas:** Se calculan al vender posiciones
- **No realizadas:** Diferencia entre valor actual y coste para posiciones abiertas

#### Tratamiento Fiscal
- Se incluye un cálculo de ganancia tras impuestos al 19%
- Solo es orientativo y puede variar según la jurisdicción

## Análisis y Reportes

### Métricas Disponibles

#### A Nivel de Cartera
- Valor total de la cartera
- Coste total invertido
- Rentabilidad absoluta y porcentual
- Distribución de activos

#### A Nivel de Acción
- Análisis individual por ticker
- Rentabilidad específica
- Peso en la cartera
- Historial de transacciones

### Visualizaciones Interactivas

#### Gráfico de Evolución Temporal
- **Propósito:** Mostrar cómo ha evolucionado la cartera en el tiempo
- **Datos mostrados:** Coste acumulado vs valor actual
- **Interactividad:** Tooltips con información detallada
- **Utilidad:** Identificar períodos de mayor/menor rendimiento

#### Gráfico de Distribución
- **Propósito:** Visualizar la diversificación de la cartera
- **Datos mostrados:** Porcentaje de cada acción en el valor total
- **Colores:** Paleta distintiva para cada posición
- **Utilidad:** Identificar concentraciones de riesgo

## Importación y Exportación de Datos

### Exportación de Datos

#### Proceso de Exportación
1. Hacer clic en **"Exportar CSV"**
2. El archivo se descarga automáticamente como `cartera_acciones.csv`
3. Incluye todas las transacciones con sus datos completos

#### Formato del CSV Exportado
```csv
date,ticker,quantity,price,commission
2025-07-11,ORO,0.034021,2909.94,0
2025-07-14,NVIDIA,0.99758162,165.4,0
```

**Columnas incluidas:**
- `date`: Fecha en formato YYYY-MM-DD
- `ticker`: Símbolo de la acción
- `quantity`: Cantidad (positiva/negativa)
- `price`: Precio por acción
- `commission`: Comisión de la operación

### Importación de Datos

#### Proceso de Importación
1. Preparar archivo CSV con el formato correcto
2. Hacer clic en **"Importar CSV"**
3. Seleccionar el archivo desde el explorador
4. El sistema procesa e importa las transacciones válidas

#### Formato Requerido para Importación
**Cabeceras obligatorias:** `date,ticker,quantity,price`
**Cabecera opcional:** `commission`

#### Validaciones Durante la Importación
- **Formato de fecha:** Debe ser válido
- **Ticker:** No puede estar vacío
- **Cantidad:** Debe ser un número distinto de 0
- **Precio:** Debe ser un número positivo
- **Comisión:** Si no se especifica, se asume 0

#### Manejo de Errores
- Las líneas con errores se saltan automáticamente
- Se muestran advertencias en la consola del navegador
- Al final se informa el número de transacciones importadas exitosamente

### Casos de Uso Comunes

#### Migración de Datos
1. Exportar datos desde otra plataforma en formato CSV
2. Ajustar las cabeceras al formato requerido
3. Importar en la aplicación

#### Copia de Seguridad y Restauración
1. **Copia de seguridad:** Exportar regularmente los datos
2. **Restauración:** Importar el CSV en caso de pérdida de datos

#### Trabajo Colaborativo
1. Exportar datos para compartir con asesores
2. Recibir transacciones de terceros e importarlas

## Arquitectura Técnica

### Stack Tecnológico
- **Frontend:** React 19.1.1 con TypeScript
- **Gráficos:** Recharts 3.1.2
- **Bundler:** Vite 6.2.0
- **Persistencia:** localStorage del navegador

### Estructura de Componentes

#### Componentes Principales
1. **App.tsx** - Componente principal y gestión de estado global
2. **Header.tsx** - Cabecera de la aplicación
3. **ControlPanel.tsx** - Panel de control lateral
4. **Dashboard.tsx** - Panel principal con métricas y gráficos
5. **EditTransactionModal.tsx** - Modal para editar transacciones
6. **ConfirmationModal.tsx** - Modal para confirmaciones

#### Hooks Personalizados
1. **useLocalStorage.ts** - Gestión de persistencia local
2. **usePortfolioCalculations.ts** - Cálculos complejos de la cartera

#### Types y Interfaces
- **Transaction** - Estructura de una transacción
- **StockSummary** - Resumen por acción
- **TransactionWithPL** - Transacción con cálculos de P&L
- **PortfolioHistoryPoint** - Punto histórico de la cartera

### Características Técnicas

#### Responsividad
- Diseño adaptativo para desktop y móvil
- Grid layout responsive
- Componentes flexibles

#### Rendimiento
- Cálculos memoizados con useMemo
- Componentes optimizados para re-renders
- Lazy loading de componentes pesados

#### Persistencia
- Guardado automático en localStorage
- Recuperación automática al cargar la página
- Manejo de errores en operaciones de almacenamiento

### Limitaciones Técnicas

1. **Almacenamiento local:** Los datos se pierden si se borra el caché del navegador
2. **Precios manuales:** No hay integración con APIs de precios en tiempo real
3. **Moneda única:** Solo soporta USD
4. **Cálculos fiscales:** Solo incluye cálculo básico de impuestos al 19%

### Extensibilidad

La arquitectura modular permite futuras mejoras:
- Integración con APIs de precios
- Soporte para múltiples monedas
- Persistencia en servidor
- Alertas y notificaciones
- Análisis técnico avanzado

---

## Contacto y Soporte

Para reportar errores o sugerir mejoras, contactar al desarrollador del proyecto.

**Versión de la guía:** 1.0  
**Última actualización:** Septiembre 2025