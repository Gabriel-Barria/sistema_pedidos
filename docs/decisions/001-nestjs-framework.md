# ADR 001: Usar NestJS como Framework Backend

**Fecha**: 2025-11-07 19:50
**Estado**: Aceptada
**Decisores**: Equipo Técnico
**Contexto Técnico**: Backend

---

## Contexto

Necesitamos seleccionar un framework backend para construir una API REST escalable, mantenible y bien estructurada para un sistema multi-tenant de pedidos.

**Requisitos**:
- TypeScript nativo
- Arquitectura modular
- Soporte para DDD (Domain-Driven Design)
- Ecosistema maduro
- Buena documentación
- Soporte para testing
- Performance adecuada

## Opciones Consideradas

### Opción 1: NestJS
- **Pros**:
  - TypeScript first-class citizen
  - Arquitectura modular inspirada en Angular
  - Decorators para metadata (controllers, services, guards)
  - Inyección de dependencias nativa
  - Excelente documentación
  - CLI poderosa
  - Soporte nativo para: Prisma, GraphQL, WebSockets, Microservices
  - Testing utilities incluidas (Jest + Supertest)
  - Comunidad activa y creciente

- **Contras**:
  - Curva de aprendizaje si no conoces decorators
  - Más "opinionated" que Express
  - Overhead mínimo vs Express puro

### Opción 2: Express.js (puro)
- **Pros**:
  - Minimalista y flexible
  - Ecosistema gigante
  - Performance excelente
  - Curva de aprendizaje baja

- **Contras**:
  - Requiere configurar todo manualmente
  - No hay estructura estándar
  - TypeScript requiere setup manual
  - Sin DI nativa
  - Difícil mantener consistencia en equipos grandes

### Opción 3: Fastify
- **Pros**:
  - Performance superior a Express
  - TypeScript support
  - Schema validation nativa (JSON Schema)
  - Plugins ecosystem

- **Contras**:
  - Ecosistema más pequeño que Express
  - Menos recursos de aprendizaje
  - No tiene DI nativa
  - Requiere más boilerplate para arquitectura

## Decisión

**Elegimos NestJS** como framework backend.

**Razones**:
1. **TypeScript Nativo**: Sin configuración adicional, todo es TypeScript
2. **Arquitectura Escalable**: Los módulos facilitan DDD y separación de responsabilidades
3. **DI (Dependency Injection)**: Facilita testing y desacoplamiento
4. **Ecosistema**: Integraciones oficiales con Prisma, BullMQ, Passport, etc.
5. **Mantenibilidad**: Estructura consistente facilita onboarding de nuevos devs
6. **Testing**: Utilities incluidas simplifican unit e integration tests

## Consecuencias

### Positivas
- ✅ Código bien organizado desde el principio
- ✅ Testing más fácil gracias a DI
- ✅ Refactoring seguro con TypeScript estricto
- ✅ Documentación automática con Swagger decorators
- ✅ Menos decisiones de arquitectura que tomar (ya hay convenciones)
- ✅ Hot reload en desarrollo con CLI

### Negativas
- ❌ Curva de aprendizaje inicial para el equipo
- ❌ Bundle size ligeramente mayor que Express puro
- ❌ Más "magic" con decorators (puede confundir al inicio)

### Riesgos y Mitigaciones

**Riesgo**: Equipo no familiarizado con decorators de TypeScript
- **Mitigación**: Workshop interno de 2 días sobre NestJS + documentación interna

**Riesgo**: Dependencia fuerte del framework
- **Mitigación**:
  - Lógica de negocio en services puros (sin dependencias de Nest)
  - Repositories implementan interfaces agnósticas
  - DTOs son clases TypeScript simples

**Riesgo**: Performance overhead vs Express
- **Mitigación**:
  - Benchmarks muestran diferencia <5% en la mayoría de casos
  - Caching con Redis compensa cualquier overhead
  - Ganancia en developer experience vale el trade-off

## Notas

- NestJS está basado en Express por defecto (puede cambiar a Fastify si es necesario)
- Versión a usar: NestJS 10.x (última estable)
- Seguir guías oficiales de best practices: https://docs.nestjs.com/
- Ejemplos de proyectos enterprise con NestJS: Valor, Trilon.io

## Referencias

- [NestJS Documentation](https://docs.nestjs.com/)
- [NestJS Best Practices](https://github.com/nestjs/nest/tree/master/sample)
- [Performance Comparison](https://github.com/nestjs/nest/issues/2249)
