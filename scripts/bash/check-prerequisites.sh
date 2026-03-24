#!/usr/bin/env bash

# Consolidated prerequisite checking script
#
# This script provides unified prerequisite checking for Spec-Driven Development workflow.
# It replaces the functionality previously spread across multiple scripts.
#
# Usage: ./check-prerequisites.sh [OPTIONS]
#
# OPTIONS:
#   --json              Output in JSON format
#   --require-tasks     Require tasks.md to exist (for implementation phase)
#   --include-tasks     Include tasks.md in AVAILABLE_DOCS list
#   --paths-only        Only output path variables (no validation)
#   --help, -h          Show help message
#
# OUTPUTS:
#   JSON mode: {"FEATURE_DIR":"...", "AVAILABLE_DOCS":["..."]}
#   Text mode: FEATURE_DIR:... \n AVAILABLE_DOCS: \n ✓/✗ file.md
#   Paths only: REPO_ROOT: ... \n BRANCH: ... \n FEATURE_DIR: ... etc.

set -e

# Parse command line arguments
JSON_MODE=false
REQUIRE_TASKS=false
INCLUDE_TASKS=false
PATHS_ONLY=false

for arg in "$@"; do
    case "$arg" in
        --json)
            JSON_MODE=true
            ;;
        --require-tasks)
            REQUIRE_TASKS=true
            ;;
        --include-tasks)
            INCLUDE_TASKS=true
            ;;
        --paths-only)
            PATHS_ONLY=true
            ;;
        --help|-h)
            cat << 'EOF'
Usage: check-prerequisites.sh [OPTIONS]

Consolidated prerequisite checking for Spec-Driven Development workflow.

OPTIONS:
  --json              Output in JSON format
  --require-tasks     Require tasks.md to exist (for implementation phase)
  --include-tasks     Include tasks.md in AVAILABLE_DOCS list
  --paths-only        Only output path variables (no prerequisite validation)
  --help, -h          Show this help message

EXAMPLES:
  # Check task prerequisites (plan.md required)
  ./check-prerequisites.sh --json
  
  # Check implementation prerequisites (plan.md + tasks.md required)
  ./check-prerequisites.sh --json --require-tasks --include-tasks
  
  # Get feature paths only (no validation)
  ./check-prerequisites.sh --paths-only
  
EOF
            exit 0
            ;;
        *)
            echo "ERROR: Unknown option '$arg'. Use --help for usage information." >&2
            exit 1
            ;;
    esac
done

# Source common functions
SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Get feature paths and validate branch
eval $(get_feature_paths)
check_feature_branch "$CURRENT_BRANCH" "$HAS_GIT" || exit 1

# If paths-only mode, output paths and exit (support JSON + paths-only combined)
if $PATHS_ONLY; then
    if $JSON_MODE; then
        # Minimal JSON paths payload (no validation performed)
        printf '{"REPO_ROOT":"%s","BRANCH":"%s","FEATURE_DIR":"%s","FEATURE_SPEC":"%s","IMPL_PLAN":"%s","TASKS":"%s"}\n' \
            "$REPO_ROOT" "$CURRENT_BRANCH" "$FEATURE_DIR" "$FEATURE_SPEC" "$IMPL_PLAN" "$TASKS"
    else
        echo "REPO_ROOT: $REPO_ROOT"
        echo "BRANCH: $CURRENT_BRANCH"
        echo "FEATURE_DIR: $FEATURE_DIR"
        echo "FEATURE_SPEC: $FEATURE_SPEC"
        echo "IMPL_PLAN: $IMPL_PLAN"
        echo "TASKS: $TASKS"
    fi
    exit 0
fi

# Validate required directories and files
if [[ ! -d "$FEATURE_DIR" ]]; then
    echo "ERROR: Feature directory not found: $FEATURE_DIR" >&2
    echo "Run /speckit.specify first to create the feature structure." >&2
    exit 1
fi

if [[ ! -f "$IMPL_PLAN" ]]; then
    echo "ERROR: plan.md not found in $FEATURE_DIR" >&2
    echo "Run /speckit.plan first to create the implementation plan." >&2
    exit 1
fi

# Check for tasks.md if required
if $REQUIRE_TASKS && [[ ! -f "$TASKS" ]]; then
    echo "ERROR: tasks.md not found in $FEATURE_DIR" >&2
    echo "Run /speckit.tasks first to create the task list." >&2
    exit 1
fi

# Build list of available documents
docs=()

# Always check these optional docs
[[ -f "$RESEARCH" ]] && docs+=("research.md")
[[ -f "$DATA_MODEL" ]] && docs+=("data-model.md")

# Check contracts directory (only if it exists and has files)
if [[ -d "$CONTRACTS_DIR" ]] && [[ -n "$(ls -A "$CONTRACTS_DIR" 2>/dev/null)" ]]; then
    docs+=("contracts/")
fi

[[ -f "$QUICKSTART" ]] && docs+=("quickstart.md")

# Include tasks.md if requested and it exists
if $INCLUDE_TASKS && [[ -f "$TASKS" ]]; then
    docs+=("tasks.md")
fi

# Output results
if $JSON_MODE; then
    # Build JSON array of documents
    if [[ ${#docs[@]} -eq 0 ]]; then
        json_docs="[]"
    else
        json_docs=$(printf '"%s",' "${docs[@]}")
        json_docs="[${json_docs%,}]"
    fi
    
    printf '{"FEATURE_DIR":"%s","AVAILABLE_DOCS":%s}\n' "$FEATURE_DIR" "$json_docs"
else
    # Text output
    echo "FEATURE_DIR:$FEATURE_DIR"
    echo "AVAILABLE_DOCS:"
    
    # Show status of each potential document
    check_file "$RESEARCH" "research.md"
    check_file "$DATA_MODEL" "data-model.md"
    check_dir "$CONTRACTS_DIR" "contracts/"
    check_file "$QUICKSTART" "quickstart.md"
    
    if $INCLUDE_TASKS; then
        check_file "$TASKS" "tasks.md"
    fi
fi

# Function to check prerequisites for brutal review
check_brutalreview_prereqs() {
    local repo_root="$1"
    local json_output="${2:-false}"
    
    # Initialize variables
    local has_code=false
    local project_type="unknown"
    local file_stats="{}"
    local tech_stack="[]"
    local entry_points="[]"
    
    # Count files by type
    local js_count=$(find "$repo_root" -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) 2>/dev/null | wc -l)
    local py_count=$(find "$repo_root" -type f \( -name "*.py" \) 2>/dev/null | wc -l)
    local html_count=$(find "$repo_root" -type f -name "*.html" 2>/dev/null | wc -l)
    local css_count=$(find "$repo_root" -type f \( -name "*.css" -o -name "*.scss" -o -name "*.less" \) 2>/dev/null | wc -l)
    local rust_count=$(find "$repo_root" -type f -name "*.rs" 2>/dev/null | wc -l)
    local go_count=$(find "$repo_root" -type f -name "*.go" 2>/dev/null | wc -l)
    local java_count=$(find "$repo_root" -type f \( -name "*.java" -o -name "*.kt" \) 2>/dev/null | wc -l)
    local mobile_count=$(find "$repo_root" -type d \( -name "android" -o -name "ios" \) 2>/dev/null | wc -l)
    
    # Determine project type
    if [[ -f "$repo_root/pubspec.yaml" ]] || [[ $mobile_count -gt 0 ]]; then
        project_type="mobile-app"
    elif [[ -f "$repo_root/package.json" ]]; then
        if [[ -f "$repo_root/android/build.gradle" ]] || [[ -d "$repo_root/ios" ]]; then
            project_type="mobile-app"
        elif grep -q '"react"\|"vue"\|"angular"\|"svelte"' "$repo_root/package.json" 2>/dev/null; then
            project_type="web-app"
        elif grep -q '"main"\|"exports"' "$repo_root/package.json" 2>/dev/null && [[ $js_count -lt 5 ]]; then
            project_type="library"
        else
            project_type="web-app"
        fi
    elif [[ -f "$repo_root/pyproject.toml" ]] || [[ -f "$repo_root/setup.py" ]]; then
        if [[ -f "$repo_root/pyproject.toml" ]] && grep -q '\[project.scripts\]' "$repo_root/pyproject.toml" 2>/dev/null; then
            project_type="cli-tool"
        elif [[ $py_count -lt 10 ]] && [[ -f "$repo_root/setup.py" ]]; then
            project_type="library"
        else
            project_type="cli-tool"
        fi
    elif [[ -f "$repo_root/Cargo.toml" ]]; then
        if grep -q '^\[lib\]' "$repo_root/Cargo.toml" 2>/dev/null; then
            project_type="library"
        elif grep -q '\[\[bin\]\]' "$repo_root/Cargo.toml" 2>/dev/null; then
            project_type="cli-tool"
        else
            project_type="unknown"
        fi
    elif [[ -f "$repo_root/go.mod" ]]; then
        if [[ -f "$repo_root/main.go" ]] || [[ $(find "$repo_root" -name "main.go" | wc -l) -gt 0 ]]; then
            project_type="cli-tool"
        else
            project_type="library"
        fi
    fi
    
    # Check if has substantial code
    local total_files=$((js_count + py_count + html_count + css_count + rust_count + go_count + java_count))
    if [[ $total_files -gt 3 ]]; then
        has_code=true
    fi
    
    # Build file stats JSON
    file_stats=$(printf '{"javascript":%d,"python":%d,"html":%d,"css":%d,"rust":%d,"go":%d,"java":%d,"total":%d}' \
        "$js_count" "$py_count" "$html_count" "$css_count" "$rust_count" "$go_count" "$java_count" "$total_files")
    
    # Detect tech stack
    local stack_items=()
    [[ -f "$repo_root/package.json" ]] && stack_items+=("nodejs")
    [[ -f "$repo_root/pyproject.toml" ]] && stack_items+=("python")
    [[ -f "$repo_root/requirements.txt" ]] && stack_items+=("python")
    [[ -f "$repo_root/Cargo.toml" ]] && stack_items+=("rust")
    [[ -f "$repo_root/go.mod" ]] && stack_items+=("go")
    [[ -f "$repo_root/pom.xml" ]] && stack_items+=("java")
    [[ -f "$repo_root/pubspec.yaml" ]] && stack_items+=("flutter")
    [[ -f "$repo_root/Gemfile" ]] && stack_items+=("ruby")
    [[ -f "$repo_root/composer.json" ]] && stack_items+=("php")
    
    # Build tech stack JSON array
    if [[ ${#stack_items[@]} -gt 0 ]]; then
        tech_stack="[$(printf '"%s",' "${stack_items[@]}" | sed 's/,$//')]"
    fi
    
    # Find entry points
    local entry_items=()
    [[ -f "$repo_root/src/index.js" ]] && entry_items+=("src/index.js")
    [[ -f "$repo_root/src/main.py" ]] && entry_items+=("src/main.py")
    [[ -f "$repo_root/main.go" ]] && entry_items+=("main.go")
    [[ -f "$repo_root/src/main.rs" ]] && entry_items+=("src/main.rs")
    [[ -f "$repo_root/lib/main.dart" ]] && entry_items+=("lib/main.dart")
    
    if [[ ${#entry_items[@]} -gt 0 ]]; then
        entry_points="[$(printf '"%s",' "${entry_items[@]}" | sed 's/,$//')]"
    fi
    
    # Output results
    if [[ "$json_output" == "true" ]]; then
        printf '{"HAS_CODE":%s,"PROJECT_TYPE":"%s","FILE_STATS":%s,"TECH_STACK":%s,"ENTRY_POINTS":%s}\n' \
            "$has_code" "$project_type" "$file_stats" "$tech_stack" "$entry_points"
    else
        echo "HAS_CODE: $has_code"
        echo "PROJECT_TYPE: $project_type"
        echo "FILE_STATS: $file_stats"
        echo "TECH_STACK: $tech_stack"
        echo "ENTRY_POINTS: $entry_points"
    fi
}

# Handle brutalreview flags
CHECK_CODE=false
DETECT_PROJECT_TYPE=false

for arg in "$@"; do
    case "$arg" in
        --check-code)
            CHECK_CODE=true
            ;;
        --detect-project-type)
            DETECT_PROJECT_TYPE=true
            ;;
    esac
done

if $CHECK_CODE || $DETECT_PROJECT_TYPE; then
    check_brutalreview_prereqs "$REPO_ROOT" "$JSON_MODE"
    exit 0
fi
