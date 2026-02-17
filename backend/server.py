from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import os
import asyncio
import logging
from pymongo import MongoClient
import uuid
import hashlib
import secrets
import resend
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Fotos Express API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "fotosexpress")
APP_URL = os.environ.get("APP_URL", "https://686b811e-993d-4293-bfa6-b6ba1d222226.preview.emergentagent.com")
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Resend Configuration
RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

# Collections
zones_collection = db["zones"]  # Zonas ambulantes
businesses_collection = db["businesses"]  # Negocios
activities_collection = db["activities"]  # Actividades por negocio
ambulant_clients_collection = db["ambulant_clients"]  # Clientes ambulantes
activity_clients_collection = db["activity_clients"]  # Clientes de actividades
service_requests_collection = db["service_requests"]
staff_applications_collection = db["staff_applications"]
staff_users_collection = db["staff_users"]

# Password hashing
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

# Email sending function
async def send_activation_email(recipient_email: str, nombre: str, activation_link: str) -> dict:
    if not RESEND_API_KEY:
        return {"status": "skipped", "reason": "No API key configured"}
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0a0a0f; color: #ffffff; margin: 0; padding: 40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #12121a; border-radius: 24px;">
            <tr><td style="background: linear-gradient(90deg, #67B5E6, #A78BFA); height: 6px;"></td></tr>
            <tr>
                <td style="padding: 50px 40px; text-align: center;">
                    <h1 style="color: #67B5E6; font-size: 28px; font-weight: 900;">FOTOS EXPRESS</h1>
                    <div style="background-color: #1a1a25; border-radius: 16px; padding: 30px; margin: 20px 0;">
                        <p style="color: #00bf63; font-size: 14px; font-weight: 700;">¡Felicidades, {nombre}!</p>
                        <p>Tu solicitud ha sido <strong style="color: #00bf63;">APROBADA</strong>.</p>
                    </div>
                    <a href="{activation_link}" style="display: inline-block; background: linear-gradient(90deg, #67B5E6, #A78BFA); color: #0a0a0f; padding: 18px 50px; border-radius: 12px; font-weight: 900; text-decoration: none;">
                        ACTIVAR MI CUENTA
                    </a>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    
    try:
        email = await asyncio.to_thread(resend.Emails.send, {
            "from": SENDER_EMAIL,
            "to": [recipient_email],
            "subject": "🎉 ¡Bienvenido a Fotos Express! - Activa tu cuenta",
            "html": html_content
        })
        return {"status": "success", "email_id": email.get("id")}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Helper functions
def generate_id(prefix: str) -> str:
    return f"{prefix}{uuid.uuid4().hex[:8].upper()}"

def generate_activation_token() -> str:
    return secrets.token_urlsafe(32)

# ==================== PYDANTIC MODELS ====================

# Zones (Ambulant areas)
class Zone(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    activa: bool = True
    fotografosAsignados: List[str] = []  # List of staff user IDs

class ZoneResponse(Zone):
    id: str

# Businesses
class Business(BaseModel):
    nombre: str
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    activo: bool = True

class BusinessResponse(Business):
    id: str

# Activities
class Activity(BaseModel):
    nombre: str
    negocioId: str
    descripcion: Optional[str] = None
    activa: bool = True
    fotografosAsignados: List[str] = []

class ActivityResponse(Activity):
    id: str
    negocioNombre: Optional[str] = None

# Ambulant Clients
class AmbulantClient(BaseModel):
    nombre: str
    telefono: str
    instagram: Optional[str] = None
    aceptaPublicidad: bool = False
    fotoReferencia: Optional[str] = None
    zonaId: str
    status: str = "esperando_fotos"
    fotografoAsignado: Optional[str] = None
    fotosSubidas: Optional[List[str]] = None

class AmbulantClientResponse(AmbulantClient):
    id: str
    zonaNombre: Optional[str] = None
    fechaRegistro: Optional[str] = None

# Activity Clients
class ActivityClient(BaseModel):
    nombre: str
    telefono: str
    negocioId: str
    actividadId: str
    fotoReferencia: Optional[str] = None
    status: str = "esperando_fotos"
    fotografoAsignado: Optional[str] = None
    fotosSubidas: Optional[List[str]] = None

class ActivityClientResponse(ActivityClient):
    id: str
    negocioNombre: Optional[str] = None
    actividadNombre: Optional[str] = None
    fechaRegistro: Optional[str] = None

# Service Requests
class ServiceRequestDetails(BaseModel):
    locacion: str
    descripcion: str
    fechaEvento: str
    horas: int
    personas: int

class ServiceRequestContact(BaseModel):
    nombre: str
    telefono: str
    email: str

class ServiceRequest(BaseModel):
    tipo: str
    detalles: ServiceRequestDetails
    contacto: ServiceRequestContact
    status: str = "pendiente"

class ServiceRequestResponse(ServiceRequest):
    id: str

# Staff
class StaffApplication(BaseModel):
    nombre: str
    email: str
    telefono: str
    experiencia: str
    equipo: str
    especialidades: List[str] = []
    fotosReferencia: List[str] = []
    status: str = "pendiente"

class StaffApplicationResponse(StaffApplication):
    id: str

class StaffLogin(BaseModel):
    email: str
    password: str

class StaffActivation(BaseModel):
    token: str
    password: str

class StaffPasswordChange(BaseModel):
    email: str
    currentPassword: str
    newPassword: str

class PhotoUpload(BaseModel):
    fotos: List[str]
    fotografoId: str

class StaffAssignment(BaseModel):
    staffIds: List[str]

# ==================== API ENDPOINTS ====================

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Fotos Express API"}

# ==================== ZONES (AMBULANT AREAS) ====================

@app.get("/api/zones")
def get_zones():
    zones = list(zones_collection.find({}, {"_id": 0}))
    return zones

@app.get("/api/zones/active")
def get_active_zones():
    zones = list(zones_collection.find({"activa": True}, {"_id": 0}))
    return zones

@app.post("/api/zones")
def create_zone(zone: Zone):
    zone_dict = zone.model_dump()
    zone_dict["id"] = generate_id("Z")
    zones_collection.insert_one(zone_dict)
    zone_dict.pop("_id", None)
    return zone_dict

@app.put("/api/zones/{zone_id}")
def update_zone(zone_id: str, zone: Zone):
    result = zones_collection.update_one({"id": zone_id}, {"$set": zone.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Zone not found")
    return zones_collection.find_one({"id": zone_id}, {"_id": 0})

@app.put("/api/zones/{zone_id}/staff")
def assign_staff_to_zone(zone_id: str, assignment: StaffAssignment):
    result = zones_collection.update_one(
        {"id": zone_id},
        {"$set": {"fotografosAsignados": assignment.staffIds}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Zone not found")
    return {"message": "Staff assigned successfully"}

@app.delete("/api/zones/{zone_id}")
def delete_zone(zone_id: str):
    result = zones_collection.delete_one({"id": zone_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Zone not found")
    return {"message": "Zone deleted"}

# ==================== BUSINESSES ====================

@app.get("/api/businesses")
def get_businesses():
    businesses = list(businesses_collection.find({}, {"_id": 0}))
    return businesses

@app.get("/api/businesses/active")
def get_active_businesses():
    businesses = list(businesses_collection.find({"activo": True}, {"_id": 0}))
    return businesses

@app.post("/api/businesses")
def create_business(business: Business):
    business_dict = business.model_dump()
    business_dict["id"] = generate_id("B")
    businesses_collection.insert_one(business_dict)
    business_dict.pop("_id", None)
    return business_dict

@app.put("/api/businesses/{business_id}")
def update_business(business_id: str, business: Business):
    result = businesses_collection.update_one({"id": business_id}, {"$set": business.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Business not found")
    return businesses_collection.find_one({"id": business_id}, {"_id": 0})

@app.delete("/api/businesses/{business_id}")
def delete_business(business_id: str):
    result = businesses_collection.delete_one({"id": business_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Business not found")
    # Also delete related activities
    activities_collection.delete_many({"negocioId": business_id})
    return {"message": "Business and related activities deleted"}

# ==================== ACTIVITIES ====================

@app.get("/api/activities")
def get_activities():
    activities = list(activities_collection.find({}, {"_id": 0}))
    # Add business name
    for act in activities:
        business = businesses_collection.find_one({"id": act.get("negocioId")}, {"_id": 0})
        act["negocioNombre"] = business.get("nombre") if business else "N/A"
    return activities

@app.get("/api/activities/business/{business_id}")
def get_activities_by_business(business_id: str):
    activities = list(activities_collection.find({"negocioId": business_id, "activa": True}, {"_id": 0}))
    return activities

@app.get("/api/activities/active")
def get_active_activities():
    activities = list(activities_collection.find({"activa": True}, {"_id": 0}))
    for act in activities:
        business = businesses_collection.find_one({"id": act.get("negocioId")}, {"_id": 0})
        act["negocioNombre"] = business.get("nombre") if business else "N/A"
    return activities

@app.post("/api/activities")
def create_activity(activity: Activity):
    # Verify business exists
    business = businesses_collection.find_one({"id": activity.negocioId})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    activity_dict = activity.model_dump()
    activity_dict["id"] = generate_id("A")
    activities_collection.insert_one(activity_dict)
    activity_dict.pop("_id", None)
    activity_dict["negocioNombre"] = business.get("nombre")
    return activity_dict

@app.put("/api/activities/{activity_id}")
def update_activity(activity_id: str, activity: Activity):
    result = activities_collection.update_one({"id": activity_id}, {"$set": activity.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activities_collection.find_one({"id": activity_id}, {"_id": 0})

@app.put("/api/activities/{activity_id}/staff")
def assign_staff_to_activity(activity_id: str, assignment: StaffAssignment):
    result = activities_collection.update_one(
        {"id": activity_id},
        {"$set": {"fotografosAsignados": assignment.staffIds}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Activity not found")
    return {"message": "Staff assigned successfully"}

@app.delete("/api/activities/{activity_id}")
def delete_activity(activity_id: str):
    result = activities_collection.delete_one({"id": activity_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Activity not found")
    return {"message": "Activity deleted"}

# ==================== AMBULANT CLIENTS ====================

@app.get("/api/ambulant-clients")
def get_ambulant_clients():
    clients = list(ambulant_clients_collection.find({}, {"_id": 0}))
    for c in clients:
        zone = zones_collection.find_one({"id": c.get("zonaId")}, {"_id": 0})
        c["zonaNombre"] = zone.get("nombre") if zone else "N/A"
    return clients

@app.get("/api/ambulant-clients/zone/{zone_id}")
def get_ambulant_clients_by_zone(zone_id: str):
    clients = list(ambulant_clients_collection.find({"zonaId": zone_id}, {"_id": 0}))
    zone = zones_collection.find_one({"id": zone_id}, {"_id": 0})
    for c in clients:
        c["zonaNombre"] = zone.get("nombre") if zone else "N/A"
    return clients

@app.get("/api/ambulant-clients/phone/{phone}")
def get_ambulant_client_by_phone(phone: str):
    client = ambulant_clients_collection.find_one({"telefono": phone}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    zone = zones_collection.find_one({"id": client.get("zonaId")}, {"_id": 0})
    client["zonaNombre"] = zone.get("nombre") if zone else "N/A"
    return client

@app.get("/api/ambulant-clients/staff/{staff_id}")
def get_ambulant_clients_for_staff(staff_id: str):
    """Get ambulant clients for zones assigned to this staff member"""
    # Find zones where this staff is assigned
    zones = list(zones_collection.find({"fotografosAsignados": staff_id, "activa": True}, {"_id": 0}))
    zone_ids = [z["id"] for z in zones]
    
    # Get clients from those zones
    clients = list(ambulant_clients_collection.find({"zonaId": {"$in": zone_ids}}, {"_id": 0}))
    for c in clients:
        zone = next((z for z in zones if z["id"] == c.get("zonaId")), None)
        c["zonaNombre"] = zone.get("nombre") if zone else "N/A"
    return clients

@app.post("/api/ambulant-clients")
def create_ambulant_client(client: AmbulantClient):
    # Verify zone exists
    zone = zones_collection.find_one({"id": client.zonaId})
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    client_dict = client.model_dump()
    client_dict["id"] = generate_id("AC")
    client_dict["fechaRegistro"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    ambulant_clients_collection.insert_one(client_dict)
    client_dict.pop("_id", None)
    client_dict["zonaNombre"] = zone.get("nombre")
    return client_dict

@app.put("/api/ambulant-clients/{client_id}/photos")
def upload_ambulant_photos(client_id: str, upload: PhotoUpload):
    result = ambulant_clients_collection.update_one(
        {"id": client_id},
        {"$set": {
            "status": "atendido",
            "fotografoAsignado": upload.fotografoId,
            "fotosSubidas": upload.fotos
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    return ambulant_clients_collection.find_one({"id": client_id}, {"_id": 0})

@app.delete("/api/ambulant-clients/{client_id}")
def delete_ambulant_client(client_id: str):
    result = ambulant_clients_collection.delete_one({"id": client_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"message": "Client deleted"}

# ==================== ACTIVITY CLIENTS ====================

@app.get("/api/activity-clients")
def get_activity_clients():
    clients = list(activity_clients_collection.find({}, {"_id": 0}))
    for c in clients:
        business = businesses_collection.find_one({"id": c.get("negocioId")}, {"_id": 0})
        activity = activities_collection.find_one({"id": c.get("actividadId")}, {"_id": 0})
        c["negocioNombre"] = business.get("nombre") if business else "N/A"
        c["actividadNombre"] = activity.get("nombre") if activity else "N/A"
    return clients

@app.get("/api/activity-clients/activity/{activity_id}")
def get_activity_clients_by_activity(activity_id: str):
    clients = list(activity_clients_collection.find({"actividadId": activity_id}, {"_id": 0}))
    activity = activities_collection.find_one({"id": activity_id}, {"_id": 0})
    business = businesses_collection.find_one({"id": activity.get("negocioId")}, {"_id": 0}) if activity else None
    for c in clients:
        c["negocioNombre"] = business.get("nombre") if business else "N/A"
        c["actividadNombre"] = activity.get("nombre") if activity else "N/A"
    return clients

@app.get("/api/activity-clients/phone/{phone}")
def get_activity_client_by_phone(phone: str, negocioId: str = Query(None), actividadId: str = Query(None)):
    query = {"telefono": phone}
    if negocioId:
        query["negocioId"] = negocioId
    if actividadId:
        query["actividadId"] = actividadId
    
    client = activity_clients_collection.find_one(query, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    business = businesses_collection.find_one({"id": client.get("negocioId")}, {"_id": 0})
    activity = activities_collection.find_one({"id": client.get("actividadId")}, {"_id": 0})
    client["negocioNombre"] = business.get("nombre") if business else "N/A"
    client["actividadNombre"] = activity.get("nombre") if activity else "N/A"
    return client

@app.get("/api/activity-clients/staff/{staff_id}")
def get_activity_clients_for_staff(staff_id: str):
    """Get activity clients for activities assigned to this staff member"""
    # Find activities where this staff is assigned
    activities = list(activities_collection.find({"fotografosAsignados": staff_id, "activa": True}, {"_id": 0}))
    activity_ids = [a["id"] for a in activities]
    
    # Get clients from those activities
    clients = list(activity_clients_collection.find({"actividadId": {"$in": activity_ids}}, {"_id": 0}))
    for c in clients:
        activity = next((a for a in activities if a["id"] == c.get("actividadId")), None)
        business = businesses_collection.find_one({"id": c.get("negocioId")}, {"_id": 0})
        c["negocioNombre"] = business.get("nombre") if business else "N/A"
        c["actividadNombre"] = activity.get("nombre") if activity else "N/A"
    return clients

@app.post("/api/activity-clients")
def create_activity_client(client: ActivityClient):
    # Verify business and activity exist
    business = businesses_collection.find_one({"id": client.negocioId})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    activity = activities_collection.find_one({"id": client.actividadId})
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    client_dict = client.model_dump()
    client_dict["id"] = generate_id("EC")
    client_dict["fechaRegistro"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    activity_clients_collection.insert_one(client_dict)
    client_dict.pop("_id", None)
    client_dict["negocioNombre"] = business.get("nombre")
    client_dict["actividadNombre"] = activity.get("nombre")
    return client_dict

@app.put("/api/activity-clients/{client_id}/photos")
def upload_activity_photos(client_id: str, upload: PhotoUpload):
    result = activity_clients_collection.update_one(
        {"id": client_id},
        {"$set": {
            "status": "atendido",
            "fotografoAsignado": upload.fotografoId,
            "fotosSubidas": upload.fotos
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    return activity_clients_collection.find_one({"id": client_id}, {"_id": 0})

@app.delete("/api/activity-clients/{client_id}")
def delete_activity_client(client_id: str):
    result = activity_clients_collection.delete_one({"id": client_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"message": "Client deleted"}

# ==================== SERVICE REQUESTS ====================

@app.get("/api/services")
def get_services():
    return list(service_requests_collection.find({}, {"_id": 0}))

@app.post("/api/services")
def create_service(service: ServiceRequest):
    service_dict = service.model_dump()
    service_dict["id"] = generate_id("SR")
    service_requests_collection.insert_one(service_dict)
    service_dict.pop("_id", None)
    return service_dict

@app.delete("/api/services/{service_id}")
def delete_service(service_id: str):
    result = service_requests_collection.delete_one({"id": service_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted"}

# ==================== STAFF APPLICATIONS ====================

@app.get("/api/staff")
def get_staff_applications():
    return list(staff_applications_collection.find({}, {"_id": 0}))

@app.post("/api/staff")
def create_staff_application(staff: StaffApplication):
    staff_dict = staff.model_dump()
    staff_dict["id"] = generate_id("P")
    staff_applications_collection.insert_one(staff_dict)
    staff_dict.pop("_id", None)
    return staff_dict

@app.delete("/api/staff/{staff_id}")
def delete_staff_application(staff_id: str):
    result = staff_applications_collection.delete_one({"id": staff_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"message": "Application deleted"}

# ==================== STAFF USERS ====================

@app.get("/api/staff/users")
def get_staff_users():
    users = list(staff_users_collection.find({"isActive": True}, {"_id": 0, "password_hash": 0, "activationToken": 0}))
    return users

@app.get("/api/staff/user/{email}")
def get_staff_user(email: str):
    user = staff_users_collection.find_one({"email": email}, {"_id": 0, "password_hash": 0, "activationToken": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get assigned zones and activities
    zones = list(zones_collection.find({"fotografosAsignados": user["id"], "activa": True}, {"_id": 0}))
    activities = list(activities_collection.find({"fotografosAsignados": user["id"], "activa": True}, {"_id": 0}))
    
    user["zonasAsignadas"] = zones
    user["actividadesAsignadas"] = activities
    return user

@app.post("/api/staff/approve/{staff_id}")
async def approve_staff_and_create_account(staff_id: str):
    application = staff_applications_collection.find_one({"id": staff_id}, {"_id": 0})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    existing_user = staff_users_collection.find_one({"email": application["email"]})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    activation_token = generate_activation_token()
    token_expires = datetime.now(timezone.utc) + timedelta(days=7)
    
    staff_user = {
        "id": generate_id("SU"),
        "email": application["email"],
        "nombre": application["nombre"],
        "telefono": application["telefono"],
        "password_hash": None,
        "isActive": False,
        "activationToken": activation_token,
        "tokenExpires": token_expires.isoformat(),
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "applicationId": staff_id
    }
    staff_users_collection.insert_one(staff_user)
    
    staff_applications_collection.update_one({"id": staff_id}, {"$set": {"status": "aprobado"}})
    
    activation_link = f"{APP_URL}/activar-cuenta?token={activation_token}"
    email_result = await send_activation_email(application["email"], application["nombre"], activation_link)
    
    return {
        "message": "Staff approved",
        "email": application["email"],
        "nombre": application["nombre"],
        "activationLink": activation_link,
        "activationToken": activation_token,
        "expiresIn": "7 days",
        "emailStatus": email_result
    }

@app.get("/api/staff/validate-token")
def validate_activation_token(token: str = Query(...)):
    user = staff_users_collection.find_one({"activationToken": token}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Invalid token")
    
    token_expires = datetime.fromisoformat(user["tokenExpires"])
    if datetime.now(timezone.utc) > token_expires:
        raise HTTPException(status_code=400, detail="Token expired")
    
    if user["isActive"]:
        raise HTTPException(status_code=400, detail="Account already activated")
    
    return {"valid": True, "email": user["email"], "nombre": user["nombre"]}

@app.post("/api/staff/activate")
def activate_staff_account(activation: StaffActivation):
    user = staff_users_collection.find_one({"activationToken": activation.token}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Invalid token")
    
    token_expires = datetime.fromisoformat(user["tokenExpires"])
    if datetime.now(timezone.utc) > token_expires:
        raise HTTPException(status_code=400, detail="Token expired")
    
    if user["isActive"]:
        raise HTTPException(status_code=400, detail="Already activated")
    
    if len(activation.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    staff_users_collection.update_one(
        {"activationToken": activation.token},
        {"$set": {
            "password_hash": hash_password(activation.password),
            "isActive": True,
            "activationToken": None,
            "activatedAt": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Account activated", "email": user["email"], "nombre": user["nombre"]}

@app.post("/api/staff/login")
def staff_login(login: StaffLogin):
    user = staff_users_collection.find_one({"email": login.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user["isActive"]:
        raise HTTPException(status_code=401, detail="Account not activated")
    
    if not verify_password(login.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Get assigned zones and activities
    zones = list(zones_collection.find({"fotografosAsignados": user["id"], "activa": True}, {"_id": 0}))
    activities = list(activities_collection.find({"fotografosAsignados": user["id"], "activa": True}, {"_id": 0}))
    
    return {
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "nombre": user["nombre"],
            "telefono": user["telefono"],
            "zonasAsignadas": zones,
            "actividadesAsignadas": activities
        }
    }

@app.post("/api/staff/change-password")
def change_staff_password(data: StaffPasswordChange):
    user = staff_users_collection.find_one({"email": data.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user["isActive"]:
        raise HTTPException(status_code=400, detail="Account not activated")
    
    if not verify_password(data.currentPassword, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Current password incorrect")
    
    if len(data.newPassword) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    staff_users_collection.update_one(
        {"email": data.email},
        {"$set": {"password_hash": hash_password(data.newPassword)}}
    )
    
    return {"message": "Password changed"}

# ==================== SEED DATA ====================

@app.post("/api/seed")
def seed_data():
    # Clear all collections
    zones_collection.delete_many({})
    businesses_collection.delete_many({})
    activities_collection.delete_many({})
    ambulant_clients_collection.delete_many({})
    activity_clients_collection.delete_many({})
    service_requests_collection.delete_many({})
    staff_applications_collection.delete_many({})
    staff_users_collection.delete_many({})
    
    # Create zones
    zones_collection.insert_many([
        {"id": "Z01", "nombre": "Bahía Urbana", "descripcion": "Área de Bahía Urbana, San Juan", "activa": True, "fotografosAsignados": []},
        {"id": "Z02", "nombre": "Condado", "descripcion": "Zona turística del Condado", "activa": True, "fotografosAsignados": []},
        {"id": "Z03", "nombre": "Viejo San Juan", "descripcion": "Calles del Viejo San Juan", "activa": True, "fotografosAsignados": []}
    ])
    
    # Create businesses
    businesses_collection.insert_many([
        {"id": "B01", "nombre": "Club La Terraza", "direccion": "Calle Luna 123", "telefono": "787-111-1111", "activo": True},
        {"id": "B02", "nombre": "Hotel Caribe Hilton", "direccion": "Av. Los Gobernadores", "telefono": "787-222-2222", "activo": True}
    ])
    
    # Create activities
    activities_collection.insert_many([
        {"id": "A01", "nombre": "Fiesta de Año Nuevo 2026", "negocioId": "B01", "descripcion": "Evento de fin de año", "activa": True, "fotografosAsignados": []},
        {"id": "A02", "nombre": "Boda Rodriguez-Martinez", "negocioId": "B02", "descripcion": "Boda en salón principal", "activa": True, "fotografosAsignados": []},
        {"id": "A03", "nombre": "Quinceañero Valentina", "negocioId": "B01", "descripcion": "Celebración de 15 años", "activa": True, "fotografosAsignados": []}
    ])
    
    # Create ambulant clients
    ambulant_clients_collection.insert_many([
        {
            "id": "AC01", "nombre": "Carlos Rivera", "telefono": "7871234567", "instagram": "@carlos.riv",
            "aceptaPublicidad": True, "fotoReferencia": "https://picsum.photos/id/1/400/400",
            "zonaId": "Z01", "status": "atendido", "fotografoAsignado": "SU001",
            "fotosSubidas": ["https://picsum.photos/id/10/800/1000", "https://picsum.photos/id/11/800/1000"],
            "fechaRegistro": "2026-02-15"
        },
        {
            "id": "AC02", "nombre": "Maria Santos", "telefono": "7879876543", "instagram": "@maria.s",
            "aceptaPublicidad": False, "fotoReferencia": "https://picsum.photos/id/2/400/400",
            "zonaId": "Z01", "status": "esperando_fotos", "fotografoAsignado": None,
            "fotosSubidas": None, "fechaRegistro": "2026-02-16"
        }
    ])
    
    # Create activity clients
    activity_clients_collection.insert_many([
        {
            "id": "EC01", "nombre": "Ana Lopez", "telefono": "7875551234",
            "negocioId": "B01", "actividadId": "A01",
            "fotoReferencia": "https://picsum.photos/id/3/400/400",
            "status": "atendido", "fotografoAsignado": "SU001",
            "fotosSubidas": ["https://picsum.photos/id/20/800/1000", "https://picsum.photos/id/21/800/1000"],
            "fechaRegistro": "2026-02-14"
        },
        {
            "id": "EC02", "nombre": "Pedro Gonzalez", "telefono": "7875559876",
            "negocioId": "B02", "actividadId": "A02",
            "fotoReferencia": "https://picsum.photos/id/4/400/400",
            "status": "esperando_fotos", "fotografoAsignado": None,
            "fotosSubidas": None, "fechaRegistro": "2026-02-16"
        }
    ])
    
    # Create service request
    service_requests_collection.insert_one({
        "id": "SR01", "tipo": "boda",
        "detalles": {"locacion": "exterior", "descripcion": "Boda en la playa", "fechaEvento": "2026-05-20", "horas": 6, "personas": 100},
        "contacto": {"nombre": "Valeria Martinez", "telefono": "787-111-2222", "email": "valeria@email.com"},
        "status": "pendiente"
    })
    
    # Create staff application
    staff_applications_collection.insert_one({
        "id": "P01", "nombre": "Javier Rodriguez", "email": "javier@cam.pr",
        "telefono": "787-999-8888", "experiencia": "5 años en eventos",
        "equipo": "Sony A7IV", "especialidades": ["Evento"], "fotosReferencia": [], "status": "pendiente"
    })
    
    # Create staff users (demo + internal test account)
    staff_users_collection.insert_many([
        {
            "id": "SU001", "email": "staff@fotosexpress.com", "nombre": "Staff Demo",
            "telefono": "787-000-0000", "password_hash": hash_password("Fotosexpress@"),
            "isActive": True, "activationToken": None, "tokenExpires": None,
            "createdAt": datetime.now(timezone.utc).isoformat(), "applicationId": None
        },
        {
            "id": "SU002", "email": "ziu@fotosexpresspr.com", "nombre": "Ziu Admin",
            "telefono": "787-000-0001", "password_hash": hash_password("Fotosexpresspr01@"),
            "isActive": True, "activationToken": None, "tokenExpires": None,
            "createdAt": datetime.now(timezone.utc).isoformat(), "applicationId": None
        }
    ])
    
    # Assign SU002 to zones and activities for testing
    zones_collection.update_one({"id": "Z01"}, {"$set": {"fotografosAsignados": ["SU002"]}})
    activities_collection.update_one({"id": "A01"}, {"$set": {"fotografosAsignados": ["SU002"]}})
    
    return {"message": "Data seeded successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
