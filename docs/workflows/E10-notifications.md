# Workflow E10: Notifications

**Duración**: 24h | **Prioridad**: P1

## Objetivo
Implementar sistema de notificaciones multi-canal (FCM push, email, WebSocket) con plantillas.

## Prerequisitos
- E07 completado
- E08 completado
- Cuenta Firebase (FCM)
- Proveedor SMTP configurado

## Documentación a Revisar
- `docs/architecture/data-model.md` (modelos Notification, NotificationTemplate)
- `docs/architecture/backend.md` (sección Notifications)
- `docs/architecture/events.md` (eventos que disparan notificaciones)
- `docs/architecture/diagrams/sequence-diagrams.md` (Envío de Notificación)

## Pasos

1. **Crear schemas**
   - Notification, NotificationTemplate
   - Enums de NotificationType y NotificationChannel
   - Migración

2. **Implementar adaptadores de canal**
   - FcmAdapter (push notifications)
   - EmailAdapter (SMTP/SendGrid)
   - WebSocketAdapter
   - NotificationFactory

3. **Implementar módulo Notifications**
   - NotificationsService
   - Sistema de plantillas (Handlebars)
   - Cola de envío (BullMQ)
   - Retry logic

4. **Integración con eventos**
   - Listeners para order.created, payment.confirmed, etc.
   - Envío automático según configuración de usuario

5. **Configurar preferencias de usuario**
   - UserNotificationPreferences
   - Opt-in/opt-out por canal

6. **Testing**
   - Tests de adaptadores con mocks
   - Tests de plantillas
   - Tests de listeners de eventos
   - Tests de cola y retry

## Validación

- [ ] Migraciones ejecutadas
- [ ] Push notification se envía via FCM
- [ ] Email se envía correctamente
- [ ] WebSocket notification funciona
- [ ] Plantillas renderizan variables correctamente
- [ ] Cola de envío procesa notificaciones
- [ ] Retry funciona en caso de fallo
- [ ] Preferencias de usuario se respetan
- [ ] Notificaciones se disparan por eventos (order.created, etc.)
- [ ] Tests pasan con cobertura >80%
- [ ] Multi-tenancy aísla notificaciones

## Prompt para IA

```
Ejecuta el workflow E10-notifications siguiendo docs/workflows/E10-notifications.md

Lee primero:
- docs/architecture/backend.md (sección Notifications)
- docs/architecture/data-model.md (schema Notification)
- docs/architecture/events.md (eventos que disparan notificaciones)
- docs/architecture/diagrams/sequence-diagrams.md (flujo de notificación)

Implementa:
1. Schemas Notification y NotificationTemplate
2. Adaptadores para FCM, Email, WebSocket
3. Sistema de plantillas con Handlebars
4. Cola de envío con BullMQ
5. Event listeners para envío automático
6. Tests completos

CRÍTICO: Respetar preferencias de usuario (opt-in/opt-out).
```

## Siguiente
`E11-reporting.md` (agrupado en E11-E14-features-avanzadas.md)
