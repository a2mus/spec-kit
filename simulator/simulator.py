import requests
import time
import random
from datetime import datetime

# The backend service is available at http://backend:3001 from other containers,
# but from your host machine, you need to use localhost and the mapped port.
SERVER_URL = "http://localhost:3001/api/collars/data"

# Simulate collars with starting positions in Reghaïa, Algeria (near Algiers)
# Slightly offset starting points to avoid overlapping markers
collars = {
    9920: {"LAT": 36.7359, "LON": 3.34018},
    9921: {"LAT": 36.7365, "LON": 3.33850},
    9930: {"LAT": 36.7348, "LON": 3.34150},
}

print("--- Starting Cattle Collar Simulator ---")
print(f"--- Sending data to: {SERVER_URL} ---")

def parse_payload(payload_string: str) -> dict:
    """
    Parses the semicolon-delimited payload string from the collar
    and returns a clean dictionary with corrected data types.
    """
    data = {}
    parts = payload_string.strip().split(';')
    for part in parts:
        if '=' in part:
            key, value = part.split('=', 1)
            data[key.strip()] = value.strip()

    cleaned_data = {}
    
    cleaned_data['collar_id'] = int(data.get('ID', 0))
    cleaned_data['battery_voltage'] = float(data.get('BATT', 0.0))
    cleaned_data['env_temp'] = float(data.get('TEMP', 0.0))
    cleaned_data['env_humidity'] = float(data.get('HUM', 0.0))
    cleaned_data['body_temp'] = float(data.get('TB', 0.0))
    cleaned_data['body_env_temp'] = float(data.get('TA', 0.0))
    cleaned_data['roll'] = float(data.get('R', 0.0))
    cleaned_data['pitch'] = float(data.get('P', 0.0))
    cleaned_data['yaw'] = float(data.get('Y', 0.0))
    cleaned_data['activity'] = data.get('ACT', 'UNKNOWN')

    lat_str = data.get('LAT', '0.0N')
    lon_str = data.get('LON', '0.0W')
    
    lat_val = float(lat_str[:-1])
    if lat_str.endswith('S'):
        lat_val *= -1
    
    lon_val = float(lon_str[:-1])
    if lon_str.endswith('W'):
        lon_val *= -1
        
    cleaned_data['latitude'] = lat_val
    cleaned_data['longitude'] = lon_val

    date_str = data.get('DAT', '010100') # DDMMYY
    time_str = data.get('TIM', '000000') # HHMMSS
    timestamp_str = f"{date_str}{time_str}"
    
    try:
        dt_object = datetime.strptime(timestamp_str, '%d%m%y%H%M%S')
        cleaned_data['timestamp'] = dt_object.strftime('%Y-%m-%dT%H:%M:%SZ')
    except ValueError:
        cleaned_data['timestamp'] = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')

    return cleaned_data


while True:
    for collar_id, pos in collars.items():
        # Simulate slight random movement
        pos["LAT"] += random.uniform(-0.0002, 0.0002)
        pos["LON"] += random.uniform(-0.0002, 0.0002)

        # Simulate other sensor data
        battery = round(random.uniform(3.5, 4.2), 2)
        body_temp = round(random.uniform(38.1, 39.3), 2)
        activity = random.choice(["STANDING", "GRAZING", "RUMINATING", "WALKING"])
        now = datetime.utcnow()

        # Build the raw payload string, exactly like the hardware would
        raw_payload = (
            f"ID={collar_id};BATT={battery:.2f};TEMP=15.5;HUM=60.1;TB={body_temp:.2f};TA=15.6;"
            f"DAT={now.strftime('%d%m%y')};TIM={now.strftime('%H%M%S')};"
            f"LAT={abs(pos['LAT']):.6f}{'N' if pos['LAT'] >= 0 else 'S'};"
            f"LON={abs(pos['LON']):.6f}{'E' if pos['LON'] >= 0 else 'W'};"
            f"R=0.0;P=0.0;Y=0.0;ACT={activity}"
        )
        
        # Use the parser function to create the clean JSON object
        parsed_data = parse_payload(raw_payload)
        
        try:
            print(f"Sending data for collar {collar_id}...")
            # print(parsed_data) # Uncomment to see the JSON being sent
            response = requests.post(SERVER_URL, json=parsed_data, timeout=5)
            response.raise_for_status() # Raise an exception for bad status codes
            print(f" -> Success (Status: {response.status_code})")
        except requests.exceptions.RequestException as e:
            print(f" -> FAILED to send data: {e}")
            
    # Wait before sending the next round of updates
    print(f"\n--- Waiting for 20 seconds ---\n")
    time.sleep(20)
