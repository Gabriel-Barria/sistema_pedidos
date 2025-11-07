# Workflow E05: Products & Categories

**Duración**: 28h | **Prioridad**: P1

## Objetivo
Implementar catálogo de productos con categorías, variantes, addons y caché con Redis.

## Prerequisitos
- E04 completado
- Multi-tenancy funcionando

## Documentación a Revisar
- `docs/architecture/data-model.md` (modelos Product, Category, Variant, Addon)
- `docs/architecture/backend.md` (sección Catalog, Caching)
- `docs/architecture/diagrams/sequence-diagrams.md` (Flujo de Cache con Redis)

## Pasos

1. **Crear schemas Prisma**
   - Product, Category, ProductCategory
   - Variant, Addon
   - Migración

2. **Implementar módulo Products**
   - CRUD completo
   - Búsqueda y filtrado
   - Paginación
   - Soft delete

3. **Implementar módulo Categories**
   - CRUD básico
   - Relación many-to-many con Products

4. **Configurar caché con Redis**
   - CacheInterceptor
   - Cache de listados de productos
   - Invalidación al crear/actualizar/eliminar

5. **Testing**
   - Tests de CRUD
   - Tests de cache (hit/miss)
   - Tests de búsqueda

## Validación

- [ ] Migraciones ejecutadas
- [ ] CRUD de productos funciona
- [ ] CRUD de categorías funciona
- [ ] Variantes y addons se pueden agregar a productos
- [ ] Búsqueda por nombre funciona
- [ ] Filtrado por categoría funciona
- [ ] Cache funciona (segundo request más rápido)
- [ ] Cache se invalida al actualizar producto
- [ ] Tests pasan con cobertura >80%
- [ ] Multi-tenancy aísla productos por tenant

## Prompt para IA

```
Ejecuta el workflow E05-products-categories siguiendo docs/workflows/E05-products-categories.md

Lee primero:
- docs/architecture/data-model.md (schema completo de catalog)
- docs/architecture/backend.md (sección Catalog y Caching)
- docs/architecture/diagrams/sequence-diagrams.md (cache flow)

Implementa:
1. Schemas de Product, Category, Variant, Addon
2. CRUD completo con Repository pattern
3. Búsqueda y filtrado
4. Cache con Redis y CacheInterceptor
5. Tests completos

Usa los ejemplos de código en backend.md.
```

## Siguiente
`E07-orders.md`
