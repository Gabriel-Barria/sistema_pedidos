-- Crear dos tenants de prueba
INSERT INTO "tenants" ("id", "name", "slug", "active", "created_at", "updated_at")
VALUES
  ('tenant-restaurant-1', 'Restaurant La Buena Mesa', 'restaurant-1', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('tenant-cafe-2', 'Café Central', 'cafe-2', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (slug) DO NOTHING;

SELECT * FROM "tenants" ORDER BY "created_at";
