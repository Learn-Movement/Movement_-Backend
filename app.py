from fastapi import FastAPI
import subprocess
import tempfile
import os

app = FastAPI()

@app.post("/compile")
def compile_move(code: str):
    with tempfile.TemporaryDirectory() as tmp:
        contract_path = os.path.join(tmp, "Move.toml")
        src_dir = os.path.join(tmp, "sources")
        os.mkdir(src_dir)

        with open(os.path.join(src_dir, "module.move"), "w") as f:
            f.write(code)

        try:
            result = subprocess.run(
                ["movement", "move", "build"],
                cwd=tmp,
                capture_output=True,
                text=True
            )
            if result.returncode != 0:
                return {"success": False, "error": result.stderr}

            return {
                "success": True,
                "stdout": result.stdout
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
