import requests
import json
import time
from datetime import datetime
import random

# Configuration
BACKEND_URL = "http://localhost:3001/api/collars/data"
HEADERS = {'Content-Type': 'application/json'}

def parse_lora_packet(raw_string):
    """
    Simulates parsing the raw LoRa string from the UART port.
    Format: ID=9920;BATT=3.70;TEMP=45.0;HUM=54.9;TB=0.00;...
    """
    print(f"\n[BeagleBone] 📡 Received LoRa Packet: {raw_string}")
    
    parts = raw_string.split(';')
    data = {}
    
    for part in parts:
        if '=' in part:
            key, value = part.split('=')
            data[key] = value
            
    # Map raw fields to backend schema
    # Note: SIMULATING extraction of timestamp from DAT/TIM or using current time
    timestamp = datetime.utcnow().isoformat() + "Z"
    
    # Parse Lat/Lon (remove N/W/E/S and convert)
    lat_raw = data.get('LAT', '0N')
    lon_raw = data.get('LON', '0E')
    
    lat = float(lat_raw[:-1]) * (1 if lat_raw.endswith('N') else -1)
    lon = float(lon_raw[:-1]) * (1 if lat_raw.endswith('E') else -1)

    parsed_data = {
        "collar_id": int(data.get('ID', 0)),
        "timestamp": timestamp,
        "latitude": lat,
        "longitude": lon,
        "battery_voltage": float(data.get('BATT', 0)),
        "body_temp": float(data.get('TB', 0)),
        "env_temp": float(data.get('TEMP', 0)),
        "env_humidity": float(data.get('HUM', 0)),
        "roll": float(data.get('R', 0)),
        "pitch": float(data.get('P', 0)),
        "yaw": float(data.get('Y', 0)),
        # Adding new sensors mentioned
        "heart_rate": random.randint(50, 80), # Simulating sensor data not in raw string example yet
        "spo2": random.randint(95, 100)
    }
    
    return parsed_data

def send_to_backend(payload):
    """
    Sends parsed data to Node.js backend and checks for config.
    """
    print(f"[BeagleBone] 🚀 Sending HTTP POST to {BACKEND_URL}...")
    try:
        response = requests.post(BACKEND_URL, json=payload, headers=HEADERS)
        print(f"[BeagleBone] ⬅️ Response Code: {response.status_code}")
        
        if response.status_code in [200, 201]:
            response_json = response.json()
            # print(f"[BeagleBone] Response Body: {response_json}")
            
            # CHECK FOR PENDING CONFIG (The RX Window Logic)
            if 'pending_config' in response_json:
                new_id = response_json['pending_config'].get('new_id')
                print(f"[BeagleBone] ⚠️ CONFIG RECEIVED! New Collar ID: {new_id}")
                print(f"[BeagleBone] 🔄 Switching LoRa to TX... Sending new ID {new_id} to collar...")
                
                # Simulate confirming the ID change
                if new_id:
                     confirm_id_change(payload['collar_id'], new_id)
            else:
                print(f"[BeagleBone] ✅ No pending config. Sleeping...")
        else:
            print(f"[BeagleBone] ❌ Error: {response.text}")
            
    except Exception as e:
        print(f"[BeagleBone] 💥 Connection Failed: {e}")

def confirm_id_change(old_id, new_id):
    """
    Simulates the BeagleBone confirming to the backend that the collar accepted the new ID.
    (This usually happens after the collar ACKS the new config, but we simulate it immediately here)
    """
    confirm_url = f"http://localhost:3001/api/collars/{old_id}/confirm-new-id"
    print(f"[BeagleBone] 📝 Confirming ID change to backend...")
    try:
        requests.post(confirm_url, json={'new_id': new_id})
        print(f"[BeagleBone] ✅ ID Change Confirmed.")
    except Exception as e:
        print(f"[BeagleBone] ❌ Confirmation Failed: {e}")

if __name__ == "__main__":
    # 1. Simulate a NEW/UNASSIGNED collar (ID=9999)
    print("--- SCENARIO 1: New Collar Discovery ---")
    # Using Reghaïa coordinates roughly
    raw_packet_new = "ID=9999;BATT=3.70;TEMP=25.0;HUM=54.9;TB=38.5;TA=25.0;DAT=061225;TIM=100000;LAT=36.7359N;LON=3.34018E;R=5.5;P=1.2;Y=120.0;ACT=GRAZING"
    parsed_new = parse_lora_packet(raw_packet_new)
    send_to_backend(parsed_new)
    
    print("\n" + "="*50 + "\n")
    
    # 2. Simulate an EXISTING/ACTIVE collar (ID=101)
    print("--- SCENARIO 2: Existing Collar Update ---")
    raw_packet_old = "ID=101;BATT=3.65;TEMP=26.0;HUM=50.0;TB=38.2;TA=26.0;DAT=061225;TIM=100010;LAT=36.7360N;LON=3.34020E;R=2.0;P=0.5;Y=122.0;ACT=STANDING"
    parsed_old = parse_lora_packet(raw_packet_old)
    send_to_backend(parsed_old)

    print("\n[BeagleBone] Simulation Cycle Complete.")
