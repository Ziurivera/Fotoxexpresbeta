# Fotos Express - Portal Profesional de Fotografía

## Problem Statement Original
Importar y hacer realidad el proyecto de GitHub: https://github.com/Ziurivera/Fotoxexpresbeta.git - Un portal de fotografía profesional de Puerto Rico.

## Arquitectura
- **Frontend**: React + TypeScript + Vite (puerto 3000)
- **Backend**: FastAPI + Python (puerto 8001)
- **Database**: MongoDB

## User Personas
1. **Cliente**: Persona que asistió a un evento y busca descargar sus fotos
2. **Fotógrafo/Staff**: Empleado que sube fotos y gestiona entregas
3. **Administrador**: Gestiona todo el sistema, aprueba staff, ve solicitudes de servicio

## Core Requirements (Static)
- Landing page con navegación intuitiva
- Sistema de búsqueda de fotos por número telefónico
- Galería privada de fotos HD para clientes
- Portafolio profesional público
- Sistema de cotización de servicios multi-paso
- Dashboard de Staff para subir fotos
- Panel Admin para gestión completa
- Autenticación de Staff y Admin

## Implementado (Feb 16, 2026)
- [x] Landing page completa con diseño oscuro premium
- [x] Navegación entre secciones (MIS FOTOS, PORTAFOLIO, SERVICIOS)
- [x] Búsqueda de fotos por teléfono funcional
- [x] Galería de cliente con lightbox navegable
- [x] Portafolio con grid de fotos
- [x] Formulario de solicitud de servicios (4 pasos)
- [x] Portal de Fotógrafos con login/registro
- [x] Dashboard de Staff para gestionar entregas
- [x] Panel Admin con gestión de leads, servicios y candidatos
- [x] Backend API completa (CRUD clientes, servicios, staff)
- [x] MongoDB integrado con datos seed

## Credenciales de Acceso
- **Staff**: staff@fotosexpress.com / Fotosexpress@
- **Admin**: Contraseña: Fotosexpress2026$
- **Cliente de prueba**: Teléfono: 3234764379 (Carla Rivera)

## Implementado (Feb 17, 2026) - Sistema de Reclutamiento + Resend
- [x] Email visible en tarjeta de candidato en panel Admin
- [x] Modal de aprobación con link de activación único
- [x] **Integración Resend** para envío de emails de activación
- [x] Modal muestra estado del email (enviado/no enviado con mensaje)
- [x] Página de activación de cuenta (/activar-cuenta?token=xxx)
- [x] Flujo profesional tipo Google/Uber: link -> crear contraseña -> cuenta activa
- [x] Sistema de login para staff con validación de contraseña
- [x] Sección "Mi Perfil" en Staff Dashboard para cambiar contraseña
- [x] Backend completo: approve, activate, login, change-password APIs

## Credenciales
- Admin: Fotosexpress2026$
- Staff demo: staff@fotosexpress.com / Fotosexpress@
- Resend API Key: re_dm8FqjWX_AkXSuSwgTtWphifSWSSD9BrU (modo prueba)

## Backlog / Mejoras Futuras
- P0: Verificar dominio en Resend para envío a cualquier email
- P0: Sistema de upload real de fotos (storage)
- P1: Notificaciones WhatsApp automáticas
- P2: Sistema de pagos para servicios
- P2: Galería con descarga masiva

## Tech Stack
- Frontend: React 19, TypeScript, Vite 6, TailwindCSS (CDN)
- Backend: FastAPI, Pydantic, PyMongo
- Database: MongoDB
- Icons: Material Symbols
- Fonts: Manrope
