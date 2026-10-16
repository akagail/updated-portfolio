"""Media storage on S3-compatible object storage (Supabase Storage).

Production uses this so uploads survive Render's ephemeral disk. Local dev keeps
Django's default FileSystemStorage; see STORAGES in settings.py.
"""
from storages.backends.s3 import S3Storage


class MediaStorage(S3Storage):
    # Supabase rejects ACL headers, serves public buckets unsigned, and must not
    # silently overwrite an existing upload that shares a name.
    default_acl = None
    querystring_auth = False
    file_overwrite = False
