# Sistema Integral de Pedidos Multirubro

Sistema multi-tenant de gestión de pedidos con soporte para múltiples rubros comerciales (restaurantes, retail, servicios).

**Versión**: 0.1.0 (E01-setup-completo)
**Estado**: En Desarrollo
**Stack**: NestJS 10 + Next.js 14 + PostgreSQL 16 + Redis 7

---

## 🚀 Quick Start

### Prerequisitos

- Docker 24+ y Docker Compose 2.20+
- Git 2.30+
- Node.js 20+ (opcional, para desarrollo local)
- Make (GNU Make)

### Instalación

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-org/sistema_pedidos.git
cd sistema_pedidos

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Iniciar servicios
make up

# 4. Verificar que todo funciona
make health-check
```

### Servicios Disponibles

Una vez iniciado con `make up`:

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| PostgreSQL | `localhost:5432` | `pedidos` / `dev_password` |
| Redis | `localhost:6379` | Password: `dev_redis_password` |
| PgAdmin | http://localhost:5050 | `admin@pedidos.local` / `admin` |
| Redis Commander | http://localhost:8081 | N/A |

---

## 📋 Comandos Disponibles

```bash
make help              # Ver todos los comandos disponibles
make up                # Iniciar todos los servicios
make down              # Detener todos los servicios
make restart           # Reiniciar servicios
make logs              # Ver logs de todos los servicios
make ps                # Listar servicios corriendo

# Base de datos
make db-shell          # Abrir psql shell
make db-migrate        # Ejecutar migraciones (disponible en E02)
make db-seed           # Seed de datos de prueba (disponible en E02)
make db-reset          # Resetear base de datos

# Redis
make redis-cli         # Abrir Redis CLI
make redis-flush       # Limpiar toda la cache

# Testing (disponible en E02)
make test              # Ejecutar todos los tests
make test-unit         # Tests unitarios
make test-e2e          # Tests E2E

# Desarrollo (disponible en E02)
make install           # Instalar dependencias
make dev               # Iniciar en modo desarrollo
make lint              # Ejecutar linting
make format            # Formatear código
```

---

## 📁 Estructura del Proyecto

```
sistema_pedidos/
├── .github/
│   └── workflows/           # GitHub Actions CI/CD
├── backend/                 # API NestJS (E02)
├── frontend/                # App Next.js 14 (E15)
├── docs/                    # Documentación completa
│   ├── workflows/           # Guías de implementación
│   ├── architecture/        # Docs de arquitectura
│   ├── operations/          # Runbook y deployment
│   └── README.md            # Índice de documentación
├── docker-compose.yml       # Orquestación de servicios
├── Makefile                 # Comandos de desarrollo
├── .env.example             # Template de variables de entorno
└── README.md                # Este archivo
```

---

## 🏗️ Arquitectura

### Stack Tecnológico

**Backend**:
- NestJS 10.x (Node.js 20)
- Prisma 5.x ORM
- PostgreSQL 16
- Redis 7 (cache y sessions)
- JWT (RS256) para autenticación

**Frontend**:
- Next.js 14 (App Router)
- React 18
- TypeScript 5
- Tailwind CSS 3

**DevOps**:
- Docker & Docker Compose
- GitHub Actions
- Nginx (reverse proxy)

### Patrones Arquitectónicos

- **Multi-tenancy**: Aislamiento lógico con `tenantId`
- **DDD**: Domain-Driven Design
- **Event-Driven**: EventEmitter + BullMQ
- **Repository Pattern**: Abstracción de acceso a datos
- **CQRS**: Separación de comandos y consultas (módulos críticos)

Ver [docs/architecture/](docs/architecture/) para más detalles.

---

## 📚 Documentación

Toda la documentación está en [`docs/`](docs/):

- **[docs/README.md](docs/README.md)** - Índice maestro de documentación
- **[docs/workflows/](docs/workflows/)** - Guías paso a paso de implementación
- **[docs/architecture/](docs/architecture/)** - Arquitectura técnica
- **[docs/operations/](docs/operations/)** - Deployment y runbook
- **[docs/testing/](docs/testing/)** - Estrategia de testing

### Workflows de Implementación

Para seguir el plan de desarrollo, consulta los workflows en `docs/workflows/`:

1. [E01-setup-completo](docs/workflows/E01-setup-completo.md) ✅ (Actual)
2. [E02-estructura-backend](docs/workflows/E02-estructura-backend.md) - Siguiente
3. [E03-auth-users](docs/workflows/E03-auth-users.md)
4. [E04-multi-tenancy](docs/workflows/E04-multi-tenancy.md)
5. ... ver [docs/workflows/](docs/workflows/) para la lista completa

---

## 🧪 Testing

```bash
# Tests unitarios
make test-unit

# Tests de integración
make test

# Tests E2E
make test-e2e

# Coverage
make test-coverage
```

**Objetivos de cobertura**:
- Módulos core: >80%
- Utilidades: >90%
- E2E: Flujos críticos completos

---

## 🔐 Seguridad

- JWT con RS256 (claves RSA)
- Passwords hasheados con bcrypt (cost: 12)
- Rate limiting en endpoints públicos
- Helmet para headers HTTP seguros
- CORS configurado por environment
- SQL injection prevention (Prisma)
- XSS protection

Ver [docs/architecture/security-observability.md](docs/architecture/security-observability.md)

---

## 🚦 Git Flow

```
main (producción)
  └── develop (integración)
        ├── feature/E02-backend-structure
        ├── feature/E03-auth
        └── feature/E05-catalog
```

### Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(auth): agregar login con JWT
fix(orders): corregir cálculo de subtotal
docs(readme): actualizar comandos make
test(products): agregar tests de búsqueda
chore(deps): actualizar Prisma a 5.8
```

Ver [docs/instrucciones_generales.md](docs/instrucciones_generales.md) para más detalles.

---

## 📊 Plan del Proyecto

**Duración**: 13 semanas
**Entregables**: 26 (organizados en 5 fases)
**Horas totales**: 564h

Ver plan completo en [docs/project_plan/project_plan.md](docs/project_plan/project_plan.md)

### Fases

1. **Fundamentos** (Semanas 1-2): Setup, Backend base, Auth
2. **Core Backend** (Semanas 3-5): Multi-tenancy, Catálogo, Órdenes
3. **Frontend** (Semanas 6-8): Next.js, UI principal
4. **Pagos y Tiempo Real** (Semanas 9-10): Payments, WebSockets
5. **Hardening** (Semanas 11-13): Testing, Performance, Deployment

---

## 🤝 Contribuir

1. Leer [docs/instrucciones_generales.md](docs/instrucciones_generales.md)
2. Crear feature branch desde `develop`
3. Seguir convenciones de commits
4. Tests deben pasar (>80% coverage)
5. Crear PR con descripción clara
6. Esperar review y CI verde

---

## 📝 Licencia

Propietario - Todos los derechos reservados

---

## 📞 Contacto

- **Project Lead**: TBD
- **Tech Lead**: TBD
- **Documentación**: [docs/](docs/)
- **Issues**: GitHub Issues

---

## ✅ Estado Actual: E01-setup-completo

- [x] Repositorio Git inicializado
- [x] Docker Compose configurado (PostgreSQL, Redis, PgAdmin, Redis Commander)
- [x] Makefile con comandos básicos
- [x] Variables de entorno (.env.example)
- [x] Documentación base (docs/)
- [x] GitHub Actions CI/CD (.github/workflows/ci.yml)
- [x] Branches main y develop configurados
- [x] Commit inicial realizado
- [x] Estructura de carpetas creada
- [x] .gitignore configurado

**Status**: ✅ E01 Completado

**Siguiente**: [E02-estructura-backend](docs/workflows/E02-estructura-backend.md)
