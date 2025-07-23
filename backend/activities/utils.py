# def update_map_image_on_polyline_change(sender, instance, created, **kwargs):
#     old_polyline = instance._old_polyline

#     if old_polyline != instance.polyline and instance.polyline:
#         image_bytes = generate_map(instance.polyline)
#         if image_bytes:
#             filename = f'activity_{instance.activity_id}.png'
#             instance.map_image.save(filename, ContentFile(image_bytes), save=False)
#             instance.save(update_fields=['map_image'])
