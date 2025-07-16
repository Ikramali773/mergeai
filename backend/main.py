from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import subprocess
import shutil
import os
import uuid
import json
import re
from typing import List, Dict

app = FastAPI()

# Enable CORS (restrict this in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to your compiled Roslyn CLI
CLI_PATH = "../roslyn_merger/roslyn_merger/bin/Release/net9.0/roslyn_merger.dll"
TMP = "/tmp"

def save_upload(file: UploadFile) -> str:
    """Save an UploadFile to /tmp and return its path."""
    path = os.path.join(TMP, file.filename)
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return path

def write_json(obj, filename: str) -> str:
    """Write JSON-serializable obj to /tmp/filename and return its path."""
    path = os.path.join(TMP, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f)
    return path

def run_merger(args: List[str]) -> (str, List[Dict]):
    """
    Run `dotnet CLI_PATH` with given args.
    Returns (stdout, parsed_logs).
    """
    proc = subprocess.run(
        ["dotnet", CLI_PATH] + args,
        capture_output=True,
        text=True
    )
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.strip())

    merged_code = proc.stdout

    # Extract JSON logs from stderr
    stderr = proc.stderr
    logs = []
    match = re.search(r"===MERGEAI_CONFLICTS_START===(.*?)===MERGEAI_CONFLICTS_END===",
                      stderr, re.DOTALL)
    if match:
        try:
            logs = json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            logs = [{"type": "error", "message": "Failed to parse conflict logs"}]

    return merged_code, logs

@app.post("/merge")
async def merge_code(file1: UploadFile = File(...),
                     file2: UploadFile = File(...)):
    # Ensure temp dir
    os.makedirs(TMP, exist_ok=True)

    # Save uploads
    path1 = save_upload(file1)
    path2 = save_upload(file2)

    # Run CLI with 2 args
    try:
        merged_code, logs = run_merger([path1, path2])
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Write merged code to unique file
    merged_filename = f"merged_{uuid.uuid4().hex}.cs"
    merged_path = os.path.join(TMP, merged_filename)
    with open(merged_path, "w", encoding="utf-8") as f:
        f.write(merged_code)

    return {
        "merged_file": merged_filename,
        "logs": logs,
        "download_url": f"/download/{merged_filename}"
    }

@app.post("/merge/resolve")
async def resolve_merge(
    file1: UploadFile = File(...),
    file2: UploadFile = File(...),
    resolutions: List[Dict] = File(...),
):
    """
    Expects:
    - file1, file2: the original .cs files
    - resolutions: JSON array of { "Id": int, "Choice": "A"|"B"|"Both" }
    """
    os.makedirs(TMP, exist_ok=True)

    # Save uploads
    path1 = save_upload(file1)
    path2 = save_upload(file2)

    # Save resolutions JSON
    res_filename = f"resolutions_{uuid.uuid4().hex}.json"
    res_path = write_json(resolutions, res_filename)

    # Run CLI with 3 args
    try:
        merged_code, logs = run_merger([path1, path2, res_path])
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Write final merged code
    merged_filename = f"final_{uuid.uuid4().hex}.cs"
    merged_path = os.path.join(TMP, merged_filename)
    with open(merged_path, "w", encoding="utf-8") as f:
        f.write(merged_code)

    return {
        "merged_file": merged_filename,
        "logs": logs,
        "download_url": f"/download/{merged_filename}"
    }

@app.get("/download/{filename}")
async def download_file(filename: str):
    file_path = os.path.join(TMP, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(
        file_path,
        media_type="text/plain",
        filename=filename
    )

@app.get("/ping")
def ping():
    return {"message": "MergeAI backend is running!"}
