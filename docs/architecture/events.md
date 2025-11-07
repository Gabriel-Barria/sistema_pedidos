# Arquitectura de Eventos

**Versión**: 1.0
**Última actualización**: 2025-11-07 19:15
**Estado**: En Progreso

---

## Índice

1. [Visión General](#visión-general)
2. [Tipos de Eventos](#tipos-de-eventos)
3. [Event Bus (EventEmitter)](#event-bus-eventemitter)
4. [Colas de Trabajo (BullMQ)](#colas-de-trabajo-bullmq)
5. [Patrones de Retry](#patrones-de-retry)
6. [Dead Letter Queue](#dead-letter-queue)
7. [Event Handlers](#event-handlers)
8. [Testing](#testing)

---

## Visión General

El sistema utiliza una arquitectura event-driven para desacoplar componentes y permitir procesamiento asíncrono de tareas pesadas.

### Capas de Eventos

```
┌─────────────────────────────────────────────────────┐
│              Sincronos (EventEmitter)               │
│  - order.created, order.status_changed              │
│  - Procesamiento inmediato dentro del request       │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│              Asíncronos (BullMQ)                    │
│  - notifications.send, analytics.compute            │
│  - Procesamiento en background con retry           │
└─────────────────────────────────────────────────────┘
```

### Cuándo Usar Cada Tipo

**EventEmitter (Sync):**
- ✅ Procesamiento <100ms
- ✅ Listeners dentro del mismo proceso
- ✅ No requiere persistencia
- ❌ Tareas pesadas (emails, PDFs, analytics)

**BullMQ (Async):**
- ✅ Procesamiento >100ms
- ✅ Requiere retry automático
- ✅ Necesita auditoría/monitoreo
- ✅ Puede fallar sin afectar el request principal

---

## Tipos de Eventos

### Eventos de Orden

```typescript
// src/orders/events/order.events.ts

export enum OrderEvents {
  CREATED = 'order.created',
  STATUS_CHANGED = 'order.status_changed',
  CONFIRMED = 'order.confirmed',
  PREPARING = 'order.preparing',
  IN_TRANSIT = 'order.in_transit',
  DELIVERED = 'order.delivered',
  CANCELLED = 'order.cancelled',
}

export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly total: number,
    public readonly items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
    }>,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class OrderStatusChangedEvent {
  constructor(
    public readonly orderId: string,
    public readonly tenantId: string,
    public readonly oldStatus: OrderStatus,
    public readonly newStatus: OrderStatus,
    public readonly changedBy: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
```

### Eventos de Pago

```typescript
// src/payments/events/payment.events.ts

export enum PaymentEvents {
  INITIATED = 'payment.initiated',
  APPROVED = 'payment.approved',
  REJECTED = 'payment.rejected',
  REFUNDED = 'payment.refunded',
  WEBHOOK_RECEIVED = 'payment.webhook_received',
}

export class PaymentApprovedEvent {
  constructor(
    public readonly paymentId: string,
    public readonly orderId: string,
    public readonly tenantId: string,
    public readonly amount: number,
    public readonly provider: PaymentProvider,
    public readonly externalId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
```

### Eventos de Notificación

```typescript
// src/notifications/events/notification.events.ts

export enum NotificationEvents {
  SEND = 'notification.send',
  DELIVERED = 'notification.delivered',
  FAILED = 'notification.failed',
}

export class SendNotificationEvent {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly type: NotificationType,
    public readonly channels: NotificationChannel[],
    public readonly title: string,
    public readonly body: string,
    public readonly data?: Record<string, any>,
  ) {}
}
```

---

## Event Bus (EventEmitter)

### Configuración

```typescript
// src/shared/events/event-bus.module.ts

import { Module, Global } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true, // order.* matches order.created, order.confirmed, etc.
      delimiter: '.',
      maxListeners: 20,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
  ],
})
export class EventBusModule {}
```

### Emisión de Eventos

```typescript
// src/orders/services/orders.service.ts

import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderCreatedEvent, OrderEvents } from '../events/order.events';

@Injectable()
export class OrdersService {
  constructor(
    private ordersRepository: OrdersRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    tenantId: string,
    userId: string,
    dto: CreateOrderDto,
  ): Promise<Order> {
    const order = await this.ordersRepository.create(tenantId, userId, dto);

    // Emitir evento síncrono
    const event = new OrderCreatedEvent(
      order.id,
      order.tenantId,
      order.userId,
      order.total.toNumber(),
      order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toNumber(),
      })),
    );

    this.eventEmitter.emit(OrderEvents.CREATED, event);

    return order;
  }

  async updateStatus(
    orderId: string,
    newStatus: OrderStatus,
    actorId: string,
  ): Promise<Order> {
    const order = await this.ordersRepository.findById(orderId);

    const oldStatus = order.status;
    const updatedOrder = await this.ordersRepository.updateStatus(
      orderId,
      newStatus,
    );

    // Emitir evento de cambio de estado
    this.eventEmitter.emit(
      OrderEvents.STATUS_CHANGED,
      new OrderStatusChangedEvent(
        orderId,
        order.tenantId,
        oldStatus,
        newStatus,
        actorId,
      ),
    );

    // Emitir evento específico del estado
    const specificEvent = OrderEvents[newStatus]; // order.confirmed, order.delivered, etc.
    if (specificEvent) {
      this.eventEmitter.emit(specificEvent, updatedOrder);
    }

    return updatedOrder;
  }
}
```

### Listeners Síncronos

```typescript
// src/audit/listeners/order-audit.listener.ts

import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderCreatedEvent, OrderStatusChangedEvent } from '../../orders/events/order.events';
import { AuditLogService } from '../services/audit-log.service';

@Injectable()
export class OrderAuditListener {
  constructor(private auditLog: AuditLogService) {}

  @OnEvent('order.created')
  async handleOrderCreated(event: OrderCreatedEvent) {
    await this.auditLog.log({
      tenantId: event.tenantId,
      action: 'CREATE',
      entity: 'Order',
      entityId: event.orderId,
      actorId: event.userId,
      after: {
        total: event.total,
        itemCount: event.items.length,
      },
    });
  }

  @OnEvent('order.status_changed')
  async handleStatusChanged(event: OrderStatusChangedEvent) {
    await this.auditLog.log({
      tenantId: event.tenantId,
      action: 'UPDATE_STATUS',
      entity: 'Order',
      entityId: event.orderId,
      actorId: event.changedBy,
      before: { status: event.oldStatus },
      after: { status: event.newStatus },
    });
  }

  @OnEvent('order.*') // Wildcard: escucha todos los eventos de orden
  async handleAnyOrderEvent(event: any) {
    console.log(`[OrderAuditListener] Event received:`, event);
  }
}
```

---

## Colas de Trabajo (BullMQ)

### Configuración

```typescript
// src/shared/queues/queue.module.ts

import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          password: config.get('REDIS_PASSWORD'),
          maxRetriesPerRequest: 3,
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100, // Mantener últimos 100 exitosos
          removeOnFail: 500, // Mantener últimos 500 fallidos
        },
      }),
    }),
    BullModule.registerQueue(
      { name: 'notifications' },
      { name: 'analytics' },
      { name: 'reports' },
      { name: 'emails' },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
```

### Productores (Enqueue)

```typescript
// src/notifications/listeners/order-notification.listener.ts

import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { OrderCreatedEvent } from '../../orders/events/order.events';

@Injectable()
export class OrderNotificationListener {
  constructor(
    @InjectQueue('notifications') private notificationsQueue: Queue,
  ) {}

  @OnEvent('order.created')
  async handleOrderCreated(event: OrderCreatedEvent) {
    // Encolar notificación al cliente
    await this.notificationsQueue.add(
      'send-order-confirmation',
      {
        tenantId: event.tenantId,
        userId: event.userId,
        orderId: event.orderId,
        total: event.total,
      },
      {
        priority: 1, // Alta prioridad
        delay: 0,
        attempts: 5,
      },
    );

    // Encolar notificación a la cocina
    await this.notificationsQueue.add(
      'send-kitchen-alert',
      {
        tenantId: event.tenantId,
        orderId: event.orderId,
        items: event.items,
      },
      {
        priority: 2, // Prioridad normal
      },
    );
  }

  @OnEvent('order.delivered')
  async handleOrderDelivered(order: Order) {
    // Encolar solicitud de review
    await this.notificationsQueue.add(
      'send-review-request',
      {
        tenantId: order.tenantId,
        userId: order.userId,
        orderId: order.id,
      },
      {
        priority: 3, // Baja prioridad
        delay: 3600000, // Esperar 1 hora
      },
    );
  }
}
```

### Consumidores (Processors)

```typescript
// src/notifications/processors/notifications.processor.ts

import { Processor, Process, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';

@Processor('notifications')
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private notificationsService: NotificationsService) {}

  @Process('send-order-confirmation')
  async sendOrderConfirmation(job: Job) {
    this.logger.log(`Processing job ${job.id} - Order confirmation`);

    const { tenantId, userId, orderId, total } = job.data;

    await this.notificationsService.send({
      tenantId,
      userId,
      type: 'order_confirmation',
      channels: ['FCM', 'EMAIL'],
      title: '¡Pedido confirmado!',
      body: `Tu pedido #${orderId.slice(0, 8)} por $${total} ha sido confirmado.`,
      data: { orderId },
    });

    // Actualizar progreso
    await job.progress(100);

    return { success: true, orderId };
  }

  @Process('send-kitchen-alert')
  async sendKitchenAlert(job: Job) {
    this.logger.log(`Processing job ${job.id} - Kitchen alert`);

    const { tenantId, orderId, items } = job.data;

    // Buscar usuarios con rol KITCHEN
    const kitchenStaff = await this.notificationsService.findUsersByRole(
      tenantId,
      'KITCHEN',
    );

    for (const user of kitchenStaff) {
      await this.notificationsService.send({
        tenantId,
        userId: user.id,
        type: 'new_order',
        channels: ['FCM', 'WEBSOCKET'],
        title: 'Nuevo pedido',
        body: `${items.length} items - Pedido #${orderId.slice(0, 8)}`,
        data: { orderId, items },
      });
    }

    return { success: true, notifiedUsers: kitchenStaff.length };
  }

  @Process('send-review-request')
  async sendReviewRequest(job: Job) {
    const { tenantId, userId, orderId } = job.data;

    await this.notificationsService.send({
      tenantId,
      userId,
      type: 'review_request',
      channels: ['FCM'],
      title: '¿Cómo estuvo tu pedido?',
      body: 'Tu opinión nos ayuda a mejorar',
      data: { orderId },
    });

    return { success: true };
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`Job ${job.id} completed: ${JSON.stringify(result)}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} failed after ${job.attemptsMade} attempts: ${error.message}`,
    );
  }
}
```

---

## Patrones de Retry

### Estrategia Exponential Backoff

```typescript
// src/notifications/processors/notifications.processor.ts

@Process('send-email')
async sendEmail(job: Job) {
  const { to, subject, body } = job.data;

  try {
    await this.emailService.send(to, subject, body);
    return { success: true };
  } catch (error) {
    // BullMQ reintentará automáticamente con backoff exponencial
    // Intento 1: inmediato
    // Intento 2: 2s después
    // Intento 3: 4s después
    // Intento 4: 8s después
    // Intento 5: 16s después
    throw error;
  }
}
```

### Configuración por Job

```typescript
await this.notificationsQueue.add(
  'send-critical-alert',
  { data },
  {
    attempts: 10, // Reintentar hasta 10 veces
    backoff: {
      type: 'exponential',
      delay: 5000, // Comenzar con 5s
    },
    timeout: 30000, // Timeout de 30s por intento
  },
);
```

### Retry Condicional

```typescript
@Process('send-sms')
async sendSMS(job: Job) {
  try {
    await this.smsService.send(job.data);
  } catch (error) {
    // No reintentar si es error de validación
    if (error.code === 'INVALID_PHONE_NUMBER') {
      this.logger.warn(`Invalid phone: ${job.data.phone}`);
      return { success: false, reason: 'invalid_phone' };
    }

    // Reintentar solo si es error temporal
    if (error.code === 'RATE_LIMIT' || error.code === 'NETWORK_ERROR') {
      throw error; // BullMQ reintentará
    }

    // No reintentar otros errores
    this.logger.error(`SMS error: ${error.message}`);
    return { success: false, reason: error.code };
  }
}
```

---

## Dead Letter Queue

### Configuración

```typescript
// src/shared/queues/queue.module.ts

BullModule.registerQueue(
  {
    name: 'notifications',
    defaultJobOptions: {
      attempts: 5,
      removeOnComplete: 100,
      removeOnFail: false, // NO eliminar fallidos
    },
  },
  {
    name: 'notifications-dlq', // Dead Letter Queue
  },
)
```

### Mover a DLQ Después de Fallos

```typescript
// src/notifications/processors/notifications.processor.ts

import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Processor('notifications')
export class NotificationsProcessor {
  constructor(
    @InjectQueue('notifications-dlq') private dlq: Queue,
  ) {}

  @OnQueueFailed()
  async onFailed(job: Job, error: Error) {
    // Si agotó todos los reintentos
    if (job.attemptsMade >= job.opts.attempts) {
      this.logger.error(
        `Job ${job.id} moved to DLQ after ${job.attemptsMade} attempts`,
      );

      // Mover a Dead Letter Queue
      await this.dlq.add('failed-notification', {
        originalJob: job.toJSON(),
        error: {
          message: error.message,
          stack: error.stack,
        },
        timestamp: new Date(),
      });
    }
  }
}
```

### Monitoreo de DLQ

```typescript
// src/admin/services/dlq-monitor.service.ts

@Injectable()
export class DLQMonitorService {
  constructor(
    @InjectQueue('notifications-dlq') private dlq: Queue,
  ) {}

  async getFailedJobs(limit = 50) {
    const jobs = await this.dlq.getJobs(['waiting', 'active'], 0, limit);

    return jobs.map((job) => ({
      id: job.id,
      originalJobId: job.data.originalJob.id,
      error: job.data.error.message,
      timestamp: job.data.timestamp,
    }));
  }

  async retryJob(dlqJobId: string) {
    const dlqJob = await this.dlq.getJob(dlqJobId);
    const originalData = dlqJob.data.originalJob.data;

    // Re-encolar en la cola original
    const notificationsQueue = this.queueService.get('notifications');
    await notificationsQueue.add(
      dlqJob.data.originalJob.name,
      originalData,
      { attempts: 1 }, // Un solo intento manual
    );

    await dlqJob.remove();
  }
}
```

---

## Event Handlers

### Patrón CQRS

```typescript
// src/analytics/listeners/order-analytics.listener.ts

import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class OrderAnalyticsListener {
  constructor(
    @InjectQueue('analytics') private analyticsQueue: Queue,
  ) {}

  @OnEvent('order.created')
  async handleOrderCreated(event: OrderCreatedEvent) {
    // Procesar analytics de forma asíncrona
    await this.analyticsQueue.add('compute-daily-revenue', {
      tenantId: event.tenantId,
      date: event.timestamp,
      amount: event.total,
    });

    await this.analyticsQueue.add('compute-product-popularity', {
      tenantId: event.tenantId,
      items: event.items,
    });
  }

  @OnEvent('order.delivered')
  async handleOrderDelivered(order: Order) {
    const deliveryTime = order.deliveredAt.getTime() - order.createdAt.getTime();

    await this.analyticsQueue.add('compute-avg-delivery-time', {
      tenantId: order.tenantId,
      deliveryMethod: order.deliveryMethod,
      deliveryTime,
    });
  }
}
```

### Processor de Analytics

```typescript
// src/analytics/processors/analytics.processor.ts

@Processor('analytics')
export class AnalyticsProcessor {
  @Process('compute-daily-revenue')
  async computeDailyRevenue(job: Job) {
    const { tenantId, date, amount } = job.data;

    await this.analyticsService.incrementRollup(
      tenantId,
      'daily_revenue',
      date,
      amount,
    );
  }

  @Process('compute-product-popularity')
  async computeProductPopularity(job: Job) {
    const { tenantId, items } = job.data;

    for (const item of items) {
      await this.analyticsService.incrementRollup(
        tenantId,
        `product_sales_${item.productId}`,
        new Date(),
        item.quantity,
      );
    }
  }
}
```

---

## Idempotencia

### Keys de Idempotencia

```typescript
// src/payments/services/payments.service.ts

@Injectable()
export class PaymentsService {
  constructor(
    private redis: Redis,
    private paymentsRepository: PaymentsRepository,
  ) {}

  async processWebhook(provider: string, externalId: string, data: any) {
    // Crear key única
    const idempotencyKey = `webhook:${provider}:${externalId}`;

    // Intentar obtener lock con setnx (set if not exists)
    const acquired = await this.redis.set(
      idempotencyKey,
      '1',
      'EX',
      3600, // 1 hora de expiración
      'NX', // Solo si no existe
    );

    if (!acquired) {
      this.logger.warn(`Duplicate webhook ignored: ${idempotencyKey}`);
      return { status: 'duplicate' };
    }

    try {
      // Procesar webhook
      const payment = await this.paymentsRepository.findByExternalId(
        provider,
        externalId,
      );

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      // Actualizar estado
      await this.paymentsRepository.updateStatus(
        payment.id,
        data.status,
        data,
      );

      return { status: 'processed', paymentId: payment.id };
    } catch (error) {
      // Liberar lock en caso de error para permitir retry
      await this.redis.del(idempotencyKey);
      throw error;
    }
  }
}
```

---

## Testing

### Testing de Listeners

```typescript
// src/audit/listeners/order-audit.listener.spec.ts

describe('OrderAuditListener', () => {
  let listener: OrderAuditListener;
  let auditLog: jest.Mocked<AuditLogService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrderAuditListener,
        {
          provide: AuditLogService,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    listener = module.get(OrderAuditListener);
    auditLog = module.get(AuditLogService);
  });

  it('should log order creation', async () => {
    const event = new OrderCreatedEvent(
      'order-1',
      'tenant-1',
      'user-1',
      100,
      [{ productId: 'prod-1', quantity: 2, unitPrice: 50 }],
    );

    await listener.handleOrderCreated(event);

    expect(auditLog.log).toHaveBeenCalledWith({
      tenantId: 'tenant-1',
      action: 'CREATE',
      entity: 'Order',
      entityId: 'order-1',
      actorId: 'user-1',
      after: {
        total: 100,
        itemCount: 1,
      },
    });
  });
});
```

### Testing de Processors

```typescript
// src/notifications/processors/notifications.processor.spec.ts

describe('NotificationsProcessor', () => {
  let processor: NotificationsProcessor;
  let notificationsService: jest.Mocked<NotificationsService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        NotificationsProcessor,
        {
          provide: NotificationsService,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    processor = module.get(NotificationsProcessor);
    notificationsService = module.get(NotificationsService);
  });

  it('should send order confirmation', async () => {
    const job = {
      id: 'job-1',
      data: {
        tenantId: 'tenant-1',
        userId: 'user-1',
        orderId: 'order-1',
        total: 100,
      },
      progress: jest.fn(),
    } as any;

    await processor.sendOrderConfirmation(job);

    expect(notificationsService.send).toHaveBeenCalledWith({
      tenantId: 'tenant-1',
      userId: 'user-1',
      type: 'order_confirmation',
      channels: ['FCM', 'EMAIL'],
      title: '¡Pedido confirmado!',
      body: expect.stringContaining('Tu pedido'),
      data: { orderId: 'order-1' },
    });

    expect(job.progress).toHaveBeenCalledWith(100);
  });

  it('should retry on temporary errors', async () => {
    const job = {
      id: 'job-1',
      data: {},
    } as any;

    notificationsService.send.mockRejectedValue(
      new Error('Network timeout'),
    );

    await expect(processor.sendOrderConfirmation(job)).rejects.toThrow();
  });
});
```

### Testing de Colas (E2E)

```typescript
// test/queues/notifications.e2e-spec.ts

describe('Notifications Queue (e2e)', () => {
  let app: INestApplication;
  let queue: Queue;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    queue = app.get(getQueueToken('notifications'));
  });

  it('should process notification job', async () => {
    const job = await queue.add('send-order-confirmation', {
      tenantId: 'tenant-1',
      userId: 'user-1',
      orderId: 'order-1',
      total: 100,
    });

    // Esperar a que se procese
    await job.finished();

    const result = await job.returnvalue;
    expect(result.success).toBe(true);
  });

  afterEach(async () => {
    await queue.empty();
    await app.close();
  });
});
```

---

## Mejores Prácticas

### ✅ DO

```typescript
// Eventos inmutables con readonly
export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly tenantId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

// Listeners idempotentes
@OnEvent('order.created')
async handleOrderCreated(event: OrderCreatedEvent) {
  const existing = await this.cache.get(`processed:${event.orderId}`);
  if (existing) return; // Ya procesado

  await this.process(event);
  await this.cache.set(`processed:${event.orderId}`, true, 3600);
}

// Jobs con timeout
await queue.add('heavy-task', data, {
  timeout: 60000, // 1 minuto máximo
});
```

### ❌ DON'T

```typescript
// ❌ Listeners bloqueantes
@OnEvent('order.created')
async handleOrderCreated(event: OrderCreatedEvent) {
  await this.generatePDF(event.orderId); // Tarea pesada bloqueante
}

// ❌ Jobs sin retry
await queue.add('critical-task', data, {
  attempts: 1, // Sin retry
});

// ❌ Eventos mutables
export class OrderCreatedEvent {
  public orderId: string; // ❌ No readonly
}
```

---

## Changelog

### v1.0 - 2025-11-07 19:15
- Documentación inicial de arquitectura de eventos
- EventEmitter y BullMQ
- Patrones de retry y DLQ
- Idempotencia con Redis
- Ejemplos completos de listeners y processors
