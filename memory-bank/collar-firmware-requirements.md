# Collar Firmware Requirements (Electronics Team)

## What to Change in the Collar Protocol

| Field | Old Name | New Name | Keep? |
|-------|----------|----------|-------|
| Activity byte | `ACT` | `MOV` | ✅ Yes |

---

## What `MOV` Should Be

**Movement Intensity** (0-255) — NOT activity classification.

**Simple formula to compute:**
```c
float magnitude = sqrt(accel_x² + accel_y² + accel_z²);
uint8_t MOV = (uint8_t) min(magnitude * SCALE_FACTOR, 255);
```

| MOV Value | Meaning |
|-----------|---------|
| 0-30 | Still |
| 30-80 | Slight movement |
| 80-150 | Walking |
| 150-255 | Running/Agitated |

---

## BLE Packet Structure

```
Byte 0       : MOV (movement intensity, 1 byte)
Bytes 1-6    : Raw Accelerometer (X, Y, Z as int16)
Bytes 7-12   : Raw Gyroscope (X, Y, Z as int16) - optional
```

---

## Key Points

1. ✅ **The collar ONLY computes movement magnitude** (cheap, simple math)
2. ❌ **The collar does NOT classify activities** (no ML, no patterns)
3. 📡 **Send raw IMU data** so BeagleBone/backend can do the real classification

---

**Summary:** The collar's job is just to measure motion, not to understand it. Activity classification (grazing, ruminating, resting, etc.) happens on the BeagleBone or Backend server where there is sufficient processing power for ML algorithms.
