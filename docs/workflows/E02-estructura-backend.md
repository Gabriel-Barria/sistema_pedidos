# Workflow E02: Estructura Backend Base

**Duración**: 20h | **Prioridad**: P0

## Objetivo
Crear la estructura base del backend con NestJS, Prisma, y configuración de testing.

## Prerequisitos
- E01 completado
- Docker corriendo

## Documentación a Revisar
- `docs/architecture/backend.md` (secciones: Estructura, Módulos)
- `docs/project_plan/project_plan.md` (Entregable 2)
- `docs/testing/strategy.md` (sección Setup)
- `docs/instrucciones_generales.md` (Convenciones de código)

## Pasos

1. **Inicializar proyecto NestJS**
   - Setup con CLI de Nest
   - Configurar TypeScript strict mode

2. **Configurar Prisma**
   - Inicializar Prisma
   - Configurar conexión a PostgreSQL
   - Setup PrismaService

3. **Crear estructura modular**
   - Carpeta `src/shared/` (config, database, utils)
   - Carpeta `src/core/` (guards, interceptors, filters)
   - Setup para módulos de dominio

4. **Configurar herramientas de calidad**
   - ESLint con reglas del proyecto
   - Prettier
   - Husky (pre-commit hooks)

5. **Setup testing**
   - Jest configurado
   - Supertest para E2E
   - Scripts de test en package.json

## Validación

- [ ] `npm run start:dev` inicia la aplicación
- [ ] Aplicación responde en http://localhost:3000
- [ ] Prisma conecta a PostgreSQL
- [ ] `npm run lint` pasa sin errores
- [ ] `npm run test` ejecuta tests
- [ ] `npm run test:e2e` ejecuta tests E2E
- [ ] Estructura de carpetas según backend.md
- [ ] Health endpoint responde (`GET /health`)

## Prompt para IA

```
Ejecuta el workflow E02-estructura-backend siguiendo docs/workflows/E02-estructura-backend.md

Lee primero:
- docs/architecture/backend.md (estructura y patrones)
- docs/testing/strategy.md (configuración de tests)

Implementa:
1. Proyecto NestJS con estructura modular
2. Prisma configurado y conectado
3. ESLint, Prettier, Husky
4. Testing setup completo
5. Health endpoint básico

Valida que todo compile y los tests corran.
```

## Siguiente
`E03-auth-users.md`
