# Workflow E08: Payments

**Duración**: 32h | **Prioridad**: P0

## Objetivo
Integrar procesamiento de pagos con MercadoPago y Stripe, webhooks y conciliación.

## Prerequisitos
- E07 completado
- Orders funcionando
- Cuentas de MercadoPago/Stripe (sandbox)

## Documentación a Revisar
- `docs/architecture/data-model.md` (modelos Payment, PaymentMethod)
- `docs/architecture/backend.md` (sección Payments, Webhooks)
- `docs/architecture/diagrams/sequence-diagrams.md` (Procesamiento de Pago)
- `docs/decisions/007-payment-gateway-strategy.md`

## Pasos

1. **Crear schemas**
   - Payment, PaymentMethod
   - Enums de PaymentStatus y PaymentProvider
   - Migración

2. **Implementar adaptadores de pago**
   - MercadoPagoAdapter
   - StripeAdapter
   - PaymentFactory (Strategy pattern)

3. **Implementar módulo Payments**
   - Crear intención de pago
   - Procesar pago
   - Validar estado
   - Conciliación automática

4. **Configurar webhooks**
   - Endpoint para MercadoPago
   - Endpoint para Stripe
   - Validación de firmas
   - Idempotencia

5. **Integración con Orders**
   - Actualizar estado de orden al confirmar pago
   - Eventos payment.*
   - Rollback en caso de fallo

6. **Testing**
   - Tests de adaptadores
   - Tests de webhooks con mocks
   - Tests de conciliación
   - Tests de idempotencia

## Validación

- [ ] Migraciones ejecutadas
- [ ] Crear pago con MercadoPago funciona
- [ ] Crear pago con Stripe funciona
- [ ] Webhooks validan firmas correctamente
- [ ] Webhooks son idempotentes
- [ ] Estado de orden se actualiza al confirmar pago
- [ ] Eventos payment.* se emiten
- [ ] Conciliación detecta inconsistencias
- [ ] Tests pasan con cobertura >80%
- [ ] Multi-tenancy aísla pagos

## Prompt para IA

```
Ejecuta el workflow E08-payments siguiendo docs/workflows/E08-payments.md

Lee primero:
- docs/architecture/backend.md (sección Payments, Webhooks)
- docs/architecture/data-model.md (schema Payment)
- docs/architecture/diagrams/sequence-diagrams.md (flujo de pago)
- docs/decisions/007-payment-gateway-strategy.md

Implementa:
1. Schemas Payment y PaymentMethod
2. Adaptadores para MercadoPago y Stripe
3. Webhooks con validación de firmas
4. Integración con módulo Orders
5. Tests completos incluyendo idempotencia

CRÍTICO: Webhooks deben ser idempotentes y validar firmas.
```

## Siguiente
`E09-analytics.md` (agrupado en E06-E09-cart-analytics.md)
