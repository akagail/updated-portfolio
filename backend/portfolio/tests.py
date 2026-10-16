import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch

from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import SimpleTestCase, override_settings


class BackfillMediaTests(SimpleTestCase):
    def test_refuses_to_run_without_object_storage(self):
        with override_settings(S3_ENABLED=False):
            with self.assertRaises(CommandError):
                call_command("backfill_media")

    def test_uploads_new_files_and_skips_existing(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "device").mkdir()
            (root / "device" / "new.jpg").write_bytes(b"x")
            (root / "have.jpg").write_bytes(b"x")

            storage = MagicMock()
            storage.exists.side_effect = lambda name: name == "have.jpg"

            with override_settings(S3_ENABLED=True), patch(
                "portfolio.management.commands.backfill_media.default_storage", storage
            ):
                call_command("backfill_media", "--source", tmp)

            saved = [call.args[0] for call in storage.save.call_args_list]
            self.assertEqual(saved, ["device/new.jpg"])
