# Documentación del Sistema Integral de Pedidos Multirubro

**Versión**: 1.0
**Última actualización**: 2025-11-07 19:02
**Estado**: En Desarrollo

---

## Índice Maestro

Esta documentación está organizada en secciones temáticas. A continuación se presenta el flujo de lectura recomendado según tu rol:

### Para Stakeholders y Product Owners
1. [`alcance/alcance.md`](alcance/alcance.md) - Visión general del proyecto
2. [`prd/prd_sistema_integral_pedidos_20251107.md`](prd/prd_sistema_integral_pedidos_20251107.md) - Especificación técnica completa

### Para Project Managers
1. [`pep/plan_ejecucion_proyecto.md`](pep/plan_ejecucion_proyecto.md) - Plan de ejecución con WBS y cronograma
2. [`project_plan/project_plan.md`](project_plan/project_plan.md) - Plan de trabajo operativo con entregables

### Para Desarrolladores
1. **Primeros Pasos**:
   - [`workflows/E01-setup-completo.md`](workflows/E01-setup-completo.md) - Iniciar proyecto desde cero
   - [`architecture/overview.md`](architecture/overview.md) - Arquitectura general
2. **Workflows de Implementación** (ver sección [Workflows](#workflows) abajo)
3. **Arquitectura Técnica**:
   - [`architecture/backend.md`](architecture/backend.md) - Estructura y patrones del backend
   - [`architecture/frontend.md`](architecture/frontend.md) - Estructura del frontend
   - [`architecture/data-model.md`](architecture/data-model.md) - Modelo de datos
   - [`architecture/events.md`](architecture/events.md) - Sistema de eventos
   - [`architecture/security-observability.md`](architecture/security-observability.md) - Seguridad y monitoreo
   - [`architecture/metrics.md`](architecture/metrics.md) - Métricas y alertas

### Para DevOps y SRE
1. [`operations/runbook.md`](operations/runbook.md) - Procedimientos operacionales
2. [`operations/deployment.md`](operations/deployment.md) - Guía de despliegue
3. [`architecture/metrics.md`](architecture/metrics.md) - Observabilidad

### Para QA
1. [`testing/strategy.md`](testing/strategy.md) - Estrategia de testing
2. [`testing/test-cases.md`](testing/test-cases.md) - Casos de prueba

---

## Estructura de la Documentación

```
docs/
├── README.md                          # Este archivo - Índice maestro
├── instrucciones_generales.md         # Guía para contribuidores
├── glossary.md                        # Glosario de términos técnicos
├── alcance/
│   └── alcance.md                     # Documento inicial de alcance
├── prd/
│   └── prd_sistema_integral_pedidos_20251107.md  # PRD completo (documento rector)
├── pep/
│   └── plan_ejecucion_proyecto.md     # Plan de ejecución del proyecto
├── project_plan/
│   └── project_plan.md                # Plan de trabajo operativo
├── workflows/                         # 🆕 Flujos de trabajo por entregable
│   ├── E01-setup-completo.md          # Workflows individuales (críticos)
│   ├── E02-estructura-backend.md
│   ├── E03-auth-users.md
│   ├── E04-multi-tenancy.md
│   ├── E05-products-categories.md
│   ├── E07-orders.md
│   ├── E08-payments.md
│   ├── E10-notifications.md
│   ├── E12-websockets.md
│   ├── E15-frontend-base.md
│   ├── E06-E09-cart-analytics.md      # Workflows agrupados
│   ├── E11-E14-features-avanzadas.md
│   ├── E16-E21-frontend-features.md
│   └── E22-E26-devops-qa.md
├── architecture/
│   ├── overview.md                    # Visión general de arquitectura
│   ├── backend.md                     # Arquitectura backend
│   ├── frontend.md                    # Arquitectura frontend
│   ├── data-model.md                  # Modelo de datos
│   ├── events.md                      # Sistema de eventos
│   ├── security-observability.md      # Seguridad y observabilidad
│   └── metrics.md                     # Métricas y alertas
├── operations/
│   ├── runbook.md                     # Runbook operacional
│   └── deployment.md                  # Guía de despliegue
├── testing/
│   ├── strategy.md                    # Estrategia de testing
│   └── test-cases.md                  # Casos de prueba
├── decisions/
│   └── README.md                      # Registro de decisiones arquitectónicas (ADRs)
└── agents/
    └── code-architect.md              # Configuración de agentes
```

---

## Workflows

Los workflows son guías paso a paso para implementar cada entregable del proyecto. Cada workflow:
- Especifica qué documentación revisar antes de comenzar
- Lista prerequisitos y dependencias
- Define pasos de alto nivel
- Incluye checklist de validación
- Contiene prompt listo para IA

### Workflows Individuales (Entregables Críticos)

| Workflow | Duración | Prioridad | Descripción |
|----------|----------|-----------|-------------|
| [E01-setup-completo](workflows/E01-setup-completo.md) | 16h | P0 | Setup inicial: Git, Docker, CI/CD |
| [E02-estructura-backend](workflows/E02-estructura-backend.md) | 20h | P0 | NestJS + Prisma + Testing |
| [E03-auth-users](workflows/E03-auth-users.md) | 28h | P0 | JWT Auth + Users + Roles |
| [E04-multi-tenancy](workflows/E04-multi-tenancy.md) | 24h | P0 | Aislamiento multi-tenant |
| [E05-products-categories](workflows/E05-products-categories.md) | 28h | P1 | Catálogo + Variantes + Cache |
| [E07-orders](workflows/E07-orders.md) | 36h | P0 | Sistema de órdenes + FSM |
| [E08-payments](workflows/E08-payments.md) | 32h | P0 | MercadoPago + Stripe + Webhooks |
| [E10-notifications](workflows/E10-notifications.md) | 24h | P1 | FCM + Email + WebSocket |
| [E12-websockets](workflows/E12-websockets.md) | 20h | P1 | Socket.io + Real-time |
| [E15-frontend-base](workflows/E15-frontend-base.md) | 32h | P0 | Next.js 14 + Auth + API Client |

### Workflows Agrupados (Entregables Relacionados)

| Workflow | Entregables | Duración | Descripción |
|----------|-------------|----------|-------------|
| [E06-E09-cart-analytics](workflows/E06-E09-cart-analytics.md) | E06, E09 | 56h | Cart + Analytics/Reporting |
| [E11-E14-features-avanzadas](workflows/E11-E14-features-avanzadas.md) | E11, E13, E14 | 92h | Reporting + Admin + Search |
| [E16-E21-frontend-features](workflows/E16-E21-frontend-features.md) | E16-E21 | 152h | Todas las pantallas del frontend |
| [E22-E26-devops-qa](workflows/E22-E26-devops-qa.md) | E22-E26 | 132h | Testing E2E + Deploy a Prod |

### Cómo Usar los Workflows

**Para ejecutar manualmente**:
1. Lee el workflow correspondiente
2. Revisa la documentación listada en "Documentación a Revisar"
3. Sigue los pasos de alto nivel
4. Valida contra el checklist

**Para ejecución con IA**:
```bash
# Ejemplo: Ejecutar E01
Ejecuta el workflow E01-setup-completo siguiendo docs/workflows/E01-setup-completo.md
```

El prompt para IA está incluido en cada workflow.

---

## Convenciones de Documentación

### Formato de Fecha y Hora
Todos los documentos deben incluir timestamp en formato ISO completo:
- **Formato**: `YYYY-MM-DD HH:MM`
- **Ejemplo**: `2025-11-07 19:02`
- **Ubicación**: En el header del documento bajo "Última actualización"

### Metadatos de Documentos
Todos los documentos principales deben incluir:
```markdown
# Título del Documento

**Versión**: X.Y
**Generado/Última actualización**: YYYY-MM-DD HH:MM
**Autor**: [Nombre o equipo]
**Estado**: [Borrador | En Revisión | Aprobado | Obsoleto]
```

### Diagramas
Utilizamos Mermaid para todos los diagramas. Tipos principales:
- **flowchart**: Flujos de proceso
- **sequenceDiagram**: Interacciones entre componentes
- **erDiagram**: Modelo de datos
- **graph**: Dependencias y relaciones

### Referencias Cruzadas
Al referenciar otros documentos, usar rutas relativas:
```markdown
Ver [Arquitectura Backend](architecture/backend.md) para más detalles.
```

### Changelog
Todos los documentos deben incluir sección de changelog al final:
```markdown
## Changelog

### v1.1 - 2025-11-07 19:02
- Descripción de cambios

### v1.0 - 2025-11-01 10:00
- Versión inicial
```

---

## Estado de Documentos

| Documento | Estado | Última Actualización | Completitud |
|-----------|--------|---------------------|-------------|
| PRD | ✅ Completo | 2025-11-07 | 100% |
| PEP | ✅ Completo | 2025-11-07 | 100% |
| Alcance | ✅ Completo | 2025-11-07 | 100% |
| Project Plan | ✅ Completo | 2025-11-07 19:02 | 100% |
| **Workflows (14 archivos)** | ✅ **Completo** | **2025-11-07** | **100%** |
| Architecture Overview | ✅ Completo | 2025-11-07 | 80% |
| Backend Architecture | 🟡 En Progreso | 2025-11-07 19:02 | 65% |
| Frontend Architecture | 🟡 En Progreso | 2025-11-07 19:02 | 65% |
| Data Model | 🟡 En Progreso | 2025-11-07 19:02 | 70% |
| Events | 🟡 En Progreso | 2025-11-07 19:02 | 60% |
| Metrics | 🟡 En Progreso | 2025-11-07 19:02 | 60% |
| Runbook | 🟡 En Progreso | 2025-11-07 19:02 | 85% |
| Deployment | 🟡 En Progreso | 2025-11-07 19:02 | 85% |
| Testing Strategy | 🟡 En Progreso | 2025-11-07 19:02 | 80% |
| Glossary | 🟡 En Progreso | 2025-11-07 19:02 | 90% |

**Leyenda**:
- ✅ Completo: Documento listo para uso
- 🟡 En Progreso: Documento con contenido base, requiere expansión
- 🔴 Pendiente: Documento por crear

---

## Documentos Rectores

Los siguientes documentos tienen autoridad sobre decisiones técnicas y de producto:

1. **PRD v1.1** - Especificación técnica y funcional
2. **PEP v1.0** - Plan de ejecución y cronograma
3. **Project Plan v1.0** - Plan operativo con entregables
4. **ADRs** - Decisiones arquitectónicas registradas en `decisions/`

En caso de conflicto entre documentos, prevalece el orden anterior.

---

## Cómo Contribuir

Consulta [`instrucciones_generales.md`](instrucciones_generales.md) para:
- Estándares de escritura
- Proceso de revisión
- Plantillas de documentos
- Flujo de actualización
- Convenciones de commits

---

## Soporte

Para preguntas sobre la documentación:
- **Issues técnicos**: Ver `operations/runbook.md`
- **Cambios en alcance**: Contactar Product Owner
- **Decisiones arquitectónicas**: Revisar `decisions/` o consultar Tech Lead
- **Dudas de terminología**: Consultar `glossary.md`

---

## Principios de Desarrollo

Este proyecto sigue los siguientes principios desde el día 1:

### Docker First
- Todo el entorno de desarrollo corre en contenedores
- Reproducibilidad garantizada con `docker-compose up`
- Configuración por variables de entorno

### GitHub First
- Control de versiones desde el primer commit
- GitHub Flow: branches protegidos, PRs obligatorios
- CI/CD automatizado con GitHub Actions
- Secrets management en GitHub

### Test-Driven
- Tests antes o junto con el código
- >80% cobertura en módulos core
- CI falla si tests no pasan

### API First
- Backend completamente funcional antes de frontend
- Swagger/OpenAPI como contrato
- Versionado desde v1

### Documentación Continua
- Docs actualizados con cada entregable
- Formato estandarizado con fecha/hora

---

## Quick Links

### Desarrollo
- [Setup Inicial](../README.md#quick-start)
- [Comandos Make](../Makefile)
- [Variables de Entorno](../.env.example)

### Workflows
- [Workflows Completos](workflows/) - 14 guías paso a paso
- [Comenzar con E01](workflows/E01-setup-completo.md)

### Arquitectura
- [Decisiones Arquitectónicas](decisions/README.md)
- [Modelo de Datos](architecture/data-model.md)
- [Sistema de Eventos](architecture/events.md)

### Operaciones
- [Runbook](operations/runbook.md)
- [Despliegue](operations/deployment.md)
- [Métricas](architecture/metrics.md)

---

## Changelog

### v1.1 - 2025-11-07
- **Workflows completos**: 14 archivos de workflows creados
  - 10 workflows individuales para entregables críticos (E01-E15)
  - 4 workflows agrupados para entregables relacionados
- Cada workflow incluye: objetivo, prerequisitos, docs a revisar, pasos, validación y prompt para IA
- Actualizado README con sección de Workflows y Quick Links

### v1.0 - 2025-11-07 19:02
- Creación del índice maestro de documentación
- Estructura inicial de carpetas
- Definición de convenciones
- Formato estandarizado de fecha y hora (YYYY-MM-DD HH:MM)
- Principios Docker First y GitHub First
- Referencias a plan operativo completo
