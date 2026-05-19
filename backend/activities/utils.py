import math
import polyline as pl


def polyline_to_svg_path(encoded: str) -> tuple[str, str]:
    """Convert an encoded Strava polyline to an SVG path and its tight viewBox string."""
    coords = pl.decode(encoded)
    if not coords:
        return '', '0 0 100 100'

    lats = [c[0] for c in coords]
    lons = [c[1] for c in coords]
    min_lat, max_lat = min(lats), max(lats)
    min_lon, max_lon = min(lons), max(lons)
    lat_range = max_lat - min_lat or 1
    lon_range = max_lon - min_lon or 1

    pad = 10
    cos_lat = math.cos(math.radians((min_lat + max_lat) / 2))
    lon_range_adj = lon_range * cos_lat or 1

    # Fix width at 100, derive height from the route's true aspect ratio.
    # This keeps the viewBox shape route-dependent, not display-dependent.
    scale = (100 - 2 * pad) / lon_range_adj
    route_h = lat_range * scale
    total_h = round(route_h + 2 * pad, 2)

    def norm(lat, lon):
        x = round(pad + (lon - min_lon) * cos_lat * scale, 2)
        y = round(pad + (1 - (lat - min_lat) / lat_range) * route_h, 2)
        return x, y

    pts = [norm(lat, lon) for lat, lon in coords]
    d = f'M {pts[0][0]} {pts[0][1]}'
    for x, y in pts[1:]:
        d += f' L {x} {y}'
    return d, f'0 0 100 {total_h}'
