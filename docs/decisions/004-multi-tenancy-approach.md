# ADR 004: Multi-Tenancy con Aislamiento Lógico

**Fecha**: 2025-11-07 19:55
**Estado**: Aceptada
**Decisores**: Equipo Técnico
**Contexto Técnico**: Full Stack

---

## Contexto

El sistema debe soportar múltiples tenants (restaurantes, cafeterías, etc.) con sus propios datos, usuarios y configuraciones. Necesitamos decidir cómo implementar el aislamiento entre tenants.

**Requisitos**:
- Aislamiento completo de datos entre tenants
- Performance adecuada (queries rápidas)
- Costos operacionales razonables
- Facilidad de deployment
- Backup y recovery por tenant
- Escalabilidad horizontal

## Opciones Consideradas

### Opción 1: Database por Tenant (Physical Isolation)
- **Pros**:
  - Aislamiento total garantizado
  - Fácil hacer backup/restore por tenant
  - Regulaciones de datos más fáciles de cumplir
  - Performance predecible por tenant

- **Contras**:
  - Alto costo operacional (N databases)
  - Migraciones complejas (ejecutar en N databases)
  - Límite de escalabilidad (max connections)
  - No aprovecha connection pooling
  - Desperdicio de recursos (tenants pequeños)

### Opción 2: Schema por Tenant (Logical Isolation)
- **Pros**:
  - Mejor que databases separadas
  - Aislamiento a nivel de schema
  - Backup por schema posible

- **Contras**:
  - Aún requiere migrar N schemas
  - Límite de schemas en PostgreSQL
  - Connection management complejo
  - Overhead de switching context

### Opción 3: Tenant ID Column (Shared Database)
- **Pros**:
  - **Simple de implementar**
  - **Una sola migración para todos**
  - **Connection pooling eficiente**
  - **Costos bajos** (una DB para todos)
  - **Fácil agregar tenants** (solo INSERT)
  - Queries con indexes eficientes

- **Contras**:
  - Riesgo de data leakage (si falla el WHERE tenantId)
  - Backup por tenant requiere lógica custom
  - Tenant grande puede afectar a otros
  - Dificultad con regulaciones estrictas de datos

## Decisión

**Elegimos Opción 3: Aislamiento Lógico con `tenantId` column** en todas las tablas.

**Razones**:
1. **Simplicidad**: Una sola database, migraciones simples
2. **Costo-Efectividad**: Infraestructura compartida reduce costos
3. **Performance**: Indexes compuestos `(tenantId, ...)` son muy eficientes
4. **Escalabilidad**: Fácil escalar horizontalmente con read replicas
5. **Operaciones**: Deployment, monitoring, backups centralizados
6. **Flexibility**: Podemos migrar a DB separadas si un tenant crece mucho

## Consecuencias

### Positivas
- ✅ Setup inicial rápido y simple
- ✅ Migraciones ejecutadas una sola vez
- ✅ Connection pooling óptimo
- ✅ Métricas agregadas fáciles de generar
- ✅ Búsquedas cross-tenant posibles (analytics)
- ✅ Costos operacionales bajos

### Negativas
- ❌ Requiere disciplina estricta en queries (siempre filtrar por tenantId)
- ❌ Tests deben validar aislamiento
- ❌ Backup/restore por tenant requiere scripting
- ❌ Tenant malicioso puede afectar performance general

### Riesgos y Mitigaciones

**Riesgo**: Data leakage entre tenants
- **Mitigación**:
  - Guard global que inyecta tenantId automáticamente
  - Row Level Security (RLS) en PostgreSQL como failsafe
  - Tests que verifican aislamiento
  - Code review obligatorio en cambios de queries
  - Prisma middleware que valida tenantId en todos los queries

**Riesgo**: Performance degradada por tenant grande
- **Mitigación**:
  - Monitoring por tenant (queries lentas)
  - Índices compuestos optimizados
  - Opción de migrar tenant específico a DB dedicada
  - Rate limiting por tenant

**Riesgo**: Dificultad con compliance (GDPR, etc.)
- **Mitigación**:
  - Soft delete con flag `deletedAt`
  - Export de datos por tenant disponible via API
  - Audit logs completos por tenant
  - Documentación de retention policies

## Implementación

### Prisma Middleware

```typescript
prisma.$use(async (params, next) => {
  const tenantId = getTenantIdFromContext();

  if (params.model && !['Tenant'].includes(params.model)) {
    if (params.action === 'findMany' || params.action === 'findFirst') {
      params.args.where = {
        ...params.args.where,
        tenantId,
      };
    }
  }

  return next(params);
});
```

### Row Level Security (Failsafe)

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON orders
  USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

### Tests de Aislamiento

```typescript
it('should not access other tenant data', async () => {
  const tenant1Order = await createOrder('tenant-1');
  const tenant2Orders = await ordersService.findAll('tenant-2');

  expect(tenant2Orders).not.toContainEqual(tenant1Order);
});
```

## Notas

- Consideramos Row Level Security de PostgreSQL como capa adicional de seguridad
- Si un tenant supera 1M de órdenes, evaluar migración a DB dedicada
- Schema permite futuro sharding horizontal por tenant
- Todos los queries deben tener index en `(tenantId, ...)`

## Referencias

- [Multi-Tenancy Patterns](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/considerations/tenancy-models)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Prisma Multi-Tenancy Guide](https://www.prisma.io/docs/guides/database/multi-tenancy)
