# Workflow E01: Setup Completo

**Duración**: 20h | **Prioridad**: P0

## Objetivo
Configurar infraestructura completa del proyecto: repositorio GitHub, Docker Compose, Makefile, y CI básico.

## Prerequisitos
- Docker 24+ instalado
- Node.js 20+ instalado
- Git configurado
- Cuenta de GitHub

## Documentación a Revisar
- `docs/project_plan/project_plan.md` (sección Entregable 1)
- `docs/operations/deployment.md` (sección Deployment Local)
- `docs/instrucciones_generales.md` (sección Setup)

## Pasos

1. **Inicializar repositorio Git**
   - Crear repo en GitHub
   - Configurar branches (main, develop)
   - Setup branch protection

2. **Configurar Docker Compose**
   - PostgreSQL 16
   - Redis 7
   - PgAdmin
   - Redis Commander

3. **Crear Makefile**
   - Comandos: up, down, logs, migrate, test, etc.

4. **Setup GitHub Actions**
   - Workflow CI básico
   - Linting y tests

5. **Smoke tests de infraestructura**
   - Verificar todos los servicios

## Validación

- [ ] Repositorio creado en GitHub
- [ ] Branches main y develop existen
- [ ] Branch protection configurado
- [ ] `docker-compose up` inicia todos los servicios
- [ ] PostgreSQL responde (`make db-shell`)
- [ ] Redis responde (`make redis-cli`)
- [ ] PgAdmin accesible en http://localhost:5050
- [ ] Makefile tiene comandos básicos
- [ ] GitHub Actions workflow existe

## Prompt para IA

```
Ejecuta el workflow E01-setup-completo siguiendo docs/workflows/E01-setup-completo.md

Lee primero:
- docs/project_plan/project_plan.md (Entregable 1)
- docs/operations/deployment.md (sección Deployment Local)

Implementa:
1. Repositorio GitHub con branches
2. Docker Compose completo
3. Makefile con comandos
4. GitHub Actions CI básico

Valida que todos los servicios estén corriendo.
```

## Siguiente
`E02-estructura-backend.md`
