import re
from typing import Dict, Any, List

# Regex to capture Move compiler error blocks
ERROR_BLOCK_REGEX = re.compile(
    r"error:\s+(?P<message>.+?)\n\s*┌─\s+(?P<file>.+?):(?P<line>\d+):(?P<column>\d+)(?:\n.+?\n\s*│\s*(?P<code>.+))?",
    re.DOTALL
)

def format_compiler_response(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Unified entry point that accepts the dictionary from app.py
    and formats it for the frontend.
    """
    
    # 1. HANDLE SUCCESS
    if data.get("success", False) is True:
        return {
            "type": "compile_success",
            "success": True,
            "modules": data.get("modules", []),
            "package_metadata_bcs": data.get("package_metadata_bcs"),
            "compiler_stdout": data.get("compiler_stdout", ""),
            "metadata": data.get("metadata", {})
        }

    # 2. HANDLE ERRORS
    raw_output = data.get("error", "")
    errors = []

    for match in ERROR_BLOCK_REGEX.finditer(raw_output):
        err_dict = {
            "message": match.group("message").strip(),
            "file": match.group("file"),
            "line": int(match.group("line")),
            "column": int(match.group("column")),
        }
        # Add source code context if regex caught it
        if match.group("code"):
            err_dict["source_line"] = match.group("code").strip()
            
        errors.append(err_dict)

    # Fallback if regex didn't match (e.g. panic or linker error)
    if not errors and raw_output:
        errors.append({"message": raw_output.strip(), "type": "raw_output"})

    return {
        "type": "compile_failed",
        "success": False,
        "error_count": len(errors),
        "errors": errors
    }