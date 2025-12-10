# Vladicamp 2025 Awards

Aplicación de votación para los premios Vladicamp 2025 impulsada por IA.

## 🚀 Cómo reiniciar el repositorio (Mac/Linux)

Si deseas desvincular este proyecto de un repositorio anterior y subirlo a uno nuevo, sigue estos pasos en tu **Terminal**:

1. **Navega a la carpeta del proyecto:**
   Abre la terminal, escribe `cd` seguido de un espacio, arrastra la carpeta del proyecto a la terminal y pulsa Enter.

2. **Borra el historial de Git anterior:**
   ```bash
   rm -rf .git
   ```
   *(Si prefieres usar Finder: Presiona `Cmd + Shift + .` para ver archivos ocultos y borra la carpeta `.git` manualmente).*

3. **Inicia el nuevo repositorio:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Vladicamp 2025 App Nuevo"
   git branch -M main
   ```

4. **Vincula tu nuevo repositorio de GitHub:**
   Crea un repositorio vacío en GitHub y copia el link (ej: `https://github.com/usuario/nuevo-repo.git`).
   ```bash
   git remote add origin https://github.com/TU_USUARIO/TU_NUEVO_REPO.git
   git push -u origin main
   ```

## 🛠 Configuración para Desarrollo

1.  **Variables de Entorno:**
    Crea un archivo `.env` en la raíz (puedes duplicar el ejemplo si existe):

    ```env
    API_KEY=tu_api_key_de_google_gemini
    VITE_SUPABASE_URL=tu_url_de_supabase
    VITE_SUPABASE_ANON_KEY=tu_key_anonima_de_supabase
    ```

2.  **Instalar Dependencias:**
    ```bash
    npm install
    ```

3.  **Iniciar Servidor:**
    ```bash
    npm run dev
    ```

## ⚠️ Solución de Problemas Comunes

*   **Error "process is not defined":** Ya está solucionado en `vite.config.ts`.
*   **Error de Supabase:** Asegúrate de que las credenciales en el `.env` sean correctas. Si falla localmente, puedes introducirlas manualmente en el panel de Admin (`/` -> "Ingresar como administrador").
