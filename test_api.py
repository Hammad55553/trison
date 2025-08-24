#!/usr/bin/env python3
"""
Simple test script to verify FastAPI endpoints are working
"""

import requests
import json

# API base URL (ngrok)
BASE_URL = "https://78a5583fa550.ngrok-free.app/api/v1"

def test_health():
    """Test the health endpoint"""
    try:
        response = requests.get(f"{BASE_URL.replace('/api/v1', '')}/health")
        print(f"✅ Health check: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_root():
    """Test the root endpoint"""
    try:
        response = requests.get(f"{BASE_URL.replace('/api/v1', '')}/")
        print(f"✅ Root endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Root endpoint failed: {e}")
        return False

def test_send_otp():
    """Test sending OTP"""
    try:
        data = {"phone_number": "+1234567890"}
        response = requests.post(f"{BASE_URL}/auth/send-otp", json=data)
        print(f"✅ Send OTP: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Send OTP failed: {e}")
        return False

def test_api_docs():
    """Test API documentation"""
    try:
        response = requests.get(f"{BASE_URL.replace('/api/v1', '')}/docs")
        print(f"✅ API docs: {response.status_code}")
        print(f"   Available at: {BASE_URL.replace('/api/v1', '')}/docs")
        return True
    except Exception as e:
        print(f"❌ API docs failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing FastAPI Backend via ngrok")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health),
        ("Root Endpoint", test_root),
        ("Send OTP", test_send_otp),
        ("API Documentation", test_api_docs),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Testing: {test_name}")
        print("-" * 30)
        if test_func():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} passed")
    
    if passed == total:
        print("🎉 All tests passed! Your API is working correctly.")
    else:
        print("⚠️  Some tests failed. Check your backend configuration.")
    
    print(f"\n🌐 Your API is accessible at: {BASE_URL}")
    print(f"📖 API Documentation: {BASE_URL.replace('/api/v1', '')}/docs")

if __name__ == "__main__":
    main() 