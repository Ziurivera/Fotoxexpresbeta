from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import os
from pymongo import MongoClient
import uuid
import hashlib
import secrets

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
APP_URL = os.environ.get("APP_URL", "http://localhost:3000")
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Collections
clients_collection = db["clients"]
service_requests_collection = db["service_requests"]
staff_applications_collection = db["staff_applications"]
staff_users_collection = db["staff_users"]

# Password hashing
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

# Pydantic Models
class ClientLead(BaseModel):
    nombre: str
    telefono: str
    instagram: Optional[str] = None
    aceptaRedes: bool = False
    fotoReferencia: Optional[str] = None
    status: str = "esperando_fotos"
    atendidoPorNombre: Optional[str] = None
    fotosSubidas: Optional[List[str]] = None
    fechaRegistro: Optional[str] = None

class ClientLeadResponse(ClientLead):
    id: str

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

class PhotoUpload(BaseModel):
    clientId: str
    staffEmail: str
    fotosSubidas: List[str]

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

class StaffUserResponse(BaseModel):
    id: str
    email: str
    nombre: str
    telefono: str
    isActive: bool
    createdAt: str

# Helper to generate IDs
def generate_id(prefix: str) -> str:
    return f"{prefix}{uuid.uuid4().hex[:8].upper()}"

def generate_activation_token() -> str:
    return secrets.token_urlsafe(32)

# API Endpoints
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Fotos Express API"}

# ==================== STAFF USER AUTHENTICATION ====================

@app.post("/api/staff/approve/{staff_id}")
def approve_staff_and_create_account(staff_id: str):
    """Approve staff application and create activation link"""
    # Find staff application
    application = staff_applications_collection.find_one({"id": staff_id}, {"_id": 0})
    if not application:
        raise HTTPException(status_code=404, detail="Staff application not found")
    
    # Check if user already exists
    existing_user = staff_users_collection.find_one({"email": application["email"]})
    if existing_user:
        raise HTTPException(status_code=400, detail="User account already exists for this email")
    
    # Generate activation token
    activation_token = generate_activation_token()
    token_expires = datetime.now(timezone.utc) + timedelta(days=7)
    
    # Create staff user (inactive until they set password)
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
    
    # Update application status
    staff_applications_collection.update_one(
        {"id": staff_id},
        {"$set": {"status": "aprobado"}}
    )
    
    # Generate activation link
    activation_link = f"{APP_URL}/activar-cuenta?token={activation_token}"
    
    return {
        "message": "Staff approved successfully",
        "email": application["email"],
        "nombre": application["nombre"],
        "activationLink": activation_link,
        "activationToken": activation_token,
        "expiresIn": "7 days"
    }

@app.post("/api/staff/activate")
def activate_staff_account(activation: StaffActivation):
    """Activate staff account by setting password"""
    # Find user by activation token
    user = staff_users_collection.find_one({"activationToken": activation.token}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Invalid or expired activation token")
    
    # Check if token is expired
    token_expires = datetime.fromisoformat(user["tokenExpires"])
    if datetime.now(timezone.utc) > token_expires:
        raise HTTPException(status_code=400, detail="Activation token has expired")
    
    # Check if already activated
    if user["isActive"]:
        raise HTTPException(status_code=400, detail="Account already activated")
    
    # Validate password
    if len(activation.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    # Update user with password and activate
    staff_users_collection.update_one(
        {"activationToken": activation.token},
        {"$set": {
            "password_hash": hash_password(activation.password),
            "isActive": True,
            "activationToken": None,
            "activatedAt": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {
        "message": "Account activated successfully",
        "email": user["email"],
        "nombre": user["nombre"]
    }

@app.get("/api/staff/validate-token")
def validate_activation_token(token: str = Query(...)):
    """Validate if activation token is valid"""
    user = staff_users_collection.find_one({"activationToken": token}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Invalid activation token")
    
    # Check if token is expired
    token_expires = datetime.fromisoformat(user["tokenExpires"])
    if datetime.now(timezone.utc) > token_expires:
        raise HTTPException(status_code=400, detail="Activation token has expired")
    
    if user["isActive"]:
        raise HTTPException(status_code=400, detail="Account already activated")
    
    return {
        "valid": True,
        "email": user["email"],
        "nombre": user["nombre"]
    }

@app.post("/api/staff/login")
def staff_login(login: StaffLogin):
    """Login for staff users"""
    user = staff_users_collection.find_one({"email": login.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user["isActive"]:
        raise HTTPException(status_code=401, detail="Account not activated. Please check your email for activation link.")
    
    if not verify_password(login.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "nombre": user["nombre"],
            "telefono": user["telefono"]
        }
    }

@app.post("/api/staff/change-password")
def change_staff_password(data: StaffPasswordChange):
    """Change staff password"""
    user = staff_users_collection.find_one({"email": data.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user["isActive"]:
        raise HTTPException(status_code=400, detail="Account not activated")
    
    if not verify_password(data.currentPassword, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    
    if len(data.newPassword) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
    
    staff_users_collection.update_one(
        {"email": data.email},
        {"$set": {
            "password_hash": hash_password(data.newPassword),
            "passwordChangedAt": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Password changed successfully"}

@app.get("/api/staff/user/{email}")
def get_staff_user(email: str):
    """Get staff user profile"""
    user = staff_users_collection.find_one({"email": email}, {"_id": 0, "password_hash": 0, "activationToken": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.get("/api/staff/users")
def get_all_staff_users():
    """Get all staff users (for admin)"""
    users = list(staff_users_collection.find({}, {"_id": 0, "password_hash": 0, "activationToken": 0}))
    return users

# ==================== CLIENT LEADS ====================

@app.get("/api/clients", response_model=List[ClientLeadResponse])
def get_clients():
    clients = list(clients_collection.find({}, {"_id": 0}))
    return clients

@app.get("/api/clients/{phone}")
def get_client_by_phone(phone: str):
    client = clients_collection.find_one({"telefono": phone}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@app.post("/api/clients", response_model=ClientLeadResponse)
def create_client(client: ClientLead):
    client_dict = client.model_dump()
    client_dict["id"] = generate_id("L")
    client_dict["fechaRegistro"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    clients_collection.insert_one(client_dict)
    client_dict.pop("_id", None)
    return client_dict

@app.put("/api/clients/{client_id}")
def update_client(client_id: str, client: ClientLead):
    client_dict = client.model_dump()
    result = clients_collection.update_one(
        {"id": client_id},
        {"$set": client_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    updated = clients_collection.find_one({"id": client_id}, {"_id": 0})
    return updated

@app.delete("/api/clients/{client_id}")
def delete_client(client_id: str):
    result = clients_collection.delete_one({"id": client_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"message": "Client deleted"}

@app.post("/api/clients/{client_id}/photos")
def upload_photos(client_id: str, upload: PhotoUpload):
    result = clients_collection.update_one(
        {"id": client_id},
        {"$set": {
            "status": "atendido",
            "atendidoPorNombre": upload.staffEmail,
            "fotosSubidas": upload.fotosSubidas
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    updated = clients_collection.find_one({"id": client_id}, {"_id": 0})
    return updated

# ==================== SERVICE REQUESTS ====================

@app.get("/api/services", response_model=List[ServiceRequestResponse])
def get_services():
    services = list(service_requests_collection.find({}, {"_id": 0}))
    return services

@app.post("/api/services", response_model=ServiceRequestResponse)
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
        raise HTTPException(status_code=404, detail="Service request not found")
    return {"message": "Service deleted"}

# ==================== STAFF APPLICATIONS ====================

@app.get("/api/staff", response_model=List[StaffApplicationResponse])
def get_staff_applications():
    applications = list(staff_applications_collection.find({}, {"_id": 0}))
    return applications

@app.post("/api/staff", response_model=StaffApplicationResponse)
def create_staff_application(staff: StaffApplication):
    staff_dict = staff.model_dump()
    staff_dict["id"] = generate_id("P")
    staff_applications_collection.insert_one(staff_dict)
    staff_dict.pop("_id", None)
    return staff_dict

@app.put("/api/staff/{staff_id}/status")
def update_staff_status(staff_id: str, status: str):
    if status not in ["aprobado", "rechazado"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    result = staff_applications_collection.update_one(
        {"id": staff_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Staff application not found")
    return {"message": f"Staff status updated to {status}"}

@app.delete("/api/staff/{staff_id}")
def delete_staff_application(staff_id: str):
    result = staff_applications_collection.delete_one({"id": staff_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Staff application not found")
    return {"message": "Staff application deleted"}

# ==================== SEED DATA ====================

@app.post("/api/seed")
def seed_data():
    # Clear existing data
    clients_collection.delete_many({})
    service_requests_collection.delete_many({})
    staff_applications_collection.delete_many({})
    staff_users_collection.delete_many({})
    
    # Seed clients
    clients_collection.insert_many([
        {
            "id": "L01",
            "nombre": "Carla Rivera",
            "telefono": "3234764379",
            "instagram": "@carla.riv",
            "aceptaRedes": True,
            "status": "atendido",
            "atendidoPorNombre": "maria@fotosexpress.com",
            "fotosSubidas": [
                "https://picsum.photos/id/10/800/1000",
                "https://picsum.photos/id/11/800/1000",
                "https://picsum.photos/id/12/800/1000",
                "https://picsum.photos/id/13/800/1000",
                "https://picsum.photos/id/14/800/1000"
            ],
            "fechaRegistro": "2025-02-10"
        },
        {
            "id": "L02",
            "nombre": "Marcos Soto",
            "telefono": "7875550123",
            "instagram": "@marcos_pro",
            "aceptaRedes": False,
            "status": "esperando_fotos",
            "fechaRegistro": "2025-02-12"
        }
    ])
    
    # Seed service requests
    service_requests_collection.insert_one({
        "id": "SR01",
        "tipo": "boda",
        "detalles": {
            "locacion": "exterior",
            "descripcion": "Boda en la playa Isabela",
            "fechaEvento": "2025-05-20",
            "horas": 6,
            "personas": 100
        },
        "contacto": {
            "nombre": "Valeria Martinez",
            "telefono": "787-111-2222",
            "email": "valeria@email.com"
        },
        "status": "pendiente"
    })
    
    # Seed staff applications
    staff_applications_collection.insert_one({
        "id": "P01",
        "nombre": "Javier Rodriguez",
        "email": "javier@cam.pr",
        "telefono": "787-999-8888",
        "experiencia": "5 años en eventos sociales y bodas.",
        "equipo": "Sony A7IV, Sigma 24-70mm",
        "especialidades": ["Evento"],
        "fotosReferencia": [],
        "status": "pendiente"
    })
    
    # Seed one active staff user for testing
    staff_users_collection.insert_one({
        "id": "SU001",
        "email": "staff@fotosexpress.com",
        "nombre": "Staff Demo",
        "telefono": "787-000-0000",
        "password_hash": hash_password("Fotosexpress@"),
        "isActive": True,
        "activationToken": None,
        "tokenExpires": None,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "applicationId": None
    })
    
    return {"message": "Data seeded successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
