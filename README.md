# Vladicamp 2025 Awards

Aplicación de votación para los premios Vladicamp 2025 impulsada por IA.

## 🚀 Cómo iniciar un NUEVO repositorio (Desvincular el anterior)

Si quieres subir este proyecto a un nuevo repositorio de GitHub y borrar el historial anterior, ejecuta los siguientes comandos en tu terminal (en la carpeta raíz del proyecto):

```bash
# 1. Borrar el historial de git existente (Windows: rmdir /s /q .git)
rm -rf .git

# 2. Iniciar un nuevo repositorio limpio
git init

# 3. Agregar todos los archivos (El .gitignore evitará subir claves secretas)
git add .

# 4. Crear el primer commit
git commit -m "Initial commit: Vladicamp 2025 App"

# 5. Crear la rama principal
git branch -M main

# 6. Vincular con tu nuevo repositorio de GitHub (crealo antes en github.com)
git remote add origin https://github.com/TU_USUARIO/TU_NUEVO_REPO.git

# 7. Subir los archivos
git push -u origin main
```

## 🛠 Configuración

1.  Copia el archivo de ejemplo de variables de entorno (si existe) o crea un archivo `.env` en la raíz:

```env
API_KEY=tu_api_key_de_google_gemini
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_key_anonima_de_supabase
```

2.  Instala las dependencias:

```bash
npm install
```

3.  Corre el servidor de desarrollo:

```bash
npm run dev
```
