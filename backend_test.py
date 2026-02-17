#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime

class FotosExpressAPITester:
    def __init__(self):
        self.base_url = "https://photo-portal-13.preview.emergentagent.com"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
            self.failed_tests.append(f"{name}: {details}")
            
    def run_test(self, name, method, endpoint, expected_status, data=None, auth_header=None):
        """Run a single API test"""
        url = f"{self.base_url}/api{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if auth_header:
            headers.update(auth_header)
            
        try:
            print(f"\n🔍 Testing {name}...")
            
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
                
            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json() if response.text else {}
                except:
                    return True, {}
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_data = response.json()
                    error_msg += f" - {error_data}"
                except:
                    error_msg += f" - Response: {response.text[:200]}"
                    
                self.log_test(name, False, error_msg)
                return False, {}
                
        except Exception as e:
            self.log_test(name, False, str(e))
            return False, {}
    
    def test_health_check(self):
        """Test API health endpoint"""
        return self.run_test("Health Check", "GET", "/health", 200)
    
    def test_zones_api(self):
        """Test zones CRUD operations"""
        print("\n" + "="*50)
        print("TESTING ZONES API")
        print("="*50)
        
        # Get zones
        success, zones = self.run_test("Get Zones", "GET", "/zones", 200)
        
        # Get active zones
        self.run_test("Get Active Zones", "GET", "/zones/active", 200)
        
        return success and len(zones) > 0
    
    def test_businesses_api(self):
        """Test businesses CRUD operations"""
        print("\n" + "="*50)
        print("TESTING BUSINESSES API")
        print("="*50)
        
        # Get businesses
        success, businesses = self.run_test("Get Businesses", "GET", "/businesses", 200)
        
        # Get active businesses
        self.run_test("Get Active Businesses", "GET", "/businesses/active", 200)
        
        return success and len(businesses) > 0
    
    def test_activities_api(self):
        """Test activities CRUD operations"""
        print("\n" + "="*50)
        print("TESTING ACTIVITIES API")
        print("="*50)
        
        # Get activities
        success, activities = self.run_test("Get Activities", "GET", "/activities", 200)
        
        # Get active activities
        self.run_test("Get Active Activities", "GET", "/activities/active", 200)
        
        if activities and len(activities) > 0:
            # Test activities by business
            business_id = activities[0].get('negocioId')
            if business_id:
                self.run_test("Get Activities by Business", "GET", f"/activities/business/{business_id}", 200)
        
        return success and len(activities) > 0
    
    def test_ambulant_clients_api(self):
        """Test ambulant clients API"""
        print("\n" + "="*50)
        print("TESTING AMBULANT CLIENTS API")
        print("="*50)
        
        # Get ambulant clients
        success, clients = self.run_test("Get Ambulant Clients", "GET", "/ambulant-clients", 200)
        
        if clients and len(clients) > 0:
            client = clients[0]
            zone_id = client.get('zonaId')
            phone = client.get('telefono')
            
            if zone_id:
                self.run_test("Get Ambulant Clients by Zone", "GET", f"/ambulant-clients/zone/{zone_id}", 200)
            
            if phone:
                self.run_test("Get Ambulant Client by Phone", "GET", f"/ambulant-clients/phone/{phone}", 200)
        
        return success
    
    def test_activity_clients_api(self):
        """Test activity clients API"""
        print("\n" + "="*50)
        print("TESTING ACTIVITY CLIENTS API")
        print("="*50)
        
        # Get activity clients
        success, clients = self.run_test("Get Activity Clients", "GET", "/activity-clients", 200)
        
        if clients and len(clients) > 0:
            client = clients[0]
            activity_id = client.get('actividadId')
            phone = client.get('telefono')
            negocio_id = client.get('negocioId')
            
            if activity_id:
                self.run_test("Get Activity Clients by Activity", "GET", f"/activity-clients/activity/{activity_id}", 200)
            
            if phone:
                endpoint = f"/activity-clients/phone/{phone}"
                if negocio_id:
                    endpoint += f"?negocioId={negocio_id}"
                if activity_id:
                    endpoint += f"&actividadId={activity_id}" if "?" in endpoint else f"?actividadId={activity_id}"
                self.run_test("Get Activity Client by Phone", "GET", endpoint, 200)
        
        return success
    
    def test_staff_users_api(self):
        """Test staff users API"""
        print("\n" + "="*50)
        print("TESTING STAFF USERS API")
        print("="*50)
        
        # Get staff users
        success, users = self.run_test("Get Staff Users", "GET", "/staff/users", 200)
        
        # Test specific user lookup (ziu@fotosexpresspr.com should exist)
        self.run_test("Get Staff User by Email", "GET", "/staff/user/ziu@fotosexpresspr.com", 200)
        
        return success and len(users) > 0
    
    def test_staff_login(self):
        """Test staff login functionality"""
        print("\n" + "="*50)
        print("TESTING STAFF LOGIN")
        print("="*50)
        
        # Test valid login
        login_data = {
            "email": "ziu@fotosexpresspr.com",
            "password": "Fotosexpresspr01@"
        }
        success, response = self.run_test("Staff Login (Valid)", "POST", "/staff/login", 200, login_data)
        
        if success and response:
            user = response.get('user', {})
            print(f"   Logged in as: {user.get('nombre', 'Unknown')}")
            print(f"   Assigned zones: {len(user.get('zonasAsignadas', []))}")
            print(f"   Assigned activities: {len(user.get('actividadesAsignadas', []))}")
            
            # Store user ID for staff-specific tests
            self.staff_user_id = user.get('id')
        
        # Test invalid login
        invalid_login = {
            "email": "ziu@fotosexpresspr.com",
            "password": "wrongpassword"
        }
        self.run_test("Staff Login (Invalid)", "POST", "/staff/login", 401, invalid_login)
        
        # Test demo staff login
        demo_login = {
            "email": "staff@fotosexpress.com",
            "password": "Fotosexpress@"
        }
        self.run_test("Demo Staff Login", "POST", "/staff/login", 200, demo_login)
        
        return success
    
    def test_staff_specific_clients(self):
        """Test staff can only see their assigned clients"""
        print("\n" + "="*50)
        print("TESTING STAFF RESTRICTED ACCESS")
        print("="*50)
        
        if not hasattr(self, 'staff_user_id') or not self.staff_user_id:
            print("⚠️  Skipping staff-specific tests - no valid staff user ID")
            return False
        
        # Test ambulant clients for staff
        success1, ambulant = self.run_test(
            "Get Staff Ambulant Clients", 
            "GET", 
            f"/ambulant-clients/staff/{self.staff_user_id}", 
            200
        )
        
        # Test activity clients for staff  
        success2, activity = self.run_test(
            "Get Staff Activity Clients",
            "GET", 
            f"/activity-clients/staff/{self.staff_user_id}",
            200
        )
        
        if ambulant:
            print(f"   Staff has {len(ambulant)} ambulant clients")
        if activity:
            print(f"   Staff has {len(activity)} activity clients")
        
        return success1 and success2
    
    def test_services_api(self):
        """Test service requests API"""
        print("\n" + "="*50)
        print("TESTING SERVICE REQUESTS API")
        print("="*50)
        
        success, services = self.run_test("Get Service Requests", "GET", "/services", 200)
        return success
    
    def test_staff_applications_api(self):
        """Test staff applications API"""
        print("\n" + "="*50)
        print("TESTING STAFF APPLICATIONS API")
        print("="*50)
        
        success, applications = self.run_test("Get Staff Applications", "GET", "/staff", 200)
        return success
    
    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 STARTING FOTOS EXPRESS API TESTS")
        print("="*60)
        
        try:
            # Health check first
            if not self.test_health_check()[0]:
                print("\n❌ API is not healthy, stopping tests")
                return False
            
            # Core API tests
            self.test_zones_api()
            self.test_businesses_api()
            self.test_activities_api()
            self.test_ambulant_clients_api()
            self.test_activity_clients_api()
            self.test_services_api()
            self.test_staff_applications_api()
            
            # Staff-specific tests
            self.test_staff_users_api()
            if self.test_staff_login():
                self.test_staff_specific_clients()
            
        except Exception as e:
            print(f"\n💥 Test suite error: {str(e)}")
            return False
        
        # Results
        print("\n" + "="*60)
        print("📊 TEST RESULTS")
        print("="*60)
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"Tests passed: {self.tests_passed}/{self.tests_run} ({success_rate:.1f}%)")
        
        if self.failed_tests:
            print(f"\n❌ Failed tests:")
            for failure in self.failed_tests:
                print(f"  - {failure}")
        else:
            print("\n✅ All tests passed!")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = FotosExpressAPITester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()