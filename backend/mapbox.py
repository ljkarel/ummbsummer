import math
import requests
from urllib.parse import quote
import polyline
import random

MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoibGprYXJlbCIsImEiOiJjbWMzbGVkNHQwNjhqMmlwcGt5NWhnY2NwIn0.hfujlU0Am7zdOGewlhZxQw"
BASE_URL = "https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/"

STRAVA_ACCESS_TOKEN = "4362c68e8feaa38d70556664dd9f18494e94e997"

response = requests.get(
    "https://www.strava.com/api/v3/athlete/activities",
    headers={"Authorization": f"Bearer {STRAVA_ACCESS_TOKEN}"},
)

data = response.json()


def mercator_xy(lat, lon):
    R = 6378137  # Earth radius in meters (WGS84)
    x = R * math.radians(lon)
    y = R * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))
    return x, y

def rotate(x, y, cx, cy, angle_deg):
    angle_rad = math.radians(angle_deg)
    dx, dy = x - cx, y - cy
    x_rot = dx * math.cos(angle_rad) - dy * math.sin(angle_rad) + cx
    y_rot = dx * math.sin(angle_rad) + dy * math.cos(angle_rad) + cy
    return x_rot, y_rot


for i, activity in enumerate(data):
    if i == 1:
        break
    encoded_polyline = activity["map"]["summary_polyline"]

    if encoded_polyline == '': continue

    coords = polyline.decode(encoded_polyline)

    def lat_rad(lat):
        lat = math.radians(lat)
        return math.log(math.tan(lat / 2 + math.pi / 4))

    def zoom_level(bbox, img_width, img_height, pad_fraction):
        lat_min, lon_min, lat_max, lon_max = bbox
        pad_x = img_width * pad_fraction
        pad_y = img_height * pad_fraction

        # Effective size after padding
        view_w = img_width - 2 * pad_x
        view_h = img_height - 2 * pad_y

        WORLD_DIM = 512  # baseline tile size in px

        # Longitude span
        lon_delta = lon_max - lon_min
        zoom_lon = math.log2((360 * view_w) / (lon_delta * WORLD_DIM))

        # Latitude span (convert to Mercator Y)
        lat_rad_min = lat_rad(lat_min)
        lat_rad_max = lat_rad(lat_max)
        lat_delta = abs(lat_rad_max - lat_rad_min)
        zoom_lat = math.log2((2 * math.pi * view_h) / (lat_delta * WORLD_DIM))

        return min(zoom_lat, zoom_lon)




    url_polyline = quote(encoded_polyline, safe='')


    strokeWidth = 4
    strokeColor = "039dfc"
    strokeOpacity = 1
    width = 300
    height = 300
    padding = 0.05
    
    for j in range(0, 360, 45):
        bearing = j
        print(bearing)

        # Project all lat/lon to Mercator
        merc_points = [mercator_xy(lat, lon) for lat, lon in coords]

        # Center point in Mercator space
        xs, ys = zip(*merc_points)
        cx = sum(xs) / len(xs)
        cy = sum(ys) / len(ys)

        # Rotate all points around center
        rotated = [rotate(x, y, cx, cy, bearing) for x, y in merc_points]

        # Compute bounding box of rotated points
        rot_xs, rot_ys = zip(*rotated)
        min_x, max_x = min(rot_xs), max(rot_xs)
        min_y, max_y = min(rot_ys), max(rot_ys)

        # Invert Mercator to lat/lon (only need for zoom calc)
        def inverse_mercator(x, y):
            lon = math.degrees(x / 6378137)
            lat = math.degrees(2 * math.atan(math.exp(y / 6378137)) - math.pi / 2)
            return lat, lon

        lat_min, lon_min = inverse_mercator(min_x, min_y)
        lat_max, lon_max = inverse_mercator(max_x, max_y)

        bbox = (lat_min, lon_min, lat_max, lon_max)
        zoom = zoom_level(bbox, width, height, padding)

        center_x = (min_x + max_x) / 2
        center_y = (min_y + max_y) / 2

        center_lat, center_lon = inverse_mercator(center_x, center_y)

        # bbox = (min_lat, min_lon, max_lat, max_lon)
        # zoom = zoom_level(bbox, width, height, padding)

        PATH_STRING = f"path-{strokeWidth}+{strokeColor}-{strokeOpacity}({url_polyline})/{center_lon},{center_lat},{zoom},{bearing}/{width}x{height}"

        params = {
            'access_token': MAPBOX_ACCESS_TOKEN,
            'attribution': 'false',
            'logo': 'false'
        }

        response = requests.get(BASE_URL + PATH_STRING, params=params)

        print(response.status_code)

        with open(f'images_test/image{i}_{j}.png', 'wb') as f:
            f.write(response.content)