# 👔 Catálogo de Ropa — Profesional

Aplicación web completa tipo iOS/glassmorphism para gestionar catálogos de ropa con sincronización de imágenes en la nube.

---

## 🚀 Instalación y uso

```bash
# 1. Instalá las dependencias
npm install

# 2. Iniciá el servidor de desarrollo
npm run dev

# 3. Abrí en el navegador
# → http://localhost:5173
```

---

## ☁️ Configurar Cloudinary (imágenes en la nube)

Para que las imágenes se sincronicen entre dispositivos necesitás una cuenta Cloudinary gratuita.

### Paso a paso:

1. **Crear cuenta gratuita** en [cloudinary.com](https://cloudinary.com/) (no requiere tarjeta)

2. **Obtener tu Cloud Name** desde el Dashboard (ej: `mi-tienda`)

3. **Crear un Upload Preset unsigned:**
   - Settings → Upload → Upload presets → Add upload preset
   - Signing Mode: **Unsigned**
   - Guardar y copiar el nombre del preset (ej: `catalogo_preset`)

4. **Editar el archivo** `src/hooks/useProducts.js`:
   ```js
   const CLOUDINARY_CLOUD_NAME = 'mi-tienda'       // ← tu cloud name
   const CLOUDINARY_UPLOAD_PRESET = 'catalogo_preset' // ← tu preset
   ```

5. **¡Listo!** Las imágenes se subirán automáticamente en segundo plano.

> **Sin Cloudinary:** La app funciona igual usando solo localStorage para datos. Las imágenes solo estarán disponibles en el dispositivo donde se cargaron.

---

## ✨ Funcionalidades

| Feature | Descripción |
|---|---|
| 🏷️ Códigos únicos | Formato `PRD-0001`, incrementales y persistentes |
| 📸 Cámara integrada | Captura directa desde el navegador |
| 🖼️ Upload de archivos | Drag & drop o selección |
| ☁️ Sync en la nube | Imágenes en Cloudinary, accesibles desde cualquier dispositivo |
| 💳 Precio tarjeta | Calculado automáticamente (+20%) |
| 🔍 Búsqueda | Por nombre y por código |
| 📊 Ordenamiento | Por precio, nombre, código o fecha |
| 📱 Grid / Lista | Toggle entre vistas |
| 💾 Persistencia | Datos en localStorage |
| 🎨 Glassmorphism | UI premium estilo iOS |

---

## 🛠️ Stack tecnológico

- **React 18** + Hooks
- **Tailwind CSS v3** (glassmorphism customizado)
- **Vite** (build tool)
- **Lucide React** (iconografía)
- **Cloudinary** (almacenamiento de imágenes)
- **localStorage** (persistencia de datos)

---

## 📁 Estructura del proyecto

```
src/
├── hooks/
│   └── useProducts.js       # Lógica de productos + Cloudinary upload
├── components/
│   ├── CameraCapture.jsx    # Acceso a cámara del dispositivo
│   ├── ImageUploader.jsx    # Selector de imagen con drag & drop
│   ├── ProductCard.jsx      # Vista en grid
│   ├── ProductListItem.jsx  # Vista en lista
│   └── ProductForm.jsx      # Modal crear/editar
├── App.jsx                  # Componente raíz
├── main.jsx                 # Entry point
└── index.css                # Estilos globales + Tailwind
```

---

## 📦 Build para producción

```bash
npm run build
# Los archivos optimizados quedan en /dist
```
