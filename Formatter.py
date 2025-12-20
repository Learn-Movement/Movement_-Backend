import re
from typing import List, Dict, Any


# ---------------------------------------------------------
# Helpers
# ---------------------------------------------------------

ERROR_BLOCK_REGEX = re.compile(
    r"error:\s+(?P<message>.+?)\n\s*┌─\s+(?P<file>.+?):(?P<line>\d+):(?P<column>\d+)",
    re.DOTALL
)

LINE_POINTER_REGEX = re.compile(r"\n\s*\|\n(?P<line_no>\d+)\s*│\s*(?P<code>.+)")


# ---------------------------------------------------------
# Error Formatter
# ---------------------------------------------------------

def format_move_error(raw_output: str) -> Dict[str, Any]:
    """
    Converts raw Move compiler output into structured JSON
    suitable for frontend display.
    """

    errors: List[Dict[str, Any]] = []

    for match in ERROR_BLOCK_REGEX.finditer(raw_output):
        error = {
            "type": "compile_error",
            "message": match.group("message").strip(),
            "file": match.group("file"),
            "line": int(match.group("line")),
            "column": int(match.group("column")),
        }

        # Try to extract the offending line of code
        pointer_match = LINE_POINTER_REGEX.search(raw_output)
        if pointer_match:
            error["source_line"] = pointer_match.group("code").strip()

        errors.append(error)

    # Fallback if parsing fails
    if not errors:
        return {
            "type": "unknown_error",
            "raw": raw_output.strip()
        }

    return {
        "type": "compile_failed",
        "error_count": len(errors),
        "errors": errors
    }


# ---------------------------------------------------------
# Success Formatter
# ---------------------------------------------------------

def format_success_output(
    modules: List[Dict[str, Any]],
    package_metadata_bcs: str,
    compiler_stdout: str,
    metadata: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Normalises successful compilation output
    """

    return {
        "type": "compile_success",
        "modules": modules,
        "package_metadata_bcs": package_metadata_bcs,
        "metadata": metadata,
        "compiler_logs": compiler_stdout.strip()
    }


# ---------------------------------------------------------
# Unified Entry Point
# ---------------------------------------------------------

def format_compiler_response(result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Decides whether the compiler output is success or failure
    and formats accordingly.
    """

    if not result.get("success"):
        return format_move_error(result.get("error", ""))

    return format_success_output(
        modules=result.get("modules", []),
        package_metadata_bcs=result.get("package_metadata_bcs"),
        compiler_stdout=result.get("compiler_stdout", ""),
        metadata=result.get("metadata", {})
    )
