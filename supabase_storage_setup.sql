-- ==========================================================================
-- SCRIPT DE CONFIGURACIÓN PARA SUPABASE STORAGE (VAPEX)
-- Ejecuta este script en el editor SQL de Supabase para configurar el Bucket
-- de almacenamiento de imágenes de productos y habilitar las políticas de seguridad.
-- ==========================================================================

-- 1. Crear el bucket 'products' si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Eliminar políticas existentes para evitar duplicados o conflictos
DROP POLICY IF EXISTS "Permitir acceso publico de lectura a imagenes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir subida de imagenes a usuarios autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir edicion/borrado de imagenes a usuarios autenticados" ON storage.objects;

-- 3. Crear Políticas de Seguridad en storage.objects para el bucket 'products'

-- Política A: Permitir lectura pública de las imágenes
CREATE POLICY "Permitir acceso publico de lectura a imagenes"
ON storage.objects
FOR SELECT
USING (bucket_id = 'products');

-- Política B: Permitir la subida de nuevas imágenes a usuarios autenticados
CREATE POLICY "Permitir subida de imagenes a usuarios autenticados"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- Política C: Permitir actualizar y eliminar imágenes solo a usuarios autenticados
CREATE POLICY "Permitir edicion/borrado de imagenes a usuarios autenticados"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');
