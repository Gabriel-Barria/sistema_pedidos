# Workflow E06-E09: Cart & Analytics

**Duración**: 56h (E06: 16h, E09: 40h) | **Prioridad**: P1

## Objetivo
Implementar carrito de compras persistente y sistema completo de analytics/reporting.

## Prerequisitos
- E05 completado (Products)
- E07 completado (Orders para E09)
- E08 completado (Payments para E09)

## Documentación a Revisar
- `docs/architecture/data-model.md` (modelos Cart, CartItem, AnalyticsEvent)
- `docs/architecture/backend.md` (secciones Cart y Analytics)
- `docs/architecture/diagrams/sequence-diagrams.md` (Agregar al Carrito, Analytics)

## Entregables Incluidos

### E06: Shopping Cart (16h)
Sistema de carrito persistente en PostgreSQL.

### E09: Analytics & Reporting (40h)
Sistema de métricas de negocio y reporting.

## Pasos

### Parte 1: Shopping Cart (E06)

1. **Crear schemas Cart**
   - Cart, CartItem
   - Relaciones con User y Product
   - Migración

2. **Implementar módulo Cart**
   - Agregar/actualizar/eliminar items
   - Calcular subtotales
   - Limpiar carrito al crear orden
   - TTL para carritos abandonados

3. **Testing Cart**
   - Tests CRUD de cart
   - Tests de cálculos
   - Tests de limpieza automática

### Parte 2: Analytics & Reporting (E09)

4. **Crear schemas Analytics**
   - AnalyticsEvent (event sourcing)
   - Vista materializada para métricas agregadas
   - Migración

5. **Implementar tracking de eventos**
   - Listeners para order.*, payment.*, product.viewed
   - Almacenar en AnalyticsEvent
   - Procesamiento asíncrono con BullMQ

6. **Implementar reportes**
   - Ventas por período
   - Productos más vendidos
   - Conversión de carrito
   - Revenue metrics

7. **Dashboard de métricas**
   - Endpoints de reporting
   - Agregaciones eficientes (vistas materializadas)
   - Cache de reportes

8. **Testing Analytics**
   - Tests de event tracking
   - Tests de reportes
   - Tests de agregaciones

## Validación

### Cart (E06)
- [ ] Migraciones de Cart ejecutadas
- [ ] Agregar producto al carrito funciona
- [ ] Actualizar cantidad funciona
- [ ] Eliminar item funciona
- [ ] Subtotales se calculan correctamente
- [ ] Carrito se limpia al crear orden
- [ ] Carritos abandonados se eliminan (TTL)
- [ ] Tests de cart pasan

### Analytics (E09)
- [ ] Migraciones de Analytics ejecutadas
- [ ] Eventos se registran automáticamente
- [ ] Reporte de ventas por período funciona
- [ ] Reporte de productos más vendidos funciona
- [ ] Métricas de conversión funcionan
- [ ] Vistas materializadas mejoran performance
- [ ] Cache de reportes funciona
- [ ] Tests de analytics pasan
- [ ] Multi-tenancy aísla analytics por tenant

## Prompt para IA

```
Ejecuta el workflow E06-E09-cart-analytics siguiendo docs/workflows/E06-E09-cart-analytics.md

Lee primero:
- docs/architecture/data-model.md (schemas Cart y AnalyticsEvent)
- docs/architecture/backend.md (secciones Cart y Analytics)
- docs/architecture/diagrams/sequence-diagrams.md

Implementa en orden:
1. E06: Cart (schemas, CRUD, cálculos, TTL)
2. E09: Analytics (event tracking, reportes, vistas materializadas)

CRÍTICO: Analytics debe usar event sourcing y vistas materializadas.
```

## Siguiente
`E10-notifications.md` (ya creado individualmente)
