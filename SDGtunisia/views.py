from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse, JsonResponse
from django.core.files.storage import FileSystemStorage
from .processor import process_zip
from .models import Dataset, RasterTile
from django.conf import settings
import os
import math
import json
import rasterio
import numpy as np
from rasterio.mask import mask
from shapely.geometry import shape, mapping
from shapely.ops import transform as shapely_transform
from django.contrib.auth import login
from django.contrib.auth.views import LoginView
from .forms import SignUpForm, UserLoginForm
from pyproj import Transformer

def map_view(request):
    datasets = Dataset.objects.all()
    return render(request, "map.html", {"datasets": datasets})

def maps_view(request):
    datasets = Dataset.objects.all()
    
    # Group datasets by SDG
    sdg_groups = {}
    for dataset in datasets:
        sdg_number = dataset.with_sdg
        if sdg_number:
            # Extract just number from SDG field (e.g., "SDG 1" -> "1")
            if isinstance(sdg_number, str) and sdg_number.isdigit():
                sdg_num = sdg_number
            elif isinstance(sdg_number, str) and sdg_number.startswith('SDG'):
                sdg_num = sdg_number.replace('SDG', '').strip()
            else:
                sdg_num = str(sdg_number) if sdg_number else None
            
            if sdg_num and sdg_num.isdigit():
                if sdg_num not in sdg_groups:
                    sdg_groups[sdg_num] = {'datasets': []}
                sdg_groups[sdg_num]['datasets'].append(dataset)
    
    # Only include SDGs that have actual image files (1, 2, 6, 11, 13, 15)
    available_sdgs = ['1', '2', '6', '11', '13', '15']
    all_sdgs = {}
    for sdg_num in available_sdgs:
        all_sdgs[sdg_num] = sdg_groups.get(sdg_num, {'datasets': []})
    
    return render(request, "maps.html", {"datasets": datasets, "sdg_groups": all_sdgs})

def index_view(request):
    return render(request, "index.html")

def about_view(request):
    return render(request, "about.html")

def contact_view(request):
    return render(request, "contact.html")

def data_explorer_view(request):
    datasets = Dataset.objects.all()
    return render(request, "data-explorer.html", {"datasets": datasets})


def signup_view(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('map_dashboard')
    else:
        form = SignUpForm()
    return render(request, 'signup.html', {'form': form})


class CustomLoginView(LoginView):
    template_name = 'login.html'
    authentication_form = UserLoginForm

def methods_view(request):
    return render(request, "methods.html")

def nucleo_icons_view(request):
    return render(request, "nucleo-icons.html")

def png_viewer_view(request):
    return render(request, "png-viewer.html")


def timeseries(request):

    try:
        lat = float(request.GET.get("lat"))
        lng = float(request.GET.get("lng"))
        dataset_id = int(request.GET.get("dataset_id"))

        start_year = int(request.GET.get("start_year"))
        start_month = int(request.GET.get("start_month"))
        end_year = int(request.GET.get("end_year"))
        end_month = int(request.GET.get("end_month"))

        # Raster is already in WGS84, no transformation needed
        x, y = lng, lat

        # Filter tiles by date range
        tiles = (
            RasterTile.objects
            .filter(dataset_id=dataset_id)
            .order_by("year", "month")
        )

        data = []

        for tile in tiles:

            # Date filtering
            if (tile.year < start_year) or (tile.year > end_year):
                continue

            if tile.year == start_year and tile.month < start_month:
                continue

            if tile.year == end_year and tile.month > end_month:
                continue

            # Build full absolute path to tif
            tif_path = os.path.join(
                settings.MEDIA_ROOT,
                "datasets",
                tile.dataset.name,
                "tifs",
                tile.dataset.name,
                tile.tif_file
            )

            try:
                with rasterio.open(tif_path) as src:

                    row, col = src.index(x, y)
                    band = src.read(1)

                    if (
                        row < 0 or col < 0 or
                        row >= band.shape[0] or col >= band.shape[1]
                    ):
                        value = None
                    else:
                        value = band[row, col]

                        if src.nodata is not None and value == src.nodata:
                            value = None

                data.append({
                    "date": f"{tile.year}-{tile.month:02d}",
                    "value": None if value is None else float(value)
                })

            except:
                data.append({
                    "date": f"{tile.year}-{tile.month:02d}",
                    "value": None
                })

        return JsonResponse({"timeseries": data})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def latest_layer_json(request, dataset_id):

    dataset = get_object_or_404(Dataset, id=dataset_id)

    tile = (
        RasterTile.objects
        .filter(dataset=dataset)
        .order_by("-year", "-month")
        .first()
    )

    if not tile:
        return JsonResponse({"error": "No data"}, status=404)

    # ✅ FULL SAFE MEDIA URL
    image_url = os.path.join(
        settings.MEDIA_URL,
        "datasets",
        dataset.name,
        "pngs",
        tile.png_file
    )

    # Convert Web Mercator to Lat/Lng for Leaflet
    def web_mercator_to_latlng(x, y):
        lng = (x / 20037508.34) * 180
        lat = (y / 20037508.34) * 180
        lat = 180 / math.pi * (2 * math.atan(math.exp(lat * math.pi / 180)) - math.pi / 2)
        return lat, lng

    lat_bottom, lng_left = web_mercator_to_latlng(tile.extent_left, tile.extent_bottom)
    lat_top, lng_right = web_mercator_to_latlng(tile.extent_right, tile.extent_top)

    return JsonResponse({
        "name": tile.name,
        "index_name": tile.index_name,
        "dataset": dataset.name,
        "year": tile.year,
        "month": tile.month,
        "image_url": image_url,
        "extent": {
            "left": lng_left,
            "bottom": lat_bottom,
            "right": lng_right,
            "top": lat_top
        }
    })

def dataset_tiles_json(request, dataset_id):
    """Get all tiles for a dataset with their dates"""
    dataset = get_object_or_404(Dataset, id=dataset_id)
    
    tiles = (
        RasterTile.objects
        .filter(dataset=dataset)
        .order_by("year", "month")
    )
    
    # Convert Web Mercator to Lat/Lng for Leaflet
    def web_mercator_to_latlng(x, y):
        lng = (x / 20037508.34) * 180
        lat = (y / 20037508.34) * 180
        lat = 180 / math.pi * (2 * math.atan(math.exp(lat * math.pi / 180)) - math.pi / 2)
        return lat, lng
    
    tiles_data = []
    for tile in tiles:
        lat_bottom, lng_left = web_mercator_to_latlng(tile.extent_left, tile.extent_bottom)
        lat_top, lng_right = web_mercator_to_latlng(tile.extent_right, tile.extent_top)
        
        image_url = os.path.join(
            settings.MEDIA_URL,
            "datasets",
            dataset.name,
            "pngs",
            tile.png_file
        )
        
        tiles_data.append({
            "id": tile.id,
            "name": tile.name,
            "index_name": tile.index_name,
            "year": tile.year,
            "month": tile.month,
            "date_str": f"{tile.year}-{tile.month:02d}",
            "image_url": image_url,
            "width": tile.width,
            "height": tile.height,
            "min_value": tile.min_value,
            "max_value": tile.max_value,
            "extent": {
                "left": lng_left,
                "bottom": lat_bottom,
                "right": lng_right,
                "top": lat_top
            }
        })
    
    # Get first tile for additional info
    first_tile = tiles.first()
    
    return JsonResponse({
        "tiles": tiles_data,
        "dataset_info": {
            "name": dataset.name,
            "index_name": first_tile.index_name if first_tile else None,
            "colormap": dataset.colormap,
            "created_at": dataset.created_at.isoformat(),
            "total_tiles": tiles.count(),
            "tile_width": first_tile.width if first_tile else None,
            "tile_height": first_tile.height if first_tile else None,
            "min_value": first_tile.min_value if first_tile else None,
            "max_value": first_tile.max_value if first_tile else None
        }
    })

def get_pixel_value(request):

    try:
        lat = float(request.GET.get("lat"))
        lng = float(request.GET.get("lng"))
        tile_id = int(request.GET.get("tile_id"))

        tile = get_object_or_404(RasterTile, id=tile_id)

        # Build full absolute path to tif
        tif_path = os.path.join(
            settings.MEDIA_ROOT,
            "datasets",
            tile.dataset.name,
            "tifs",
            tile.dataset.name,
            tile.tif_file
        )

        # Raster is already in WGS84, no transformation needed
        x, y = lng, lat

        with rasterio.open(tif_path) as src:

            # Convert coords → pixel index
            row, col = src.index(x, y)

            # Read raster band
            band = src.read(1)

            # Safety check
            if row < 0 or col < 0 or row >= band.shape[0] or col >= band.shape[1]:
                return JsonResponse({"error": "Outside raster"}, status=400)

            value = band[row, col]

            # Handle nodata
            if src.nodata is not None and value == src.nodata:
                return JsonResponse({"value": None})

        return JsonResponse({
            "value": float(value)
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def clip_tile_by_boundary(request):
    if request.method != 'POST':
        return JsonResponse({"error": "POST required"}, status=405)

    try:
        payload = json.loads(request.body.decode('utf-8'))
    except Exception:
        return JsonResponse({"error": "Invalid JSON payload"}, status=400)

    tile_id = payload.get('tile_id')
    boundary_type = payload.get('boundary_type')
    polygon_id = payload.get('polygon_id')

    if not tile_id or not boundary_type or polygon_id is None:
        return JsonResponse({"error": "Missing tile_id, boundary_type, or polygon_id"}, status=400)

    boundary_map = {
        "governorates": {
            "filename": os.path.join('Tun_Governorates', 'Tun_Governorates.geojson'),
            "id_field": 'C_GOUV',
            "source_crs": 'EPSG:32632'
        },
        "delegations": {
            "filename": os.path.join('Tun_Delegations', 'Tun_Delegations.geojson'),
            "id_field": 'C_DEL',
            "source_crs": 'EPSG:32632'
        },
        "municipalities": {
            "filename": os.path.join('Tun_Municipalities', 'Tun_Municipalities.geojson'),
            "id_field": 'ref:tn:cod',
            "source_crs": 'EPSG:4326'
        },
        "sectors": {
            "filename": os.path.join('Tun_Sectors', 'Tun_Sectors.geojson'),
            "id_field": 'CODE_INS_S',
            "source_crs": 'EPSG:32632'
        }
    }

    if boundary_type not in boundary_map:
        return JsonResponse({"error": "Invalid boundary_type"}, status=400)

    tile = get_object_or_404(RasterTile, id=tile_id)
    boundary_info = boundary_map[boundary_type]
    geojson_path = os.path.join(settings.BASE_DIR, 'static', 'data', boundary_info['filename'])

    if not os.path.exists(geojson_path):
        return JsonResponse({"error": "Boundary GeoJSON file not found"}, status=500)

    try:
        with open(geojson_path, 'r', encoding='utf-8') as f:
            boundary_geojson = json.load(f)
    except Exception as exc:
        return JsonResponse({"error": f"Failed to read GeoJSON: {exc}"}, status=500)

    feature = None
    for item in boundary_geojson.get('features', []):
        props = item.get('properties', {}) or {}
        if str(props.get(boundary_info['id_field'])) == str(polygon_id):
            feature = item
            break

    if feature is None:
        return JsonResponse({"error": "Boundary polygon not found"}, status=404)

    geometry = feature.get('geometry')
    if geometry is None:
        return JsonResponse({"error": "Boundary geometry missing"}, status=500)

    try:
        polygon = shape(geometry)
    except Exception as exc:
        return JsonResponse({"error": f"Invalid polygon geometry: {exc}"}, status=500)

    tif_path = os.path.join(
        settings.MEDIA_ROOT,
        'datasets',
        tile.dataset.name,
        'tifs',
        tile.dataset.name,
        tile.tif_file
    )

    if not os.path.exists(tif_path):
        return JsonResponse({"error": "Raster file not found"}, status=500)

    try:
        with rasterio.open(tif_path) as src:
            raster_crs = src.crs
            source_crs = boundary_info.get('source_crs', 'EPSG:4326')

            if raster_crs is not None and source_crs is not None:
                raster_crs_obj = rasterio.crs.CRS.from_user_input(raster_crs)
                source_crs_obj = rasterio.crs.CRS.from_user_input(source_crs)
                if raster_crs_obj != source_crs_obj:
                    transformer = Transformer.from_crs(source_crs_obj, raster_crs_obj, always_xy=True)
                    polygon = shapely_transform(
                        lambda x, y, z=None: transformer.transform(x, y),
                        polygon
                    )

            out_image, out_transform = mask(src, [mapping(polygon)], crop=True, nodata=src.nodata)
            band = out_image[0]

            if src.nodata is not None:
                valid_mask = band != src.nodata
                values = band[valid_mask]
            else:
                values = band.flatten()

            if values.size == 0:
                return JsonResponse({"error": "Clipped raster contains no valid data"}, status=404)

            values = values.astype(float)
            min_value = float(np.nanmin(values))
            max_value = float(np.nanmax(values))
            mean_value = float(np.nanmean(values))

            return JsonResponse({
                "min": min_value,
                "max": max_value,
                "mean": mean_value
            })

    except Exception as exc:
        return JsonResponse({"error": f"Raster clipping failed: {exc}"}, status=500)


def upload_view(request):

    if request.method == "POST":
        zip_file = request.FILES["zipfile"]
        dataset_name = request.POST["dataset"]
        colormap = request.POST["colormap"]
        sdg = request.POST.get("sdg", "")
        description = request.POST.get("description", "")

        fs = FileSystemStorage(location="media/uploads")
        filename = fs.save(zip_file.name, zip_file)
        file_path = fs.path(filename)

        config = {
            "dataset": {"name": dataset_name},
            "visualization": {"colormap": colormap},
            "sdg": sdg,
            "description": description
        }

        dataset_id = process_zip(file_path, config)

        return HttpResponse(f"✅ Dataset processed! ID: {dataset_id}")

    return render(request, "upload.html")