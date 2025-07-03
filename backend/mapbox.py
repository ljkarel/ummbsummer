import os
import math
import requests
from urllib.parse import quote
import polyline

MAPBOX_ACCESS_TOKEN = os.getenv("MAPBOX_ACCESS_TOKEN")
BASE_URL = "https://api.mapbox.com/styles/v1/mapbox/dark-v11/static"

MAPBOX_PARAMS = {
    'access_token': MAPBOX_ACCESS_TOKEN,
    'attribution': 'false',
    'logo': 'false'
}

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

def zoom_level(min_coord, max_coord, img_width, img_height):
    """Computes the zoom level based on the bounding box and the image dimensions."""
    lat_min, lon_min = min_coord
    lat_max, lon_max = max_coord
    
    pad_x = img_width * 0.05
    pad_y = img_height * 0.05

    # Effective size after padding
    view_w = img_width - 2 * pad_x
    view_h = img_height - 2 * pad_y

    WORLD_DIM = 512  # baseline tile size in px

    # Longitude span
    lon_delta = lon_max - lon_min
    zoom_lon = math.log2((360 * view_w) / (lon_delta * WORLD_DIM))

    # Latitude span (convert to Mercator Y)
    lat_rad_min = math.log(math.tan(math.radians(lat_min) / 2 + math.pi / 4))
    lat_rad_max = math.log(math.tan(math.radians(lat_max) / 2 + math.pi / 4))
    lat_delta = abs(lat_rad_max - lat_rad_min)
    zoom_lat = math.log2((2 * math.pi * view_h) / (lat_delta * WORLD_DIM))

    return min(zoom_lat, zoom_lon)

def createPathString(strokeColor, polyline):
    """Creates a path URL string."""
    url_polyline = quote(polyline, safe='')
    return f'path-4+{strokeColor}-1({url_polyline})'

def createPinString(color, lat, lon):
    """Creates a pin URL string."""
    return f'pin-s+{color}({lon},{lat})'

def createFullUrl(overlays, center_lat, center_lon, zoom, bearing, width, height):
    """Joins the base URL, overlays, and settings into a GET URL."""
    overlays = ','.join(overlays)
    settings = f'{center_lon},{center_lat},{zoom},{bearing}/{width}x{height}'
    return f'{BASE_URL}/{overlays}/{settings}'

def writeBinaryToImageFile(path, content):
    """Outputs binary image content to a specified file."""
    with open(path, 'wb') as f:
        f.write(content)

def generate_strava_art(encoded_polyline, output_path, color="fff", rotation=0, width=300, height=300):
    """Uses the Mapbox API to generate an artwork with specific parameters."""

    # Decode the polyline into geographic coordinates
    polyline_coords = polyline.decode(encoded_polyline)

    # Convert the polyline into Cartesian points
    polyline_points = [mercator_projection(coord) for coord in polyline_coords]

    # Rotate the polyline to align with the bearing
    rotated_polyline_points = [rotate(point, rotation) for point in polyline_points]

    # Get the rotated polyline's bounding box
    min_point, max_point = compute_bbox(rotated_polyline_points)

    # Get the center of the rotated polyline's bounding box
    rotated_center = compute_center(min_point, max_point)

    # Unrotate the center to get the correct center for the original polyline
    true_center = rotate(rotated_center, -rotation)

    # Convert the correct center back into geographic coords
    true_center_lat, true_center_lon = inverse_mercator(true_center)

    # Convert the rotated polyline's bounding box back into geographic coords
    rotated_min_coord = inverse_mercator(min_point)
    rotated_max_coord = inverse_mercator(max_point)

    # Use the bounding box to compute the zoom level
    zoom = zoom_level(rotated_min_coord, rotated_max_coord, width, height)

    overlays = [createPathString(color, encoded_polyline)]

    request_url = createFullUrl(overlays, true_center_lat, true_center_lon, zoom, rotation, width, height)

    response = requests.get(request_url, params=MAPBOX_PARAMS)
    if not response.ok:
        return RuntimeError(f"Mapbox error {response.status_code}: {response.text}")

    writeBinaryToImageFile(output_path, response.content)
