from django.contrib import admin
from .models import Dataset, RasterTile

admin.site.register(Dataset)
admin.site.register(RasterTile)