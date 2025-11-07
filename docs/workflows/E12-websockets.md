# Workflow E12: WebSockets

**Duración**: 20h | **Prioridad**: P1

## Objetivo
Implementar comunicación en tiempo real con Socket.io para actualizaciones de órdenes, notificaciones y estados.

## Prerequisitos
- E07 completado
- E10 completado
- Redis corriendo (para adaptador de Socket.io)

## Documentación a Revisar
- `docs/architecture/backend.md` (sección WebSockets)
- `docs/architecture/diagrams/sequence-diagrams.md` (Actualización en Tiempo Real)
- `docs/decisions/005-event-driven-architecture.md`

## Pasos

1. **Configurar Socket.io**
   - Instalar @nestjs/websockets y socket.io
   - Configurar RedisAdapter para multi-instancia
   - Gateway principal

2. **Implementar WebSocket Gateways**
   - OrdersGateway (actualizaciones de estado)
   - NotificationsGateway (notificaciones en tiempo real)
   - Autenticación de conexiones (JWT)

3. **Integrar con eventos**
   - Listeners que emiten a Socket.io
   - Rooms por tenant (multi-tenancy)
   - Rooms por usuario

4. **Implementar seguridad**
   - Validación de JWT en handshake
   - Guards para eventos
   - Rate limiting

5. **Testing**
   - Tests de conexión/desconexión
   - Tests de autenticación
   - Tests de rooms y multi-tenancy
   - Tests de eventos emitidos

## Validación

- [ ] Socket.io configurado con RedisAdapter
- [ ] Clientes pueden conectarse con JWT válido
- [ ] Clientes reciben actualizaciones de órdenes en tiempo real
- [ ] Clientes reciben notificaciones push
- [ ] Rooms por tenant aíslan datos
- [ ] Eventos order.status_changed emiten a WebSocket
- [ ] Rate limiting previene abuso
- [ ] Tests pasan con cobertura >80%
- [ ] Múltiples instancias del backend funcionan (gracias a Redis)

## Prompt para IA

```
Ejecuta el workflow E12-websockets siguiendo docs/workflows/E12-websockets.md

Lee primero:
- docs/architecture/backend.md (sección WebSockets)
- docs/architecture/diagrams/sequence-diagrams.md (flujo en tiempo real)
- docs/decisions/005-event-driven-architecture.md

Implementa:
1. Socket.io con RedisAdapter
2. Gateways para Orders y Notifications
3. Autenticación JWT en handshake
4. Integración con EventEmitter
5. Rooms por tenant y usuario
6. Tests completos

CRÍTICO: Rooms deben aislar datos por tenant.
```

## Siguiente
`E13-admin-panel.md` (agrupado en E11-E14-features-avanzadas.md)
