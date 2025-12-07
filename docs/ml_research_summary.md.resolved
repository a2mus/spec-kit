# ML Models for Advanced Livestock Activity Detection

## Executive Summary

This research document analyzes machine learning approaches for detecting complex livestock activities from IMU sensor data on your backend system. Your architecture (BeagleBone for basic classification → Backend for advanced ML) aligns well with academic research showing that sophisticated temporal analysis requires more computational resources.

---

## 1. ML Algorithm Comparison

### 1.1 Traditional ML Approaches

| Algorithm | Accuracy | Pros | Cons | Best For |
|-----------|----------|------|------|----------|
| **Random Forest** | 73-87% | Handles non-linear relationships, robust to overfitting, interpretable feature importance | Limited temporal pattern capture | Grazing, general activity states |
| **SVM** | 71-85% | Efficient with limited data, high-dimensional handling | Struggles with very large datasets | Standing/lying classification |
| **XGBoost** | 75-90% | State-of-the-art for tabular data, handles imbalance well | Requires hyperparameter tuning | Foraging behaviors, health prediction |
| **KNN** | 65-80% | Simple, no training needed | Slow inference, sensitive to noise | Quick prototyping |

### 1.2 Deep Learning Approaches

| Model | Accuracy | Pros | Cons | Best For |
|-------|----------|------|------|----------|
| **LSTM/RNN** | 90-97% | Captures long-term temporal dependencies, handles variable-length sequences | Computationally expensive, needs more data | Rumination, feeding patterns, estrus |
| **CNN-1D** | 85-95% | Fast inference, learns hierarchical features automatically | Less effective for very long sequences | Short-term pattern recognition |
| **CNN-LSTM Hybrid** | 92-98% | Best of both worlds: spatial + temporal | Complex to tune, highest resource needs | Complex multi-behavior classification |
| **Transformer** | 88-95% | Parallelizable, attention mechanisms | Demanding data/compute requirements | Health anomaly prediction |

> [!TIP]
> **Recommended Priority**: Start with **Random Forest** for rapid iteration, then upgrade to **LSTM** for behaviors requiring temporal context (rumination, estrus, health anomalies).

---

## 2. Activity-Specific Analysis

### 2.1 Rumination Detection

**Behavioral Signature:** Rhythmic head bobbing + jaw movement patterns (60-80 chews/minute)

| Feature Type | Specific Features | Importance |
|--------------|-------------------|------------|
| Accelerometer | Z-axis std dev (vertical oscillation) | ★★★★★ |
| Gyroscope | Yaw rotation frequency | ★★★★☆ |
| Orientation | Pitch mean (head tilt) | ★★★★☆ |
| Temporal | Periodicity in 5-15 min windows | ★★★★★ |

**Best Model:** LSTM (captures 60-cycle/min chewing periodicity)  
**Time Window:** 5-minute windows with 30-second overlap  
**Reported Accuracy:** 94-98% with deep learning

---

### 2.2 Grazing Detection

**Behavioral Signature:** Head-down posture + periodic step-bite-step patterns

| Feature Type | Specific Features | Importance |
|--------------|-------------------|------------|
| Orientation | Pitch mean (negative = head down) | ★★★★★ |
| Accelerometer | X-axis variance (forward motion) | ★★★★☆ |
| Movement | Intensity 50-120 range (slow walking) | ★★★☆☆ |
| Temporal | Duration consistency (grazing bouts 15-45 min) | ★★★★☆ |

**Best Model:** Random Forest (high accuracy: 87%+)  
**Time Window:** 15-minute aggregations  
**Key Insight:** Head orientation (pitch) is the most discriminative feature

---

### 2.3 Estrus/Heat Detection

**Behavioral Signature:** Increased restlessness over 12-24 hours, mounting behavior, reduced lying time

| Feature Type | Specific Features | Importance |
|--------------|-------------------|------------|
| Movement | Hour-over-hour activity change % | ★★★★★ |
| Temporal | Reduced lying duration | ★★★★★ |
| Accelerometer | Sudden high-G events (mounting) | ★★★★☆ |
| Pattern | Deviation from individual baseline | ★★★★★ |

> [!IMPORTANT]
> **Class Imbalance Challenge:** Estrus occurs ~12-18 hours every 21 days. Use:
> - **SMOTE** (Synthetic Minority Over-sampling)
> - **Anomaly detection framing** (treat as deviation from normal)
> - **Time-weighted sampling** (oversample estrus windows)

**Best Model:** LSTM with attention mechanism OR Isolation Forest (anomaly-based)  
**Time Window:** 1-hour aggregations, analyzed over 24-48 hour periods  
**Reported Accuracy:** 85-92% sensitivity, 90%+ specificity

---

### 2.4 Sleeping vs. Resting Detection

**Behavioral Signature:** Near-zero movement, specific posture (lateral recumbency), duration >30 min

| Feature Type | Specific Features | Importance |
|--------------|-------------------|------------|
| Accelerometer | All-axis std dev near zero | ★★★★★ |
| Orientation | Roll angle (lateral vs sternal) | ★★★★★ |
| Movement | Intensity < 10 for extended periods | ★★★★☆ |
| Duration | Bout length > 30 minutes | ★★★★☆ |

**Best Model:** Random Forest with engineered features  
**Time Window:** 15-30 minute windows  
**Key Insight:** Roll angle differentiates lateral lying (deep sleep) from sternal lying (light rest)

---

### 2.5 Health Issue Detection

**Behavioral Signature:** Gradual deviation from individual baseline patterns

| Anomaly Type | Key Indicators | Detection Window |
|--------------|----------------|------------------|
| Lameness | Reduced walking, asymmetric gait | 24-48 hours |
| Mastitis | Reduced activity, changes in lying patterns | 12-24 hours before clinical signs |
| Respiratory | Reduced rumination, increased resting | 2-3 days before clinical signs |
| Ketosis | Decreased feeding time, lethargy | 3-7 days before clinical signs |

**Best Model:** Isolation Forest + LSTM ensemble  
**Approach:** Learn individual animal baselines → detect statistical deviations  
**Time Window:** Rolling 7-day baseline, hourly anomaly checks

---

## 3. Feature Engineering Recommendations

### 3.1 From Your 5-Minute Activity Windows

```
Raw Features (from BeagleBone):
├── Accelerometer: mean_x, mean_y, mean_z, std_x, std_y, std_z
├── Gyroscope: mean_x, mean_y, mean_z, std_x, std_y, std_z
├── Orientation: roll, pitch, yaw
├── Movement intensity (0-255)
└── Basic activity label

Derived Features (compute on backend):
├── magnitude_accel = sqrt(mean_x² + mean_y² + mean_z²)
├── magnitude_gyro = sqrt(mean_x² + mean_y² + mean_z²)
├── total_variance = std_x + std_y + std_z
├── signal_magnitude_area = |mean_x| + |mean_y| + |mean_z|
├── orientation_change_rate (from consecutive windows)
├── activity_change_from_previous_window
└── rolling_stats (1h, 4h, 24h moving averages)
```

### 3.2 Multi-Scale Time Windows

| Scale | Duration | Aggregation | Use Case |
|-------|----------|-------------|----------|
| Short | 5 min (raw) | None | Basic events |
| Medium | 15-30 min | Rolling mean/std | Rumination, grazing |
| Long | 1-4 hours | Trend analysis | Estrus, daily patterns |
| Very Long | 24h+ | Deviation from baseline | Health anomalies |

---

## 4. Open Datasets for Training

### 4.1 Recommended Datasets

| Dataset | Source | Contents | Best For |
|---------|--------|----------|----------|
| [MmCows](https://github.com/collaborativemllab/MmCows) | Purdue University | IMU, UWB, temp, images from 10 Holstein cows | Multimodal training |
| [Figshare Cattle Sensor Data](https://figshare.com) | Figshare | Accel/gyro at 1, 3, 5-sec bins, 29 features | General activity |
| [Frontiers Grazing Dataset](https://www.frontiersin.org) | Frontiers Research | Labeled walking/grazing/resting | Lameness, grazing |
| [AcTBeCalf](https://zenodo.org) | Zenodo | 23 calf behaviors, accelerometer | Early life behaviors |

### 4.2 Creating Your Own Dataset

Since your system will generate labeled data from BeagleBone, you can bootstrap:

1. **Use basic labels as ground truth** for initial model training
2. **Active learning**: Flag uncertain predictions for manual review
3. **Transfer learning**: Pre-train on open datasets, fine-tune on your data

---

## 5. Academic References

### Key Papers

| Topic | Reference | Key Finding |
|-------|-----------|-------------|
| General Survey | *"Sensors for Health Monitoring in Cattle"* (MDPI 2023) | Comprehensive sensor comparison |
| Rumination LSTM | *"Deep Learning for Dairy Cattle Rumination Detection"* (arXiv) | 97.8% accuracy with LSTM |
| Estrus Detection | *"Estrus Detection Using ML and Accelerometers"* (NIH/PMC) | 90%+ sensitivity with RF |
| Behavior Classification | *"Cattle Behavior Classification from Accelerometer Data"* (CIGR) | RF vs CNN comparison |
| Health Prediction | *"Early Disease Detection in Cattle Using Sensor Data"* (Frontiers) | 2-day advance prediction |

### Research Groups

- **Iowa State University** - Precision Livestock Farming Lab
- **Purdue University** - Smart Farm Research (MmCows dataset authors)
- **Wageningen University** - Animal Production Systems
- **CSIRO Australia** - Digital Agriculture

---

## 6. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Implement feature engineering pipeline from 5-min windows
- [ ] Set up database tables for ML predictions
- [ ] Train initial Random Forest models for:
  - Grazing vs. other
  - Rumination detection
- [ ] Establish baseline accuracy metrics

### Phase 2: Advanced Models (Weeks 3-4)
- [ ] Implement sliding window aggregations (15min, 1h, 24h)
- [ ] Train LSTM model for rumination time-series
- [ ] Build individual animal baseline tracking
- [ ] Implement Isolation Forest for anomaly detection

### Phase 3: Estrus & Health (Weeks 5-6)
- [ ] Implement class imbalance handling (SMOTE, weighted loss)
- [ ] Train estrus detection model (24-48h patterns)
- [ ] Build health deviation scoring system
- [ ] Set up alert thresholds and notification system

### Phase 4: Production (Weeks 7-8)
- [ ] Optimize model inference speed
- [ ] Implement model versioning and A/B testing
- [ ] Create dashboard for activity visualization
- [ ] Set up retraining pipeline with new labeled data

---

## 7. Practical Recommendations

### Model Selection Strategy

```mermaid
flowchart TD
    A[Incoming Activity Window] --> B{Behavior Type?}
    B -->|Simple spatial| C[Random Forest]
    B -->|Temporal pattern| D[LSTM]
    B -->|Rare event| E[Anomaly Detection]
    
    C --> F[Grazing, Standing, Lying]
    D --> G[Rumination, Feeding patterns]
    E --> H[Estrus, Health issues]
    
    F --> I[Immediate classification]
    G --> J[5-15 min windows needed]
    H --> K[24h+ observation needed]
```

### Training Data Requirements

| Behavior | Minimum Samples | Recommended | Animals Needed |
|----------|-----------------|-------------|----------------|
| Grazing | 1,000 | 5,000+ | 10-20 |
| Rumination | 2,000 | 10,000+ | 10-20 |
| Estrus | 50-100 cycles | 200+ cycles | 20-50 |
| Health anomalies | 20-50 cases | 100+ cases | Varies |

### Evaluation Metrics

> [!CAUTION]
> **Do NOT use accuracy alone!** For imbalanced classes like estrus:
> - Use **Precision, Recall, F1-score** per class
> - Use **Macro-averaged F1** for overall performance
> - Track **False Positive Rate** (avoid alert fatigue)

---

## 8. Technology Stack Recommendation

### Python Libraries

```python
# Traditional ML
scikit-learn  # Random Forest, SVM, preprocessing
xgboost       # Gradient boosting
imbalanced-learn  # SMOTE, class imbalance handling

# Deep Learning
tensorflow/keras  # LSTM, CNN
pytorch          # Alternative (more research-friendly)

# Time Series
tsfresh      # Automated feature extraction
prophet      # Trend detection
tslearn      # Time series classification

# Anomaly Detection
pyod         # Outlier detection algorithms
```

### Integration with Your Backend

```javascript
// Node.js backend integration options:
// 1. Python microservice (Flask/FastAPI) for ML
// 2. ONNX model export for Node.js inference
// 3. TensorFlow.js for in-process inference
```

---

## Summary: What to Build First

1. **Start with Random Forest** for grazing and basic activity differentiation
2. **Add LSTM** for rumination detection (highest value, achievable accuracy)
3. **Implement rolling baseline** for health monitoring
4. **Tackle estrus last** (requires most data, longest observation windows)

Your 5-minute activity windows are well-suited for this approach—you'll want to aggregate them into longer windows (15min–24h) on the backend for temporal pattern analysis.
