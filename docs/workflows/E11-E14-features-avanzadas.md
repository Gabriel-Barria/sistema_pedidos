# Workflow E11-E14: Features Avanzadas Backend

**Duración**: 92h (E11: 28h, E13: 32h, E14: 32h) | **Prioridad**: P2

## Objetivo
Implementar features avanzadas: reporting completo, admin panel, búsqueda full-text y recomendaciones.

## Prerequisitos
- E09 completado (Analytics base)
- E12 completado (WebSockets)
- Todos los módulos core funcionando

## Documentación a Revisar
- `docs/architecture/backend.md` (secciones Reporting, Admin, Search, Recommendations)
- `docs/architecture/data-model.md` (modelos relevantes)
- `docs/decisions/008-search-strategy.md` (si existe)

## Entregables Incluidos

### E11: Reporting Avanzado (28h)
Reportes complejos, exportación PDF/Excel, scheduling.

### E13: Admin Panel API (32h)
Endpoints administrativos para gestión completa.

### E14: Search & Recommendations (32h)
Búsqueda full-text con PostgreSQL, sistema de recomendaciones.

## Pasos

### Parte 1: Reporting Avanzado (E11)

1. **Implementar reportes complejos**
   - Ventas detalladas con filtros avanzados
   - Análisis de cohortes
   - Forecasting simple

2. **Exportación de reportes**
   - PDF con PDFKit
   - Excel con ExcelJS
   - CSV

3. **Scheduling de reportes**
   - BullMQ para reportes programados
   - Email de reportes automáticos

### Parte 2: Admin Panel API (E13)

4. **Implementar Admin Guards**
   - AdminGuard (role-based)
   - Audit logging de acciones admin

5. **Endpoints administrativos**
   - Gestión de usuarios
   - Gestión de tenants
   - Configuración global
   - Métricas del sistema

6. **Dashboard de administración**
   - Estadísticas generales
   - Salud del sistema
   - Logs y auditoría

### Parte 3: Search & Recommendations (E14)

7. **Implementar búsqueda full-text**
   - PostgreSQL Full-Text Search
   - Índices GIN/GiST
   - Ranking de resultados

8. **Sistema de recomendaciones**
   - Collaborative filtering simple
   - Productos relacionados
   - Basado en historial de compras

9. **Cache de búsquedas y recomendaciones**
   - Redis para queries frecuentes
   - Invalidación inteligente

## Validación

### Reporting (E11)
- [ ] Reportes complejos funcionan con filtros
- [ ] Exportación a PDF funciona
- [ ] Exportación a Excel funciona
- [ ] Reportes programados se envían por email
- [ ] Tests de reportes pasan

### Admin Panel (E13)
- [ ] AdminGuard protege endpoints
- [ ] Gestión de usuarios funciona
- [ ] Gestión de tenants funciona
- [ ] Audit logging registra acciones
- [ ] Dashboard de admin muestra métricas
- [ ] Tests de admin pasan

### Search & Recommendations (E14)
- [ ] Búsqueda full-text retorna resultados relevantes
- [ ] Ranking funciona correctamente
- [ ] Recomendaciones basadas en historial funcionan
- [ ] Productos relacionados funcionan
- [ ] Cache de búsquedas mejora performance
- [ ] Tests de search y recommendations pasan
- [ ] Multi-tenancy aísla búsquedas

## Prompt para IA

```
Ejecuta el workflow E11-E14-features-avanzadas siguiendo docs/workflows/E11-E14-features-avanzadas.md

Lee primero:
- docs/architecture/backend.md (secciones Reporting, Admin, Search, Recommendations)
- docs/architecture/data-model.md

Implementa en orden:
1. E11: Reporting avanzado (exportación PDF/Excel, scheduling)
2. E13: Admin Panel API (guards, endpoints admin, audit)
3. E14: Search full-text y Recommendations (PostgreSQL FTS, collaborative filtering)

Usa los patrones establecidos en módulos existentes.
```

## Siguiente
`E15-frontend-base.md` (ya creado individualmente)
