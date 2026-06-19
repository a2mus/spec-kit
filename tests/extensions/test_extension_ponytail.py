"""Tests for the bundled Ponytail anti-over-engineering extension.

Validates that the extension manifest parses correctly, all referenced
command files exist, hooks are registered on the expected lifecycle events,
and the config template is valid YAML.
"""

import yaml
import pytest
from pathlib import Path

from specify_cli.extensions import ExtensionManifest
from specify_cli._assets import _locate_bundled_extension


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def ponytail_ext_dir() -> Path:
    """Return the path to the bundled ponytail extension directory."""
    ext_dir = _locate_bundled_extension("ponytail")
    assert ext_dir is not None, "ponytail extension not found as a bundled extension"
    return ext_dir


@pytest.fixture
def ponytail_manifest(ponytail_ext_dir: Path) -> ExtensionManifest:
    """Load and validate the ponytail extension manifest."""
    return ExtensionManifest(ponytail_ext_dir / "extension.yml")


# ---------------------------------------------------------------------------
# Manifest validation
# ---------------------------------------------------------------------------

class TestPonytailManifest:
    """Verify the extension.yml manifest is structurally valid."""

    def test_manifest_loads(self, ponytail_manifest: ExtensionManifest):
        """Manifest should load without raising."""
        assert ponytail_manifest.data is not None

    def test_schema_version(self, ponytail_manifest: ExtensionManifest):
        """Schema version must be 1.0."""
        assert ponytail_manifest.data["schema_version"] == "1.0"

    def test_extension_id(self, ponytail_manifest: ExtensionManifest):
        """Extension ID must be 'ponytail'."""
        assert ponytail_manifest.data["extension"]["id"] == "ponytail"

    def test_extension_name(self, ponytail_manifest: ExtensionManifest):
        """Extension should have a human-readable name."""
        name = ponytail_manifest.data["extension"]["name"]
        assert "Ponytail" in name
        assert "Over-Engineering" in name or "over-engineering" in name.lower()

    def test_extension_version(self, ponytail_manifest: ExtensionManifest):
        """Version must be valid semver."""
        assert ponytail_manifest.data["extension"]["version"] == "1.0.0"

    def test_extension_description(self, ponytail_manifest: ExtensionManifest):
        """Description should be present and under 200 chars."""
        desc = ponytail_manifest.data["extension"]["description"]
        assert len(desc) > 0
        assert len(desc) < 200

    def test_extension_author(self, ponytail_manifest: ExtensionManifest):
        """Author should be set."""
        assert ponytail_manifest.data["extension"]["author"] == "a2mus"

    def test_extension_license(self, ponytail_manifest: ExtensionManifest):
        """License should be MIT."""
        assert ponytail_manifest.data["extension"]["license"] == "MIT"

    def test_requires_speckit_version(self, ponytail_manifest: ExtensionManifest):
        """Should require a minimum spec-kit version."""
        req = ponytail_manifest.data["requires"]["speckit_version"]
        assert req.startswith(">=")

    def test_extension_id_pattern(self, ponytail_manifest: ExtensionManifest):
        """Extension ID must match ^[a-z0-9-]+$."""
        import re
        ext_id = ponytail_manifest.data["extension"]["id"]
        assert re.match(r'^[a-z0-9-]+$', ext_id), f"ID '{ext_id}' must be lowercase alphanumeric + hyphens"


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------

class TestPonytailCommands:
    """Verify all referenced command files exist and have frontmatter."""

    def test_commands_list(self, ponytail_manifest: ExtensionManifest):
        """Should provide exactly 3 commands."""
        commands = ponytail_manifest.data["provides"]["commands"]
        assert len(commands) == 3

    def test_command_names_namespace(self, ponytail_manifest: ExtensionManifest):
        """All command names must follow speckit.ponytail.<cmd> pattern."""
        import re
        commands = ponytail_manifest.data["provides"]["commands"]
        for cmd in commands:
            name = cmd["name"]
            assert re.match(r'^speckit\.ponytail\.[a-z0-9-]+$', name), \
                f"Command '{name}' must match speckit.ponytail.<cmd>"

    def test_command_files_exist(self, ponytail_manifest: ExtensionManifest, ponytail_ext_dir: Path):
        """All referenced command files must exist on disk."""
        commands = ponytail_manifest.data["provides"]["commands"]
        for cmd in commands:
            cmd_file = ponytail_ext_dir / cmd["file"]
            assert cmd_file.is_file(), f"Command file {cmd['file']} not found"

    def test_command_files_have_description(self, ponytail_manifest: ExtensionManifest, ponytail_ext_dir: Path):
        """Each command file should have a description in its frontmatter."""
        commands = ponytail_manifest.data["provides"]["commands"]
        for cmd in commands:
            cmd_file = ponytail_ext_dir / cmd["file"]
            raw = cmd_file.read_text(encoding="utf-8")
            assert raw.startswith("---"), f"{cmd['file']} must start with frontmatter"
            # Parse frontmatter
            parts = raw.split("---", 2)
            assert len(parts) >= 3, f"{cmd['file']} must have closing frontmatter delimiter"
            fm = yaml.safe_load(parts[1])
            assert isinstance(fm, dict), f"{cmd['file']} frontmatter must be a YAML mapping"
            assert "description" in fm, f"{cmd['file']} must have a description in frontmatter"

    def test_review_command(self, ponytail_manifest: ExtensionManifest):
        """Should have a ponytail.review command."""
        commands = ponytail_manifest.data["provides"]["commands"]
        names = [c["name"] for c in commands]
        assert "speckit.ponytail.review" in names

    def test_audit_command(self, ponytail_manifest: ExtensionManifest):
        """Should have a ponytail.audit command."""
        commands = ponytail_manifest.data["provides"]["commands"]
        names = [c["name"] for c in commands]
        assert "speckit.ponytail.audit" in names

    def test_debt_command(self, ponytail_manifest: ExtensionManifest):
        """Should have a ponytail.debt command."""
        commands = ponytail_manifest.data["provides"]["commands"]
        names = [c["name"] for c in commands]
        assert "speckit.ponytail.debt" in names


# ---------------------------------------------------------------------------
# Hooks
# ---------------------------------------------------------------------------

class TestPonytailHooks:
    """Verify hooks are registered on the correct lifecycle events."""

    def test_hooks_present(self, ponytail_manifest: ExtensionManifest):
        """Manifest should define hooks."""
        assert "hooks" in ponytail_manifest.data
        hooks = ponytail_manifest.data["hooks"]
        assert len(hooks) >= 2

    def test_after_implement_hook(self, ponytail_manifest: ExtensionManifest):
        """Should hook into after_implement for post-implementation review."""
        hooks = ponytail_manifest.data["hooks"]
        assert "after_implement" in hooks
        hook = hooks["after_implement"]
        assert hook["command"] == "speckit.ponytail.review"
        assert hook.get("optional") is True

    def test_after_specify_hook(self, ponytail_manifest: ExtensionManifest):
        """Should hook into after_specify for YAGNI check on spec."""
        hooks = ponytail_manifest.data["hooks"]
        assert "after_specify" in hooks
        hook = hooks["after_specify"]
        assert hook["command"] == "speckit.ponytail.review"
        assert hook.get("optional") is True

    def test_hook_commands_exist(self, ponytail_manifest: ExtensionManifest, ponytail_ext_dir: Path):
        """All hook commands should reference commands defined in provides."""
        commands = ponytail_manifest.data["provides"]["commands"]
        cmd_names = {c["name"] for c in commands}
        hooks = ponytail_manifest.data["hooks"]
        for event, hook in hooks.items():
            hook_cmd = hook["command"] if isinstance(hook, dict) else hook
            assert hook_cmd in cmd_names, \
                f"Hook {event} references command '{hook_cmd}' not in provides.commands"

    def test_hooks_are_optional(self, ponytail_manifest: ExtensionManifest):
        """All hooks should be optional (user is prompted, not forced)."""
        hooks = ponytail_manifest.data["hooks"]
        for event, hook in hooks.items():
            assert hook.get("optional") is True, \
                f"Hook {event} should be optional, not mandatory"


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

class TestPonytailConfig:
    """Verify the config template is valid and has expected keys."""

    def test_config_template_exists(self, ponytail_manifest: ExtensionManifest, ponytail_ext_dir: Path):
        """Config template file should exist if config is declared."""
        config_entries = ponytail_manifest.data["provides"].get("config", [])
        for cfg in config_entries:
            template_path = ponytail_ext_dir / cfg["template"]
            assert template_path.is_file(), f"Config template {cfg['template']} not found"

    def test_config_template_is_valid_yaml(self, ponytail_ext_dir: Path):
        """Config template should parse as valid YAML."""
        config_path = ponytail_ext_dir / "config-template.yml"
        if not config_path.exists():
            pytest.skip("No config template")
        raw = config_path.read_text(encoding="utf-8")
        data = yaml.safe_load(raw)
        assert isinstance(data, dict), "Config template must be a YAML mapping"

    def test_config_has_intensity(self, ponytail_ext_dir: Path):
        """Config should have an 'intensity' key with default 'full'."""
        config_path = ponytail_ext_dir / "config-template.yml"
        if not config_path.exists():
            pytest.skip("No config template")
        data = yaml.safe_load(config_path.read_text(encoding="utf-8"))
        assert "intensity" in data
        assert data["intensity"] in ("lite", "full", "ultra")

    def test_config_has_auto_review(self, ponytail_ext_dir: Path):
        """Config should have an 'auto_review' boolean key."""
        config_path = ponytail_ext_dir / "config-template.yml"
        if not config_path.exists():
            pytest.skip("No config template")
        data = yaml.safe_load(config_path.read_text(encoding="utf-8"))
        assert "auto_review" in data
        assert isinstance(data["auto_review"], bool)


# ---------------------------------------------------------------------------
# Bundled discovery
# ---------------------------------------------------------------------------

class TestPonytailBundled:
    """Verify the extension is discoverable as a bundled extension."""

    def test_locate_bundled_extension(self):
        """_locate_bundled_extension should find the ponytail extension."""
        ext_dir = _locate_bundled_extension("ponytail")
        assert ext_dir is not None, "ponytail extension should be locatable as bundled"
        assert (ext_dir / "extension.yml").is_file()

    def test_extension_yml_is_valid_yaml(self, ponytail_ext_dir: Path):
        """The extension.yml should parse as valid YAML."""
        raw = (ponytail_ext_dir / "extension.yml").read_text(encoding="utf-8")
        data = yaml.safe_load(raw)
        assert isinstance(data, dict)
        assert data["schema_version"] == "1.0"
        assert data["extension"]["id"] == "ponytail"


# ---------------------------------------------------------------------------
# README
# ---------------------------------------------------------------------------

class TestPonytailReadme:
    """Verify the README documents the extension properly."""

    def test_readme_exists(self, ponytail_ext_dir: Path):
        """README.md should exist."""
        assert (ponytail_ext_dir / "README.md").is_file()

    def test_readme_mentions_install(self, ponytail_ext_dir: Path):
        """README should document installation."""
        readme = (ponytail_ext_dir / "README.md").read_text(encoding="utf-8")
        assert "specify extension add ponytail" in readme

    def test_readme_mentions_commands(self, ponytail_ext_dir: Path):
        """README should list the three commands."""
        readme = (ponytail_ext_dir / "README.md").read_text(encoding="utf-8")
        assert "ponytail.review" in readme
        assert "ponytail.audit" in readme
        assert "ponytail.debt" in readme

    def test_readme_mentions_ladder(self, ponytail_ext_dir: Path):
        """README should explain the ladder."""
        readme = (ponytail_ext_dir / "README.md").read_text(encoding="utf-8")
        assert "YAGNI" in readme
        assert "stdlib" in readme.lower() or "Stdlib" in readme

    def test_readme_mentions_license(self, ponytail_ext_dir: Path):
        """README should state the license."""
        readme = (ponytail_ext_dir / "README.md").read_text(encoding="utf-8")
        assert "MIT" in readme
