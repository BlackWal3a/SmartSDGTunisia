from django.urls import path
from django.contrib.auth.views import LogoutView
from .views import (
    upload_view, map_view, maps_view, index_view, about_view, contact_view, 
    data_explorer_view, methods_view, nucleo_icons_view, png_viewer_view,
    latest_layer_json, dataset_tiles_json, get_pixel_value, clip_tile_by_boundary, timeseries,
    signup_view, CustomLoginView
)

urlpatterns = [
    path("", index_view, name="home"),          # homepage
    path("upload/", upload_view, name="upload"), # /upload
    path("map/", map_view, name="map"),
    path("maps/", maps_view, name="maps"),
    path("dashboard/", maps_view, name="map_dashboard"),
    path("about/", about_view, name="about"),
    path("contact/", contact_view, name="contact"),
    path("data-explorer/", data_explorer_view, name="data-explorer"),
    path("methods/", methods_view, name="methods"),
    path("nucleo-icons/", nucleo_icons_view, name="nucleo-icons"),
    path("png-viewer/", png_viewer_view, name="png-viewer"),
    path("login/", CustomLoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(next_page='home'), name="logout"),
    path("signup/", signup_view, name="signup"),
    path("api/dataset/<int:dataset_id>/latest/", latest_layer_json),
    path("api/dataset/<int:dataset_id>/tiles/", dataset_tiles_json),
    path("api/pixel/", get_pixel_value),
    path("api/clip-boundary/", clip_tile_by_boundary),
    path("api/timeseries/", timeseries),
]