# MESSAI ML Service Quick Start

## 🚀 Start the Service (2 Options)

### Option 1: Quick Python Start

```bash
cd services/ml-engine
python start_service.py
```

### Option 2: Docker (Production-like)

```bash
# From project root
docker-compose -f docker-compose.ml.yml up
```

## 🧪 Test the Service

```bash
# In another terminal
cd services/ml-engine
python test_local.py
```

## ✅ Expected Output

You should see:

- Health check: ✅
- Available models: 4 models (3 OPEM + 1 MFC)
- PEM prediction: Working with OPEM
- MFC prediction: Working with empirical model
- Materials API: Working (if API key set)

## 🔧 Troubleshooting

### Missing packages?

```bash
pip install -r requirements.txt
```

### Port already in use?

```bash
# Change port in start_service.py or use:
ML_SERVICE_PORT=8002 python start_service.py
```

### OPEM import error?

```bash
pip install opem --upgrade
```

## 📊 What's Working Now

1. **MFC/MEC/MDC Predictions**: Using empirical Logan et al. correlations
2. **PEM/SOFC/PAFC Predictions**: Using validated OPEM models
3. **Optimization Recommendations**: Based on system type
4. **Confidence Scoring**: Based on input completeness
5. **Model Routing**: Automatic selection based on system type

## 🎯 Next Steps

1. Connect frontend to use ML service
2. Add Materials Project API key for enhanced predictions
3. Integrate JLab LSTM models
4. Add research paper training data
