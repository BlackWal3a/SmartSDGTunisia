from django.urls import path
from .views import (
    upload_view, map_view, maps_view, index_view, about_view, contact_view, 
    data_explorer_view, methods_view, nucleo_icons_view, png_viewer_view,
    latest_layer_json, dataset_tiles_json, get_pixel_value, timeseries
)

urlpatterns = [
    path("", index_view, name="home"),          # homepage
    path("upload/", upload_view, name="upload"), # /upload
    path("map/", map_view, name="map"),
    path("maps/", maps_view, name="maps"),
    path("about/", about_view, name="about"),
    path("contact/", contact_view, name="contact"),
    path("data-explorer/", data_explorer_view, name="data-explorer"),
    path("methods/", methods_view, name="methods"),
    path("nucleo-icons/", nucleo_icons_view, name="nucleo-icons"),
    path("png-viewer/", png_viewer_view, name="png-viewer"),
    path("api/dataset/<int:dataset_id>/latest/", latest_layer_json),
    path("api/dataset/<int:dataset_id>/tiles/", dataset_tiles_json),
    path("api/pixel/", get_pixel_value),
    path("api/timeseries/", timeseries),
]