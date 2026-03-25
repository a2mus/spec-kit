#!/usr/bin/env pwsh

# Consolidated prerequisite checking script (PowerShell)
#
# This script provides unified prerequisite checking for Spec-Driven Development workflow.
# It replaces the functionality previously spread across multiple scripts.
#
# Usage: ./check-prerequisites.ps1 [OPTIONS]
#
# OPTIONS:
#   -Json               Output in JSON format
#   -RequireTasks       Require tasks.md to exist (for implementation phase)
#   -IncludeTasks       Include tasks.md in AVAILABLE_DOCS list
#   -PathsOnly          Only output path variables (no validation)
#   -Help, -h           Show help message

[CmdletBinding()]
param(
    [switch]$Json,
    [switch]$RequireTasks,
    [switch]$IncludeTasks,
    [switch]$PathsOnly,
    [switch]$Help,
    [switch]$CheckCode,
    [switch]$DetectProjectType
)

$ErrorActionPreference = 'Stop'

# Show help if requested
if ($Help) {
    Write-Output @"
Usage: check-prerequisites.ps1 [OPTIONS]

Consolidated prerequisite checking for Spec-Driven Development workflow.

OPTIONS:
  -Json               Output in JSON format
  -RequireTasks       Require tasks.md to exist (for implementation phase)
  -IncludeTasks       Include tasks.md in AVAILABLE_DOCS list
  -PathsOnly          Only output path variables (no prerequisite validation)
  -Help, -h           Show this help message

EXAMPLES:
  # Check task prerequisites (plan.md required)
  .\check-prerequisites.ps1 -Json
  
  # Check implementation prerequisites (plan.md + tasks.md required)
  .\check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
  
  # Get feature paths only (no validation)
  .\check-prerequisites.ps1 -PathsOnly

"@
    exit 0
}

# Source common functions
. "$PSScriptRoot/common.ps1"

# Get feature paths and validate branch
$paths = Get-FeaturePathsEnv

if (-not (Test-FeatureBranch -Branch $paths.CURRENT_BRANCH -HasGit:$paths.HAS_GIT)) { 
    exit 1 
}

# If paths-only mode, output paths and exit (support combined -Json -PathsOnly)
if ($PathsOnly) {
    if ($Json) {
        [PSCustomObject]@{
            REPO_ROOT    = $paths.REPO_ROOT
            BRANCH       = $paths.CURRENT_BRANCH
            FEATURE_DIR  = $paths.FEATURE_DIR
            FEATURE_SPEC = $paths.FEATURE_SPEC
            IMPL_PLAN    = $paths.IMPL_PLAN
            TASKS        = $paths.TASKS
        } | ConvertTo-Json -Compress
    } else {
        Write-Output "REPO_ROOT: $($paths.REPO_ROOT)"
        Write-Output "BRANCH: $($paths.CURRENT_BRANCH)"
        Write-Output "FEATURE_DIR: $($paths.FEATURE_DIR)"
        Write-Output "FEATURE_SPEC: $($paths.FEATURE_SPEC)"
        Write-Output "IMPL_PLAN: $($paths.IMPL_PLAN)"
        Write-Output "TASKS: $($paths.TASKS)"
    }
    exit 0
}

# Validate required directories and files
if (-not (Test-Path $paths.FEATURE_DIR -PathType Container)) {
    Write-Output "ERROR: Feature directory not found: $($paths.FEATURE_DIR)"
    Write-Output "Run /speckit.specify first to create the feature structure."
    exit 1
}

if (-not (Test-Path $paths.IMPL_PLAN -PathType Leaf)) {
    Write-Output "ERROR: plan.md not found in $($paths.FEATURE_DIR)"
    Write-Output "Run /speckit.plan first to create the implementation plan."
    exit 1
}

# Check for tasks.md if required
if ($RequireTasks -and -not (Test-Path $paths.TASKS -PathType Leaf)) {
    Write-Output "ERROR: tasks.md not found in $($paths.FEATURE_DIR)"
    Write-Output "Run /speckit.tasks first to create the task list."
    exit 1
}

# Build list of available documents
$docs = @()

# Always check these optional docs
if (Test-Path $paths.RESEARCH) { $docs += 'research.md' }
if (Test-Path $paths.DATA_MODEL) { $docs += 'data-model.md' }

# Check contracts directory (only if it exists and has files)
if ((Test-Path $paths.CONTRACTS_DIR) -and (Get-ChildItem -Path $paths.CONTRACTS_DIR -ErrorAction SilentlyContinue | Select-Object -First 1)) { 
    $docs += 'contracts/' 
}

if (Test-Path $paths.QUICKSTART) { $docs += 'quickstart.md' }

# Include tasks.md if requested and it exists
if ($IncludeTasks -and (Test-Path $paths.TASKS)) { 
    $docs += 'tasks.md' 
}

# Output results
if ($Json) {
    # JSON output
    [PSCustomObject]@{ 
        FEATURE_DIR = $paths.FEATURE_DIR
        AVAILABLE_DOCS = $docs 
    } | ConvertTo-Json -Compress
} else {
    # Text output
    Write-Output "FEATURE_DIR:$($paths.FEATURE_DIR)"
    Write-Output "AVAILABLE_DOCS:"
    
    # Show status of each potential document
    Test-FileExists -Path $paths.RESEARCH -Description 'research.md' | Out-Null
    Test-FileExists -Path $paths.DATA_MODEL -Description 'data-model.md' | Out-Null
    Test-DirHasFiles -Path $paths.CONTRACTS_DIR -Description 'contracts/' | Out-Null
    Test-FileExists -Path $paths.QUICKSTART -Description 'quickstart.md' | Out-Null
    
    if ($IncludeTasks) {
        Test-FileExists -Path $paths.TASKS -Description 'tasks.md' | Out-Null
    }
}

# Function to check prerequisites for brutal review
function Test-BrutalReviewPrereqs {
    param(
        [string]$RepoRoot,
        [bool]$JsonOutput = $false
    )
    
    # Initialize variables
    $hasCode = $false
    $projectType = "unknown"
    $fileStats = @{}
    $techStack = @()
    $entryPoints = @()
    
    # Count files by type
    $jsFiles = @(Get-ChildItem -Path $RepoRoot -Recurse -Include *.js,*.ts,*.jsx,*.tsx -File -ErrorAction SilentlyContinue)
    $pyFiles = @(Get-ChildItem -Path $RepoRoot -Recurse -Include *.py -File -ErrorAction SilentlyContinue)
    $htmlFiles = @(Get-ChildItem -Path $RepoRoot -Recurse -Include *.html -File -ErrorAction SilentlyContinue)
    $cssFiles = @(Get-ChildItem -Path $RepoRoot -Recurse -Include *.css,*.scss,*.less -File -ErrorAction SilentlyContinue)
    $rustFiles = @(Get-ChildItem -Path $RepoRoot -Recurse -Include *.rs -File -ErrorAction SilentlyContinue)
    $goFiles = @(Get-ChildItem -Path $RepoRoot -Recurse -Include *.go -File -ErrorAction SilentlyContinue)
    $javaFiles = @(Get-ChildItem -Path $RepoRoot -Recurse -Include *.java,*.kt -File -ErrorAction SilentlyContinue)
    $mobileDirs = @(Get-ChildItem -Path $RepoRoot -Directory -Filter "android","ios" -ErrorAction SilentlyContinue)
    
    $fileStats = @{
        javascript = $jsFiles.Count
        python = $pyFiles.Count
        html = $htmlFiles.Count
        css = $cssFiles.Count
        rust = $rustFiles.Count
        go = $goFiles.Count
        java = $javaFiles.Count
        total = ($jsFiles.Count + $pyFiles.Count + $htmlFiles.Count + $cssFiles.Count + $rustFiles.Count + $goFiles.Count + $javaFiles.Count)
    }
    
    # Determine project type
    $pubspecYaml = Join-Path $RepoRoot "pubspec.yaml"
    $packageJson = Join-Path $RepoRoot "package.json"
    $pyprojectToml = Join-Path $RepoRoot "pyproject.toml"
    $setupPy = Join-Path $RepoRoot "setup.py"
    $cargoToml = Join-Path $RepoRoot "Cargo.toml"
    $goMod = Join-Path $RepoRoot "go.mod"
    
    if ((Test-Path $pubspecYaml) -or $mobileDirs.Count -gt 0) {
        $projectType = "mobile-app"
    }
    elseif (Test-Path $packageJson) {
        $androidGradle = Join-Path $RepoRoot "android/build.gradle"
        $iosDir = Join-Path $RepoRoot "ios"
        
        if ((Test-Path $androidGradle) -or (Test-Path $iosDir)) {
            $projectType = "mobile-app"
        }
        else {
            try {
                $packageContent = Get-Content $packageJson -Raw | ConvertFrom-Json -ErrorAction SilentlyContinue
                if ($packageContent.dependencies -and ($packageContent.dependencies.react -or $packageContent.dependencies.vue -or $packageContent.dependencies.angular -or $packageContent.dependencies.svelte)) {
                    $projectType = "web-app"
                }
                elseif ($packageContent.main -or $packageContent.exports) {
                    $projectType = "library"
                }
                else {
                    $projectType = "web-app"
                }
            }
            catch {
                $projectType = "web-app"
            }
        }
    }
    elseif ((Test-Path $pyprojectToml) -or (Test-Path $setupPy)) {
        if (Test-Path $pyprojectToml) {
            $tomlContent = Get-Content $pyprojectToml -Raw -ErrorAction SilentlyContinue
            if ($tomlContent -match '\[project\.scripts\]') {
                $projectType = "cli-tool"
            }
            elseif ($pyFiles.Count -lt 10 -and (Test-Path $setupPy)) {
                $projectType = "library"
            }
            else {
                $projectType = "cli-tool"
            }
        }
        else {
            $projectType = "cli-tool"
        }
    }
    elseif (Test-Path $cargoToml) {
        $cargoContent = Get-Content $cargoToml -Raw -ErrorAction SilentlyContinue
        if ($cargoContent -match '^\[lib\]') {
            $projectType = "library"
        }
        elseif ($cargoContent -match '\[\[bin\]\]') {
            $projectType = "cli-tool"
        }
        else {
            $projectType = "unknown"
        }
    }
    elseif (Test-Path $goMod) {
        $mainGo = Join-Path $RepoRoot "main.go"
        $mainGoFiles = @(Get-ChildItem -Path $RepoRoot -Recurse -Filter "main.go" -File -ErrorAction SilentlyContinue)
        if ((Test-Path $mainGo) -or $mainGoFiles.Count -gt 0) {
            $projectType = "cli-tool"
        }
        else {
            $projectType = "library"
        }
    }
    
    # Check if has substantial code
    if ($fileStats.total -gt 3) {
        $hasCode = $true
    }
    
    # Detect tech stack
    if (Test-Path $packageJson) { $techStack += "nodejs" }
    if (Test-Path $pyprojectToml) { $techStack += "python" }
    if (Test-Path (Join-Path $RepoRoot "requirements.txt")) { $techStack += "python" }
    if (Test-Path $cargoToml) { $techStack += "rust" }
    if (Test-Path $goMod) { $techStack += "go" }
    if (Test-Path (Join-Path $RepoRoot "pom.xml")) { $techStack += "java" }
    if (Test-Path $pubspecYaml) { $techStack += "flutter" }
    if (Test-Path (Join-Path $RepoRoot "Gemfile")) { $techStack += "ruby" }
    if (Test-Path (Join-Path $RepoRoot "composer.json")) { $techStack += "php" }
    
    # Find entry points
    $possibleEntryPoints = @(
        (Join-Path $RepoRoot "src/index.js"),
        (Join-Path $RepoRoot "src/main.py"),
        (Join-Path $RepoRoot "main.go"),
        (Join-Path $RepoRoot "src/main.rs"),
        (Join-Path $RepoRoot "lib/main.dart")
    )
    
    foreach ($ep in $possibleEntryPoints) {
        if (Test-Path $ep) {
            $entryPoints += $ep.Substring($RepoRoot.Length + 1)
        }
    }
    
    # Output results
    $result = [PSCustomObject]@{
        HAS_CODE = $hasCode
        PROJECT_TYPE = $projectType
        FILE_STATS = $fileStats
        TECH_STACK = $techStack
        ENTRY_POINTS = $entryPoints
    }
    
    if ($JsonOutput) {
        $result | ConvertTo-Json -Compress
    }
    else {
        Write-Output "HAS_CODE: $hasCode"
        Write-Output "PROJECT_TYPE: $projectType"
        Write-Output "FILE_STATS: $($fileStats | ConvertTo-Json -Compress)"
        Write-Output "TECH_STACK: [$($techStack -join ', ')]"
        Write-Output "ENTRY_POINTS: [$($entryPoints -join ', ')]"
    }
}

# Handle brutalreview parameters
if ($CheckCode -or $DetectProjectType) {
    $repoRoot = Get-Location
    Test-BrutalReviewPrereqs -RepoRoot $repoRoot -JsonOutput $Json
    exit 0
}
