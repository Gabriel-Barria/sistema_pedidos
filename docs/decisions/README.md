# Architecture Decision Records (ADRs)

**Versión**: 1.0
**Última actualización**: 2025-11-07 19:50
**Estado**: Completo

---

## Qué son los ADRs

Los Architecture Decision Records (ADRs) documentan las decisiones arquitectónicas importantes tomadas durante el desarrollo del proyecto. Cada ADR captura:

- **Contexto**: Por qué necesitamos tomar esta decisión
- **Decisión**: Qué decidimos hacer
- **Consecuencias**: Qué implica esta decisión (pros y contras)
- **Estado**: Propuesta, Aceptada, Deprecada, Supersedida

---

## Índice de Decisiones

| # | Título | Estado | Fecha |
|---|--------|--------|-------|
| [001](./001-nestjs-framework.md) | Usar NestJS como Framework Backend | Aceptada | 2025-11-07 |
| [002](./002-nextjs-frontend.md) | Usar Next.js 14 para Frontend | Aceptada | 2025-11-07 |
| [003](./003-postgresql-database.md) | PostgreSQL como Base de Datos Principal | Aceptada | 2025-11-07 |
| [004](./004-multi-tenancy-approach.md) | Multi-Tenancy con Aislamiento Lógico | Aceptada | 2025-11-07 |
| [005](./005-event-driven-architecture.md) | Arquitectura Event-Driven con BullMQ | Aceptada | 2025-11-07 |
| [006](./006-jwt-authentication.md) | Autenticación con JWT RS256 | Aceptada | 2025-11-07 |
| [007](./007-redis-caching.md) | Redis para Caché y Sesiones | Aceptada | 2025-11-07 |
| [008](./008-monorepo-structure.md) | Monorepo con Backend y Frontend Separados | Aceptada | 2025-11-07 |

---

## Cómo Crear un ADR

### Template

```markdown
# [Número]. [Título de la Decisión]

**Fecha**: YYYY-MM-DD HH:MM
**Estado**: Propuesta | Aceptada | Deprecada | Supersedida por ADR-XXX
**Decisores**: [Nombres]
**Contexto Técnico**: Backend | Frontend | Infrastructure | Full Stack

---

## Contexto

[Describe el problema o situación que requiere una decisión]

## Opciones Consideradas

### Opción 1: [Nombre]
- **Pros**:
  - Pro 1
  - Pro 2
- **Contras**:
  - Contra 1
  - Contra 2

### Opción 2: [Nombre]
- **Pros**: ...
- **Contras**: ...

## Decisión

[La opción elegida y por qué]

## Consecuencias

### Positivas
- Consecuencia positiva 1
- Consecuencia positiva 2

### Negativas
- Consecuencia negativa 1
- Consecuencia negativa 2

### Riesgos
- Riesgo 1 y mitigación
- Riesgo 2 y mitigación

## Notas

[Información adicional, referencias, etc.]
```

---

## Proceso de ADR

1. **Identificar** una decisión arquitectónica significativa
2. **Investigar** opciones y trade-offs
3. **Documentar** usando el template
4. **Revisar** con el equipo técnico
5. **Aprobar** y marcar como "Aceptada"
6. **Comunicar** al equipo completo

---

## Criterios para Crear un ADR

Crea un ADR cuando:
- ✅ La decisión afecta la arquitectura del sistema
- ✅ Es costoso cambiar la decisión más adelante
- ✅ Afecta múltiples módulos o equipos
- ✅ Tiene trade-offs significativos
- ✅ El equipo futuro necesitará entender el "por qué"

No creas un ADR para:
- ❌ Decisiones de implementación triviales
- ❌ Preferencias de estilo de código
- ❌ Configuraciones temporales
- ❌ Decisiones fácilmente reversibles

---

## Referencias

- [ADR Template by Michael Nygard](https://github.com/joelparkerhenderson/architecture-decision-record)
- [When to Write ADRs](https://adr.github.io/)
