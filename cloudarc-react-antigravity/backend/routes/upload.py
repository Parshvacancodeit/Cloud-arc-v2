import os
import uuid
from flask import Blueprint, request, jsonify, current_app, send_from_directory, g
from auth_middleware import require_auth
from werkzeug.utils import secure_filename

upload_bp = Blueprint('upload', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'}
MAX_SIZE_MB = 5


def _allowed(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def _upload_dir():
    d = os.path.join(current_app.root_path, 'static', 'uploads')
    os.makedirs(d, exist_ok=True)
    return d


@upload_bp.route('/api/upload/image', methods=['POST'])
@require_auth
def upload_image():
    """
    POST /api/upload/image
    multipart/form-data with field 'file'
    Returns: { url: "/static/uploads/<filename>" }
    """
    if 'file' not in request.files:
        return jsonify({'message': 'No file field in request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400

    if not _allowed(file.filename):
        return jsonify({'message': f'File type not allowed. Use: {", ".join(ALLOWED_EXTENSIONS)}'}), 400

    # Read content to check size
    content = file.read()
    if len(content) > MAX_SIZE_MB * 1024 * 1024:
        return jsonify({'message': f'File too large. Max {MAX_SIZE_MB}MB allowed'}), 400

    ext      = secure_filename(file.filename).rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    save_path = os.path.join(_upload_dir(), filename)

    with open(save_path, 'wb') as f:
        f.write(content)

    api_base = request.host_url.rstrip('/')
    url = f"{api_base}/static/uploads/{filename}"
    return jsonify({'url': url}), 201


@upload_bp.route('/static/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(_upload_dir(), filename)
