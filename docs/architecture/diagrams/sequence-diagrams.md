# Diagramas de Secuencia

**Versión**: 1.0
**Última actualización**: 2025-11-07 19:45
**Estado**: Completo

---

## Índice

1. [Flujo de Creación de Orden](#flujo-de-creación-de-orden)
2. [Flujo de Pago con MercadoPago](#flujo-de-pago-con-mercadopago)
3. [Flujo de Autenticación JWT](#flujo-de-autenticación-jwt)
4. [Flujo de Actualización de Estado de Orden](#flujo-de-actualización-de-estado-de-orden)
5. [Flujo de Notificaciones](#flujo-de-notificaciones)

---

## Flujo de Creación de Orden

```mermaid
sequenceDiagram
    participant C as Cliente
    participant API as API Gateway
    participant Auth as AuthGuard
    participant Ctrl as OrdersController
    participant Svc as OrdersService
    participant Repo as OrdersRepository
    participant DB as PostgreSQL
    participant Events as EventEmitter
    participant Queue as BullMQ
    participant Cache as Redis

    C->>API: POST /api/orders
    API->>Auth: Verificar JWT
    Auth->>Cache: Validar token en blacklist
    Cache-->>Auth: Token válido
    Auth->>API: Usuario autenticado

    API->>Ctrl: create(tenantId, userId, dto)
    Ctrl->>Svc: create(tenantId, userId, dto)

    Note over Svc: Validar datos
    Svc->>Cache: GET productos (precios)
    Cache-->>Svc: Productos cacheados

    Note over Svc: Calcular totales
    Svc->>Repo: create(order)
    Repo->>DB: INSERT INTO orders
    Repo->>DB: INSERT INTO order_items
    DB-->>Repo: Order creada
    Repo-->>Svc: Order con items

    Svc->>Events: emit('order.created', event)
    Events-->>Queue: Encolar notificación
    Events-->>Queue: Encolar analytics

    Svc->>Cache: SET order:{id}
    Svc-->>Ctrl: Order creada
    Ctrl-->>API: 201 Created
    API-->>C: { id, total, status }

    Note over Queue: Procesamiento asíncrono
    Queue->>Queue: Enviar notificación al cliente
    Queue->>Queue: Enviar notificación a cocina
    Queue->>Queue: Actualizar métricas
```

---

## Flujo de Pago con MercadoPago

```mermaid
sequenceDiagram
    participant C as Cliente
    participant API as Backend API
    participant PaySvc as PaymentsService
    participant DB as PostgreSQL
    participant MP as MercadoPago API
    participant Webhook as Webhook Endpoint
    participant Events as EventEmitter
    participant OrderSvc as OrdersService

    C->>API: POST /api/payments
    Note over C,API: { orderId, provider: "MERCADOPAGO" }

    API->>PaySvc: createPayment(orderId, provider)
    PaySvc->>DB: Verificar orden existe
    DB-->>PaySvc: Order details

    PaySvc->>MP: POST /v1/payments
    Note over MP: Crear preferencia de pago
    MP-->>PaySvc: { id, init_point, status }

    PaySvc->>DB: INSERT INTO payments
    Note over DB: status: PENDING
    DB-->>PaySvc: Payment saved

    PaySvc-->>API: { id, paymentUrl, status }
    API-->>C: 201 Created

    Note over C: Cliente redirigido a MercadoPago
    C->>MP: Completar pago
    MP-->>C: Pago exitoso

    Note over MP: Webhook asíncrono
    MP->>Webhook: POST /api/webhooks/mercadopago
    Note over Webhook: { action: "payment.updated", data: {...} }

    Webhook->>PaySvc: processWebhook(provider, externalId, data)

    Note over PaySvc: Validar idempotencia
    PaySvc->>DB: SET webhook:mp:{externalId} NX

    PaySvc->>DB: UPDATE payments SET status = 'APPROVED'
    PaySvc->>Events: emit('payment.approved', event)

    Events->>OrderSvc: Listener actualiza orden
    OrderSvc->>DB: UPDATE orders SET status = 'CONFIRMED'

    Events->>Queue: Encolar notificación de pago

    PaySvc-->>Webhook: 200 OK
    Webhook-->>MP: Webhook procesado
```

---

## Flujo de Autenticación JWT

```mermaid
sequenceDiagram
    participant C as Cliente
    participant API as API
    participant Auth as AuthService
    participant DB as PostgreSQL
    participant Cache as Redis
    participant JWT as JWT Service

    Note over C,API: Login
    C->>API: POST /auth/login
    Note over C,API: { email, password }

    API->>Auth: login(email, password)
    Auth->>DB: SELECT user WHERE email
    DB-->>Auth: User con passwordHash

    Note over Auth: Comparar bcrypt
    Auth->>Auth: bcrypt.compare(password, hash)

    alt Password inválido
        Auth-->>API: UnauthorizedException
        API-->>C: 401 Unauthorized
    else Password válido
        Auth->>JWT: generateTokens(userId, tenantId)
        JWT->>JWT: sign(payload, privateKey, 15m)
        JWT->>JWT: sign(payload, privateKey, 7d)
        JWT-->>Auth: { accessToken, refreshToken }

        Auth->>DB: INSERT INTO refresh_tokens
        Auth->>Cache: SET user:{userId}:session

        Auth-->>API: { user, accessToken, refreshToken }
        API-->>C: 200 OK
    end

    Note over C: Subsecuentes requests
    C->>API: GET /api/orders (Bearer token)
    API->>JWT: verify(accessToken)
    JWT->>Cache: Check blacklist
    Cache-->>JWT: Token no revocado
    JWT->>JWT: jwt.verify(token, publicKey)
    JWT-->>API: Decoded payload
    API->>API: Ejecutar endpoint
    API-->>C: 200 OK

    Note over C,API: Refresh Token
    C->>API: POST /auth/refresh
    Note over C,API: { refreshToken }

    API->>Auth: refresh(refreshToken)
    Auth->>DB: SELECT * FROM refresh_tokens
    DB-->>Auth: Token válido

    Auth->>JWT: generateAccessToken(userId)
    Auth->>Cache: SET user:{userId}:session
    Auth-->>API: { accessToken }
    API-->>C: 200 OK
```

---

## Flujo de Actualización de Estado de Orden

```mermaid
sequenceDiagram
    participant Staff as Staff (Cocina/Delivery)
    participant WS as WebSocket Server
    participant API as API
    participant Svc as OrdersService
    participant FSM as Finite State Machine
    participant DB as PostgreSQL
    participant Events as EventEmitter
    participant Cache as Redis
    participant Clients as Clientes (WebSocket)

    Staff->>API: PATCH /api/orders/{id}/status
    Note over Staff,API: { status: "PREPARING" }

    API->>Svc: updateStatus(orderId, newStatus, actorId)
    Svc->>DB: SELECT order WHERE id
    DB-->>Svc: Order actual (status: PENDING)

    Note over Svc,FSM: Validar transición
    Svc->>FSM: canTransition(PENDING, PREPARING)
    FSM-->>Svc: true

    alt Transición inválida
        FSM-->>Svc: false
        Svc-->>API: BadRequestException
        API-->>Staff: 400 Bad Request
    else Transición válida
        Svc->>DB: UPDATE orders SET status, updated_at
        DB-->>Svc: Order actualizada

        Svc->>Events: emit('order.status_changed', event)
        Note over Events: oldStatus: PENDING, newStatus: PREPARING

        Events->>DB: INSERT INTO audit_logs
        Events->>Cache: DEL order:{id}
        Events->>WS: Broadcast a clientes

        WS->>Clients: send({ type: 'order.updated', data })

        Svc-->>API: Order actualizada
        API-->>Staff: 200 OK
    end
```

---

## Flujo de Notificaciones

```mermaid
sequenceDiagram
    participant Event as Event (order.created)
    participant Listener as NotificationListener
    participant Queue as BullMQ Queue
    participant Processor as NotificationProcessor
    participant DB as PostgreSQL
    participant FCM as Firebase Cloud Messaging
    participant WS as WebSocket Server
    participant Client as Cliente

    Note over Event: Orden creada
    Event->>Listener: handleOrderCreated(event)

    Listener->>Queue: add('send-order-confirmation')
    Note over Queue: Job encolado con prioridad 1

    Listener->>Queue: add('send-kitchen-alert')
    Note over Queue: Job encolado con prioridad 2

    Note over Queue,Processor: Procesamiento asíncrono
    Queue->>Processor: Process job 'send-order-confirmation'

    Processor->>DB: SELECT user WHERE id
    Processor->>DB: SELECT notification_tokens WHERE userId
    DB-->>Processor: Tokens FCM del usuario

    Processor->>DB: INSERT INTO notifications
    Note over DB: delivered: false, read: false

    alt Canal: FCM
        Processor->>FCM: send(token, notification)
        FCM-->>Client: Push notification
        FCM-->>Processor: { success: true }

        Processor->>DB: UPDATE notifications SET delivered = true
    end

    alt Canal: WEBSOCKET
        Processor->>WS: broadcastToUser(userId, data)
        WS->>Client: send(notification)
        WS-->>Processor: Sent
    end

    Processor->>Queue: Job completed
    Queue->>Queue: Remove from active

    Note over Queue: Procesar siguiente job
    Queue->>Processor: Process job 'send-kitchen-alert'

    Processor->>DB: SELECT users WHERE role = 'KITCHEN'
    DB-->>Processor: Staff de cocina

    loop Para cada staff
        Processor->>DB: INSERT notification
        Processor->>FCM: send(token, alert)
        Processor->>WS: broadcast({ type: 'new_order' })
    end

    Processor-->>Queue: Job completed
```

---

## Máquina de Estados de Orden

```mermaid
stateDiagram-v2
    [*] --> PENDING: Orden creada

    PENDING --> CONFIRMED: Pago aprobado
    PENDING --> CANCELLED: Cliente cancela

    CONFIRMED --> PREPARING: Staff inicia preparación
    CONFIRMED --> CANCELLED: Timeout sin preparar

    PREPARING --> IN_TRANSIT: Listo para entrega
    PREPARING --> CANCELLED: Problema en cocina

    IN_TRANSIT --> DELIVERED: Entregado al cliente
    IN_TRANSIT --> CANCELLED: No se pudo entregar

    DELIVERED --> [*]
    CANCELLED --> [*]

    note right of PENDING
        Esperando confirmación de pago
        Timeout: 15 minutos
    end note

    note right of CONFIRMED
        Pago aprobado
        Esperando preparación
    end note

    note right of PREPARING
        En preparación por cocina
        Notificaciones activas
    end note

    note right of IN_TRANSIT
        En camino al cliente
        Tracking activo
    end note
```

---

## Flujo de Cache con Redis

```mermaid
sequenceDiagram
    participant Client as Cliente
    participant API as API
    participant Cache as CacheInterceptor
    participant Redis as Redis
    participant Service as Service
    participant DB as PostgreSQL

    Client->>API: GET /api/products?tenantId=abc
    API->>Cache: Interceptor pre-handler

    Cache->>Redis: GET products:abc

    alt Cache HIT
        Redis-->>Cache: Productos cacheados
        Cache-->>API: Return cached data
        API-->>Client: 200 OK (cached)
        Note over Client,API: Response time: ~10ms
    else Cache MISS
        Redis-->>Cache: null
        Cache->>Service: findAll(tenantId)
        Service->>DB: SELECT * FROM products
        DB-->>Service: Products from DB
        Service-->>Cache: Products

        Cache->>Redis: SET products:abc (TTL: 300s)
        Cache-->>API: Return fresh data
        API-->>Client: 200 OK (from DB)
        Note over Client,API: Response time: ~100ms
    end

    Note over API,DB: Invalidación de caché
    Client->>API: POST /api/products (Crear producto)
    API->>Service: create(product)
    Service->>DB: INSERT INTO products
    DB-->>Service: Product created

    Service->>Redis: DEL products:abc
    Service->>Redis: DEL product:{id}
    Note over Redis: Cache invalidado

    Service-->>API: Product created
    API-->>Client: 201 Created
```

---

## Notas de Implementación

### Timeouts y Retry

- **HTTP Requests**: Timeout 30s
- **DB Queries**: Timeout 10s
- **Redis Operations**: Timeout 5s
- **BullMQ Jobs**: 3 reintentos con backoff exponencial
- **Webhooks**: 5 reintentos, backoff: 2s, 4s, 8s, 16s, 32s

### Idempotencia

- Webhooks: Redis SETNX con TTL 1 hora
- Pagos: Columna `externalId` única
- Órdenes: `orderNumber` único por tenant

### Seguridad

- JWT: RS256 con rotación de keys cada 90 días
- Rate limiting: 100 req/min por IP
- CORS: Whitelist de dominios
- SQL Injection: Prisma con prepared statements

---

## Changelog

### v1.0 - 2025-11-07 19:45
- Diagramas de secuencia completos para flujos críticos
- Máquina de estados de órdenes
- Diagramas de cache y notificaciones
- Notas de implementación
