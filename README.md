# Smart SDG Tunisia Geoportal

A comprehensive geospatial platform for monitoring Sustainable Development Goals (SDGs) in Tunisia using satellite imagery, AI-powered analysis, and interactive data visualization.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Data Processing Pipeline](#data-processing-pipeline)
- [API Documentation](#api-documentation)
- [User Guide](#user-guide)
- [Development](#development)
- [Contributing](#contributing)

## Overview

The Smart SDG Tunisia Geoportal is an advanced web-based platform designed to monitor, analyze, and visualize Sustainable Development Goals across Tunisia using satellite-derived indices. The platform combines geospatial data processing, interactive mapping, time series analysis, and AI-powered interpretation to provide researchers, policymakers, and the public with comprehensive insights into environmental and social indicators.

### Key Capabilities

- **Multi-Temporal Analysis**: Track changes over time with 300+ time series data points
- **Interactive Mapping**: Explore spatial patterns with Leaflet.js-powered maps
- **AI-Powered Insights**: Get intelligent data interpretation using Google Gemini
- **Boundary Analysis**: Analyze data within administrative regions (governorates, delegations, municipalities, sectors)
- **Scientific Visualization**: 20+ professional colormaps for accurate data representation
- **Real-Time Processing**: Efficient raster data processing and visualization

## Features

### Core Functionality

- **📊 Interactive Dashboard**
  - SDG-based data organization
  - Multi-dataset comparison
  - Responsive design for all devices

- **🗺️ Advanced Mapping**
  - Leaflet.js integration
  - Custom image overlays
  - Pixel-level data inspection
  - Coordinate transformation support

- **📈 Time Series Analysis**
  - Temporal trend visualization
  - Chart.js interactive charts
  - Custom date range selection
  - Statistical analysis tools

- **🤖 AI Interpretation**
  - Google Gemini integration
  - Context-aware analysis
  - Multi-turn conversations
  - Data interpretation assistance

- **📁 Data Management**
  - ZIP file upload processing
  - Automated metadata extraction
  - Colormap application
  - Spatial indexing

### Analysis Tools

1. **Pixel Selection**: Click any point to extract exact values
2. **Time Analysis**: View temporal trends for specific locations
3. **Boundary Analysis**: Aggregate data within administrative boundaries
4. **Layer Comparison**: Compare different datasets and time periods

## 🛠 Technology Stack

### Backend

```
┌─────────────────────────────────────────────────────────────┐
│                    Django 5.1.1 Framework                    │
├─────────────────────────────────────────────────────────────┤
│  • PostgreSQL Database (Spatial Data Storage)                │
│  • Rasterio (Geospatial Raster I/O)                          │
│  • NumPy (Numerical Computing)                               │
│  • Shapely (Geometric Operations)                            │
│  • PyProj (Coordinate Transformations)                       │
│  • Pillow (Image Processing)                                 │
│  • Google Gemini API (AI Analysis)                           │
└─────────────────────────────────────────────────────────────┘
```

### Frontend

```
┌─────────────────────────────────────────────────────────────┐
│                   Modern Web Technologies                    │
├─────────────────────────────────────────────────────────────┤
│  • Leaflet.js (Interactive Mapping)                         │
│  • Chart.js (Data Visualization)                            │
│  • Bootstrap 5 (UI Components)                              │
│  • Custom CSS/SCSS (Styling)                                 │
│  • JavaScript ES6+ (Client Logic)                           │
└─────────────────────────────────────────────────────────────┘
```

### Dependencies

```
Django==5.1.1
psycopg2-binary==2.9.9
rasterio==1.3.9
numpy==1.26.3
shapely==2.0.2
pyproj==3.6.1
google-generativeai==0.3.2
```

## 🏗 System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE LAYER                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Home Page  │  │  Maps View   │  │Data Explorer │  │  Upload UI   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Login/Signup│  │   Research   │  │   Projects   │  │   Contact    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DJANGO APPLICATION LAYER                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         URL Routing                                   │   │
│  │  geoportal/urls.py → SDGtunisia/urls.py                               │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                      │                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         View Controllers                               │   │
│  │  • map_view, maps_view                                                │   │
│  │  • upload_view, data_explorer_view                                    │   │
│  │  • timeseries, get_pixel_value                                        │   │
│  │  • clip_tile_by_boundary                                              │   │
│  │  • chat_api, log_analysis_data                                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                      │                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         Business Logic                                 │   │
│  │  • processor.py (ZIP processing, raster transformation)               │   │
│  │  • colormaps.py (20+ scientific colormaps)                            │   │
│  │  • forms.py (User authentication)                                     │   │
│  │  • backends.py (Email/Username authentication)                        │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         Database Models                               │   │
│  │  • Dataset (name, colormap, SDG, description)                        │   │
│  │  • RasterTile (spatial/temporal metadata)                             │   │
│  │  • Conversation (AI chat history)                                     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                      │                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         File Storage                                  │   │
│  │  • media/datasets/{name}/tifs/ (Original GeoTIFFs)                     │   │
│  │  • media/datasets/{name}/pngs/ (Rendered visualizations)              │   │
│  │  • media/uploads/ (Temporary upload storage)                          │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                      │                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         PostgreSQL Database                           │   │
│  │  • Spatial indexing                                                   │   │
│  │  • Metadata storage                                                   │   │
│  │  • User management                                                    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │────▶│   Django    │────▶│  Processor  │────▶│  File System │
│  Interface  │     │    Views    │     │   Module    │     │   Storage   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │                   │
       │                   ▼                   ▼                   │
       │            ┌─────────────┐     ┌─────────────┐          │
       │            │  PostgreSQL │     │  Rasterio   │          │
       │            │  Database   │     │   Library   │          │
       │            └─────────────┘     └─────────────┘          │
       │                   │                   │                   │
       │                   └───────────────────┴───────────────────┘
       │                                           │
       ▼                                           ▼
┌─────────────┐                             ┌─────────────┐
│   Leaflet   │◀────────────────────────────│   PNG Files │
│     Map     │     Rendered Visualizations │  (Output)   │
└─────────────┘                             └─────────────┘
```

## Installation

### Prerequisites

- Python 3.8+
- PostgreSQL 12+
- GDAL library
- PROJ library

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd geoportal
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure PostgreSQL**
```sql
CREATE DATABASE geoportal;
CREATE USER postgres WITH PASSWORD 'azerty123';
GRANT ALL PRIVILEGES ON DATABASE geoportal TO postgres;
```

5. **Configure environment variables**
Edit `geoportal/settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'geoportal',
        'USER': 'postgres',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

GEMINI_API_KEY = 'your_gemini_api_key'
```

6. **Run migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

7. **Create superuser**
```bash
python manage.py createsuperuser
```

8. **Run development server**
```bash
python manage.py runserver
```

9. **Access the application**
Open browser at `http://127.0.0.1:8000`

## Project Structure

```
geoportal/
├── geoportal/                    # Django project configuration
│   ├── __init__.py
│   ├── asgi.py                   # ASGI configuration
│   ├── settings.py               # Project settings
│   ├── urls.py                   # Main URL routing
│   └── wsgi.py                   # WSGI configuration
│
├── SDGtunisia/                   # Main Django application
│   ├── __init__.py
│   ├── admin.py                  # Admin interface
│   ├── apps.py                   # App configuration
│   ├── backends.py               # Custom authentication
│   ├── colormaps.py              # Scientific colormap library
│   ├── forms.py                  # User forms
│   ├── migrations/               # Database migrations
│   ├── models.py                 # Database models
│   ├── processor.py              # Data processing pipeline
│   ├── tests.py                  # Unit tests
│   ├── urls.py                   # App URL routing
│   └── views.py                  # View controllers
│
├── templates/                    # HTML templates
│   ├── base.html                 # Base template
│   ├── index.html                # Homepage
│   ├── maps.html                 # Interactive maps
│   ├── upload.html               # Data upload interface
│   ├── data-explorer.html        # Data catalog
│   ├── login.html                # Login page
│   ├── signup.html               # Registration page
│   ├── contact.html              # Contact page
│   ├── projects.html             # Projects page
│   └── research.html             # Research page
│
├── static/                       # Static files
│   ├── css/                      # Stylesheets
│   ├── js/                       # JavaScript files
│   ├── img/                      # Images
│   ├── fonts/                    # Font files
│   ├── scss/                     # SCSS source files
│   ├── data/                     # GeoJSON boundary files
│   └── demo/                     # Demo assets
│
├── media/                        # User-uploaded media
│   ├── datasets/                 # Processed datasets
│   │   ├── NDVI/                 # Vegetation index data
│   │   │   ├── tifs/            # Original GeoTIFF files
│   │   │   └── pngs/            # Rendered visualizations
│   │   ├── CDI/                  # Crop drought index
│   │   ├── LST/                  # Land surface temperature
│   │   └── uploads/              # Temporary uploads
│
├── manage.py                     # Django management script
├── requirements.txt               # Python dependencies
├── add_ramp_cards2.py           # Utility script
├── PIPELINE_SCHEMA_CURRENT.md    # Detailed pipeline documentation
└── README.md                     # This file
```

## 🔄 Data Processing Pipeline

### Upload and Processing Flow

```
┌─────────────┐
│   User      │
│  Uploads    │
│   ZIP File  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Django    │
│   Upload    │
│    View     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Save to   │
│ media/uploads│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Processor  │
│  process_zip│
└──────┬──────┘
       │
       ├─────────────────────────────────────────┐
       │                                         │
       ▼                                         ▼
┌─────────────┐                           ┌─────────────┐
│   Create    │                           │   Extract   │
│  Dataset    │                           │   ZIP to    │
│   Record    │                           │   tifs/     │
└──────┬──────┘                           └──────┬──────┘
       │                                         │
       └──────────────────┬──────────────────────┘
                          │
                          ▼
                 ┌─────────────┐
                 │  For Each   │
                 │   TIFF File │
                 └──────┬──────┘
                        │
       ┌────────────────┼────────────────┐
       │                │                │
       ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Parse     │  │   Open      │  │ Transform  │
│  Filename   │  │  with       │  │  WGS84 →    │
│             │  │  Rasterio   │  │ Web Mercator│
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
                        ▼
                 ┌─────────────┐
                 │  Calculate  │
                 │  Min/Max    │
                 │   Values    │
                 └──────┬──────┘
                        │
                        ▼
                 ┌─────────────┐
                 │  Normalize  │
                 │  to [0-1]   │
                 └──────┬──────┘
                        │
                        ▼
                 ┌─────────────┐
                 │  Apply      │
                 │  Colormap   │
                 └──────┬──────┘
                        │
                        ▼
                 ┌─────────────┐
                 │  Save PNG   │
                 │  with Alpha │
                 └──────┬──────┘
                        │
                        ▼
                 ┌─────────────┐
                 │  Create     │
                 │  RasterTile │
                 │   Record    │
                 └─────────────┘
```

### Filename Parsing Convention

The system expects TIFF files in the format:
```
{INDEX_NAME}_Tunisia_{YEAR}_{MONTH}.tif
```

Examples:
- `NDVI_Tunisia_2023_11.tif` → NDVI, November 2023
- `CDI_Tunisia_2000_02.tif` → CDI, February 2000
- `LST_Tunisia_2021_06.tif` → LST, June 2021

### Colormap System

The platform includes 20+ scientific colormaps organized by category:

#### Diverging Colormaps
- `spi` - Standardized Precipitation Index (red-blue)
- `diverging` - General anomaly detection
- `spei` - Standardized Precipitation Evapotranspiration Index

#### Sequential Colormaps
- `ndvi` - Vegetation health (red-yellow-green)
- `lst` - Land surface temperature (blue-white-red)
- `sm` - Soil moisture (brown-blue)
- `terrain` - Elevation (blue-green-brown-white)

#### Qualitative Colormaps
- `risk` - Fire/hazard assessment (green-yellow-red)
- `cdi` - Crop drought index (green-yellow-orange-red)

#### Scientific Colormaps
- `viridis` - Perceptually uniform (purple-yellow)
- `plasma` - High contrast (purple-yellow)
- `inferno` - Black body radiation (black-yellow)
- `magma` - Similar to inferno (black-yellow)
- `cool` - Cyan-magenta
- `hot` - Black-red-yellow-white
- `rainbow` - Full spectrum
- `ocean` - Deep water visualization

#### Single-Color Gradients
- `blues`, `greens`, `reds`, `oranges`, `purples`
- `sunset` - Warm tones

## 📡 API Documentation

### Dataset Endpoints

#### Get Latest Tile
```http
GET /api/dataset/<dataset_id>/latest/
```

**Response:**
```json
{
  "name": "NDVI_Tunisia_2023_11",
  "index_name": "NDVI",
  "dataset": "NDVI",
  "year": 2023,
  "month": 11,
  "image_url": "/media/datasets/NDVI/pngs/NDVI_Tunisia_2023_11.png",
  "extent": {
    "left": 7.5,
    "bottom": 32.0,
    "right": 11.5,
    "top": 37.5
  }
}
```

#### Get All Tiles
```http
GET /api/dataset/<dataset_id>/tiles/
```

**Response:**
```json
{
  "tiles": [
    {
      "id": 1,
      "name": "NDVI_Tunisia_2023_11",
      "year": 2023,
      "month": 11,
      "date_str": "2023-11",
      "image_url": "/media/datasets/NDVI/pngs/NDVI_Tunisia_2023_11.png",
      "extent": {...}
    }
  ],
  "dataset_info": {
    "name": "NDVI",
    "colormap": "ndvi",
    "total_tiles": 300,
    "min_value": -0.2,
    "max_value": 0.9
  }
}
```

### Analysis Endpoints

#### Pixel Value Extraction
```http
GET /api/pixel/?lat={lat}&lng={lng}&tile_id={tile_id}
```

**Response:**
```json
{
  "value": 0.4567
}
```

#### Time Series Data
```http
GET /api/timeseries/?lat={lat}&lng={lng}&dataset_id={dataset_id}&start_year={start_year}&start_month={start_month}&end_year={end_year}&end_month={end_month}
```

**Response:**
```json
{
  "timeseries": [
    {
      "date": "2023-01",
      "value": 0.4567
    },
    {
      "date": "2023-02",
      "value": 0.4789
    }
  ]
}
```

#### Boundary Clipping
```http
POST /api/clip-boundary/
Content-Type: application/json

{
  "tile_id": 1,
  "boundary_type": "governorates",
  "polygon_id": "12"
}
```

**Response:**
```json
{
  "name": "Tunis",
  "min": 0.234,
  "max": 0.789,
  "mean": 0.512
}
```

### AI Chat Endpoints

#### Chat with AI
```http
POST /api/chat/
Content-Type: application/json

{
  "message": "What does this NDVI value indicate?",
  "context_data": {
    "dataset": "NDVI",
    "lat": 33.8869,
    "lng": 9.5375,
    "data_points": [...]
  },
  "conversation_id": 1
}
```

**Response:**
```json
{
  "response": "Based on the NDVI value of 0.4567, this indicates moderate vegetation health...",
  "history_length": 5,
  "conversation_id": 1
}
```

#### Conversation Management
```http
GET /api/conversations/                    # List conversations
GET /api/conversations/<id>/               # Load conversation
DELETE /api/conversations/<id>/delete/     # Delete conversation
```

## 📖 User Guide

### Getting Started

1. **Registration**
   - Navigate to `/signup/`
   - Create an account with username, email, and password
   - Login at `/login/`

2. **Dashboard Navigation**
   - Access the main dashboard at `/maps/`
   - Browse SDGs on the left sidebar
   - Select datasets to visualize

3. **Interactive Mapping**
   - Click on SDG numbers to filter datasets
   - Select a dataset from the dropdown
   - Use the time slider to navigate temporal data
   - Click on the map to inspect pixel values

### Analysis Tools

#### Pixel Selection Mode
1. Activate "Pixel Selection" mode
2. Click any point on the map
3. View the exact value in the popup
4. Click "Interpret with AI" for detailed analysis

#### Time Series Mode
1. Activate "Time Series Mode" (📈 button)
2. Click on a location of interest
3. Set date range parameters
4. View interactive chart in modal
5. Use "Interpret with AI" for trend analysis

#### Boundary Analysis
1. Select a boundary type (governorate, delegation, municipality, sector)
2. Choose specific administrative region
3. View aggregated statistics
4. Compare across different regions

### Data Upload (Admin Only)

1. Navigate to `/upload/`
2. Prepare a ZIP file with GeoTIFFs following naming convention
3. Select appropriate colormap
4. Associate with SDG goal
5. Add description
6. Upload and monitor processing

## 🔧 Development

### Running Tests

```bash
python manage.py test SDGtunisia
```

### Database Management

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Reset database
python manage.py flush
```

### Adding New Colormaps

Edit `SDGtunisia/colormaps.py`:

```python
COLORMAPS = {
    # Add new colormap
    "my_colormap": [
        (0.0, [r, g, b]),  # Color at 0.0
        (0.5, [r, g, b]),  # Color at 0.5
        (1.0, [r, g, b]),  # Color at 1.0
    ],
}
```

### Custom Authentication

The platform supports email or username login via `backends.py`:

```python
class EmailOrUsernameModelBackend:
    def authenticate(self, request, username=None, password=None):
        # Custom authentication logic
```

## 🎨 UI/UX Features

### Responsive Design
- Mobile-friendly interface
- Adaptive layouts for different screen sizes
- Touch-optimized controls

### Interactive Elements
- Real-time map updates
- Smooth transitions and animations
- Modal overlays for detailed views
- Toast notifications for user feedback

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast options
- Clear visual hierarchy

## 🔒 Security Considerations

### Current Implementation
- File type validation for uploads
- Coordinate bounds checking
- SQL injection protection via Django ORM
- CSRF protection on all forms
- User authentication required for sensitive operations

### Production Recommendations
- Set `DEBUG = False` in production
- Use environment variables for sensitive data
- Implement rate limiting on API endpoints
- Add HTTPS enforcement
- Regular security audits
- Implement logging and monitoring

## 📊 Performance Optimization

### Caching Strategy
- Pre-rendered PNG files for fast display
- Database query optimization with indexes
- Static file serving via Django's staticfiles
- Coordinate transformation caching

### Database Indexing
```python
class RasterTile(models.Model):
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE)
    year = models.IntegerField(db_index=True)
    month = models.IntegerField(db_index=True)
    # Additional indexed fields for performance
```

### File Organization
- Separate storage for original and processed files
- Efficient directory structure
- Automated cleanup of temporary files

## 🌐 SDG Integration

The platform currently supports the following SDGs with associated datasets:

- **SDG 1**: No Poverty - Economic indicators
- **SDG 2**: Zero Hunger - Agricultural indices (NDVI, CDI)
- **SDG 6**: Clean Water - Water availability indices
- **SDG 11**: Sustainable Cities - Urban development metrics
- **SDG 13**: Climate Action - Climate indices (SPI, SPEI, LST)
- **SDG 15**: Life on Land - Environmental indicators

### Available Indices

- **NDVI**: Normalized Difference Vegetation Index
- **CDI**: Crop Drought Index
- **LST**: Land Surface Temperature
- **SPI**: Standardized Precipitation Index
- **SPEI**: Standardized Precipitation Evapotranspiration Index
- **SM**: Soil Moisture

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Style

- Follow PEP 8 guidelines
- Use descriptive variable names
- Add docstrings to functions
- Keep functions focused and modular
- Write meaningful commit messages

## 📝 License

This project is part of the Smart SDG Tunisia initiative. Contact the project administrators for licensing information.

## 📞 Support

For questions, issues, or contributions:
- Open an issue on the project repository
- Contact the development team
- Consult the technical documentation in `PIPELINE_SCHEMA_CURRENT.md`

## 🙏 Acknowledgments

- Django development team
- Rasterio and GDAL communities
- Leaflet.js contributors
- Google AI for Gemini API
- Open source geospatial community

---

**Version**: 1.0.0  
**Last Updated**: 2025-2026  
**Project**: Smart SDG Tunisia Geoportal  
**Status**: Production Ready ✅
