import math
import requests
from urllib.parse import quote
import polyline
import random

MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoibGprYXJlbCIsImEiOiJjbWMzbGVkNHQwNjhqMmlwcGt5NWhnY2NwIn0.hfujlU0Am7zdOGewlhZxQw"
BASE_URL = "https://api.mapbox.com/styles/v1/mapbox/dark-v11/static"

MAPBOX_PARAMS = {
    'access_token': MAPBOX_ACCESS_TOKEN,
    'attribution': 'false',
    'logo': 'false'
}

STRAVA_ACCESS_TOKEN = "397e1c0a605395c651d1f3b80b9e3444c818d72b"

R = 6378137 # Earth radius in meters

def mercator_projection(coord):
    """Converts a geographic coordinate to a Cartesian point."""
    lat, lon = coord
    x = R * math.radians(lon)
    y = R * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))
    return (x, y)

def inverse_mercator(point):
    """Converts a Cartesian point to a geographic coordinate."""
    x, y = point
    lon = math.degrees(x / R)
    lat = math.degrees(2 * math.atan(math.exp(y / R)) - math.pi / 2)
    return (lat, lon)

def rotate(point, angle_degrees):
    """Rotates a Cartesian point around a center point."""
    angle_radians = math.radians(angle_degrees)
    x, y = point

    # Apply rotation
    cos_theta = math.cos(angle_radians)
    sin_theta = math.sin(angle_radians)
    rx = x * cos_theta - y * sin_theta
    ry = x * sin_theta + y * cos_theta

    return (rx, ry)

def compute_bbox(points):
    """Computes the bounding box center of a set of Cartesian points."""
    xs, ys = zip(*points)
    return ((min(xs), min(ys)), (max(xs), max(ys)))

def compute_center(min_point, max_point):
    """Computes the center of a bounding box."""
    x_min, y_min = min_point
    x_max, y_max = max_point

    return ((x_min + x_max) / 2, (y_min + y_max) / 2)

def lat_rad(lat):
    return math.log(math.tan(math.radians(lat) / 2 + math.pi / 4))

def zoom_level(min_coord, max_coord, img_width, img_height, pad_fraction):
    lat_min, lon_min = min_coord
    lat_max, lon_max = max_coord
    
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


def createPathString(strokeColor, polyline):
    url_polyline = quote(polyline, safe='')
    return f'path-4+{strokeColor}-1({url_polyline})'

def createPinString(color, lat, lon):
    return f'pin-s+{color}({lon},{lat})'

def createFullUrl(overlays, center_lat, center_lon, zoom, bearing, width, height):
    overlays = ','.join(overlays)
    settings = f'{center_lon},{center_lat},{zoom},{bearing}/{width}x{height}'
    return f'{BASE_URL}/{overlays}/{settings}'


def writeBinaryToImageFile(path, content):
    with open(path, 'wb') as f:
        f.write(content)



response = requests.get(
    "https://www.strava.com/api/v3/athlete/activities",
    headers={"Authorization": f"Bearer {STRAVA_ACCESS_TOKEN}"},
)

if response.status_code == 200:
    activities = response.json()
else:
    raise Exception("Unable to get activities. Invalid access token?")


for i, activity in enumerate(activities[:5]):
    encoded_polyline = activity['map']['summary_polyline']
    if not encoded_polyline: continue

    coords = polyline.decode(encoded_polyline)

    # Settings
    width = 300
    height = 300
    padding = 0.05

    # Convert the polyline into Cartesian points
    polyline_points = [mercator_projection(coord) for coord in coords]

    for bearing in range(0, 360, 45):
        # Rotate the polyline to align with the bearing
        rotated_polyline_points = [rotate(point, bearing) for point in polyline_points]

        # Get the rotated polyline's bounding box
        min_point, max_point = compute_bbox(rotated_polyline_points)

        # Get the center of the rotated polyline's bounding box
        rotated_center = compute_center(min_point, max_point)

        # Unrotate the center to get the correct center for the original polyline
        true_center = rotate(rotated_center, -bearing)

        # Convert the correct center back into geographic coords
        true_center_lat, true_center_lon = inverse_mercator(true_center)

        # Convert the rotated polyline's bounding box back into geographic coords
        rotated_min_coord = inverse_mercator(min_point)
        rotated_max_coord = inverse_mercator(max_point)

        # Use the bounding box to compute the zoom level
        zoom = zoom_level(rotated_min_coord, rotated_max_coord, width, height, padding)

        overlays = [
            createPathString("fff", encoded_polyline),
        ]

        get_url = createFullUrl(overlays, true_center_lat, true_center_lon, zoom, bearing, width, height)

        response = requests.get(get_url, params=MAPBOX_PARAMS)

        print(response.status_code)

        path = f'images_test/image_{i}_{bearing}_3.png'

        writeBinaryToImageFile(path, response.content)
            