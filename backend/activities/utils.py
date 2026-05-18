import polyline as pl


def polyline_to_svg_path(encoded: str, width: int = 100, height: int = 90) -> str:
    """Convert an encoded Strava polyline to an SVG path d attribute string."""
    coords = pl.decode(encoded)
    if not coords:
        return ''

    lats = [c[0] for c in coords]
    lons = [c[1] for c in coords]
    min_lat, max_lat = min(lats), max(lats)
    min_lon, max_lon = min(lons), max(lons)
    lat_range = max_lat - min_lat or 1
    lon_range = max_lon - min_lon or 1

    pad = 5
    w = width - 2 * pad
    h = height - 2 * pad

    def norm(lat, lon):
        x = round(pad + (lon - min_lon) / lon_range * w, 2)
        y = round(pad + (1 - (lat - min_lat) / lat_range) * h, 2)
        return x, y

    pts = [norm(lat, lon) for lat, lon in coords]
    d = f'M {pts[0][0]} {pts[0][1]}'
    for x, y in pts[1:]:
        d += f' L {x} {y}'
    return d
