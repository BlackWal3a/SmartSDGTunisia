from django.db import models

# Create your models here.

class Dataset(models.Model):
    name = models.CharField(max_length=255)
    colormap = models.CharField(max_length=100)
    with_sdg = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class RasterTile(models.Model):
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE)

    name = models.CharField(max_length=255)
    tif_file = models.CharField(max_length=255)
    png_file = models.CharField(max_length=255)

    index_name = models.CharField(max_length=100, null=True, blank=True)
    year = models.IntegerField(null=True, blank=True)
    month = models.IntegerField(null=True, blank=True)

    min_value = models.FloatField()
    max_value = models.FloatField()

    extent_left = models.FloatField()
    extent_bottom = models.FloatField()
    extent_right = models.FloatField()
    extent_top = models.FloatField()

    width = models.IntegerField()
    height = models.IntegerField()

    def __str__(self):
        return self.name