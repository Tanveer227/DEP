from flask import Flask, request, jsonify
from cvat_sdk import make_client
from cvat_sdk.core.proxies.tasks import ResourceType
import os

app = Flask(__name__)

@app.route('/create-cvat-task', methods=['POST'])
def create_cvat_task():
    try:
        # Get CVAT credentials from environment variables
        cvat_host = os.getenv('CVAT_HOST', 'https://app.cvat.ai')
        cvat_username = os.getenv('CVAT_USERNAME', 'your_username_here')
        cvat_password = os.getenv('CVAT_PASSWORD', 'your_password_here')

        # Create CVAT client
        with make_client(host=cvat_host, credentials=(cvat_username, cvat_password)) as client:
            # Create a new task
            task = client.tasks.create(
                name="New Task",
                labels=[{"name": "Object"}],
                project_id=1  # Adjust as needed
            )

            # Get selected images from the request
            selected_images = request.json.get('selectedImages', [])

            # Add images to the task
            task.upload_data(
                resource_type=ResourceType.LOCAL,
                resources=selected_images
            )

            return jsonify({"taskId": task.id}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
