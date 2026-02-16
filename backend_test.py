#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class FotosExpressAPITester:
    def __init__(self, base_url="https://686b811e-993d-4293-bfa6-b6ba1d222226.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.errors = []

    def log_result(self, test_name, success, status_code=None, error_msg=None):
        """Log test result with status info"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - Status: {status_code}")
        else:
            error_info = f"Status: {status_code}" if status_code else ""
            if error_msg:
                error_info += f", Error: {error_msg}"
            print(f"❌ {test_name} - {error_info}")
            self.errors.append(f"{test_name}: {error_info}")

    def test_health_endpoint(self):
        """Test health check endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            success = response.status_code == 200
            self.log_result("Health Check", success, response.status_code)
            if success:
                data = response.json()
                print(f"   Service: {data.get('service', 'Unknown')}")
            return success
        except Exception as e:
            self.log_result("Health Check", False, error_msg=str(e))
            return False

    def test_get_clients(self):
        """Test getting clients list"""
        try:
            response = requests.get(f"{self.base_url}/api/clients", timeout=10)
            success = response.status_code == 200
            self.log_result("Get Clients", success, response.status_code)
            if success:
                clients = response.json()
                print(f"   Found {len(clients)} clients")
                for client in clients:
                    print(f"   - {client.get('nombre')} ({client.get('telefono')})")
            return success
        except Exception as e:
            self.log_result("Get Clients", False, error_msg=str(e))
            return False

    def test_get_client_by_phone(self, phone="3234764379"):
        """Test getting specific client by phone (Carla Rivera)"""
        try:
            response = requests.get(f"{self.base_url}/api/clients/{phone}", timeout=10)
            success = response.status_code == 200
            self.log_result(f"Get Client by Phone ({phone})", success, response.status_code)
            if success:
                client = response.json()
                print(f"   Client: {client.get('nombre')} - Status: {client.get('status')}")
                if client.get('fotosSubidas'):
                    print(f"   Photos: {len(client.get('fotosSubidas', []))} uploaded")
            return success
        except Exception as e:
            self.log_result(f"Get Client by Phone ({phone})", False, error_msg=str(e))
            return False

    def test_get_services(self):
        """Test getting service requests"""
        try:
            response = requests.get(f"{self.base_url}/api/services", timeout=10)
            success = response.status_code == 200
            self.log_result("Get Services", success, response.status_code)
            if success:
                services = response.json()
                print(f"   Found {len(services)} service requests")
                for service in services:
                    print(f"   - {service.get('tipo')} for {service.get('contacto', {}).get('nombre')}")
            return success
        except Exception as e:
            self.log_result("Get Services", False, error_msg=str(e))
            return False

    def test_get_staff_applications(self):
        """Test getting staff applications"""
        try:
            response = requests.get(f"{self.base_url}/api/staff", timeout=10)
            success = response.status_code == 200
            self.log_result("Get Staff Applications", success, response.status_code)
            if success:
                staff = response.json()
                print(f"   Found {len(staff)} staff applications")
                for app in staff:
                    print(f"   - {app.get('nombre')} ({app.get('email')})")
            return success
        except Exception as e:
            self.log_result("Get Staff Applications", False, error_msg=str(e))
            return False

    def test_seed_data(self):
        """Test seeding initial data"""
        try:
            response = requests.post(f"{self.base_url}/api/seed", timeout=15)
            success = response.status_code == 200
            self.log_result("Seed Data", success, response.status_code)
            if success:
                print("   Initial data seeded successfully")
            return success
        except Exception as e:
            self.log_result("Seed Data", False, error_msg=str(e))
            return False

    def test_create_client(self):
        """Test creating a new client"""
        test_client = {
            "nombre": "Test Cliente",
            "telefono": "7879999999",
            "instagram": "@testclient",
            "aceptaRedes": True
        }
        try:
            response = requests.post(
                f"{self.base_url}/api/clients",
                json=test_client,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            success = response.status_code == 200
            self.log_result("Create Client", success, response.status_code)
            if success:
                client = response.json()
                print(f"   Created client: {client.get('id')} - {client.get('nombre')}")
                return client.get('id')
            return None
        except Exception as e:
            self.log_result("Create Client", False, error_msg=str(e))
            return None

    def test_create_service_request(self):
        """Test creating a new service request"""
        test_service = {
            "tipo": "evento_social",
            "detalles": {
                "locacion": "exterior",
                "descripcion": "Fiesta de cumpleaños",
                "fechaEvento": "2025-03-15",
                "horas": 4,
                "personas": 50
            },
            "contacto": {
                "nombre": "Test Cliente Service",
                "telefono": "787-888-9999",
                "email": "test@service.com"
            }
        }
        try:
            response = requests.post(
                f"{self.base_url}/api/services",
                json=test_service,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            success = response.status_code == 200
            self.log_result("Create Service Request", success, response.status_code)
            if success:
                service = response.json()
                print(f"   Created service: {service.get('id')} - {service.get('tipo')}")
                return service.get('id')
            return None
        except Exception as e:
            self.log_result("Create Service Request", False, error_msg=str(e))
            return None

    def run_all_tests(self):
        """Run comprehensive API tests"""
        print("🧪 Starting Fotos Express API Tests")
        print("=" * 50)
        
        # Basic health and connectivity
        if not self.test_health_endpoint():
            print("❌ Health check failed - stopping tests")
            return False

        # Seed initial data
        self.test_seed_data()
        
        # Test read operations
        self.test_get_clients()
        self.test_get_client_by_phone("3234764379")  # Carla Rivera test phone
        self.test_get_services()
        self.test_get_staff_applications()
        
        # Test create operations
        new_client_id = self.test_create_client()
        new_service_id = self.test_create_service_request()
        
        # Print summary
        print("=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.errors:
            print("❌ Errors found:")
            for error in self.errors:
                print(f"   - {error}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        return success_rate >= 80

def main():
    tester = FotosExpressAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())