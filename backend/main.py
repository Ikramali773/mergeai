from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import subprocess
import shutil
import os
import uuid
import json
import re

app = FastAPI()

# Enable CORS (adjust allow_origins in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to the compiled Roslyn CLI merger
CLI_PATH = "../roslyn_merger/roslyn_merger/bin/Release/net9.0/roslyn_merger.dll"

@app.post("/merge")
async def merge_code(file1: UploadFile = File(...), file2: UploadFile = File(...)):
    temp_dir = "/tmp"
    os.makedirs(temp_dir, exist_ok=True)

    tmp1_path = os.path.join(temp_dir, file1.filename)
    tmp2_path = os.path.join(temp_dir, file2.filename)

    # Save the uploaded files
    with open(tmp1_path, "wb") as f:
        shutil.copyfileobj(file1.file, f)
    with open(tmp2_path, "wb") as f:
        shutil.copyfileobj(file2.file, f)

    # Generate a unique filename for the merged output
    merged_filename = f"merged_{uuid.uuid4().hex}.cs"
    merged_path = os.path.join(temp_dir, merged_filename)

    # Run the Roslyn merger CLI
    result = subprocess.run(
        ["dotnet", CLI_PATH, tmp1_path, tmp2_path],
        capture_output=True,
        text=True
    )

    # If Roslyn merger fails, return error
    if result.returncode != 0:
        return {"error": result.stderr.strip()}

    # Save the merged code into a file
    with open(merged_path, "w", encoding="utf-8") as f:
        f.write(result.stdout)

    # Extract structured logs from stderr if available
    logs = []
    match = re.search(
        r"===MERGEAI_CONFLICTS_START===(.*?)===MERGEAI_CONFLICTS_END===",
        result.stderr,
        re.DOTALL
    )
    if match:
        try:
            logs = json.loads(match.group(1).strip())
        except Exception as e:
            logs = [{"type": "error", "message": f"Failed to parse logs: {str(e)}"}]

    return {
        "merged_file": merged_filename,
        "logs": logs,
        "download_url": f"/download/{merged_filename}"
    }

@app.get("/download/{filename}")
async def download_file(filename: str):
    file_path = os.path.join("/tmp", filename)
    if not os.path.exists(file_path):
        return {"error": "File not found."}
    return FileResponse(
        file_path,
        media_type="text/plain",
        filename=filename
    )

@app.get("/ping")
def ping():
    return {"message": "MergeAI backend is running!"}
