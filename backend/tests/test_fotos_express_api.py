"""
Fotos Express API Tests
Test all CRUD operations for:
- Zones (ambulant areas)
- Businesses
- Activities
- Ambulant Clients
- Activity Clients
- Staff Login/Authentication
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://photo-portal-13.preview.emergentagent.com')


class TestHealthCheck:
    """Basic API health check"""
    
    def test_health_endpoint(self):
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")


class TestZonesAPI:
    """Zone (ambulant areas) API tests"""
    
    def test_get_all_zones(self):
        response = requests.get(f"{BASE_URL}/api/zones")
        assert response.status_code == 200
        zones = response.json()
        assert isinstance(zones, list)
        print(f"✓ GET /api/zones returned {len(zones)} zones")
    
    def test_get_active_zones(self):
        response = requests.get(f"{BASE_URL}/api/zones/active")
        assert response.status_code == 200
        zones = response.json()
        assert isinstance(zones, list)
        # Verify all returned zones are active
        for zone in zones:
            assert zone.get("activa") == True
        print(f"✓ GET /api/zones/active returned {len(zones)} active zones")
    
    def test_create_zone(self):
        payload = {
            "nombre": "TEST_Zona_Nueva",
            "descripcion": "Zona de prueba automatizada",
            "activa": True,
            "fotografosAsignados": []
        }
        response = requests.post(f"{BASE_URL}/api/zones", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["nombre"] == payload["nombre"]
        print(f"✓ POST /api/zones created zone with id: {data['id']}")
        return data["id"]
    
    def test_create_and_delete_zone(self):
        # Create
        payload = {
            "nombre": "TEST_Zona_Para_Borrar",
            "descripcion": "Zona temporal",
            "activa": True,
            "fotografosAsignados": []
        }
        create_res = requests.post(f"{BASE_URL}/api/zones", json=payload)
        assert create_res.status_code == 200
        zone_id = create_res.json()["id"]
        
        # Verify exists
        get_res = requests.get(f"{BASE_URL}/api/zones")
        zones = get_res.json()
        assert any(z["id"] == zone_id for z in zones)
        
        # Delete
        del_res = requests.delete(f"{BASE_URL}/api/zones/{zone_id}")
        assert del_res.status_code == 200
        print(f"✓ Zone {zone_id} created and deleted successfully")


class TestBusinessesAPI:
    """Business API tests"""
    
    def test_get_all_businesses(self):
        response = requests.get(f"{BASE_URL}/api/businesses")
        assert response.status_code == 200
        businesses = response.json()
        assert isinstance(businesses, list)
        print(f"✓ GET /api/businesses returned {len(businesses)} businesses")
    
    def test_get_active_businesses(self):
        response = requests.get(f"{BASE_URL}/api/businesses/active")
        assert response.status_code == 200
        businesses = response.json()
        assert isinstance(businesses, list)
        for biz in businesses:
            assert biz.get("activo") == True
        print(f"✓ GET /api/businesses/active returned {len(businesses)} active businesses")
    
    def test_create_business(self):
        payload = {
            "nombre": "TEST_Negocio_Nuevo",
            "direccion": "Calle Test 123",
            "telefono": "787-123-4567",
            "activo": True
        }
        response = requests.post(f"{BASE_URL}/api/businesses", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["nombre"] == payload["nombre"]
        print(f"✓ POST /api/businesses created business with id: {data['id']}")
        return data["id"]
    
    def test_create_and_delete_business(self):
        # Create
        payload = {
            "nombre": "TEST_Negocio_Temporal",
            "direccion": "Direccion Temporal",
            "telefono": "787-000-0000",
            "activo": True
        }
        create_res = requests.post(f"{BASE_URL}/api/businesses", json=payload)
        assert create_res.status_code == 200
        business_id = create_res.json()["id"]
        
        # Delete
        del_res = requests.delete(f"{BASE_URL}/api/businesses/{business_id}")
        assert del_res.status_code == 200
        print(f"✓ Business {business_id} created and deleted successfully")


class TestActivitiesAPI:
    """Activity API tests"""
    
    def test_get_all_activities(self):
        response = requests.get(f"{BASE_URL}/api/activities")
        assert response.status_code == 200
        activities = response.json()
        assert isinstance(activities, list)
        # Verify each activity has business name populated
        for act in activities:
            assert "negocioNombre" in act
        print(f"✓ GET /api/activities returned {len(activities)} activities")
    
    def test_get_active_activities(self):
        response = requests.get(f"{BASE_URL}/api/activities/active")
        assert response.status_code == 200
        activities = response.json()
        assert isinstance(activities, list)
        for act in activities:
            assert act.get("activa") == True
            assert "negocioNombre" in act
        print(f"✓ GET /api/activities/active returned {len(activities)} active activities")
    
    def test_get_activities_by_business(self):
        # First get a business to use
        businesses = requests.get(f"{BASE_URL}/api/businesses").json()
        if businesses:
            business_id = businesses[0]["id"]
            response = requests.get(f"{BASE_URL}/api/activities/business/{business_id}")
            assert response.status_code == 200
            activities = response.json()
            assert isinstance(activities, list)
            print(f"✓ GET /api/activities/business/{business_id} returned {len(activities)} activities")
    
    def test_create_activity(self):
        # First ensure we have a business
        businesses = requests.get(f"{BASE_URL}/api/businesses").json()
        if not businesses:
            pytest.skip("No businesses available")
        
        business_id = businesses[0]["id"]
        payload = {
            "nombre": "TEST_Actividad_Nueva",
            "negocioId": business_id,
            "descripcion": "Actividad de prueba",
            "activa": True,
            "fotografosAsignados": []
        }
        response = requests.post(f"{BASE_URL}/api/activities", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["nombre"] == payload["nombre"]
        assert "negocioNombre" in data
        print(f"✓ POST /api/activities created activity with id: {data['id']}")
        return data["id"]


class TestAmbulantClientsAPI:
    """Ambulant Clients API tests"""
    
    def test_get_all_ambulant_clients(self):
        response = requests.get(f"{BASE_URL}/api/ambulant-clients")
        assert response.status_code == 200
        clients = response.json()
        assert isinstance(clients, list)
        for client in clients:
            assert "zonaNombre" in client
        print(f"✓ GET /api/ambulant-clients returned {len(clients)} clients")
    
    def test_get_ambulant_clients_for_staff(self):
        """Test staff-filtered ambulant clients endpoint"""
        staff_id = "SU002"  # Ziu's staff ID
        response = requests.get(f"{BASE_URL}/api/ambulant-clients/staff/{staff_id}")
        assert response.status_code == 200
        clients = response.json()
        assert isinstance(clients, list)
        print(f"✓ GET /api/ambulant-clients/staff/{staff_id} returned {len(clients)} clients")
    
    def test_create_ambulant_client(self):
        # Get an active zone first
        zones = requests.get(f"{BASE_URL}/api/zones/active").json()
        if not zones:
            pytest.skip("No active zones available")
        
        zone_id = zones[0]["id"]
        payload = {
            "nombre": "TEST_Cliente_Ambulante",
            "telefono": "7879999888",
            "instagram": "@testclient",
            "aceptaPublicidad": True,
            "zonaId": zone_id,
            "status": "esperando_fotos"
        }
        response = requests.post(f"{BASE_URL}/api/ambulant-clients", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["nombre"] == payload["nombre"]
        assert data["telefono"] == payload["telefono"]
        assert "zonaNombre" in data
        assert "fechaRegistro" in data
        print(f"✓ POST /api/ambulant-clients created client with id: {data['id']}")
        return data["id"]
    
    def test_get_ambulant_clients_by_zone(self):
        zones = requests.get(f"{BASE_URL}/api/zones/active").json()
        if not zones:
            pytest.skip("No active zones available")
        
        zone_id = zones[0]["id"]
        response = requests.get(f"{BASE_URL}/api/ambulant-clients/zone/{zone_id}")
        assert response.status_code == 200
        clients = response.json()
        assert isinstance(clients, list)
        print(f"✓ GET /api/ambulant-clients/zone/{zone_id} returned {len(clients)} clients")


class TestActivityClientsAPI:
    """Activity Clients API tests"""
    
    def test_get_all_activity_clients(self):
        response = requests.get(f"{BASE_URL}/api/activity-clients")
        assert response.status_code == 200
        clients = response.json()
        assert isinstance(clients, list)
        for client in clients:
            assert "negocioNombre" in client
            assert "actividadNombre" in client
        print(f"✓ GET /api/activity-clients returned {len(clients)} clients")
    
    def test_get_activity_clients_for_staff(self):
        """Test staff-filtered activity clients endpoint"""
        staff_id = "SU002"  # Ziu's staff ID
        response = requests.get(f"{BASE_URL}/api/activity-clients/staff/{staff_id}")
        assert response.status_code == 200
        clients = response.json()
        assert isinstance(clients, list)
        print(f"✓ GET /api/activity-clients/staff/{staff_id} returned {len(clients)} clients")
    
    def test_create_activity_client(self):
        # Get an active business and activity
        businesses = requests.get(f"{BASE_URL}/api/businesses/active").json()
        activities = requests.get(f"{BASE_URL}/api/activities/active").json()
        
        if not businesses or not activities:
            pytest.skip("No active businesses or activities")
        
        business_id = businesses[0]["id"]
        activity_id = activities[0]["id"]
        
        payload = {
            "nombre": "TEST_Cliente_Actividad",
            "telefono": "7878887777",
            "negocioId": business_id,
            "actividadId": activity_id,
            "status": "esperando_fotos"
        }
        response = requests.post(f"{BASE_URL}/api/activity-clients", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["nombre"] == payload["nombre"]
        assert "negocioNombre" in data
        assert "actividadNombre" in data
        assert "fechaRegistro" in data
        print(f"✓ POST /api/activity-clients created client with id: {data['id']}")
        return data["id"]
    
    def test_get_activity_clients_by_activity(self):
        activities = requests.get(f"{BASE_URL}/api/activities/active").json()
        if not activities:
            pytest.skip("No active activities")
        
        activity_id = activities[0]["id"]
        response = requests.get(f"{BASE_URL}/api/activity-clients/activity/{activity_id}")
        assert response.status_code == 200
        clients = response.json()
        assert isinstance(clients, list)
        print(f"✓ GET /api/activity-clients/activity/{activity_id} returned {len(clients)} clients")


class TestStaffAuthentication:
    """Staff login and authentication tests"""
    
    def test_staff_login_success(self):
        """Test login with valid credentials (ziu@fotosexpresspr.com)"""
        payload = {
            "email": "ziu@fotosexpresspr.com",
            "password": "Fotosexpresspr01@"
        }
        response = requests.post(f"{BASE_URL}/api/staff/login", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Login successful"
        assert "user" in data
        assert data["user"]["email"] == payload["email"]
        assert data["user"]["id"] == "SU002"
        assert "zonasAsignadas" in data["user"]
        assert "actividadesAsignadas" in data["user"]
        print(f"✓ Staff login successful for {payload['email']}")
        print(f"  - ID: {data['user']['id']}")
        print(f"  - Zones assigned: {len(data['user']['zonasAsignadas'])}")
        print(f"  - Activities assigned: {len(data['user']['actividadesAsignadas'])}")
    
    def test_staff_login_invalid_password(self):
        """Test login with wrong password"""
        payload = {
            "email": "ziu@fotosexpresspr.com",
            "password": "wrongpassword"
        }
        response = requests.post(f"{BASE_URL}/api/staff/login", json=payload)
        assert response.status_code == 401
        print("✓ Staff login correctly rejected with wrong password")
    
    def test_staff_login_nonexistent_user(self):
        """Test login with non-existent email"""
        payload = {
            "email": "nonexistent@example.com",
            "password": "anypassword"
        }
        response = requests.post(f"{BASE_URL}/api/staff/login", json=payload)
        assert response.status_code == 401
        print("✓ Staff login correctly rejected for non-existent user")


class TestStaffUsersAPI:
    """Staff users management tests"""
    
    def test_get_staff_users(self):
        response = requests.get(f"{BASE_URL}/api/staff/users")
        assert response.status_code == 200
        users = response.json()
        assert isinstance(users, list)
        # Verify password fields are not exposed
        for user in users:
            assert "password_hash" not in user
            assert "activationToken" not in user
        print(f"✓ GET /api/staff/users returned {len(users)} users")
    
    def test_get_staff_user_by_email(self):
        response = requests.get(f"{BASE_URL}/api/staff/user/ziu@fotosexpresspr.com")
        assert response.status_code == 200
        user = response.json()
        assert user["email"] == "ziu@fotosexpresspr.com"
        assert "zonasAsignadas" in user
        assert "actividadesAsignadas" in user
        print(f"✓ GET /api/staff/user/ziu@fotosexpresspr.com returned user data")


class TestStaffAssignment:
    """Staff assignment to zones and activities"""
    
    def test_assign_staff_to_zone(self):
        """Test assigning staff to a zone"""
        zones = requests.get(f"{BASE_URL}/api/zones").json()
        if not zones:
            pytest.skip("No zones available")
        
        # Use Z02 (Condado) which may not have staff assigned
        zone_id = "Z02"
        payload = {"staffIds": ["SU002"]}
        
        response = requests.put(f"{BASE_URL}/api/zones/{zone_id}/staff", json=payload)
        assert response.status_code == 200
        
        # Verify assignment
        verify_res = requests.get(f"{BASE_URL}/api/zones")
        zones = verify_res.json()
        zone = next((z for z in zones if z["id"] == zone_id), None)
        assert zone is not None
        assert "SU002" in zone.get("fotografosAsignados", [])
        print(f"✓ Staff assigned to zone {zone_id}")
    
    def test_assign_staff_to_activity(self):
        """Test assigning staff to an activity"""
        activities = requests.get(f"{BASE_URL}/api/activities").json()
        if not activities:
            pytest.skip("No activities available")
        
        # Use A02 which may not have staff assigned
        activity_id = "A02"
        payload = {"staffIds": ["SU002"]}
        
        response = requests.put(f"{BASE_URL}/api/activities/{activity_id}/staff", json=payload)
        assert response.status_code == 200
        
        # Verify assignment
        verify_res = requests.get(f"{BASE_URL}/api/activities")
        activities = verify_res.json()
        activity = next((a for a in activities if a["id"] == activity_id), None)
        assert activity is not None
        assert "SU002" in activity.get("fotografosAsignados", [])
        print(f"✓ Staff assigned to activity {activity_id}")


class TestServiceRequestsAPI:
    """Service requests (cotizaciones) API tests"""
    
    def test_get_service_requests(self):
        response = requests.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200
        services = response.json()
        assert isinstance(services, list)
        print(f"✓ GET /api/services returned {len(services)} requests")


class TestStaffApplicationsAPI:
    """Staff applications (reclutamiento) API tests"""
    
    def test_get_staff_applications(self):
        response = requests.get(f"{BASE_URL}/api/staff")
        assert response.status_code == 200
        applications = response.json()
        assert isinstance(applications, list)
        print(f"✓ GET /api/staff returned {len(applications)} applications")
    
    def test_create_staff_application(self):
        payload = {
            "nombre": "TEST_Fotografo_Nuevo",
            "email": "test.fotografo@example.com",
            "telefono": "+1 787-555-0000",
            "experiencia": "3 años en eventos",
            "equipo": "Canon R5",
            "especialidades": ["Bodas", "Eventos"],
            "fotosReferencia": [],
            "status": "pendiente"
        }
        response = requests.post(f"{BASE_URL}/api/staff", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["nombre"] == payload["nombre"]
        print(f"✓ POST /api/staff created application with id: {data['id']}")


# Cleanup test data
class TestCleanup:
    """Cleanup test-created data"""
    
    def test_cleanup_test_zones(self):
        zones = requests.get(f"{BASE_URL}/api/zones").json()
        for zone in zones:
            if zone.get("nombre", "").startswith("TEST_"):
                requests.delete(f"{BASE_URL}/api/zones/{zone['id']}")
                print(f"  Deleted test zone: {zone['id']}")
        print("✓ Test zones cleaned up")
    
    def test_cleanup_test_businesses(self):
        businesses = requests.get(f"{BASE_URL}/api/businesses").json()
        for biz in businesses:
            if biz.get("nombre", "").startswith("TEST_"):
                requests.delete(f"{BASE_URL}/api/businesses/{biz['id']}")
                print(f"  Deleted test business: {biz['id']}")
        print("✓ Test businesses cleaned up")
    
    def test_cleanup_test_ambulant_clients(self):
        clients = requests.get(f"{BASE_URL}/api/ambulant-clients").json()
        for client in clients:
            if client.get("nombre", "").startswith("TEST_"):
                requests.delete(f"{BASE_URL}/api/ambulant-clients/{client['id']}")
                print(f"  Deleted test ambulant client: {client['id']}")
        print("✓ Test ambulant clients cleaned up")
    
    def test_cleanup_test_activity_clients(self):
        clients = requests.get(f"{BASE_URL}/api/activity-clients").json()
        for client in clients:
            if client.get("nombre", "").startswith("TEST_"):
                requests.delete(f"{BASE_URL}/api/activity-clients/{client['id']}")
                print(f"  Deleted test activity client: {client['id']}")
        print("✓ Test activity clients cleaned up")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
