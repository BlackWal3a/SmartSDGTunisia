import os
import sys
import zipfile
import numpy as np
from PIL import Image

import rasterio
from rasterio.warp import calculate_default_transform, reproject, Resampling

from .colormaps import get_colormap, apply_colormap
from .models import Dataset, RasterTile


# ================================
# 🔥 PROJ FIX (WINDOWS SAFETY)
# ================================
potential_paths = [
    os.path.join(sys.prefix, "share", "proj"),
    os.path.join(sys.prefix, "Library", "share", "proj"),
    os.path.join(sys.prefix, "Lib", "site-packages", "rasterio", "proj_data")
]

for p in potential_paths:
    if os.path.exists(p):
        os.environ["PROJ_LIB"] = p
        break


# ================================
# 🧠 FILENAME PARSER
# ================================
def parse_filename(filename):
    """
    Expected:
        NDVI_Tunisia_2023_11
        CDI_Tunisia_2000_02
    """

    name = os.path.splitext(filename)[0]
    parts = name.split("_")

    if len(parts) < 3:
        return {
            "index_name": name,
            "year": None,
            "month": None
        }

    year = parts[-2]
    month = parts[-1]
    index_name = "_".join(parts[:-2])

    return {
        "index_name": index_name,
        "year": int(year),
        "month": int(month)
    }


# ================================
# 🚀 PROCESS ZIP
# ================================
def process_zip(zip_path, config):

    dataset_name = config["dataset"]["name"]
    cmap_name = config["visualization"]["colormap"]

    # ================= CREATE DATASET =================
    dataset = Dataset.objects.create(
        name=dataset_name,
        colormap=cmap_name
    )

    BASE = f"media/datasets/{dataset_name}"
    INPUT = os.path.join(BASE, "tifs")
    OUTPUT = os.path.join(BASE, "pngs")

    os.makedirs(INPUT, exist_ok=True)
    os.makedirs(OUTPUT, exist_ok=True)

    # ================= EXTRACT ZIP =================
    with zipfile.ZipFile(zip_path, "r") as z:
        z.extractall(INPUT)

    # ================= FIND TIFFS =================
    tifs = []
    for root, _, files in os.walk(INPUT):
        for f in files:
            if f.lower().endswith(".tif"):
                tifs.append(os.path.join(root, f))

    print(f"🛰 Found {len(tifs)} rasters")

    cmap = get_colormap(cmap_name)

    # ================= PROCESS EACH FILE =================
    for path in tifs:

        raw_name = os.path.basename(path)
        parsed = parse_filename(raw_name)

        index_name = parsed["index_name"]
        year = parsed["year"]
        month = parsed["month"]

        out_name = raw_name.replace(".tif", ".png")
        out_path = os.path.join(OUTPUT, out_name)

        try:
            with rasterio.open(path) as src:

                dst_crs = "EPSG:3857"

                transform, width, height = calculate_default_transform(
                    src.crs,
                    dst_crs,
                    src.width,
                    src.height,
                    *src.bounds
                )

                dest = np.zeros((height, width), dtype=np.float32)

                reproject(
                    source=rasterio.band(src, 1),
                    destination=dest,
                    src_transform=src.transform,
                    src_crs=src.crs,
                    dst_transform=transform,
                    dst_crs=dst_crs,
                    resampling=Resampling.bilinear
                )

                # ================= MASK =================
                nodata = src.nodata

                mask = ~np.isnan(dest)
                if nodata is not None:
                    mask &= (dest != nodata)

                valid = dest[mask]

                if valid.size == 0:
                    continue

                # ================= NORMALIZE =================
                dmin, dmax = valid.min(), valid.max()

                norm = np.zeros_like(dest, dtype=np.float32)
                norm[mask] = (dest[mask] - dmin) / (dmax - dmin + 1e-12)

                # ================= COLOR =================
                rgb = apply_colormap(norm, cmap)

                alpha = (mask * 255).astype(np.uint8)
                rgba = np.dstack((rgb, alpha))

                Image.fromarray(rgba, "RGBA").save(out_path)

                # ================= EXTENT =================
                left = transform[2]
                top = transform[5]
                right = left + transform[0] * width
                bottom = top + transform[4] * height

                # ================= SAVE TO DB =================
                RasterTile.objects.create(
                    dataset=dataset,

                    name=raw_name.replace(".tif", ""),
                    tif_file=raw_name,
                    png_file=out_name,
                    index_name=index_name,
                    year=year,
                    month=month,

                    min_value=float(dmin),
                    max_value=float(dmax),

                    extent_left=left,
                    extent_bottom=bottom,
                    extent_right=right,
                    extent_top=top,

                    width=width,
                    height=height
                )

                print("✅", raw_name)

        except Exception as e:
            print("❌ Error:", raw_name, e)

    print("🎉 DONE")

    return dataset.id