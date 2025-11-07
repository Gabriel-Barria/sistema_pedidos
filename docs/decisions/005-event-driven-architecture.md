# ADR 005: Arquitectura Event-Driven con BullMQ

**Fecha**: 2025-11-07 20:00
**Estado**: Aceptada
**Decisores**: Equipo Técnico
**Contexto Técnico**: Backend

---

## Contexto

Necesitamos manejar tareas asíncronas y desacoplar componentes del sistema (notificaciones, analytics, webhooks, etc.). La pregunta es: ¿usar eventos síncronos, colas de trabajo, o ambos?

**Requisitos**:
- Procesamiento asíncrono de tareas no críticas
- Retry automático en caso de fallos
- Desacoplamiento entre módulos
- Persistencia de jobs pendientes
- Monitoreo de colas
- Escalabilidad horizontal

## Opciones Consideradas

### Opción 1: Solo EventEmitter (Síncrono)
- **Pros**:
  - Nativo de Node.js
  - Simple de implementar
  - No requiere infraestructura adicional
  - Bajo latency

- **Contras**:
  - No hay persistencia (se pierden si app crashea)
  - Sin retry automático
  - Bloquea el event loop si tarea es pesada
  - No escalable a múltiples workers
  - Difícil monitorear

### Opción 2: Solo BullMQ (Asíncrono)
- **Pros**:
  - Persistencia en Redis
  - Retry automático con backoff
  - Escalable (múltiples workers)
  - UI de monitoreo (Bull Board)
  - Priorización de jobs

- **Contras**:
  - Latency adicional (enqueue → Redis → dequeue)
  - Overhead para tareas simples
  - Dependencia de Redis
  - Más complejo que EventEmitter

### Opción 3: Híbrido (EventEmitter + BullMQ)
- **Pros**:
  - **Best of both worlds**
  - EventEmitter para lógica síncrona rápida (<100ms)
  - BullMQ para tareas asíncronas pesadas
  - Flexibilidad según caso de uso

- **Contras**:
  - Más complejo (dos sistemas)
  - Decisión case-by-case de qué usar

## Decisión

**Elegimos Opción 3: Arquitectura Híbrida** con EventEmitter para eventos síncronos y BullMQ para procesamiento asíncrono.

**Criterios de Decisión**:

| Usar EventEmitter cuando: | Usar BullMQ cuando: |
|---------------------------|---------------------|
| Procesamiento <100ms | Procesamiento >100ms |
| No requiere retry | Requiere retry automático |
| Listeners en mismo proceso | Puede ejecutarse en workers |
| No es crítico si falla | Debe garantizarse ejecución |
| Audit logs simples | Envío de emails/notifications |

**Ejemplos**:
- **EventEmitter**: `order.created` → Audit log (sync)
- **BullMQ**: `order.created` → Enviar notificación (async)

## Consecuencias

### Positivas
- ✅ Performance óptima (sin overhead para tareas rápidas)
- ✅ Resiliencia (jobs persistidos en Redis)
- ✅ Escalabilidad (workers adicionales solo para colas)
- ✅ Monitoreo granular (Bull Board dashboard)
- ✅ Flexibility (elegir mejor herramienta según caso)

### Negativas
- ❌ Complejidad adicional (dos patrones)
- ❌ Necesita Redis (dependencia adicional)
- ❌ Equipo debe entender cuándo usar cada uno

### Riesgos y Mitigaciones

**Riesgo**: Confusión sobre cuándo usar cada patrón
- **Mitigación**:
  - Documentación clara con ejemplos
  - Guidelines en docs/architecture/events.md
  - Code review enforcing standards

**Riesgo**: Redis down = jobs no se procesan
- **Mitigación**:
  - Redis con replica para alta disponibilidad
  - Monitoring y alertas de Redis health
  - Graceful degradation (fallback a logging)

**Riesgo**: Memory leak en colas
- **Mitigación**:
  - `removeOnComplete: 100` (solo mantener últimos 100)
  - `removeOnFail: 500` (mantener fallidos para debug)
  - Monitoring de tamaño de colas

## Implementación

### EventEmitter (Síncronos)

```typescript
// src/orders/services/orders.service.ts
@Injectable()
export class OrdersService {
  constructor(private eventEmitter: EventEmitter2) {}

  async create(dto: CreateOrderDto) {
    const order = await this.repository.create(dto);

    // Evento síncrono: Audit log
    this.eventEmitter.emit('order.created', new OrderCreatedEvent(order));

    return order;
  }
}

// src/audit/listeners/order-audit.listener.ts
@Injectable()
export class OrderAuditListener {
  @OnEvent('order.created')
  async handleOrderCreated(event: OrderCreatedEvent) {
    await this.auditLog.log({ action: 'CREATE', entity: 'Order', ... });
  }
}
```

### BullMQ (Asíncronos)

```typescript
// src/notifications/listeners/order-notification.listener.ts
@Injectable()
export class OrderNotificationListener {
  constructor(@InjectQueue('notifications') private queue: Queue) {}

  @OnEvent('order.created')
  async handleOrderCreated(event: OrderCreatedEvent) {
    // Encolar job asíncrono
    await this.queue.add('send-order-confirmation', {
      userId: event.userId,
      orderId: event.orderId,
    }, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }
}

// src/notifications/processors/notifications.processor.ts
@Processor('notifications')
export class NotificationsProcessor {
  @Process('send-order-confirmation')
  async sendOrderConfirmation(job: Job) {
    const { userId, orderId } = job.data;
    await this.notificationsService.send(userId, {
      title: 'Orden confirmada',
      body: `Tu pedido ${orderId} está listo`,
    });
  }
}
```

### Monitoring

```typescript
// Bull Board UI
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

const serverAdapter = new ExpressAdapter();
createBullBoard({
  queues: [
    new BullMQAdapter(notificationsQueue),
    new BullMQAdapter(analyticsQueue),
  ],
  serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());
```

## Patrones de Uso

### Pattern 1: Saga con Múltiples Steps

```typescript
@OnEvent('payment.approved')
async handlePaymentApproved(event: PaymentApprovedEvent) {
  // Step 1: Actualizar orden (síncrono)
  await this.ordersService.updateStatus(event.orderId, 'CONFIRMED');

  // Step 2: Enviar notificación (asíncrono)
  await this.queue.add('send-payment-confirmation', event);

  // Step 3: Actualizar analytics (asíncrono)
  await this.analyticsQueue.add('compute-revenue', event);
}
```

### Pattern 2: Fan-out (Múltiples Listeners)

```typescript
// Event: order.created

// Listener 1: Audit (sync)
@OnEvent('order.created')
async logAudit(event) { ... }

// Listener 2: Analytics (async)
@OnEvent('order.created')
async enqueueAnalytics(event) {
  await this.queue.add('compute-metrics', event);
}

// Listener 3: Notifications (async)
@OnEvent('order.created')
async enqueueNotifications(event) {
  await this.queue.add('send-confirmation', event);
}
```

## Notas

- EventEmitter configurado con `wildcard: true` para patterns `order.*`
- BullMQ usa Redis como backend (no puede ser in-memory)
- Jobs tienen TTL de 24 horas por defecto
- Dead Letter Queue para jobs que fallan después de max retries
- Considerar RabbitMQ o Kafka si volumen supera 10K jobs/min

## Referencias

- [BullMQ Documentation](https://docs.bullmq.io/)
- [NestJS EventEmitter](https://docs.nestjs.com/techniques/events)
- [Bull Board UI](https://github.com/felixmosh/bull-board)
- [Event-Driven Architecture Patterns](https://martinfowler.com/articles/201701-event-driven.html)
