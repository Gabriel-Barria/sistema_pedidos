# Arquitectura Backend (NestJS)

**Versión**: 1.1
**Última actualización**: 2025-11-07 19:02
**Estado**: En Progreso

---

## Índice

1. [Visión General](#visión-general)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Módulos y Responsabilidades](#módulos-y-responsabilidades)
4. [Patrones de Diseño](#patrones-de-diseño)
5. [Ejemplos de Código](#ejemplos-de-código)
6. [Caching y Performance](#caching-y-performance)
7. [Seguridad](#seguridad)
8. [Testing](#testing)

---

## Visión General

El backend está construido con **NestJS** (framework de Node.js con TypeScript) siguiendo principios de:
- **DDD (Domain-Driven Design)**: Organización por dominios de negocio
- **Clean Architecture**: Separación de capas (controllers, services, repositories)
- **SOLID**: Principios de diseño orientado a objetos
- **API First**: Contrato documentado en Swagger antes de implementar UI

### Stack Tecnológico

| Componente | Tecnología | Versión | Propósito |
|------------|-----------|---------|-----------|
| **Runtime** | Node.js | 20.x | JavaScript engine |
| **Framework** | NestJS | 10.x | Aplicación backend |
| **Lenguaje** | TypeScript | 5.x | Type safety |
| **ORM** | Prisma | 5.x | Database access layer |
| **Base de Datos** | PostgreSQL | 16.x | Persistencia principal |
| **Cache/Queues** | Redis | 7.x | Cache y procesamiento asíncrono |
| **Queue Manager** | BullMQ | 4.x | Job queues |
| **Authentication** | Passport | 0.7.x | Estrategias de auth |
| **Validation** | class-validator | 0.14.x | Validación de DTOs |
| **Logger** | Pino | 8.x | Logging estructurado |
| **API Docs** | Swagger/OpenAPI | 3.0 | Documentación automática |

---

## Estructura de Carpetas

```
backend/
├── Dockerfile
├── .dockerignore
├── .eslintrc.js
├── .prettierrc
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seeds/
├── test/
│   ├── app.e2e-spec.ts
│   ├── jest-e2e.json
│   └── fixtures/
└── src/
    ├── main.ts                      # Entry point
    ├── app.module.ts                # Root module
    ├── app.controller.ts
    ├── app.service.ts
    │
    ├── config/                      # Configuración
    │   ├── config.module.ts
    │   ├── configuration.ts         # Environment variables
    │   ├── database.config.ts
    │   ├── redis.config.ts
    │   └── validation.schema.ts     # Validación de .env
    │
    ├── common/                      # Código compartido
    │   ├── constants/
    │   │   ├── errors.constant.ts
    │   │   └── roles.constant.ts
    │   ├── contracts/               # Interfaces compartidas
    │   │   ├── repository.interface.ts
    │   │   └── service.interface.ts
    │   ├── decorators/
    │   │   ├── api-response.decorator.ts
    │   │   ├── current-user.decorator.ts
    │   │   ├── roles.decorator.ts
    │   │   └── tenant.decorator.ts
    │   ├── dto/
    │   │   ├── base-response.dto.ts
    │   │   ├── pagination.dto.ts
    │   │   └── error-response.dto.ts
    │   ├── filters/
    │   │   └── http-exception.filter.ts
    │   ├── guards/
    │   │   ├── jwt-auth.guard.ts
    │   │   ├── roles.guard.ts
    │   │   └── tenant.guard.ts
    │   ├── interceptors/
    │   │   ├── logging.interceptor.ts
    │   │   ├── transform.interceptor.ts
    │   │   └── timeout.interceptor.ts
    │   ├── pipes/
    │   │   └── validation.pipe.ts
    │   └── utils/
    │       ├── crypto.util.ts
    │       ├── date.util.ts
    │       └── string.util.ts
    │
    ├── infrastructure/              # Infraestructura transversal
    │   ├── database/
    │   │   ├── database.module.ts
    │   │   ├── prisma.service.ts
    │   │   └── migrations/
    │   ├── cache/
    │   │   ├── cache.module.ts
    │   │   └── redis.service.ts
    │   ├── messaging/
    │   │   ├── queue.module.ts
    │   │   └── processors/
    │   └── storage/
    │       ├── storage.module.ts
    │       └── s3.service.ts
    │
    ├── observability/               # Monitoreo y observabilidad
    │   ├── logging/
    │   │   └── logger.module.ts
    │   ├── metrics/
    │   │   └── metrics.module.ts
    │   └── tracing/
    │       └── tracing.module.ts
    │
    ├── security/                    # Seguridad transversal
    │   ├── encryption/
    │   │   └── encryption.service.ts
    │   └── rate-limit/
    │       └── rate-limit.config.ts
    │
    ├── jobs/                        # Background jobs
    │   ├── jobs.module.ts
    │   ├── analytics-rollup.processor.ts
    │   ├── notifications.processor.ts
    │   └── payments-reconcile.processor.ts
    │
    └── modules/                     # Módulos de negocio
        │
        ├── auth/                    # Autenticación y autorización
        │   ├── auth.module.ts
        │   ├── auth.controller.ts
        │   ├── auth.service.ts
        │   ├── auth.service.spec.ts
        │   ├── token.service.ts
        │   ├── strategies/
        │   │   ├── jwt.strategy.ts
        │   │   └── jwt-refresh.strategy.ts
        │   ├── guards/
        │   │   ├── jwt-auth.guard.ts
        │   │   └── public.decorator.ts
        │   ├── decorators/
        │   │   └── current-user.decorator.ts
        │   ├── dto/
        │   │   ├── register.dto.ts
        │   │   ├── login.dto.ts
        │   │   └── refresh-token.dto.ts
        │   └── entities/
        │       └── refresh-token.entity.ts
        │
        ├── tenants/                 # Multi-tenancy
        │   ├── tenants.module.ts
        │   ├── tenants.service.ts
        │   ├── tenant.guard.ts
        │   ├── tenant.decorator.ts
        │   ├── tenant-context.ts    # AsyncLocalStorage
        │   └── entities/
        │       └── tenant.entity.ts
        │
        ├── users/                   # Gestión de usuarios
        │   ├── users.module.ts
        │   ├── users.controller.ts
        │   ├── users.service.ts
        │   ├── users.repository.ts
        │   ├── dto/
        │   │   ├── create-user.dto.ts
        │   │   └── update-user.dto.ts
        │   └── entities/
        │       └── user.entity.ts
        │
        ├── catalog/                 # Catálogo de productos
        │   ├── catalog.module.ts
        │   ├── products/
        │   │   ├── products.controller.ts
        │   │   ├── products.service.ts
        │   │   ├── products.repository.ts
        │   │   ├── dto/
        │   │   │   ├── create-product.dto.ts
        │   │   │   ├── update-product.dto.ts
        │   │   │   └── query-product.dto.ts
        │   │   └── entities/
        │   │       └── product.entity.ts
        │   ├── categories/
        │   │   ├── categories.controller.ts
        │   │   ├── categories.service.ts
        │   │   └── entities/
        │   │       └── category.entity.ts
        │   ├── variants/
        │   └── addons/
        │
        ├── orders/                  # Gestión de órdenes
        │   ├── orders.module.ts
        │   ├── orders.controller.ts
        │   ├── orders.service.ts
        │   ├── orders.repository.ts
        │   ├── cart/
        │   │   ├── cart.controller.ts
        │   │   └── cart.service.ts
        │   ├── checkout/
        │   │   ├── checkout.controller.ts
        │   │   └── checkout.service.ts
        │   ├── states/
        │   │   ├── order-fsm.service.ts
        │   │   └── transitions.config.ts
        │   ├── pricing/
        │   │   └── pricing-engine.service.ts
        │   ├── dto/
        │   │   ├── create-order.dto.ts
        │   │   └── update-order-status.dto.ts
        │   └── entities/
        │       ├── order.entity.ts
        │       ├── order-item.entity.ts
        │       └── cart.entity.ts
        │
        ├── payments/                # Procesamiento de pagos
        │   ├── payments.module.ts
        │   ├── payments.service.ts
        │   ├── providers/
        │   │   ├── payment-provider.interface.ts
        │   │   ├── mercadopago/
        │   │   │   ├── mercadopago.controller.ts
        │   │   │   ├── mercadopago.service.ts
        │   │   │   └── mercadopago.webhook.ts
        │   │   └── manual/
        │   │       └── manual-payment.service.ts
        │   ├── dto/
        │   │   └── process-payment.dto.ts
        │   └── entities/
        │       └── payment.entity.ts
        │
        ├── notifications/           # Sistema de notificaciones
        │   ├── notifications.module.ts
        │   ├── notifications.service.ts
        │   ├── notifications.controller.ts
        │   ├── channels/
        │   │   ├── fcm/
        │   │   │   └── fcm.service.ts
        │   │   ├── websocket/
        │   │   │   └── notifications.gateway.ts
        │   │   └── email/
        │   │       └── email.service.ts
        │   ├── templates/
        │   │   └── notification-templates.ts
        │   └── entities/
        │       ├── notification.entity.ts
        │       └── notification-token.entity.ts
        │
        ├── analytics/               # Analítica y reportes
        │   ├── analytics.module.ts
        │   ├── analytics.controller.ts
        │   ├── analytics.service.ts
        │   ├── rollup/
        │   │   └── rollup.service.ts
        │   └── entities/
        │       └── analytics-rollup.entity.ts
        │
        ├── webhooks/                # Webhooks para integraciones
        │   ├── webhooks.module.ts
        │   ├── webhooks.controller.ts
        │   ├── webhooks.service.ts
        │   ├── validators/
        │   │   └── hmac-validator.ts
        │   └── handlers/
        │       ├── whatsapp.handler.ts
        │       └── telegram.handler.ts
        │
        └── health/                  # Health checks
            ├── health.module.ts
            ├── health.controller.ts
            ├── health.service.ts
            └── indicators/
                ├── database-health.indicator.ts
                └── redis-health.indicator.ts
```

---

## Módulos y Responsabilidades

### 📦 auth - Autenticación y Autorización

**Responsabilidades**:
- Registro y login de usuarios
- Generación y validación de JWT (access + refresh tokens)
- Rotación de refresh tokens
- Revocación de tokens
- Rate limiting en endpoints de auth

**Endpoints**:
```typescript
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
```

**Tecnologías**:
- Passport JWT
- bcrypt (12 rounds)
- JWT RS256
- Redis para lista de revocación

### 📦 tenants - Multi-Tenancy

**Responsabilidades**:
- Gestionar contexto de tenant
- Extraer tenant de subdomain/header/token
- Aplicar filtros automáticos por tenant_id
- Aislar datos por tenant

**Patrón**:
```typescript
// AsyncLocalStorage para tenant context
export class TenantContext {
  private static storage = new AsyncLocalStorage<Tenant>();

  static set(tenant: Tenant) {
    this.storage.enterWith(tenant);
  }

  static get(): Tenant | undefined {
    return this.storage.getStore();
  }
}
```

### 📦 users - Gestión de Usuarios

**Responsabilidades**:
- CRUD de usuarios
- Asignación de roles
- Gestión de perfiles

**Roles**:
```typescript
enum Role {
  OWNER,      // Dueño del negocio
  MANAGER,    // Gerente
  CASHIER,    // Cajero
  KITCHEN,    // Cocina
  DELIVERY,   // Repartidor
  CUSTOMER    // Cliente
}
```

### 📦 catalog - Catálogo de Productos

**Responsabilidades**:
- CRUD productos, categorías, variantes, addons
- Búsqueda full-text
- Filtros por categoría, precio, disponibilidad
- Gestión de stock
- Upload de imágenes a S3/R2
- Cache de listados en Redis

**Entities**:
- Product
- Category
- ProductCategory (many-to-many)
- Variant
- Addon

### 📦 orders - Gestión de Órdenes

**Responsabilidades**:
- Carrito (persistencia anónima y autenticada)
- Checkout con validaciones
- Creación de órdenes
- Máquina de estados (FSM)
- Pricing engine
- Auditoría de cambios

**FSM States**:
```
PENDING → CONFIRMED → PREPARING → IN_TRANSIT → DELIVERED
  ↓
CANCELLED
```

### 📦 payments - Procesamiento de Pagos

**Responsabilidades**:
- Integración con MercadoPago
- Webhook con validación HMAC
- Idempotencia (external_id único)
- Conciliación automática
- Soporte pagos manuales (efectivo/transferencia)

**Payment Providers**:
```typescript
interface PaymentProvider {
  createPreference(order: Order): Promise<PaymentPreference>;
  processWebhook(payload: any, signature: string): Promise<void>;
  getPaymentStatus(externalId: string): Promise<PaymentStatus>;
}
```

### 📦 notifications - Sistema de Notificaciones

**Responsabilidades**:
- Push notifications (FCM)
- WebSockets en tiempo real
- Email (opcional)
- Plantillas de notificaciones
- Cola de procesamiento

**Channels**:
- FCM (Firebase Cloud Messaging)
- WebSocket (Socket.io)
- Email (SendGrid/SES - futuro)

### 📦 analytics - Analítica y Reportes

**Responsabilidades**:
- Rollup diario de métricas
- Ventas por periodo
- Top productos
- Clientes frecuentes
- Medios de pago

**Job Schedule**:
```typescript
@Cron('0 2 * * *') // 2 AM diariamente
async rollupDailyMetrics() {
  // Agregar datos del día anterior
}
```

### 📦 webhooks - Integraciones Externas

**Responsabilidades**:
- Recibir webhooks de servicios externos
- Validar firma HMAC
- Replay protection (timestamp + nonce)
- Rate limiting estricto

**Endpoints**:
```typescript
POST /api/v1/webhooks/whatsapp
POST /api/v1/webhooks/telegram
POST /api/v1/webhooks/payment-status
POST /api/v1/webhooks/notifications
```

---

## Patrones de Diseño

### Repository Pattern

Abstrae acceso a datos, permitiendo cambiar implementación sin afectar servicios.

```typescript
// products.repository.ts
@Injectable()
export class ProductsRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, query: QueryProductDto): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: {
        tenantId,
        ...(query.categoryId && { categories: { some: { categoryId: query.categoryId } } }),
        ...(query.search && {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
          ]
        }),
      },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, tenantId: string): Promise<Product | null> {
    return this.prisma.product.findFirst({
      where: { id, tenantId },
      include: { categories: true, variants: true, addons: true },
    });
  }

  async create(data: CreateProductDto, tenantId: string): Promise<Product> {
    return this.prisma.product.create({
      data: { ...data, tenantId },
    });
  }

  async update(id: string, data: UpdateProductDto, tenantId: string): Promise<Product> {
    return this.prisma.product.update({
      where: { id, tenantId },
      data,
    });
  }

  async softDelete(id: string, tenantId: string): Promise<Product> {
    return this.prisma.product.update({
      where: { id, tenantId },
      data: { deletedAt: new Date() },
    });
  }
}
```

### Service Layer Pattern

Contiene lógica de negocio, orquesta repositorios y otros services.

```typescript
// products.service.ts
@Injectable()
export class ProductsService {
  constructor(
    private repository: ProductsRepository,
    private cacheService: CacheService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAll(tenantId: string, query: QueryProductDto): Promise<PaginatedResponse<Product>> {
    const cacheKey = `catalog:${tenantId}:${JSON.stringify(query)}`;

    // Try cache first
    const cached = await this.cacheService.get<Product[]>(cacheKey);
    if (cached) {
      return { data: cached, total: cached.length, page: query.page, pageSize: query.pageSize };
    }

    // Fetch from DB
    const products = await this.repository.findAll(tenantId, query);
    const total = await this.repository.count(tenantId, query);

    // Cache result
    await this.cacheService.set(cacheKey, products, 300); // TTL 5 min

    return { data: products, total, page: query.page, pageSize: query.pageSize };
  }

  async create(data: CreateProductDto, tenantId: string): Promise<Product> {
    // Validate SKU uniqueness
    const existing = await this.repository.findBySku(data.sku, tenantId);
    if (existing) {
      throw new ConflictException('Product with this SKU already exists');
    }

    // Create product
    const product = await this.repository.create(data, tenantId);

    // Invalidate cache
    await this.cacheService.invalidatePattern(`catalog:${tenantId}:*`);

    // Emit event
    this.eventEmitter.emit('product.created', { productId: product.id, tenantId });

    return product;
  }
}
```

### DTO Pattern con Validación

```typescript
// create-product.dto.ts
import { IsString, IsNumber, IsOptional, IsPositive, Min, Max, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Pizza Margherita', description: 'Nombre del producto' })
  @IsString()
  @Length(3, 100)
  name: string;

  @ApiPropertyOptional({ example: 'Pizza clásica con tomate y mozzarella' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 'PIZZA-001' })
  @IsString()
  @Length(3, 50)
  sku: string;

  @ApiProperty({ example: 12.99, minimum: 0 })
  @IsNumber()
  @IsPositive()
  @Max(999999.99)
  price: number;

  @ApiProperty({ example: 0.21, description: 'Tasa de impuesto (0.21 = 21%)' })
  @IsNumber()
  @Min(0)
  @Max(1)
  taxRate: number;

  @ApiProperty({ example: 50, minimum: 0 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ example: ['uuid1', 'uuid2'] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  categoryIds?: string[];

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean = true;
}
```

### Guard Pattern para Auth y RBAC

```typescript
// jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if endpoint is public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}

// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const hasRole = user.roles.some((role) => requiredRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(`Requires one of roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
```

### Event-Driven Pattern

```typescript
// order.service.ts
@Injectable()
export class OrdersService {
  constructor(
    private eventEmitter: EventEmitter2,
    private notificationsQueue: Queue,
  ) {}

  async updateStatus(orderId: string, newStatus: OrderStatus, userId: string): Promise<Order> {
    const order = await this.repository.findById(orderId);

    // Validate transition
    const isValidTransition = this.fsmService.canTransition(order.status, newStatus);
    if (!isValidTransition) {
      throw new BadRequestException(`Cannot transition from ${order.status} to ${newStatus}`);
    }

    // Update order
    const updatedOrder = await this.repository.updateStatus(orderId, newStatus);

    // Create audit log
    await this.auditService.log({
      action: 'order.status_changed',
      entityType: 'order',
      entityId: orderId,
      actorId: userId,
      before: { status: order.status },
      after: { status: newStatus },
    });

    // Emit event (synchronous handlers)
    this.eventEmitter.emit('order.status_changed', {
      orderId,
      oldStatus: order.status,
      newStatus,
      tenantId: order.tenantId,
      userId,
    });

    // Enqueue notification (asynchronous)
    await this.notificationsQueue.add('send', {
      type: 'order_status_changed',
      orderId,
      userId: order.userId,
      status: newStatus,
    });

    return updatedOrder;
  }
}

// Event listener
@Injectable()
export class OrderEventHandlers {
  @OnEvent('order.status_changed')
  async handleStatusChanged(payload: OrderStatusChangedEvent) {
    // Handle event (sync)
    console.log('Order status changed:', payload);

    // Could trigger other actions:
    // - Update analytics
    // - Send webhooks
    // - Trigger integrations
  }
}
```

---

## Ejemplos de Código

### Controlador Completo

```typescript
// products.controller.ts
@ApiTags('catalog')
@Controller('products')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully', type: [Product] })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  async findAll(
    @CurrentTenant() tenant: Tenant,
    @Query() query: QueryProductDto,
  ): Promise<PaginatedResponse<Product>> {
    return this.productsService.findAll(tenant.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product found', type: Product })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(
    @CurrentTenant() tenant: Tenant,
    @Param('id') id: string,
  ): Promise<Product> {
    const product = await this.productsService.findById(id, tenant.id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  @Post()
  @Roles(Role.OWNER, Role.MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create new product' })
  @ApiResponse({ status: 201, description: 'Product created', type: Product })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'SKU already exists' })
  @ApiBearerAuth()
  async create(
    @CurrentTenant() tenant: Tenant,
    @CurrentUser() user: User,
    @Body() createProductDto: CreateProductDto,
  ): Promise<Product> {
    return this.productsService.create(createProductDto, tenant.id);
  }

  @Put(':id')
  @Roles(Role.OWNER, Role.MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({ status: 200, description: 'Product updated', type: Product })
  @ApiBearerAuth()
  async update(
    @CurrentTenant() tenant: Tenant,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto, tenant.id);
  }

  @Delete(':id')
  @Roles(Role.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Soft delete product' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiBearerAuth()
  async remove(
    @CurrentTenant() tenant: Tenant,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.productsService.softDelete(id, tenant.id);
    return { message: 'Product deleted successfully' };
  }
}
```

### Decoradores Personalizados

```typescript
// current-tenant.decorator.ts
export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Tenant => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant;
  },
);

// current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// roles.decorator.ts
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

// public.decorator.ts
export const Public = () => SetMetadata('isPublic', true);
```

---

## Caching y Performance

### Estrategia de Cache con Redis

```typescript
// cache.service.ts
@Injectable()
export class CacheService {
  constructor(@Inject('REDIS') private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async invalidate(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

### Cache en Catálogo

**TTL por Tipo**:
- Listado de productos: 5 min
- Detalle de producto: 10 min
- Categorías: 1 hora
- Config de tenant: 1 hora

**Invalidación**:
- Al crear/actualizar/eliminar producto → invalidar `catalog:${tenantId}:*`
- Al actualizar categoría → invalidar `categories:${tenantId}:*`

### Lock de Redis para Idempotencia

```typescript
// idempotency.service.ts
@Injectable()
export class IdempotencyService {
  constructor(@Inject('REDIS') private redis: Redis) {}

  async acquireLock(key: string, ttlSeconds: number = 30): Promise<boolean> {
    const result = await this.redis.set(
      `lock:${key}`,
      '1',
      'EX',
      ttlSeconds,
      'NX',
    );
    return result === 'OK';
  }

  async releaseLock(key: string): Promise<void> {
    await this.redis.del(`lock:${key}`);
  }

  async executeWithLock<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = 30,
  ): Promise<T> {
    const locked = await this.acquireLock(key, ttl);

    if (!locked) {
      throw new ConflictException('Operation already in progress');
    }

    try {
      return await fn();
    } finally {
      await this.releaseLock(key);
    }
  }
}

// Uso en checkout
async createOrder(data: CreateOrderDto, idempotencyKey: string): Promise<Order> {
  return this.idempotencyService.executeWithLock(
    `order:create:${idempotencyKey}`,
    async () => {
      // Crear orden (solo se ejecuta una vez)
      const order = await this.repository.create(data);
      await this.decrementStock(data.items);
      return order;
    },
  );
}
```

---

## Seguridad

### Validación de Inputs

Todas las entradas se validan con `class-validator`:

```typescript
@Post()
async create(@Body() dto: CreateProductDto) {
  // dto ya está validado por ValidationPipe global
}
```

### Sanitización

```typescript
// Middleware de sanitización
@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.body) {
      req.body = this.sanitize(req.body);
    }
    next();
  }

  private sanitize(obj: any): any {
    if (typeof obj === 'string') {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitize(item));
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitize(value);
      }
      return sanitized;
    }
    return obj;
  }
}
```

### Rate Limiting

```typescript
// Global rate limit
ThrottlerModule.forRoot({
  ttl: 60,  // 60 segundos
  limit: 100, // 100 requests
});

// Per-endpoint rate limit
@Throttle(5, 60) // 5 requests en 60 segundos
@Post('login')
async login() { ... }
```

---

## Testing

### Unit Tests

```typescript
describe('ProductsService', () => {
  let service: ProductsService;
  let repository: jest.Mocked<ProductsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get(ProductsRepository);
  });

  describe('create', () => {
    it('should create product successfully', async () => {
      const dto = { name: 'Test', sku: 'TEST-001', price: 10, taxRate: 0.21, stock: 100 };
      const expected = { id: 'uuid', ...dto };

      repository.create.mockResolvedValue(expected);

      const result = await service.create(dto, 'tenant-id');

      expect(result).toEqual(expected);
      expect(repository.create).toHaveBeenCalledWith(dto, 'tenant-id');
    });

    it('should throw ConflictException if SKU exists', async () => {
      const dto = { name: 'Test', sku: 'EXISTING', price: 10, taxRate: 0.21, stock: 100 };

      repository.findBySku.mockResolvedValue({ id: 'existing-id' } as any);

      await expect(service.create(dto, 'tenant-id')).rejects.toThrow(ConflictException);
    });
  });
});
```

### Integration Tests

```typescript
describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'Test123!' });

    token = loginResponse.body.accessToken;
  });

  it('/products (GET) should return paginated products', () => {
    return request(app.getHttpServer())
      .get('/api/v1/products?page=1&pageSize=20')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.total).toBeGreaterThanOrEqual(0);
        expect(res.body.page).toBe(1);
        expect(res.body.pageSize).toBe(20);
      });
  });

  it('/products (POST) should create product', () => {
    const dto = {
      name: 'E2E Product',
      sku: 'E2E-001',
      price: 99.99,
      taxRate: 0.21,
      stock: 50,
    };

    return request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send(dto)
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
        expect(res.body.name).toBe(dto.name);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

---

## Versionado API

**Prefijo**: `/api/v1`

**Breaking Changes**:
- Si se rompe compatibilidad → `/api/v2`
- Header `X-Deprecated: true` en endpoints próximos a retiro
- Sunset date en Swagger

**Ejemplo**:
```typescript
@Controller({ version: '1' })
export class ProductsV1Controller { ... }

@Controller({ version: '2' })
export class ProductsV2Controller { ... }
```

---

## Multi-Tenant

### Aislamiento Lógico

Todas las queries incluyen `WHERE tenant_id = $1`:

```typescript
// Automático con Prisma middleware
prisma.$use(async (params, next) => {
  const tenant = TenantContext.get();

  if (tenant && params.model) {
    if (params.action === 'findMany' || params.action === 'findFirst') {
      params.args.where = { ...params.args.where, tenantId: tenant.id };
    }
  }

  return next(params);
});
```

### Futuro: Row Level Security (RLS)

Postgres RLS para capa adicional de seguridad:

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON products
  USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

---

## Changelog

### v1.1 - 2025-11-07 19:02
- Documentación expandida con ejemplos de código
- Patrones de diseño detallados
- Estrategias de caching y performance
- Ejemplos de testing
- Multi-tenant con ejemplos

### v1.0 - 2025-11-07
- Versión inicial
