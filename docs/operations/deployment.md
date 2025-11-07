# Guía de Deployment

**Versión**: 1.0
**Última actualización**: 2025-11-07 19:30
**Estado**: En Progreso

---

## Índice

1. [Entornos](#entornos)
2. [Deployment Local](#deployment-local)
3. [Deployment a Staging](#deployment-a-staging)
4. [Deployment a Producción](#deployment-a-producción)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Rollback](#rollback)
7. [Checklist Pre-Deploy](#checklist-pre-deploy)

---

## Entornos

### Configuración de Entornos

```
┌──────────────┬─────────────────┬──────────────┬──────────────┐
│ Entorno      │ Branch          │ Auto-Deploy  │ Requiere     │
├──────────────┼─────────────────┼──────────────┼──────────────┤
│ Local        │ cualquiera      │ No           │ -            │
│ Development  │ develop         │ Sí           │ -            │
│ Staging      │ develop         │ Sí           │ PR aprobado  │
│ Production   │ main            │ No (manual)  │ Tag + Review │
└──────────────┴─────────────────┴──────────────┴──────────────┘
```

### Variables de Entorno por Ambiente

```bash
# .env.local
NODE_ENV=development
DATABASE_URL=postgresql://pedidos:dev@localhost:5432/pedidos
REDIS_URL=redis://localhost:6379

# .env.staging
NODE_ENV=staging
DATABASE_URL=postgresql://pedidos:staging@db.staging.internal:5432/pedidos
REDIS_URL=redis://redis.staging.internal:6379

# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://pedidos:prod@db.prod.internal:5432/pedidos
REDIS_URL=redis://redis.prod.internal:6379
```

---

## Deployment Local

### Requisitos

- Docker 24+
- Docker Compose 2.20+
- Node.js 20+ (para desarrollo)
- Make

### Paso a Paso

```bash
# 1. Clonar repositorio
git clone https://github.com/org/sistema_pedidos.git
cd sistema_pedidos

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Iniciar infraestructura
make up

# 4. Ejecutar migraciones
make migrate

# 5. Seed de datos (opcional)
make seed

# 6. Verificar health
make health-check

# 7. Acceder a la aplicación
open http://localhost:3000
```

### Desarrollo con Hot Reload

```bash
# Backend (NestJS)
cd backend
npm install
npm run dev  # Puerto 3000

# Frontend (Next.js)
cd frontend
npm install
npm run dev  # Puerto 3001
```

---

## Deployment a Staging

### Via GitHub Actions (Automático)

El deployment a staging ocurre automáticamente al mergear a `develop`:

```bash
# 1. Crear feature branch
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar y commitear
git add .
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad

# 3. Crear Pull Request
gh pr create --base develop --title "Nueva funcionalidad"

# 4. Esperar aprobación y CI
# GitHub Actions ejecutará:
# - Linting
# - Tests unitarios
# - Tests E2E
# - Build

# 5. Mergear PR
gh pr merge --squash

# 6. Deployment automático a staging
# GitHub Actions ejecutará workflow de deployment
```

### Manual (Emergencia)

```bash
# 1. Conectar a servidor staging
ssh deploy@staging.pedidos.com

# 2. Ir al directorio de la app
cd /app/sistema_pedidos

# 3. Hacer pull de develop
git checkout develop
git pull origin develop

# 4. Rebuild y reiniciar
docker-compose build
docker-compose up -d

# 5. Ejecutar migraciones
docker-compose exec api npm run migrate:deploy

# 6. Verificar health
curl http://localhost:3000/health

# 7. Ver logs
docker-compose logs -f api
```

---

## Deployment a Producción

### Preparación

```bash
# 1. Asegurar que staging está estable
# Verificar en Grafana que no hay errores

# 2. Crear release branch
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 3. Actualizar versión
npm version 1.2.0

# 4. Push release branch
git push origin release/v1.2.0

# 5. Crear Release PR
gh pr create --base main --title "Release v1.2.0"
```

### Deployment (Manual con Aprobación)

```bash
# 1. Mergear release PR a main
# Requiere aprobación de 2 reviewers

# 2. Crear tag
git checkout main
git pull origin main
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0

# 3. Triggear deployment manual
# GitHub Actions > Workflow "Deploy to Production" > Run workflow
# Seleccionar tag: v1.2.0

# 4. Monitorear deployment
# Ver progreso en GitHub Actions
# Verificar métricas en Grafana
```

### Post-Deployment

```bash
# 1. Verificar health endpoints
curl https://api.pedidos.com/health

# 2. Smoke tests
curl https://api.pedidos.com/api/products?tenantId=demo
curl https://api.pedidos.com/api/orders?tenantId=demo

# 3. Verificar métricas en Grafana
# - Error rate < 1%
# - P95 latency < 500ms
# - No increase in error logs

# 4. Monitorear por 30 minutos
# Verificar dashboards cada 5 minutos
# Revisar Slack #alerts

# 5. Comunicar deployment exitoso
# Slack #deployments: "✅ v1.2.0 deployed to production"
```

---

## CI/CD Pipeline

### GitHub Actions Workflows

#### 1. CI Pipeline (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint

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
        image: postgres:16-alpine
        env:
          POSTGRES_DB: pedidos_test
          POSTGRES_USER: pedidos
          POSTGRES_PASSWORD: test
      redis:
        image: redis:7-alpine
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:e2e

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: false
          tags: pedidos-api:test
```

#### 2. Deploy to Staging (`.github/workflows/deploy-staging.yml`)

```yaml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -t pedidos-api:${{ github.sha }} .

      - name: Push to Registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker tag pedidos-api:${{ github.sha }} registry.example.com/pedidos-api:staging
          docker push registry.example.com/pedidos-api:staging

      - name: Deploy to Staging
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: deploy
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /app/sistema_pedidos
            docker-compose pull
            docker-compose up -d
            docker-compose exec -T api npm run migrate:deploy

      - name: Health Check
        run: |
          sleep 10
          curl -f https://staging.pedidos.com/health || exit 1

      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Staging deployment ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

#### 3. Deploy to Production (`.github/workflows/deploy-production.yml`)

```yaml
name: Deploy to Production

on:
  workflow_dispatch:
    inputs:
      tag:
        description: 'Tag to deploy (e.g., v1.2.0)'
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://api.pedidos.com
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.inputs.tag }}

      - name: Build Docker image
        run: docker build -t pedidos-api:${{ github.event.inputs.tag }} .

      - name: Push to Registry
        run: |
          docker tag pedidos-api:${{ github.event.inputs.tag }} registry.example.com/pedidos-api:${{ github.event.inputs.tag }}
          docker tag pedidos-api:${{ github.event.inputs.tag }} registry.example.com/pedidos-api:latest
          docker push registry.example.com/pedidos-api:${{ github.event.inputs.tag }}
          docker push registry.example.com/pedidos-api:latest

      - name: Deploy to Production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PROD_HOST }}
          username: deploy
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /app/sistema_pedidos
            docker-compose pull
            docker-compose up -d --no-deps api
            docker-compose exec -T api npm run migrate:deploy

      - name: Smoke Tests
        run: |
          sleep 30
          curl -f https://api.pedidos.com/health
          curl -f https://api.pedidos.com/api/products?tenantId=demo

      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment ${{ github.event.inputs.tag }} ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Rollback

### Rollback Rápido (Docker)

```bash
# 1. Conectar a servidor
ssh deploy@production.pedidos.com

# 2. Ver versiones disponibles
docker images | grep pedidos-api

# 3. Actualizar docker-compose.yml con versión anterior
sed -i 's/pedidos-api:v1.2.0/pedidos-api:v1.1.0/' docker-compose.yml

# 4. Restart con versión anterior
docker-compose up -d --no-deps api

# 5. Verificar
curl https://api.pedidos.com/health

# 6. Si hay migraciones, rollback DB
docker-compose exec -T postgres psql -U pedidos pedidos < backups/pre_v1.2.0.sql
```

### Rollback via GitHub Actions

```bash
# 1. Triggear workflow de deployment con tag anterior
gh workflow run deploy-production.yml -f tag=v1.1.0

# 2. Monitorear deployment
gh run list --workflow=deploy-production.yml --limit=1

# 3. Ver logs
gh run view --log

# 4. Verificar
curl https://api.pedidos.com/health
```

### Rollback de Migraciones

```bash
# 1. Identificar última migración aplicada
docker-compose exec postgres psql -U pedidos -c "SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5;"

# 2. Rollback específico
npx prisma migrate resolve --rolled-back 20251107_add_new_table

# 3. Restaurar desde backup
docker-compose exec -T postgres psql -U pedidos pedidos < backups/pre_migration.sql

# 4. Verificar integridad
docker-compose exec api npm run prisma:validate
```

---

## Checklist Pre-Deploy

### Staging

- [ ] Todos los tests pasando (CI verde)
- [ ] PR aprobado por al menos 1 reviewer
- [ ] Cambios en CHANGELOG.md
- [ ] Migraciones de DB testeadas localmente
- [ ] Variables de entorno actualizadas

### Production

- [ ] Staging estable por al menos 24 horas
- [ ] Todas las features testeadas en staging
- [ ] PR aprobado por 2+ reviewers
- [ ] Release notes documentadas
- [ ] Backup de DB tomado (automático pre-deploy)
- [ ] Migraciones backwards-compatible
- [ ] Rollback plan documentado
- [ ] Equipo on-call notificado
- [ ] Deployment durante horario de bajo tráfico
- [ ] Monitoreo configurado

### Post-Deploy

- [ ] Health endpoints respondiendo
- [ ] Smoke tests pasando
- [ ] Error rate < 1%
- [ ] P95 latency < 500ms
- [ ] No hay errores en logs
- [ ] Métricas de negocio correctas
- [ ] Notificar en Slack #deployments

---

## Deployment Strategies

### Blue-Green Deployment

```yaml
# docker-compose.blue-green.yml
services:
  api-blue:
    image: pedidos-api:v1.1.0
    environment:
      - COLOR=blue

  api-green:
    image: pedidos-api:v1.2.0
    environment:
      - COLOR=green

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - api-blue
      - api-green
```

```nginx
# nginx.conf - Switch de blue a green
upstream backend {
  server api-green:3000;  # Cambiar a api-blue para rollback
}
```

### Canary Deployment

```nginx
# nginx.conf - 10% de tráfico a nueva versión
upstream backend {
  server api-v1.1.0:3000 weight=9;
  server api-v1.2.0:3000 weight=1;
}
```

---

## Troubleshooting Deployment

### Deploy Falla en Health Check

```bash
# 1. Ver logs del contenedor
docker-compose logs api --tail=100

# 2. Verificar migraciones
docker-compose exec api npm run prisma:migrate:status

# 3. Verificar conectividad a DB
docker-compose exec api npm run db:ping

# 4. Rollback si es crítico
docker-compose down
docker-compose up -d  # Con versión anterior
```

### Migraciones Fallan

```bash
# 1. Ver error específico
docker-compose logs api | grep "migrate"

# 2. Verificar estado de migraciones
docker-compose exec postgres psql -U pedidos -c "SELECT * FROM _prisma_migrations;"

# 3. Resolver manualmente si es safe
docker-compose exec api npx prisma migrate resolve --applied <migration_name>

# 4. O rollback completo
docker-compose exec -T postgres psql -U pedidos pedidos < backups/pre_deploy.sql
```

---

## Changelog

### v1.0 - 2025-11-07 19:30
- Guía de deployment inicial
- Workflows de CI/CD con GitHub Actions
- Procedimientos de rollback
- Checklists pre/post deploy
