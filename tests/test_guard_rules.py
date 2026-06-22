"""Tests for the always-active guard rules implementation."""
from pathlib import Path
import pytest

from specify_cli._assets import _locate_guard_rules
from specify_cli.integrations import get_integration
from specify_cli.integrations.manifest import IntegrationManifest


def test_locate_guard_rules():
    """Verify that guard rules directory can be located."""
    guards_dir = _locate_guard_rules()
    assert guards_dir is not None
    assert guards_dir.is_dir()
    
    # Must have the 3 default universal guards
    subdirs = [p.name for p in guards_dir.iterdir() if p.is_dir()]
    assert "clean-code-guard" in subdirs
    assert "test-guard" in subdirs
    assert "docs-guard" in subdirs


def test_guard_rules_templates_valid():
    """Verify that guard rule templates contain a rule.md file."""
    guards_dir = _locate_guard_rules()
    for guard in ["clean-code-guard", "test-guard", "docs-guard"]:
        gd_path = guards_dir / guard
        assert (gd_path / "rule.md").is_file()
        assert (gd_path / "references").is_dir()


def test_install_guard_rules_rules_directory_agent(tmp_path):
    """Verify guard rules installation for a rules-directory agent (e.g. windsurf)."""
    integration = get_integration("windsurf")
    assert integration is not None
    
    manifest = IntegrationManifest("windsurf", tmp_path)
    created = integration.install_guard_rules(tmp_path, manifest)
    
    assert len(created) > 0
    
    # Target rules directory: .windsurf/rules/
    rules_dir = tmp_path / ".windsurf" / "rules"
    assert rules_dir.is_dir()
    
    assert (rules_dir / "guard-clean-code.md").is_file()
    assert (rules_dir / "guard-test.md").is_file()
    assert (rules_dir / "guard-docs.md").is_file()
    
    # References directories
    assert (rules_dir / "guard-clean-code-references").is_dir()
    assert (rules_dir / "guard-test-references").is_dir()
    assert (rules_dir / "guard-docs-references").is_dir()


def test_install_guard_rules_cursor_agent(tmp_path):
    """Verify Cursor-agent specific rules (.mdc extension, alwaysApply frontmatter)."""
    integration = get_integration("cursor-agent")
    assert integration is not None
    
    manifest = IntegrationManifest("cursor-agent", tmp_path)
    created = integration.install_guard_rules(tmp_path, manifest)
    
    rules_dir = tmp_path / ".cursor" / "rules"
    assert rules_dir.is_dir()
    
    # Files must end with .mdc
    assert (rules_dir / "guard-clean-code.mdc").is_file()
    
    # Verify alwaysApply is true in frontmatter
    content = (rules_dir / "guard-clean-code.mdc").read_text(encoding="utf-8")
    assert "alwaysApply: true" in content
    assert "---" in content


def test_install_guard_rules_skills_agent(tmp_path):
    """Verify guard rules installation for a skills-based agent (e.g. claude)."""
    integration = get_integration("claude")
    assert integration is not None
    
    manifest = IntegrationManifest("claude", tmp_path)
    created = integration.install_guard_rules(tmp_path, manifest)
    
    assert len(created) > 0
    
    # Target directory: .claude/skills/
    skills_dir = tmp_path / ".claude" / "skills"
    assert skills_dir.is_dir()
    
    assert (skills_dir / "speckit-clean-code-guard" / "SKILL.md").is_file()
    assert (skills_dir / "speckit-clean-code-guard" / "references").is_dir()
    
    content = (skills_dir / "speckit-clean-code-guard" / "SKILL.md").read_text(encoding="utf-8")
    assert "alwaysApply: true" in content
    assert "name: speckit-clean-code-guard" in content


def test_install_guard_rules_is_additive(tmp_path):
    """Verify that install_guard_rules does not overwrite existing files."""
    integration = get_integration("windsurf")
    manifest = IntegrationManifest("windsurf", tmp_path)
    
    rules_dir = tmp_path / ".windsurf" / "rules"
    rules_dir.mkdir(parents=True)
    custom_rule = rules_dir / "guard-clean-code.md"
    custom_rule.write_text("custom user content", encoding="utf-8")
    
    created = integration.install_guard_rules(tmp_path, manifest)
    
    # Should not overwrite existing file
    assert custom_rule.read_text(encoding="utf-8") == "custom user content"


def test_uninstall_cleans_up_guard_rules(tmp_path):
    """Verify that uninstallation cleanly removes installed guard rules and empty dirs."""
    integration = get_integration("windsurf")
    manifest = IntegrationManifest("windsurf", tmp_path)
    
    created = integration.install_guard_rules(tmp_path, manifest)
    manifest.save()
    
    for f in created:
        assert f.exists()
        
    removed, skipped = integration.uninstall(tmp_path, manifest)
    assert len(removed) == len(created)
    assert len(skipped) == 0
    
    # The .windsurf directory should be cleanly removed if empty
    assert not (tmp_path / ".windsurf").exists()


def test_init_flow_installs_guard_rules_windsurf(tmp_path):
    """Verify that specify init installs guard rules for a rules-directory agent."""
    from typer.testing import CliRunner
    from specify_cli import app
    import os

    project = tmp_path / "windsurf-project"
    project.mkdir()
    old_cwd = os.getcwd()
    try:
        os.chdir(project)
        runner = CliRunner()
        result = runner.invoke(app, [
            "init", "--here", "--integration", "windsurf", "--script", "sh",
            "--ignore-agent-tools",
        ], catch_exceptions=False)
    finally:
        os.chdir(old_cwd)
        
    assert result.exit_code == 0
    rules_dir = project / ".windsurf" / "rules"
    assert rules_dir.is_dir()
    assert (rules_dir / "guard-clean-code.md").is_file()
    assert (rules_dir / "guard-clean-code-references").is_dir()


def test_init_flow_installs_guard_rules_claude(tmp_path):
    """Verify that specify init installs guard rules for a skills agent."""
    from typer.testing import CliRunner
    from specify_cli import app
    import os

    project = tmp_path / "claude-project"
    project.mkdir()
    old_cwd = os.getcwd()
    try:
        os.chdir(project)
        runner = CliRunner()
        result = runner.invoke(app, [
            "init", "--here", "--integration", "claude", "--script", "sh",
            "--ignore-agent-tools",
        ], catch_exceptions=False)
    finally:
        os.chdir(old_cwd)
        
    assert result.exit_code == 0
    skills_dir = project / ".claude" / "skills"
    assert skills_dir.is_dir()
    assert (skills_dir / "speckit-clean-code-guard" / "SKILL.md").is_file()
