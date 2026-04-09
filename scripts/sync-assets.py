#!/usr/bin/env python3
"""
Sync Spec-Kit CLI Assets

This script synchronizes the "Source of Truth" (.agents/ directory) with the
distribution templates used by the specify-cli. It ensures that the CLI
always bundles the latest workflows and skills developed in the repository.

Usage:
    python scripts/sync-assets.py
"""

import os
import shutil
from pathlib import Path

# Paths relative to the repository root
REPO_ROOT = Path(__file__).parent.parent.resolve()
SOURCE_WORKFLOWS = REPO_ROOT / ".agents" / "workflows"
SOURCE_SKILLS = REPO_ROOT / ".agents" / "skills"
SOURCE_ROOT_TEMPLATES = REPO_ROOT / "templates"
SOURCE_SCRIPTS = REPO_ROOT / "scripts"

TARGET_TEMPLATES_COMMANDS = REPO_ROOT / "templates" / "commands"
TARGET_TEMPLATES_SKILLS = REPO_ROOT / "templates" / "skills"

CORE_PACK_BASE = REPO_ROOT / "src" / "specify_cli" / "core_pack"
TARGET_CORE_COMMANDS = CORE_PACK_BASE / "commands"
TARGET_CORE_SKILLS = CORE_PACK_BASE / "skills"
TARGET_CORE_TEMPLATES = CORE_PACK_BASE / "templates"
TARGET_CORE_SCRIPTS = CORE_PACK_BASE / "scripts"

def clean_dir(directory: Path):
    """Safely remove and recreate a directory."""
    if directory.exists():
        shutil.rmtree(directory)
    directory.mkdir(parents=True, exist_ok=True)
    print(f"Cleaned {directory.relative_to(REPO_ROOT)}")

def sync_workflows():
    """Sync workflows from .agents/workflows/ to target directories."""
    print("\nSyncing Workflows...")
    
    clean_dir(TARGET_TEMPLATES_COMMANDS)
    clean_dir(TARGET_CORE_COMMANDS)
    
    # Iterate over everything in the source workflows directory
    for item in SOURCE_WORKFLOWS.iterdir():
        if item.name.startswith("."):
            continue
            
        if item.is_file() and item.suffix == ".md":
            source_name = item.name
            
            # Transformation logic for top-level files:
            # speckit.uidesign.md -> uidesign.md
            # speckit.uidesign.agent.md -> uidesign.md
            target_name = source_name
            if target_name.startswith("speckit."):
                target_name = target_name[len("speckit."):]
            if target_name.endswith(".agent.md"):
                target_name = target_name[:-len(".agent.md")] + ".md"
                
            # Copy to both targets
            shutil.copy2(item, TARGET_TEMPLATES_COMMANDS / target_name)
            shutil.copy2(item, TARGET_CORE_COMMANDS / target_name)
            print(f"  v {source_name} -> {target_name}")
            
        elif item.is_dir():
            # Copy entire sub-directories (recursive support for sub-workflows like speckit.uidesign/)
            target_templates = TARGET_TEMPLATES_COMMANDS / item.name
            target_core = TARGET_CORE_COMMANDS / item.name
            
            shutil.copytree(item, target_templates)
            shutil.copytree(item, target_core)
            print(f"  v folder: {item.name}")


def sync_skills():
    """Sync skills from .agents/skills/ to target directories."""
    print("\nSyncing Skills...")
    
    clean_dir(TARGET_TEMPLATES_SKILLS)
    clean_dir(TARGET_CORE_SKILLS)
    
    for skill_folder in SOURCE_SKILLS.iterdir():
        if skill_folder.is_dir() and not skill_folder.name.startswith("."):
            dest_template = TARGET_TEMPLATES_SKILLS / skill_folder.name
            dest_core = TARGET_CORE_SKILLS / skill_folder.name
            
            shutil.copytree(skill_folder, dest_template)
            shutil.copytree(skill_folder, dest_core)
            print(f"  v skill: {skill_folder.name}")

def sync_other_templates():
    """Sync root templates to core_pack."""
    print("\nSyncing Root Templates to Core Pack...")
    
    clean_dir(TARGET_CORE_TEMPLATES)
    
    # List of files to sync based on pyproject.toml
    template_files = [
        "agent-file-template.md",
        "checklist-template.md",
        "constitution-template.md",
        "plan-template.md",
        "spec-template.md",
        "tasks-template.md",
        "vscode-settings.json"
    ]
    
    for filename in template_files:
        src = SOURCE_ROOT_TEMPLATES / filename
        if src.exists():
            shutil.copy2(src, TARGET_CORE_TEMPLATES / filename)
            print(f"  v template: {filename}")
        else:
            print(f"  ! skipped: {filename} (not found)")

def sync_scripts():
    """Sync scripts to core_pack."""
    print("\nSyncing Scripts to Core Pack...")
    
    clean_dir(TARGET_CORE_SCRIPTS)
    
    for script_type in ["bash", "powershell"]:
        src = SOURCE_SCRIPTS / script_type
        if src.exists():
            shutil.copytree(src, TARGET_CORE_SCRIPTS / script_type)
            print(f"  v scripts: {script_type}")

def main():
    sync_workflows()
    sync_skills()
    sync_other_templates()
    sync_scripts()
    print("\nSynchronization Complete!")

if __name__ == "__main__":
    main()
