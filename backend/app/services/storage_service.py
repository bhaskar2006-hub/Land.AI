import os
import hashlib
import uuid
import shutil
from typing import Tuple
from fastapi import UploadFile, HTTPException
from backend.app.core.config import settings

class StorageService:
    def __init__(self):
        self.upload_dir = os.path.abspath(settings.UPLOAD_DIR)
        self.processed_dir = os.path.abspath(settings.PROCESSED_DIR)
        os.makedirs(self.upload_dir, exist_ok=True)
        os.makedirs(self.processed_dir, exist_ok=True)

    def compute_sha256(self, file_bytes: bytes) -> str:
        sha256 = hashlib.sha256()
        sha256.update(file_bytes)
        return sha256.hexdigest()

    async def save_upload_file(self, upload_file: UploadFile) -> Tuple[str, str, int, str]:
        """
        Saves uploaded file to storage.
        Returns: (file_path, file_hash, file_size_bytes, mime_type)
        """
        filename = upload_file.filename or "unnamed_document.pdf"
        ext = filename.split(".")[-1].lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
            )

        content = await upload_file.read()
        file_size = len(content)
        max_size = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if file_size > max_size:
            raise HTTPException(
                status_code=400,
                detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB"
            )

        file_hash = self.compute_sha256(content)
        unique_name = f"{uuid.uuid4()}_{filename}"
        dest_path = os.path.join(self.upload_dir, unique_name)

        with open(dest_path, "wb") as f:
            f.write(content)

        mime_type = upload_file.content_type or "application/octet-stream"
        return dest_path, file_hash, file_size, mime_type

    def get_file_path(self, relative_or_abs_path: str) -> str:
        if os.path.isabs(relative_or_abs_path):
            return relative_or_abs_path
        return os.path.join(self.upload_dir, relative_or_abs_path)

    def delete_file(self, file_path: str) -> bool:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
        except Exception:
            pass
        return False

storage_service = StorageService()
