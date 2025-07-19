# MESSAI ML Engine

Machine Learning service for MESSAI.AI predictions, integrating physics-based
models (OPEM) and custom ML models for microbial electrochemical systems.

## Quick Start

### Local Development

1. **Install dependencies**:

```bash
cd services/ml-engine
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Set up environment**:

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Run the service**:

```bash
python app.py
# or
uvicorn app:app --reload --port 8001
```

4. **Test the service**:

```bash
python test_local.py
```

### Docker Development

```bash
# Start all services
docker-compose -f docker-compose.ml.yml up

# Or just the ML service
docker-compose -f docker-compose.ml.yml up ml-engine
```

## API Endpoints

### Health Check

- `GET /health` - Basic health check
- `GET /health/ready` - Readiness probe
- `GET /health/status` - Detailed system status

### Predictions

- `POST /api/ml/predict` - Generate single prediction
- `POST /api/ml/batch-predict` - Batch predictions (up to 100)
- `GET /api/ml/models` - List available models

### Example Request

```bash
curl -X POST http://localhost:8001/api/ml/predict \
  -H "Content-Type: application/json" \
  -d '{
    "system_type": "PEM",
    "configuration": {
      "reactor_volume": 100.0,
      "electrode_spacing": 2.0,
      "num_chambers": 2
    },
    "conditions": {
      "temperature": 353.15,
      "ph": 7.0,
      "pressure": 3.0
    },
    "materials": {
      "anode_material": "Platinum",
      "cathode_material": "Platinum",
      "membrane_type": "Nafion",
      "anode_surface_area": 50.0,
      "cathode_surface_area": 50.0
    }
  }'
```

## Available Models

### OPEM Models (Fuel Cells)

- **Amphlett**: Static PEM fuel cell model
- **Larminie-Dicks**: Simplified PEM model
- **Chamberline-Kim**: Alternative static model

### Coming Soon

- MFC LSTM models (from JLab)
- Custom ensemble models
- NLP-based parameter extraction

## Architecture

```
ml-engine/
├── app.py              # FastAPI application
├── api/                # API endpoints
│   ├── predict.py      # Prediction endpoints
│   ├── health.py       # Health checks
│   └── schemas.py      # Request/response schemas
├── models/             # ML model implementations
│   ├── base.py         # Base predictor interface
│   ├── opem_wrapper.py # OPEM integration
│   └── model_manager.py # Model lifecycle management
├── data/               # Data processing
├── utils/              # Utilities
└── tests/              # Test suite
```

## Integration with MESSAI Frontend

The ML service integrates seamlessly with the existing MESSAI frontend:

1. Frontend continues using existing TypeScript interfaces
2. API proxy at `/api/ml/predict` forwards requests to ML service
3. Fallback to simulation if ML service is unavailable

## Environment Variables

See `.env.example` for all configuration options:

- `ML_PORT`: Service port (default: 8001)
- `ML_DATABASE_URL`: PostgreSQL connection
- `ML_REDIS_URL`: Redis cache connection
- `ML_LOG_LEVEL`: Logging level

## Development Guidelines

1. **Adding New Models**:

   - Extend `BasePredictor` class
   - Implement `predict()`, `preprocess()`, and `postprocess()`
   - Register in `ModelManager`

2. **Testing**:

   ```bash
   pytest tests/
   pytest tests/ --cov=.
   ```

3. **Code Quality**:
   ```bash
   black .
   flake8 .
   mypy .
   ```

## Monitoring

- Prometheus metrics at `/metrics`
- Structured JSON logging
- Health endpoints for container orchestration

## Troubleshooting

### OPEM Import Error

If you get import errors for OPEM:

```bash
pip install --upgrade opem
```

### Port Already in Use

```bash
lsof -i :8001  # Find process using port
kill -9 <PID>  # Kill the process
```

### Database Connection Issues

Ensure PostgreSQL is running and accessible:

```bash
docker-compose -f docker-compose.ml.yml up postgres
```
