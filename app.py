from fastapi import FastAPI
from pydantic import BaseModel
import subprocess
import tempfile
import os

app = FastAPI()

class MoveCode(BaseModel):
    code: str

@app.post("/compile")
def compile_move(move: MoveCode):
    code = move.code
    with tempfile.TemporaryDirectory() as tmp:
        # Create Move.toml
        with open(os.path.join(tmp, "Move.toml"), "w") as f:
            f.write('[package]\nname = "my_module"\nversion = "0.1.0"\n')

        # Create sources dir and module
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
            return {"success": True, "stdout": result.stdout}
        except Exception as e:
            return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    import os
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
