# Workflow E07: Orders

**Duración**: 36h | **Prioridad**: P0

## Objetivo
Implementar sistema completo de órdenes con FSM de estados, OrderItems y eventos.

## Prerequisitos
- E05 completado
- Products funcionando

## Documentación a Revisar
- `docs/architecture/data-model.md` (modelos Order, OrderItem)
- `docs/architecture/backend.md` (sección Orders)
- `docs/architecture/diagrams/sequence-diagrams.md` (Creación de Orden, Estados)
- `docs/architecture/events.md` (eventos de orden)

## Pasos

1. **Crear schemas**
   - Order con todos los campos de pricing
   - OrderItem
   - Enums de OrderStatus y DeliveryMethod
   - Migración

2. **Implementar FSM de estados**
   - Máquina de estados finitos
   - Validación de transiciones
   - Eventos al cambiar estado

3. **Implementar módulo Orders**
   - Crear orden desde cart/items
   - Calcular totales (subtotal, taxes, delivery, total)
   - Actualizar estados
   - Listar órdenes (con filtros)

4. **Integración con eventos**
   - Emitir order.created
   - Emitir order.status_changed
   - Listeners para audit logs

5. **Testing**
   - Tests de creación de orden
   - Tests de FSM (transiciones válidas/inválidas)
   - Tests de cálculo de totales
   - Tests de eventos

## Validación

- [ ] Migraciones ejecutadas
- [ ] Crear orden funciona
- [ ] Totales se calculan correctamente
- [ ] Estados solo permiten transiciones válidas
- [ ] Eventos se emiten correctamente
- [ ] Audit logs se crean
- [ ] Listar órdenes funciona con filtros
- [ ] Multi-tenancy aísla órdenes
- [ ] Tests pasan con cobertura >80%

## Prompt para IA

```
Ejecuta el workflow E07-orders siguiendo docs/workflows/E07-orders.md

Lee primero:
- docs/architecture/data-model.md (schema Order completo)
- docs/architecture/diagrams/sequence-diagrams.md (flujos de orden y FSM)
- docs/architecture/events.md (eventos order.*)
- docs/architecture/backend.md (patrones)

Implementa:
1. Schema Order y OrderItem
2. FSM de estados con validación
3. Lógica de creación y cálculo de totales
4. Emisión de eventos
5. Tests completos incluyendo FSM

CRÍTICO: FSM debe prevenir transiciones inválidas.
```

## Siguiente
`E08-payments.md`
