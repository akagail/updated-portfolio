"""One-time upload of files on local disk into the configured media storage.

Keeps relative paths, so existing DB file names (e.g. `device/hero-frame-1.jpg`)
stay valid. Requires the SUPABASE_S3_* env vars; see settings.py.

    python manage.py backfill_media --dry-run
    python manage.py backfill_media
"""
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Upload local media files to the configured object storage."

    def add_arguments(self, parser):
        parser.add_argument(
            "--source",
            default=str(settings.MEDIA_ROOT),
            help="Directory holding the files to upload (default: MEDIA_ROOT).",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="List what would be uploaded without writing anything.",
        )

    def handle(self, *args, **options):
        if not settings.S3_ENABLED:
            raise CommandError(
                "Object storage is not configured; set SUPABASE_S3_* env vars first."
            )

        source = Path(options["source"])
        if not source.is_dir():
            raise CommandError(f"Source directory not found: {source}")

        dry_run = options["dry_run"]
        uploaded = skipped = 0
        for path in sorted(source.rglob("*")):
            if not path.is_file() or path.name == ".gitkeep":
                continue
            name = path.relative_to(source).as_posix()
            if default_storage.exists(name):
                skipped += 1
                continue
            if dry_run:
                self.stdout.write(f"would upload: {name}")
            else:
                with path.open("rb") as fh:
                    default_storage.save(name, File(fh))
                self.stdout.write(f"uploaded: {name}")
            uploaded += 1

        verb = "would upload" if dry_run else "uploaded"
        self.stdout.write(self.style.SUCCESS(f"{verb} {uploaded}, skipped {skipped} existing"))
