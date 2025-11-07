# Workflow E04: Multi-Tenancy

**Duración**: 24h | **Prioridad**: P0

## Objetivo
Implementar aislamiento multi-tenant con tenantId en todas las tablas y guards de seguridad.

## Prerequisitos
- E03 completado
- Auth funcionando

## Documentación a Revisar
- `docs/architecture/data-model.md` (modelo Tenant)
- `docs/decisions/004-multi-tenancy-approach.md`
- `docs/architecture/backend.md` (sección Multi-Tenancy)

## Pasos

1. **Crear schema de Tenant**
   - Modelo Tenant en Prisma
   - Migración
   - Relación con User

2. **Implementar middleware de tenant**
   - TenantMiddleware para extraer tenantId
   - Decorator @TenantId()
   - Guard para validar acceso

3. **Configurar Row Level Security (RLS)**
   - Políticas en PostgreSQL
   - Prisma middleware para auto-filtrado

4. **Actualizar módulos existentes**
   - Agregar tenantId a User
   - Modificar auth para incluir tenant en JWT

5. **Testing de aislamiento**
   - Tests que validan que un tenant no puede acceder a datos de otro
   - Tests de RLS

## Validación

- [ ] Modelo Tenant creado
- [ ] Migración ejecutada
- [ ] Middleware extrae tenantId del header/JWT
- [ ] @TenantId() decorator funciona
- [ ] RLS configurado en PostgreSQL
- [ ] Tests de aislamiento pasan
- [ ] Usuario de tenant A no puede ver datos de tenant B
- [ ] Prisma middleware filtra automáticamente por tenantId

## Prompt para IA

```
Ejecuta el workflow E04-multi-tenancy siguiendo docs/workflows/E04-multi-tenancy.md

Lee primero:
- docs/decisions/004-multi-tenancy-approach.md (decisión arquitectónica)
- docs/architecture/data-model.md (schema Tenant)
- docs/architecture/backend.md (patrones multi-tenant)

Implementa:
1. Schema Tenant y relaciones
2. Middleware y guards de tenant
3. Row Level Security en PostgreSQL
4. Prisma middleware para auto-filtrado
5. Tests de aislamiento

CRÍTICO: Asegurar que ningún query permita ver datos de otros tenants.
```

## Siguiente
`E05-products-categories.md`
