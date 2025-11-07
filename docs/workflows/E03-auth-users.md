# Workflow E03: Auth & Users

**Duración**: 28h | **Prioridad**: P0

## Objetivo
Implementar sistema completo de autenticación JWT con usuarios, roles y refresh tokens.

## Prerequisitos
- E01, E02 completados
- PostgreSQL y Redis corriendo

## Documentación a Revisar
- `docs/architecture/backend.md` (sección Auth)
- `docs/architecture/data-model.md` (modelos User, RefreshToken)
- `docs/decisions/006-jwt-authentication.md`
- `docs/architecture/diagrams/sequence-diagrams.md` (Flujo de Autenticación JWT)

## Pasos

1. **Crear schema Prisma**
   - Modelos: User, RefreshToken
   - Enum de Roles
   - Ejecutar migración

2. **Implementar módulo Auth**
   - AuthService (login, register, refresh)
   - JWT con RS256
   - Passport strategies (local, jwt)
   - Guards (AuthGuard, RolesGuard)

3. **Implementar módulo Users**
   - UsersService
   - UsersRepository
   - Endpoints CRUD básicos

4. **Seguridad**
   - Hash de passwords con bcrypt
   - Validación de DTOs
   - Rate limiting

5. **Testing**
   - Unit tests de servicios
   - Integration tests de endpoints
   - Tests de guards

## Validación

- [ ] Migración ejecutada sin errores
- [ ] `POST /auth/register` crea usuario
- [ ] `POST /auth/login` retorna access + refresh tokens
- [ ] `POST /auth/refresh` retorna nuevo access token
- [ ] `GET /auth/profile` retorna datos del usuario autenticado
- [ ] Guards protegen endpoints privados
- [ ] Passwords hasheados en DB
- [ ] Tests pasan con cobertura >80%

## Prompt para IA

```
Ejecuta el workflow E03-auth-users siguiendo docs/workflows/E03-auth-users.md

Lee primero:
- docs/architecture/backend.md (patrones de auth)
- docs/architecture/data-model.md (schema User)
- docs/architecture/diagrams/sequence-diagrams.md (flujo JWT)
- docs/decisions/006-jwt-authentication.md

Implementa:
1. Schema Prisma para User y RefreshToken
2. Módulo Auth con JWT RS256
3. Passport strategies
4. Guards y decorators
5. Tests completos

Sigue los patrones de backend.md para Repository/Service/Controller.
```

## Siguiente
`E04-multi-tenancy.md`
