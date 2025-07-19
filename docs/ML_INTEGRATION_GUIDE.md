# ML Integration Guide for MESSAI Agent Developers

## 🎯 Overview

MESSAI has both a simulation engine and a real ML service. This guide explains
how to verify which one is being used and how to work with the ML integration.

## 🔍 How to Know if ML is Being Used

### 1. Check the Browser Console

When ML is enabled, you'll see:

```javascript
console.log('Using ML Service:', process.env.NEXT_PUBLIC_USE_ML_SERVICE);
// Output: "Using ML Service: true"
```

### 2. Check the Network Tab

**Simulation Engine (Default)**:

- No external API calls
- All calculations happen in the browser
- No requests to `/api/ml/predict`

**ML Service (When Enabled)**:

- Network request to: `http://localhost:3000/api/ml/predict`
- Response includes `model_type` field
- Processing time visible in response

### 3. Check the Prediction Response

**Simulation Response**:

```json
{
  "id": "pred_123...",
  "powerOutput": 150,
  "efficiency": 45,
  "confidence": { "overall": 0.85 }
  // NO model_type field
}
```

**ML Service Response**:

```json
{
  "prediction_id": "uuid...",
  "power_output": { "value": 1.5, "unit": "mW/cm²" },
  "efficiency": { "value": 35, "unit": "%" },
  "model_type": "empirical_mfc", // ← This indicates ML
  "model_version": "1.0.0", // ← This too
  "confidence_score": 0.85
}
```

### 4. Visual Indicators in UI

Look for these indicators in the prediction results:

- **Model Badge**: Shows "ML: empirical_mfc" or "ML: OPEM_amphlett"
- **Processing Time**: ML shows actual server processing time
- **Confidence Visualization**: ML has more detailed confidence breakdowns

## 🏗️ Architecture Overview

```
User → Frontend → API Route → ML Service → Model → Response
         ↓                                            ↓
    (simulation)                               (if ML fails)
```

### Key Files

1. **Frontend Engine Selection**:

   - `/apps/web/src/app/predictions/page.tsx` - Chooses engine based on env
   - `/apps/web/src/lib/prediction-engine.ts` - Simulation engine
   - `/apps/web/src/lib/prediction-engine-ml.ts` - ML client

2. **API Route**:

   - `/apps/web/src/app/api/ml/predict/route.ts` - Forwards to ML service

3. **ML Service**:
   - `/services/ml-engine/app.py` - FastAPI service
   - `/services/ml-engine/models/` - Model implementations

## 🚀 Quick Start for Developers

### 1. Enable ML in Development

```bash
# Terminal 1: Start ML Service
cd services/ml-engine
./quickstart.sh

# Terminal 2: Enable ML in Frontend
cd apps/web
echo "NEXT_PUBLIC_USE_ML_SERVICE=true" >> .env.local
pnpm dev
```

### 2. Test ML is Working

```bash
# Test ML service directly
curl -X POST http://localhost:8001/api/ml/predict \
  -H "Content-Type: application/json" \
  -d '{
    "system_type": "MFC",
    "configuration": {
      "reactor_volume": 100,
      "electrode_spacing": 2,
      "num_chambers": 2
    },
    "conditions": {
      "temperature": 303.15,
      "ph": 7.0,
      "substrate_concentration": 10,
      "pressure": 1.0
    },
    "materials": {
      "anode_material": "carbon_cloth",
      "cathode_material": "platinum",
      "anode_surface_area": 100,
      "cathode_surface_area": 100
    }
  }'
```

### 3. Verify in Frontend

1. Open browser DevTools
2. Go to Network tab
3. Make a prediction
4. Look for request to `/api/ml/predict`
5. Check response has `model_type` field

## 📊 ML Models Available

### MFC/MEC/MDC Systems

- **Model**: `empirical_mfc`
- **Based on**: Logan et al. (2019) correlations
- **Features**: Substrate, temperature, pH, materials
- **Confidence**: 0.75-0.95

### PEM/SOFC/PAFC Systems

- **Models**: `OPEM_amphlett`, `OPEM_larminie`, `OPEM_chamberline`
- **Based on**: Validated OPEM equations
- **Features**: Pressure, temperature, catalyst loading
- **Confidence**: 0.80-0.95

## 🛠️ Development Workflow

### Adding New Models

1. Create model in `/services/ml-engine/models/`
2. Register in `model_manager.py`
3. Map system types to model
4. Test with `test_local.py`

### Debugging ML Integration

1. **Check ML Service Logs**:

   ```bash
   # In ML service terminal, you'll see:
   {"event": "Prediction request", "system_type": "MFC", ...}
   {"event": "Using model", "model_id": "empirical_mfc", ...}
   ```

2. **Check Frontend Console**:

   ```javascript
   // Add to prediction-engine-ml.ts
   console.log('ML Request:', mlRequest);
   console.log('ML Response:', mlResponse);
   ```

3. **Check API Route**:
   ```typescript
   // In /api/ml/predict/route.ts
   console.log('Forwarding to ML service:', ML_SERVICE_URL);
   ```

## 🔄 Switching Between Simulation and ML

### Use Simulation (Default)

```bash
NEXT_PUBLIC_USE_ML_SERVICE=false
# or just remove the line from .env.local
```

### Use ML Service

```bash
NEXT_PUBLIC_USE_ML_SERVICE=true
```

### Runtime Detection

```typescript
// In your code
const isUsingML = process.env.NEXT_PUBLIC_USE_ML_SERVICE === 'true';
console.log(`Using ${isUsingML ? 'ML' : 'Simulation'} engine`);
```

## 📈 Performance Comparison

| Metric      | Simulation      | ML Service         |
| ----------- | --------------- | ------------------ |
| Latency     | <50ms           | 100-200ms          |
| Accuracy    | ~70%            | ~85%               |
| Scalability | Browser limited | Server scalable    |
| Offline     | ✅ Works        | ❌ Needs service   |
| Updates     | Redeploy app    | Update models only |

## 🐛 Common Issues

### ML Service Not Starting

```bash
# Check Python version
python --version  # Need 3.8+

# Install in virtual environment
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend Not Using ML

```bash
# Verify environment variable
grep USE_ML .env.local
# Should show: NEXT_PUBLIC_USE_ML_SERVICE=true

# Restart Next.js
pnpm dev
```

### CORS Errors

```bash
# Check ML service allows frontend origin
grep ALLOWED_ORIGINS services/ml-engine/.env
# Should include http://localhost:3000
```

## 🎯 Best Practices

1. **Always provide fallback**: ML service might be down
2. **Log model type**: Track which model made predictions
3. **Monitor latency**: Set timeouts for ML calls
4. **Cache predictions**: Same inputs = same outputs
5. **Version your models**: Track which version made predictions

## 📚 Further Reading

- [ML Strategy Document](./ML_STRATEGY.md)
- [API Documentation](http://localhost:8001/docs)
- [Model Implementations](../services/ml-engine/models/)
- [Research Papers Used](./RESEARCH_PAPERS.md)
