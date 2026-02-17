# PROMPT DETALLADO - FOTOS EXPRESS
## Portal Profesional de Fotografía - Puerto Rico

---

## 📋 DESCRIPCIÓN GENERAL

**Fotos Express** es un portal web profesional de fotografía que permite:
- A **clientes** buscar y descargar sus fotos de eventos usando su número de teléfono
- A **fotógrafos/staff** gestionar entregas de fotos a clientes
- A **administradores** gestionar todo el sistema, aprobar nuevos fotógrafos y ver solicitudes de servicios

**URL del repositorio original:** https://github.com/Ziurivera/Fotoxexpresbeta.git

---

## 🏗️ ARQUITECTURA TÉCNICA

### Stack Tecnológico
- **Frontend:** React 19 + TypeScript + Vite 6
- **Backend:** FastAPI (Python)
- **Base de Datos:** MongoDB
- **Estilos:** TailwindCSS (via CDN)
- **Iconos:** Material Symbols
- **Fuente:** Manrope
- **Email:** Resend API

### Estructura de Archivos
```
/app/
├── backend/
│   ├── server.py          # API FastAPI completa
│   ├── requirements.txt   # Dependencias Python
│   └── .env               # Variables de entorno
├── frontend/
│   ├── App.tsx            # Componente principal con routing
│   ├── types.ts           # Tipos TypeScript
│   ├── index.tsx          # Entry point
│   ├── index.html         # HTML base
│   ├── vite.config.ts     # Configuración Vite
│   ├── package.json       # Dependencias Node
│   └── components/
│       ├── Navbar.tsx              # Navegación principal
│       ├── LandingPage.tsx         # Página de inicio
│       ├── MemoriesPage.tsx        # "Mis Fotos" - búsqueda por teléfono
│       ├── PortfolioPage.tsx       # Portafolio público
│       ├── RequestServicePage.tsx  # Solicitud de servicios (4 pasos)
│       ├── ClientRegistrationPage.tsx  # Registro de clientes
│       ├── PhotographerAuth.tsx    # Login/Registro de staff + Admin
│       ├── PhotographerDashboard.tsx   # Dashboard de fotógrafos
│       ├── AdminDashboard.tsx      # Panel de administración
│       ├── AccountActivationPage.tsx   # Activación de cuenta
│       └── Footer.tsx              # Pie de página
└── memory/
    └── PRD.md              # Documentación del proyecto
```

---

## 🔐 CREDENCIALES Y ACCESOS

### Acceso Administrador
- **Ruta:** Portal Staff → Acceso Administrativo
- **Contraseña:** `Fotosexpress2026$`

### Acceso Staff Demo
- **Email:** `staff@fotosexpress.com`
- **Contraseña:** `Fotosexpress@`

### Cliente de Prueba (para buscar fotos)
- **Teléfono:** `3234764379`
- **Nombre:** Carla Rivera
- **Tiene 5 fotos subidas**

### API Keys Configuradas
- **Resend API Key:** `re_dm8FqjWX_AkXSuSwgTtWphifSWSSD9BrU`
- **Sender Email:** `onboarding@resend.dev` (modo prueba)

---

## 📱 PÁGINAS Y FUNCIONALIDADES

### 1. Landing Page (/)
- Hero con título "FOTOS EXPRESS" con efecto neón azul
- Badge "SERVICIOS EN TODA LA ISLA"
- Dos cards principales:
  - **MIS FOTOS:** Acceso a galería HD con icono de descarga
  - **REGISTRO:** Verificación rápida y segura con icono QR
- Diseño oscuro premium (#0a0a0f fondo)

### 2. Mis Fotos (/memories)
- Formulario de búsqueda por número de teléfono
- Selector de código de país (+1 PR/US, +1-809 DO, +52 MX, +34 ES)
- Si encuentra cliente con fotos:
  - Muestra galería con grid de fotos
  - Lightbox navegable con flechas
  - Botón de descarga individual
  - Información del cliente (nombre, fecha)
- Si no encuentra: mensaje de error

### 3. Portafolio (/portfolio)
- Grid de fotos profesionales
- Filtros por categoría (próximamente)
- Lightbox para ver fotos en grande

### 4. Solicitar Servicio (/request-service)
- Formulario multi-paso (4 pasos):
  1. **Tipo de servicio:** Boda, Quinceañero, Corporativo, Sesión Personal, Evento
  2. **Detalles:** Locación (interior/exterior), descripción, fecha, duración, personas
  3. **Contacto:** Nombre, teléfono, email
  4. **Confirmación:** Resumen y envío

### 5. Portal Staff (/photographer-auth)
#### Vista Login Staff
- Campo email profesional
- Campo contraseña
- Botón "INGRESAR A TRABAJAR"
- Link a registro
- Botón "Acceso Administrativo"

#### Vista Registro Staff (3 pasos)
1. **Datos personales:** Nombre, apellido, email, teléfono, experiencia, equipo
2. **Confirmación de datos:** Verificar email y teléfono
3. **Portafolio:** Subir 5 fotos de referencia (opcional)

#### Vista Admin Login
- Campo contraseña administrativa
- Botón "VERIFICAR IDENTIDAD"

### 6. Staff Dashboard (/photographer-dashboard)
- **Sidebar izquierdo:**
  - Logo "STAFF DASHBOARD"
  - Tab "Identificar" (clientes pendientes)
  - Tab "Entregas" (clientes completados)
  - Tab "Mi Perfil" (configuración)
  - Info usuario conectado
  - Botón cerrar sesión

- **Tab Identificar:**
  - Lista de clientes esperando fotos
  - Card con foto referencia, nombre, teléfono
  - Botón "SUBIR IMÁGENES"
  - Modal de carga con:
    - Campo email del staff
    - Selector de archivos
    - Barra de progreso
    - Confirmación de entrega

- **Tab Entregas:**
  - Lista de entregas completadas
  - Badge verde "Entrega Finalizada HD"

- **Tab Mi Perfil:**
  - Card "Información Personal" (nombre, email, teléfono)
  - Card "Cambiar Contraseña":
    - Campo contraseña actual
    - Campo nueva contraseña
    - Campo confirmar nueva contraseña
    - Botón "GUARDAR CONTRASEÑA"
    - Mensaje de éxito/error

### 7. Panel Admin (/admin)
- **Sidebar izquierdo:**
  - Logo "PANEL MAESTRO"
  - Tab "Entregas HD" (gestión de clientes)
  - Tab "Servicios" (cotizaciones)
  - Tab "Candidatos" (reclutamiento)
  - Status "Conectado"
  - Botón cerrar sesión

- **Tab Entregas HD:**
  - Tabla con columnas: Estado, Cliente, Teléfono, Staff Asignado, Acciones
  - Estados: "LISTO HD" (verde) o "EN ESPERA" (amarillo pulsante)
  - Acciones: Ver galería, WhatsApp, Eliminar

- **Tab Servicios:**
  - Cards de solicitudes de cotización
  - Info: tipo, fecha, nombre, email, duración, locación, personas
  - Botones: Contactar (WhatsApp), Eliminar

- **Tab Candidatos (Reclutamiento):**
  - Cards de fotógrafos solicitantes
  - Info mostrada:
    - Nombre
    - Teléfono
    - **Email de contacto** (visible)
    - Equipo profesional
    - Experiencia
  - Botones: "DESCARTAR", "APROBAR INGRESO"
  
  - **Al aprobar:**
    - Modal "¡FOTÓGRAFO APROBADO!"
    - Muestra nombre y email
    - **Estado del email:**
      - Verde "EMAIL ENVIADO" si Resend funciona
      - Amarillo "EMAIL NO ENVIADO" si falla (con mensaje)
    - Link de activación completo
    - Botón "COPIAR LINK"
    - Mensaje: "El fotógrafo debe abrir este link para crear su contraseña"

### 8. Activación de Cuenta (/activar-cuenta?token=xxx)
- **Token válido:**
  - Título "ACTIVA TU CUENTA"
  - Muestra nombre y email del fotógrafo
  - Campo "Crea tu Contraseña" (mínimo 8 caracteres)
  - Campo "Confirmar Contraseña"
  - Indicadores de requisitos (checkmarks verdes)
  - Botón "ACTIVAR MI CUENTA"
  
- **Activación exitosa:**
  - Mensaje "¡CUENTA ACTIVADA!"
  - Muestra email
  - Botón "IR A INICIAR SESIÓN"

- **Token inválido/expirado:**
  - Mensaje "ENLACE INVÁLIDO" o "ENLACE EXPIRADO"
  - Botón "VOLVER AL INICIO"

---

## 🔌 API ENDPOINTS

### Health Check
```
GET /api/health
Response: { "status": "healthy", "service": "Fotos Express API" }
```

### Clientes (Leads)
```
GET /api/clients                    # Lista todos los clientes
GET /api/clients/{phone}            # Buscar por teléfono
POST /api/clients                   # Crear cliente
PUT /api/clients/{client_id}        # Actualizar cliente
DELETE /api/clients/{client_id}     # Eliminar cliente
POST /api/clients/{client_id}/photos # Subir fotos a cliente
```

### Servicios (Cotizaciones)
```
GET /api/services                   # Lista solicitudes
POST /api/services                  # Crear solicitud
DELETE /api/services/{service_id}   # Eliminar solicitud
```

### Staff (Aplicaciones)
```
GET /api/staff                      # Lista aplicaciones
POST /api/staff                     # Nueva aplicación
PUT /api/staff/{staff_id}/status    # Cambiar estado
DELETE /api/staff/{staff_id}        # Eliminar aplicación
```

### Autenticación Staff
```
POST /api/staff/approve/{staff_id}  # Aprobar y crear cuenta (envía email)
GET /api/staff/validate-token?token=xxx  # Validar token de activación
POST /api/staff/activate            # Activar cuenta con contraseña
POST /api/staff/login               # Login de staff
POST /api/staff/change-password     # Cambiar contraseña
GET /api/staff/user/{email}         # Obtener perfil
GET /api/staff/users                # Lista usuarios staff (admin)
```

### Seed Data
```
POST /api/seed                      # Resetear datos de prueba
```

---

## 📧 FLUJO DE RECLUTAMIENTO CON EMAIL

### Proceso Completo:
1. **Fotógrafo se registra** en Portal Staff → Registro
2. **Admin aprueba** en Panel Maestro → Candidatos → "APROBAR INGRESO"
3. **Sistema genera:**
   - Token único de activación (válido 7 días)
   - Link: `/activar-cuenta?token=xxxxx`
4. **Sistema intenta enviar email** via Resend:
   - Si éxito: Email con botón "ACTIVAR MI CUENTA"
   - Si falla: Admin copia link manualmente
5. **Fotógrafo abre link** y crea su contraseña
6. **Cuenta activada:** Puede hacer login y trabajar
7. **En Mi Perfil:** Puede cambiar contraseña cuando quiera

### Plantilla de Email (HTML):
- Header con gradiente azul-púrpura
- Logo "FOTOS EXPRESS"
- Mensaje de felicitación personalizado
- Botón "ACTIVAR MI CUENTA" con gradiente
- Footer con copyright

---

## 🎨 DISEÑO Y ESTILOS

### Paleta de Colores (CSS Variables)
```css
--background: #0a0a0f          /* Fondo principal */
--background-card: #12121a     /* Fondo de cards */
--background-input: #1a1a25    /* Fondo de inputs */
--primary: #67B5E6             /* Azul principal */
--secondary: #A78BFA           /* Púrpura secundario */
--success: #00bf63             /* Verde éxito */
--warning: #f59e0b             /* Amarillo advertencia */
--error: #ff0055               /* Rojo error */
--text-primary: #ffffff        /* Texto principal */
--text-secondary: #a0a0a0      /* Texto secundario */
--text-tertiary: #666666       /* Texto terciario */
```

### Gradientes
```css
--gradient-logo: linear-gradient(90deg, #67B5E6, #A78BFA)
```

### Tipografía
- **Fuente:** Manrope (Google Fonts)
- **Títulos:** font-black, uppercase, italic, tracking-tighter
- **Labels:** text-[10px], font-black, uppercase, tracking-widest
- **Body:** font-bold

### Bordes y Sombras
- Border radius: 2rem a 3.5rem para cards
- Border: border-white/5 a border-white/10
- Sombras: shadow-xl, shadow-2xl

---

## 📊 MODELOS DE DATOS (MongoDB)

### Collection: clients
```javascript
{
  id: "L01",
  nombre: "Carla Rivera",
  telefono: "3234764379",
  instagram: "@carla.riv",
  aceptaRedes: true,
  status: "atendido" | "esperando_fotos",
  atendidoPorNombre: "staff@fotosexpress.com",
  fotosSubidas: ["url1", "url2", ...],
  fechaRegistro: "2025-02-10"
}
```

### Collection: service_requests
```javascript
{
  id: "SR01",
  tipo: "boda" | "quinceanero" | "corporativo" | "sesion_personal" | "evento",
  detalles: {
    locacion: "exterior" | "interior",
    descripcion: "Descripción del evento",
    fechaEvento: "2025-05-20",
    horas: 6,
    personas: 100
  },
  contacto: {
    nombre: "Valeria Martinez",
    telefono: "787-111-2222",
    email: "valeria@email.com"
  },
  status: "pendiente"
}
```

### Collection: staff_applications
```javascript
{
  id: "P01",
  nombre: "Javier Rodriguez",
  email: "javier@cam.pr",
  telefono: "787-999-8888",
  experiencia: "5 años en eventos sociales y bodas.",
  equipo: "Sony A7IV, Sigma 24-70mm",
  especialidades: ["Evento"],
  fotosReferencia: [],
  status: "pendiente" | "aprobado" | "rechazado"
}
```

### Collection: staff_users
```javascript
{
  id: "SU001",
  email: "staff@fotosexpress.com",
  nombre: "Staff Demo",
  telefono: "787-000-0000",
  password_hash: "sha256_hash",
  isActive: true,
  activationToken: null | "token_string",
  tokenExpires: "2025-02-24T00:00:00Z",
  createdAt: "2025-02-17T00:00:00Z",
  applicationId: "P01"
}
```

---

## ⚙️ VARIABLES DE ENTORNO

### Backend (/app/backend/.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=fotosexpress
RESEND_API_KEY=re_dm8FqjWX_AkXSuSwgTtWphifSWSSD9BrU
SENDER_EMAIL=onboarding@resend.dev
```

### Frontend (/app/frontend/.env)
```
REACT_APP_BACKEND_URL=https://[preview-url]/api
```

---

## 🚀 COMANDOS ÚTILES

### Reiniciar servicios
```bash
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
sudo supervisorctl restart all
```

### Ver logs
```bash
tail -n 50 /var/log/supervisor/backend.err.log
tail -n 50 /var/log/supervisor/frontend.out.log
```

### Seed data de prueba
```bash
curl -X POST http://localhost:8001/api/seed
```

### Probar API
```bash
curl http://localhost:8001/api/health
curl http://localhost:8001/api/clients
```

---

## 📝 NOTAS IMPORTANTES

1. **Resend en modo prueba:** Solo envía emails a direcciones verificadas (ziurivera@gmail.com). Para enviar a cualquier email, verificar dominio propio en https://resend.com/domains

2. **Contraseña Admin:** `Fotosexpress2026$` - Distingue mayúsculas/minúsculas

3. **Token de activación:** Válido por 7 días, único por fotógrafo

4. **Fotos:** Actualmente usa URLs de picsum.photos para demo. Integrar storage real (Cloudinary, S3) para producción.

5. **WhatsApp:** Los botones abren wa.me con mensaje predefinido

---

## 🔮 BACKLOG / PRÓXIMAS MEJORAS

- [ ] Verificar dominio en Resend para envío masivo de emails
- [ ] Sistema de upload real de fotos (Cloudinary/S3)
- [ ] Notificaciones WhatsApp automáticas via API
- [ ] Sistema de pagos (Stripe) para servicios
- [ ] Descarga masiva de galerías (ZIP)
- [ ] Dashboard de métricas para admin
- [ ] App móvil para fotógrafos

---

*Documento generado: Febrero 17, 2026*
*Versión: 1.0*
