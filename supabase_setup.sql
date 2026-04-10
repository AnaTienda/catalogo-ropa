-- ═══════════════════════════════════════════════════════════════
-- SETUP SUPABASE — Catálogo de Ropa
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════

-- 1. Crear tabla con columnas correctas
CREATE TABLE IF NOT EXISTS products (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code       TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  price      NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_card NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url  TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 3. Policy permisiva (sin autenticación requerida)
--    Si querés agregar autenticación después, cambiá USING (true)
DROP POLICY IF EXISTS "Allow all" ON products;
CREATE POLICY "Allow all"
  ON products
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Habilitar Realtime (para sincronización entre dispositivos)
ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- Verificar que todo quedó bien:
SELECT 'Setup completado ✓' AS status;
