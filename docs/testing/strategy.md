# Estrategia de Testing

**Versión**: 1.0
**Última actualización**: 2025-11-07 19:35
**Estado**: En Progreso

---

## Índice

1. [Visión General](#visión-general)
2. [Pirámide de Testing](#pirámide-de-testing)
3. [Tests Unitarios](#tests-unitarios)
4. [Tests de Integración](#tests-de-integración)
5. [Tests E2E](#tests-e2e)
6. [Testing de Carga](#testing-de-carga)
7. [Testing de Seguridad](#testing-de-seguridad)
8. [Cobertura y Métricas](#cobertura-y-métricas)

---

## Visión General

### Objetivos de Testing

- ✅ Cobertura >80% en módulos core
- ✅ Detección temprana de bugs
- ✅ Confianza en refactoring
- ✅ Documentación viva del comportamiento
- ✅ Prevención de regresiones

### Stack de Testing

```
Backend (NestJS):
- Unit: Jest
- Integration: Jest + Supertest
- E2E: Jest + Supertest
- Mocks: jest.mock() + @nestjs/testing

Frontend (Next.js):
- Unit: Vitest
- Component: Testing Library
- E2E: Playwright
- Visual: Chromatic (Storybook)
```

---

## Pirámide de Testing

```
                    ╱╲
                   ╱  ╲
                  ╱ E2E ╲         ~10% | 5-10 tests
                 ╱────────╲
                ╱          ╲
               ╱ Integration╲     ~30% | 30-50 tests
              ╱──────────────╲
             ╱                ╲
            ╱   Unit Tests     ╲   ~60% | 200+ tests
           ╱────────────────────╲
```

### Distribución Recomendada

| Tipo | Cantidad | Duración | Cuando Ejecutar |
|------|----------|----------|-----------------|
| Unit | 200+ | <5 min | Cada commit |
| Integration | 30-50 | <10 min | Cada PR |
| E2E | 5-10 | <15 min | Pre-deploy |

---

## Tests Unitarios

### Backend: Servicios

```typescript
// src/orders/services/orders.service.spec.ts

import { Test } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { OrdersRepository } from '../repositories/orders.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('OrdersService', () => {
  let service: OrdersService;
  let repository: jest.Mocked<OrdersRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: OrdersRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(OrdersService);
    repository = module.get(OrdersRepository);
    eventEmitter = module.get(EventEmitter2);
  });

  describe('create', () => {
    it('should create an order and emit event', async () => {
      // Arrange
      const tenantId = 'tenant-1';
      const userId = 'user-1';
      const dto = {
        items: [
          { productId: 'prod-1', quantity: 2, unitPrice: 10 },
        ],
        deliveryMethod: 'DELIVERY',
      };

      const expectedOrder = {
        id: 'order-1',
        tenantId,
        userId,
        total: new Decimal(20),
        items: dto.items,
      };

      repository.create.mockResolvedValue(expectedOrder);

      // Act
      const result = await service.create(tenantId, userId, dto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(tenantId, userId, dto);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'order.created',
        expect.objectContaining({
          orderId: 'order-1',
          tenantId,
        }),
      );
      expect(result).toEqual(expectedOrder);
    });

    it('should throw error if items array is empty', async () => {
      const dto = { items: [], deliveryMethod: 'DELIVERY' };

      await expect(
        service.create('tenant-1', 'user-1', dto),
      ).rejects.toThrow('At least one item required');
    });
  });

  describe('updateStatus', () => {
    it('should update status and emit event', async () => {
      const orderId = 'order-1';
      const existingOrder = {
        id: orderId,
        tenantId: 'tenant-1',
        status: 'PENDING',
      };

      const updatedOrder = { ...existingOrder, status: 'CONFIRMED' };

      repository.findById.mockResolvedValue(existingOrder);
      repository.updateStatus.mockResolvedValue(updatedOrder);

      await service.updateStatus(orderId, 'CONFIRMED', 'user-1');

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'order.status_changed',
        expect.objectContaining({
          orderId,
          oldStatus: 'PENDING',
          newStatus: 'CONFIRMED',
        }),
      );
    });
  });
});
```

### Backend: Repositorios

```typescript
// src/orders/repositories/orders.repository.spec.ts

import { Test } from '@nestjs/testing';
import { OrdersRepository } from './orders.repository';
import { PrismaService } from '../../shared/prisma/prisma.service';

describe('OrdersRepository', () => {
  let repository: OrdersRepository;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrdersRepository,
        {
          provide: PrismaService,
          useValue: {
            order: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get(OrdersRepository);
    prisma = module.get(PrismaService);
  });

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      const orders = [
        { id: 'order-1', tenantId: 'tenant-1' },
        { id: 'order-2', tenantId: 'tenant-1' },
      ];

      prisma.order.findMany.mockResolvedValue(orders);

      const result = await repository.findAll('tenant-1', {
        page: 1,
        pageSize: 10,
      });

      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        skip: 0,
        take: 10,
        include: expect.any(Object),
      });

      expect(result).toEqual(orders);
    });

    it('should filter by status', async () => {
      await repository.findAll('tenant-1', {
        page: 1,
        pageSize: 10,
        status: 'PENDING',
      });

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            tenantId: 'tenant-1',
            status: 'PENDING',
          },
        }),
      );
    });
  });
});
```

### Frontend: Hooks

```typescript
// frontend/src/hooks/useOrders.test.ts

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOrders } from './useOrders';
import * as ordersApi from '../api/orders';

jest.mock('../api/orders');

describe('useOrders', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  it('should fetch orders', async () => {
    const mockOrders = [
      { id: 'order-1', total: 100 },
      { id: 'order-2', total: 200 },
    ];

    jest.spyOn(ordersApi, 'getOrders').mockResolvedValue(mockOrders);

    const { result } = renderHook(() => useOrders('tenant-1'), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockOrders);
    expect(ordersApi.getOrders).toHaveBeenCalledWith('tenant-1', {});
  });

  it('should handle errors', async () => {
    jest.spyOn(ordersApi, 'getOrders').mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useOrders('tenant-1'), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});
```

### Frontend: Componentes

```typescript
// frontend/src/components/OrderCard.test.tsx

import { render, screen } from '@testing-library/react';
import { OrderCard } from './OrderCard';

describe('OrderCard', () => {
  it('should render order details', () => {
    const order = {
      id: 'order-1',
      orderNumber: 'ORD-001',
      total: 150.50,
      status: 'PENDING',
      createdAt: new Date('2025-11-07'),
    };

    render(<OrderCard order={order} />);

    expect(screen.getByText('ORD-001')).toBeInTheDocument();
    expect(screen.getByText('$150.50')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('should call onStatusChange when button clicked', () => {
    const onStatusChange = jest.fn();
    const order = {
      id: 'order-1',
      orderNumber: 'ORD-001',
      status: 'PENDING',
    };

    render(<OrderCard order={order} onStatusChange={onStatusChange} />);

    const confirmButton = screen.getByText('Confirmar');
    confirmButton.click();

    expect(onStatusChange).toHaveBeenCalledWith('order-1', 'CONFIRMED');
  });
});
```

---

## Tests de Integración

### Backend: Controller + Service + Repository

```typescript
// test/orders/orders.integration.spec.ts

import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/prisma/prisma.service';

describe('Orders (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = app.get(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Limpiar DB antes de cada test
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /api/orders', () => {
    it('should create an order', async () => {
      // Setup: Crear tenant, user, product
      const tenant = await prisma.tenant.create({
        data: { name: 'Test Tenant', slug: 'test' },
      });

      const user = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: 'test@example.com',
          passwordHash: 'hash',
          roles: ['CUSTOMER'],
        },
      });

      const product = await prisma.product.create({
        data: {
          tenantId: tenant.id,
          name: 'Product 1',
          sku: 'PROD-001',
          price: 50,
        },
      });

      // Act: Crear orden
      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .set('X-Tenant-Id', tenant.id)
        .set('Authorization', `Bearer ${generateToken(user.id)}`)
        .send({
          items: [
            {
              productId: product.id,
              quantity: 2,
              unitPrice: 50,
            },
          ],
          deliveryMethod: 'DELIVERY',
        })
        .expect(201);

      // Assert
      expect(response.body).toMatchObject({
        tenantId: tenant.id,
        userId: user.id,
        total: 100,
        status: 'PENDING',
      });

      // Verify DB state
      const order = await prisma.order.findUnique({
        where: { id: response.body.id },
        include: { items: true },
      });

      expect(order.items).toHaveLength(1);
      expect(order.items[0].quantity).toBe(2);
    });

    it('should return 400 if items array is empty', async () => {
      const tenant = await prisma.tenant.create({
        data: { name: 'Test', slug: 'test' },
      });

      await request(app.getHttpServer())
        .post('/api/orders')
        .set('X-Tenant-Id', tenant.id)
        .send({
          items: [],
          deliveryMethod: 'DELIVERY',
        })
        .expect(400);
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('should update order status', async () => {
      // Setup
      const tenant = await prisma.tenant.create({
        data: { name: 'Test', slug: 'test' },
      });

      const order = await prisma.order.create({
        data: {
          tenantId: tenant.id,
          userId: 'user-1',
          orderNumber: 'ORD-001',
          status: 'PENDING',
          subtotal: 100,
          total: 100,
        },
      });

      // Act
      await request(app.getHttpServer())
        .patch(`/api/orders/${order.id}/status`)
        .set('X-Tenant-Id', tenant.id)
        .send({ status: 'CONFIRMED' })
        .expect(200);

      // Assert
      const updated = await prisma.order.findUnique({
        where: { id: order.id },
      });

      expect(updated.status).toBe('CONFIRMED');
      expect(updated.confirmedAt).toBeDefined();
    });
  });
});
```

---

## Tests E2E

### Backend: Flujos Completos

```typescript
// test/e2e/order-flow.e2e-spec.ts

import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Order Flow (E2E)', () => {
  let app: INestApplication;
  let authToken: string;
  let tenantId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Setup: Login y obtener token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'demo@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.accessToken;
    tenantId = loginResponse.body.user.tenantId;
  });

  it('should complete full order lifecycle', async () => {
    // 1. Listar productos
    const productsResponse = await request(app.getHttpServer())
      .get('/api/products')
      .set('X-Tenant-Id', tenantId)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const product = productsResponse.body.data[0];

    // 2. Crear orden
    const createOrderResponse = await request(app.getHttpServer())
      .post('/api/orders')
      .set('X-Tenant-Id', tenantId)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        items: [
          {
            productId: product.id,
            quantity: 2,
            unitPrice: product.price,
          },
        ],
        deliveryMethod: 'DELIVERY',
        address: {
          street: 'Main St 123',
          city: 'City',
        },
      })
      .expect(201);

    const order = createOrderResponse.body;
    expect(order.status).toBe('PENDING');

    // 3. Confirmar orden
    await request(app.getHttpServer())
      .patch(`/api/orders/${order.id}/status`)
      .set('X-Tenant-Id', tenantId)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'CONFIRMED' })
      .expect(200);

    // 4. Iniciar pago
    const paymentResponse = await request(app.getHttpServer())
      .post('/api/payments')
      .set('X-Tenant-Id', tenantId)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        orderId: order.id,
        provider: 'MERCADOPAGO',
        amount: order.total,
      })
      .expect(201);

    expect(paymentResponse.body.status).toBe('PENDING');

    // 5. Simular webhook de pago aprobado
    await request(app.getHttpServer())
      .post('/api/webhooks/mercadopago')
      .send({
        action: 'payment.updated',
        data: {
          id: paymentResponse.body.externalId,
          status: 'approved',
        },
      })
      .expect(200);

    // 6. Verificar orden actualizada
    const finalOrderResponse = await request(app.getHttpServer())
      .get(`/api/orders/${order.id}`)
      .set('X-Tenant-Id', tenantId)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(finalOrderResponse.body.payment.status).toBe('APPROVED');
    expect(finalOrderResponse.body.status).toBe('CONFIRMED');
  });

  afterAll(async () => {
    await app.close();
  });
});
```

### Frontend: Playwright

```typescript
// frontend/e2e/order-flow.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Order Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:3001');
    await page.fill('[name="email"]', 'demo@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard');
  });

  test('should create order from products page', async ({ page }) => {
    // 1. Ir a productos
    await page.goto('http://localhost:3001/products');

    // 2. Agregar producto al carrito
    await page.click('[data-testid="product-card"]:first-child button');
    await expect(page.locator('[data-testid="cart-badge"]')).toHaveText('1');

    // 3. Ir al carrito
    await page.click('[data-testid="cart-button"]');
    await page.waitForURL('**/cart');

    // 4. Checkout
    await page.click('[data-testid="checkout-button"]');

    // 5. Completar formulario de entrega
    await page.fill('[name="address.street"]', 'Main St 123');
    await page.fill('[name="address.city"]', 'City');
    await page.selectOption('[name="deliveryMethod"]', 'DELIVERY');

    // 6. Confirmar orden
    await page.click('button[type="submit"]');

    // 7. Verificar orden creada
    await page.waitForURL('**/orders/*');
    await expect(page.locator('h1')).toContainText('Orden confirmada');
    await expect(page.locator('[data-testid="order-status"]')).toHaveText('PENDING');
  });

  test('should update order status', async ({ page }) => {
    // Setup: Crear orden primero (o usar fixture)

    // 1. Ir a panel de cocina (rol KITCHEN)
    await page.goto('http://localhost:3001/kitchen');

    // 2. Ver orden pendiente
    const orderCard = page.locator('[data-testid="order-card"]:first-child');
    await expect(orderCard).toBeVisible();

    // 3. Cambiar a "En preparación"
    await orderCard.locator('button:text("Preparar")').click();

    // 4. Verificar estado actualizado
    await expect(orderCard.locator('[data-testid="status"]')).toHaveText('PREPARING');

    // 5. Marcar como listo
    await orderCard.locator('button:text("Listo")').click();

    // 6. Verificar desapareció de la lista
    await expect(orderCard).not.toBeVisible();
  });
});
```

---

## Testing de Carga

### Artillery Configuration

```yaml
# artillery/load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10  # 10 usuarios por segundo
      name: Warm up
    - duration: 120
      arrivalRate: 50  # 50 usuarios por segundo
      name: Sustained load
    - duration: 60
      arrivalRate: 100  # 100 usuarios por segundo
      name: Spike
  processor: "./helpers.js"

scenarios:
  - name: "Browse and order"
    flow:
      - post:
          url: "/auth/login"
          json:
            email: "demo@example.com"
            password: "password123"
          capture:
            - json: "$.accessToken"
              as: "token"

      - get:
          url: "/api/products"
          headers:
            Authorization: "Bearer {{ token }}"
            X-Tenant-Id: "{{ $randomString() }}"

      - post:
          url: "/api/orders"
          headers:
            Authorization: "Bearer {{ token }}"
            X-Tenant-Id: "{{ $randomString() }}"
          json:
            items:
              - productId: "{{ $randomString() }}"
                quantity: 2
                unitPrice: 50
            deliveryMethod: "DELIVERY"
```

### Ejecutar Tests de Carga

```bash
# Instalar Artillery
npm install -g artillery

# Ejecutar test
artillery run artillery/load-test.yml

# Generar reporte HTML
artillery run --output report.json artillery/load-test.yml
artillery report report.json

# Benchmarks esperados:
# - P95 latency < 500ms bajo 100 RPS
# - Error rate < 1%
# - Throughput > 1000 RPS
```

---

## Testing de Seguridad

### OWASP ZAP

```bash
# Ejecutar escaneo de seguridad
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:3000 \
  -r security-report.html
```

### SQL Injection Tests

```typescript
// test/security/sql-injection.spec.ts

it('should prevent SQL injection in search', async () => {
  const maliciousInput = "'; DROP TABLE users; --";

  await request(app.getHttpServer())
    .get('/api/products')
    .query({ search: maliciousInput })
    .expect(200);  // No debe fallar

  // Verificar que la tabla sigue existiendo
  const users = await prisma.user.count();
  expect(users).toBeGreaterThan(0);
});
```

### XSS Tests

```typescript
it('should sanitize HTML in product descriptions', async () => {
  const xssPayload = '<script>alert("XSS")</script>';

  const response = await request(app.getHttpServer())
    .post('/api/products')
    .send({
      name: 'Test Product',
      description: xssPayload,
      price: 100,
    });

  expect(response.body.description).not.toContain('<script>');
});
```

---

## Cobertura y Métricas

### Configuración de Cobertura

```json
// jest.config.js
{
  "collectCoverageFrom": [
    "src/**/*.ts",
    "!src/**/*.spec.ts",
    "!src/**/*.module.ts",
    "!src/main.ts"
  ],
  "coverageThresholds": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    },
    "./src/orders/**/*.ts": {
      "branches": 90,
      "functions": 90,
      "lines": 90,
      "statements": 90
    }
  }
}
```

### Ejecutar Tests con Cobertura

```bash
# Backend
npm run test:cov

# Ver reporte en navegador
open coverage/lcov-report/index.html

# Frontend
npm run test:coverage

# Subir a Codecov (en CI)
bash <(curl -s https://codecov.io/bash)
```

### Métricas de Calidad

```bash
# Mutation testing (detectar tests débiles)
npx stryker run

# Benchmarks de performance
npm run test:perf

# Análisis estático
npm run lint
npm run type-check
```

---

## Mejores Prácticas

### ✅ DO

```typescript
// Test names descriptivos
it('should create order when user has sufficient balance', () => {});

// AAA pattern (Arrange, Act, Assert)
it('should...', () => {
  // Arrange
  const input = { ... };

  // Act
  const result = service.doSomething(input);

  // Assert
  expect(result).toBe(expected);
});

// Un concepto por test
it('should calculate total correctly', () => {
  expect(calculateTotal([...])).toBe(100);
});

// Usar factories/fixtures
const order = orderFactory.build({ status: 'PENDING' });
```

### ❌ DON'T

```typescript
// ❌ Test names vagos
it('should work', () => {});

// ❌ Múltiples asserts no relacionados
it('should do everything', () => {
  expect(a).toBe(1);
  expect(b).toBe(2);
  expect(c).toBe(3);
});

// ❌ Tests que dependen del orden
it('test 1', () => { globalVar = 'foo'; });
it('test 2', () => { expect(globalVar).toBe('foo'); });

// ❌ Sleep en tests
await new Promise(resolve => setTimeout(resolve, 5000));
```

---

## CI Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:cov
      - uses: codecov/codecov-action@v3

  test-e2e:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
      redis:
        image: redis:7
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:e2e

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: cd frontend && npm ci
      - run: npm run test
      - run: npx playwright install
      - run: npm run test:e2e
```

---

## Changelog

### v1.0 - 2025-11-07 19:35
- Estrategia de testing inicial
- Tests unitarios, integración, E2E
- Testing de carga y seguridad
- Configuración de cobertura
- Best practices
