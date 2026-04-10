// ─── Cloudinary config ────────────────────────────────────────────────────────
// ⚠️  Reemplazá estos valores con los de tu cuenta Cloudinary:
//    https://cloudinary.com/ → Dashboard → Cloud name + unsigned upload preset
const CLOUDINARY_CLOUD_NAME = 'dmuwjxtys'        // ← tu cloud name
const CLOUDINARY_UPLOAD_PRESET = 'catalogo_ropa' // ← preset en MINÚSCULAS (Cloudinary es case-sensitive)

/**
 * Sube un archivo/blob/base64 a Cloudinary y devuelve la URL segura.
 * Funciona correctamente en desktop y mobile (incluyendo cámara nativa).
 *
 * @param {File|Blob|string} input - File object, Blob, o data URL (base64)
 * @returns {Promise<string>} URL pública de la imagen
 */
export async function uploadToCloudinary(input) {
  const formData = new FormData()

  if (typeof input === 'string') {
    // Es un data URL (base64) — convertir a Blob
    const response = await fetch(input)
    const blob = await response.blob()
    // Detectar extensión desde mime type
    const ext = blob.type.split('/')[1] || 'jpg'
    formData.append('file', blob, `upload.${ext}`)
  } else if (input instanceof File || input instanceof Blob) {
    // Ya es un File/Blob nativo (ideal para mobile con input[type=file])
    formData.append('file', input)
  } else {
    throw new Error('uploadToCloudinary: input debe ser un File, Blob o data URL string')
  }

  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Cloudinary error ${response.status}: ${errText}`)
  }

  const data = await response.json()
  return data.secure_url
}
