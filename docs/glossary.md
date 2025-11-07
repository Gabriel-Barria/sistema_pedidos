# Glosario de Términos

**Versión**: 1.0
**Última actualización**: 2025-11-07 19:02
**Estado**: Aprobado

---

## Índice Alfabético

[A](#a) | [B](#b) | [C](#c) | [D](#d) | [E](#e) | [F](#f) | [G](#g) | [H](#h) | [I](#i) | [J](#j) | [K](#k) | [L](#l) | [M](#m) | [N](#n) | [O](#o) | [P](#p) | [Q](#q) | [R](#r) | [S](#s) | [T](#t) | [U](#u) | [V](#v) | [W](#w) | [X](#x) | [Y](#y) | [Z](#z)

---

## A

### Access Token
Token JWT de corta duración (15 minutos) usado para autenticar requests a la API. Se envía en el header `Authorization: Bearer {token}`.

### ADR (Architecture Decision Record)
Documento que captura una decisión arquitectónica importante, incluyendo contexto, alternativas consideradas, y razones de la elección.

### Addon
Complemento opcional para un producto (ej: extra queso, salsa). Tiene nombre y precio adicional.

### API First
Enfoque de desarrollo donde el backend y su API se diseñan y construyen completamente antes del frontend.

### Audit Log
Registro de auditoría que captura quién hizo qué cambio, cuándo, y qué valores cambiaron (before/after).

---

## B

### Backend
Capa del sistema que maneja lógica de negocio, base de datos, y expone APIs. Implementado en NestJS.

### Backoff (Exponential)
Estrategia de retry donde el tiempo de espera se duplica en cada intento fallido (1s, 2s, 4s, 8s, etc).

### Bcrypt
Algoritmo de hashing para passwords. Usado con 12 rounds para balance entre seguridad y performance.

### Branch Protection
Reglas en GitHub que previenen pushes directos y requieren PR reviews y CI verde antes de merge.

### BullMQ
Librería de colas de trabajo basada en Redis. Usada para procesamiento asíncrono de notificaciones, pagos, analytics.

---

## C

### Cache
Almacenamiento temporal de datos en Redis para mejorar performance. TTL (Time To Live) define cuánto dura.

### Carrito (Cart)
Colección temporal de productos que el cliente planea comprar. Puede ser anónimo (session-based) o autenticado (user-based).

### Catálogo
Conjunto de productos, categorías, variantes, y addons que un tenant ofrece.

### Checkout
Proceso de finalizar una compra: ingresar dirección, seleccionar método de pago, y crear orden.

### CI/CD (Continuous Integration/Continuous Deployment)
Prácticas de automatización para integrar código (CI) y desplegarlo (CD) continuamente. Implementado con GitHub Actions.

### Circuit Breaker
Patrón de diseño que previene intentos repetidos a servicios que están fallando. Si X intentos fallan, "abre el circuito" por Y tiempo.

### CORS (Cross-Origin Resource Sharing)
Mecanismo de seguridad que controla qué dominios pueden hacer requests al API. Configurado por tenant.

### CRUD
Create, Read, Update, Delete - operaciones básicas sobre datos.

### CSP (Content Security Policy)
Headers de seguridad que controlan qué recursos puede cargar el navegador, previniendo XSS.

---

## D

### DDD (Domain-Driven Design)
Enfoque de diseño donde el código se organiza por dominios de negocio (auth, catalog, orders, payments).

### Dead Letter Queue (DLQ)
Cola donde se envían mensajes/jobs que fallaron después de todos los reintentos. Permite inspección manual.

### Debounce
Técnica que retrasa la ejecución de una función hasta que hayan pasado X ms desde la última invocación. Usado en búsqueda para evitar requests excesivos.

### Docker
Plataforma de contenedorización que permite empaquetar aplicaciones con todas sus dependencias.

### Docker Compose
Herramienta para definir y correr aplicaciones multi-contenedor. Usa archivo `docker-compose.yml`.

### DTO (Data Transfer Object)
Objeto que define la estructura de datos para requests/responses. Incluye validaciones con class-validator.

---

## E

### E2E (End-to-End) Tests
Tests que simulan el flujo completo de un usuario real, desde UI hasta base de datos.

### Entity
Clase que representa una tabla de base de datos. Decorada con TypeORM o Prisma.

### Event-Driven Architecture
Arquitectura donde módulos se comunican mediante eventos asíncronos en lugar de llamadas directas.

### EventEmitter
Patrón pub-sub de NestJS para emitir y escuchar eventos internos de la aplicación.

---

## F

### FCM (Firebase Cloud Messaging)
Servicio de Google para enviar notificaciones push a dispositivos móviles y web.

### Feature Flag
Switch que permite activar/desactivar funcionalidades sin redeploy. Útil para canary deployments.

### FSM (Finite State Machine)
Máquina de estados finitos. Define estados válidos y transiciones permitidas (ej: orden de pendiente a confirmada).

### Frontend
Capa del sistema que interactúa con usuarios. Implementada en Next.js como PWA.

---

## G

### Gateway (API Gateway)
Punto de entrada único a la API que maneja routing, auth, rate limiting, etc.

### Git Flow
Estrategia de branching con branches main, develop, feature/*, hotfix/*, release/*.

### Guard
Middleware de NestJS que controla acceso a endpoints (ej: JwtAuthGuard, RolesGuard).

---

## H

### Healthcheck
Endpoint (`/health`) que verifica si el servicio y sus dependencias están operativos.

### Helmet
Middleware de Express/NestJS que agrega headers de seguridad (CSP, HSTS, etc).

### HMAC (Hash-based Message Authentication Code)
Algoritmo criptográfico para verificar integridad y autenticidad de mensajes. Usado en webhooks.

### Hot Reload
Capacidad de ver cambios en código sin reiniciar el servidor. Activo en modo desarrollo.

---

## I

### Idempotency (Idempotencia)
Propiedad donde ejecutar una operación múltiples veces produce el mismo resultado que ejecutarla una vez. Crítico en webhooks y pagos.

### Idempotency Key
Header único (`Idempotency-Key`) que identifica un request. Si llega el mismo key dos veces, se retorna el mismo resultado sin re-procesar.

### Integration Tests
Tests que verifican interacción entre múltiples módulos/servicios, usando base de datos real (test).

---

## J

### JWT (JSON Web Token)
Estándar para tokens de autenticación. Incluye claims (sub, email, roles) firmados criptográficamente.

### JwtAuthGuard
Guard de NestJS que verifica que el request incluya un JWT válido antes de permitir acceso.

---

## K

### Kanban
Vista de tareas organizadas en columnas por estado. Usada en panel admin para gestionar órdenes.

---

## L

### Liveness Probe
Healthcheck que verifica si el contenedor está "vivo". Si falla, orquestador reinicia el contenedor.

### Lock (Redis Lock)
Mecanismo de sincronización usando `SET key NX EX` en Redis. Previene procesamiento concurrente del mismo recurso.

---

## M

### MercadoPago
Pasarela de pagos de LATAM. Primera integración del sistema.

### Middleware
Función que se ejecuta antes de llegar al handler de un endpoint. Usado para logging, parsing, etc.

### Migration
Script versionado que modifica esquema de base de datos. Creado con Prisma Migrate.

### Monorepo
Repositorio único que contiene múltiples proyectos (backend, frontend, docs).

### Multi-Tenant
Arquitectura donde una única instancia del sistema sirve a múltiples "tenants" (clientes/negocios) con datos aislados.

---

## N

### Namespace (WebSocket)
Canal separado de comunicación en WebSocket. Permite aislamiento por tenant.

### NestJS
Framework de Node.js para construir aplicaciones del lado del servidor. Usa TypeScript y arquitectura modular.

### Next.js
Framework de React para aplicaciones web. Soporta SSR, SSG, y optimizaciones automáticas.

### Nonce
Número usado una sola vez. En webhooks, previene replay attacks.

---

## O

### OpenAPI
Especificación estándar para describir APIs REST. Generado automáticamente por Swagger en NestJS.

### OpenTelemetry (OTel)
Framework para observabilidad: métricas, logs, y traces distribuidos.

### Orden (Order)
Pedido creado por un cliente. Incluye items, totales, dirección, y estado.

---

## P

### Pagination
Dividir listados grandes en páginas. Parámetros: `page` (número de página) y `pageSize` (items por página).

### Payload
Datos enviados en el body de un request o evento.

### PgAdmin
Herramienta web para administrar bases de datos PostgreSQL.

### Pino
Logger estructurado de alto performance para Node.js. Genera logs en formato JSON.

### Pricing Engine
Módulo que calcula totales de órdenes: subtotales, impuestos, descuentos, propina, envío.

### Prisma
ORM (Object-Relational Mapping) moderno para TypeScript. Genera cliente tipado desde schema.

### PR (Pull Request)
Solicitud para integrar cambios de un branch a otro. Requiere review y CI verde.

### PWA (Progressive Web App)
Aplicación web que funciona como app nativa: instalable, offline-capable, push notifications.

---

## Q

### Queue (Cola)
Estructura de datos FIFO (First In First Out) usada para procesar tareas asíncronamente. Implementada con BullMQ.

---

## R

### Rate Limiting
Limitar cantidad de requests por tiempo para prevenir abuso. Ej: 100 req/min por IP.

### RBAC (Role-Based Access Control)
Control de acceso basado en roles. Roles: OWNER, MANAGER, CASHIER, KITCHEN, DELIVERY, CUSTOMER.

### Readiness Probe
Healthcheck que verifica si el contenedor está listo para recibir tráfico. Si falla, orquestador deja de enviar requests.

### Redis
Base de datos en memoria usada para cache, colas, y locks.

### Redis Commander
UI web para visualizar y gestionar datos en Redis.

### Refresh Token
Token de larga duración (30 días) usado para obtener nuevos access tokens sin re-autenticar.

### Repository Pattern
Patrón que abstrae acceso a datos. Servicios usan repositorios en lugar de acceder DB directamente.

### Retry (Reintento)
Volver a ejecutar una operación fallida después de un delay. Con backoff exponencial.

### RLS (Row-Level Security)
Feature de Postgres que aplica filtros automáticos a queries según usuario/rol. Futuro para multi-tenant.

### Room (WebSocket)
Grupo de conexiones WebSocket. En nuestro caso, una room por orden para actualizaciones en tiempo real.

---

## S

### S3
Servicio de almacenamiento de objetos de AWS. Compatible con Cloudflare R2.

### Sanitization
Limpiar/escapar inputs para prevenir inyecciones (SQL injection, XSS).

### Scope (JWT Scope)
Permiso granular dentro de un token. Ej: `orders:read`, `products:write`.

### Seed
Cargar datos iniciales en base de datos para desarrollo o testing.

### SLA (Service Level Agreement)
Acuerdo de nivel de servicio. Define métricas garantizadas.

### SLO (Service Level Objective)
Objetivo de nivel de servicio. Ej: "P95 latency < 200ms", "Uptime 99.9%".

### Soft Delete
Marcar registro como eliminado sin borrarlo físicamente. Usa campo `deleted_at`.

### SSR (Server-Side Rendering)
Renderizar HTML en servidor antes de enviarlo al cliente. Feature de Next.js.

### Swagger
Herramienta para generar documentación interactiva de APIs desde código.

---

## T

### Tenant
Cliente/negocio individual en sistema multi-tenant. Cada tenant tiene datos aislados.

### Tenant Context
Información del tenant actual, extraída de subdomain, header, o token. Almacenada en AsyncLocalStorage.

### Throttling
Ver Rate Limiting.

### Timestamp
Fecha y hora en formato ISO 8601 (YYYY-MM-DDTHH:MM:SS.sssZ).

### Token Rotation
Invalidar refresh token viejo al generar uno nuevo, previniendo reutilización.

### TraceId
ID único que identifica un request a través de todos los servicios. Usado para correlacionar logs.

### TTL (Time To Live)
Tiempo que un dato persiste antes de expirar. Usado en cache Redis y tokens.

---

## U

### Unit Test
Test que verifica una unidad individual de código (función, clase) en aislamiento con mocks.

### UUID
Identificador único universal. Formato: `123e4567-e89b-12d3-a456-426614174000`.

---

## V

### Validación
Verificar que datos cumplen reglas de negocio. Hecha con class-validator en DTOs.

### Variant (Variante)
Opción de un producto (ej: tamaño S/M/L). Puede tener precio diferencial.

### Volume (Docker Volume)
Almacenamiento persistente para contenedores. Datos no se pierden al reiniciar.

---

## W

### Webhook
Endpoint HTTP que recibe notificaciones de servicios externos. Debe validar firma HMAC.

### WebSocket
Protocolo de comunicación bidireccional en tiempo real sobre HTTP.

### WBS (Work Breakdown Structure)
Descomposición jerárquica de trabajo en tareas y subtareas.

---

## X

### XSS (Cross-Site Scripting)
Vulnerabilidad donde atacante inyecta scripts maliciosos. Prevenida con sanitización y CSP.

---

## Y

### YAML
Formato de serialización de datos legible. Usado en docker-compose.yml y CI/CD.

---

## Z

### Zone (Zona de Entrega)
Área geográfica donde el negocio realiza entregas. Cada zona puede tener costo diferente.

---

## Acrónimos Comunes

| Acrónimo | Significado |
|----------|-------------|
| API | Application Programming Interface |
| AWS | Amazon Web Services |
| CD | Continuous Deployment |
| CI | Continuous Integration |
| CPU | Central Processing Unit |
| CRUD | Create, Read, Update, Delete |
| DB | Database |
| ENV | Environment (variables de entorno) |
| ERD | Entity-Relationship Diagram |
| HTTP | Hypertext Transfer Protocol |
| HTTPS | HTTP Secure |
| JSON | JavaScript Object Notation |
| ORM | Object-Relational Mapping |
| OS | Operating System |
| PK | Primary Key |
| PR | Pull Request |
| QA | Quality Assurance |
| REST | Representational State Transfer |
| SQL | Structured Query Language |
| SSL | Secure Sockets Layer |
| TLS | Transport Layer Security |
| UI | User Interface |
| URL | Uniform Resource Locator |
| UX | User Experience |
| VM | Virtual Machine |
| VPN | Virtual Private Network |

---

## Patrones de Diseño Mencionados

### Repository Pattern
Abstrae acceso a datos, permitiendo cambiar implementación sin afectar lógica de negocio.

### Factory Pattern
Crea objetos sin especificar clase exacta. Usado en payment providers.

### Strategy Pattern
Define familia de algoritmos intercambiables. Usado en pricing engine para diferentes tipos de descuento.

### Observer Pattern
Objeto notifica a dependientes cuando cambia estado. Base de event-driven architecture.

### Singleton Pattern
Garantiza única instancia de una clase. Usado en módulos de NestJS.

---

## Tecnologías Principales

### Backend
- **NestJS**: Framework principal
- **TypeScript**: Lenguaje
- **Prisma**: ORM
- **PostgreSQL**: Base de datos principal
- **Redis**: Cache y colas
- **BullMQ**: Procesamiento de colas
- **Passport**: Autenticación
- **Class-Validator**: Validación de DTOs
- **Pino**: Logger estructurado

### Frontend
- **Next.js**: Framework React
- **React**: Librería UI
- **TypeScript**: Lenguaje
- **Tailwind CSS**: Estilos
- **React Query**: Estado del servidor
- **Zustand**: Estado global
- **Socket.io-client**: WebSockets
- **Playwright**: Tests E2E

### Infraestructura
- **Docker**: Contenedorización
- **Docker Compose**: Orquestación local
- **GitHub Actions**: CI/CD
- **Prometheus**: Métricas
- **Grafana**: Dashboards
- **AWS S3**: Almacenamiento de archivos
- **Cloudflare R2**: Almacenamiento (alternativa S3)

### Servicios Externos
- **MercadoPago**: Pasarela de pagos
- **Firebase Cloud Messaging**: Push notifications
- **SendGrid**: Emails (futuro)

---

## Referencias

### Estándares
- [RFC 7519](https://tools.ietf.org/html/rfc7519) - JWT
- [RFC 6749](https://tools.ietf.org/html/rfc6749) - OAuth 2.0
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [OpenAPI 3.0](https://swagger.io/specification/)

### Seguridad
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)

### Arquitectura
- [12-Factor App](https://12factor.net/)
- [Martin Fowler - Microservices](https://martinfowler.com/microservices/)

---

## Changelog

### v1.0 - 2025-11-07 19:02
- Glosario inicial con términos técnicos del proyecto
- Acrónimos comunes
- Patrones de diseño
- Stack tecnológico completo
- Referencias a estándares
