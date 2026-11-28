import os
import re
import stat
import subprocess
from pathlib import Path
from tempfile import NamedTemporaryFile, TemporaryDirectory, TemporaryFile
from urllib.parse import urlsplit

from fastapi import HTTPException
from filelock import FileLock, Timeout

from .config import get_settings

TEXT_LIMIT = 256 * 1024
OUTPUT_LIMIT = 512 * 1024
GITHUB_PATH = re.compile(r"/[A-Za-z0-9][A-Za-z0-9-]{0,38}/[A-Za-z0-9_.-]{1,100}/?")
REPOSITORY_SEGMENT = r"[A-Za-z0-9_][A-Za-z0-9_.-]{0,99}"
PUBLIC_GIT_PATHS = {
    "github.com": GITHUB_PATH,
    "gitlab.com": re.compile(rf"(/{REPOSITORY_SEGMENT}){{2,}}/?"),
    "codeberg.org": re.compile(rf"(/{REPOSITORY_SEGMENT}){{2}}/?"),
}
OBJECT_ID = re.compile(r"[0-9a-f]{40}|[0-9a-f]{64}")


def public_clone_url(value: str | None) -> str:
    invalid_url = "Enter an HTTPS URL for a public repository on GitHub, GitLab.com, or Codeberg."
    try:
        url = urlsplit(value or "")
    except ValueError:
        raise HTTPException(422, invalid_url) from None
    host = url.netloc.lower()
    pattern = PUBLIC_GIT_PATHS.get(host)
    if url.scheme != "https" or not pattern or url.query or url.fragment or not pattern.fullmatch(url.path):
        raise HTTPException(422, invalid_url)
    namespace, name = url.path.strip("/").rsplit("/", 1)
    name = name.removesuffix(".git")
    if name in {"", ".", ".."}:
        raise HTTPException(422, "Enter a valid Git repository name.")
    return f"https://{host}/{namespace}/{name}.git"


def run_git(directory: Path, *arguments: str, timeout: int = 20) -> str:
    env = {key: value for key, value in os.environ.items() if key.upper() in {"PATH", "SYSTEMROOT", "WINDIR", "TEMP", "TMP"}}
    env.update({"GIT_CONFIG_NOSYSTEM": "1", "GIT_CONFIG_GLOBAL": os.devnull, "GIT_TERMINAL_PROMPT": "0", "GIT_LITERAL_PATHSPECS": "1"})
    command = [
        "git", "-C", str(directory), "-c", f"core.hooksPath={os.devnull}",
        "-c", "core.symlinks=false", "-c", "core.fsmonitor=false", "-c", "credential.helper=",
        "-c", "protocol.allow=never", "-c", "protocol.https.allow=always",
        "-c", "http.followRedirects=false", "-c", "commit.gpgSign=false", *arguments,
    ]
    try:
        with TemporaryFile() as stdout:
            result = subprocess.run(command, stdout=stdout, stderr=subprocess.DEVNULL, env=env, timeout=timeout, check=False)
            stdout.seek(0)
            output = stdout.read(OUTPUT_LIMIT + 1)
    except FileNotFoundError:
        raise HTTPException(503, "Install Git on the backend host to use repository tools.") from None
    except subprocess.TimeoutExpired:
        raise HTTPException(504, "Git timed out. Try again in a moment.") from None
    if result.returncode:
        raise HTTPException(409, "Git could not complete this operation. Check the repository and try again.")
    if len(output) > OUTPUT_LIMIT:
        raise HTTPException(413, "This Git result is too large to show in Readcode.")
    return output.decode("utf-8", errors="replace")


class Repository:
    def __init__(self, project_id: str, thread_id: str | None = None):
        self.root = Path(get_settings().workspace_dir).resolve() / project_id
        self.base = self.root / "repository.git"
        self.tree = self.root / "threads" / thread_id if thread_id else None
        self.branch = f"readcode/{thread_id}" if thread_id else None

    @property
    def imported(self) -> bool:
        return (self.base / "HEAD").is_file()

    @property
    def ready(self) -> bool:
        return self.tree is not None and (self.tree / ".git").is_file()

    def lock(self):
        self.root.mkdir(parents=True, exist_ok=True)
        return FileLock(str(self.root / "workspace.lock"), timeout=3)

    def clone(self, repository_url: str) -> None:
        with self.lock():
            if self.imported:
                return
            with TemporaryDirectory(dir=self.root, prefix="clone-") as temporary:
                incoming = Path(temporary) / "repository.git"
                run_git(
                    self.root, "clone", "--bare", "--depth=1", "--single-branch", "--no-tags", "--template=",
                    "--", repository_url, str(incoming), timeout=90,
                )
                run_git(incoming, "rev-parse", "--verify", "HEAD")
                incoming.rename(self.base)

    def initialize(self, files: dict[str, bytes]) -> None:
        with self.lock():
            with TemporaryDirectory(dir=self.root, prefix="init-") as temporary:
                seed = Path(temporary) / "seed"
                seed.mkdir()
                for path, content in files.items():
                    target = seed.joinpath(*path.split("/"))
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(content)
                run_git(seed, "init", "--initial-branch=main", "--template=")
                run_git(seed, "add", "-f", "--all")
                run_git(seed, "-c", "user.name=Readcode", "-c", "user.email=workspace@readcode.local",
                        "commit", "--allow-empty", "-m", "Initialize project")
                incoming = Path(temporary) / "repository.git"
                run_git(seed, "-c", "protocol.file.allow=always", "clone", "--bare", "--no-local", "--template=", "--", str(seed), str(incoming))
                run_git(incoming, "remote", "remove", "origin")
                incoming.rename(self.base)

    def open_worktree(self) -> None:
        assert self.tree is not None and self.branch is not None
        with self.lock():
            if self.ready:
                return
            if not self.imported:
                raise HTTPException(409, "Clone the project before opening a worktree.")
            self.tree.parent.mkdir(exist_ok=True)
            run_git(self.base, "worktree", "add", "-b", self.branch, str(self.tree), "HEAD")

    def worktree(self) -> Path:
        if self.tree is None or not self.ready:
            raise HTTPException(409, "Open this thread’s worktree first.")
        return self.tree

    def status(self) -> dict:
        if not self.ready:
            return {"imported": self.imported, "ready": False, "branch": None}
        tree = self.worktree()
        return {"imported": True, "ready": True, "branch": run_git(tree, "branch", "--show-current").strip()}

    def files(self) -> list[str]:
        files = run_git(self.worktree(), "ls-files", "-z", "--cached", "--others", "--exclude-standard").split("\0")
        return sorted(set(filter(None, files)))[:2000]

    def file_path(self, name: str, *, create: bool = False) -> Path:
        root = self.worktree()
        parts = name.split("/")
        if not 1 <= len(name) <= 600 or any(
            not part or part in {".", ".."} or part.casefold() == ".git" or part.rstrip(" .") != part or
            any(char in part for char in '\\:*?"<>|') or any(ord(char) < 32 for char in part)
            for part in parts
        ):
            raise HTTPException(422, "Use a relative path inside the worktree.")
        target = root
        for index, part in enumerate(parts):
            target /= part
            try:
                info = target.lstat()
            except FileNotFoundError:
                if create and index == len(parts) - 1:
                    return target
                raise HTTPException(404, "File or parent folder not found.") from None
            if os.path.samestat(info, (root / ".git").lstat()):
                raise HTTPException(422, "Git metadata is outside the file editor.")
            expected = stat.S_ISDIR if index < len(parts) - 1 else stat.S_ISREG
            if not expected(info.st_mode) or getattr(info, "st_file_attributes", 0) & stat.FILE_ATTRIBUTE_REPARSE_POINT:
                raise HTTPException(422, "Select a regular file inside the worktree.")
        return target

    def read_file(self, name: str) -> dict:
        target = self.file_path(name)
        with target.open("rb") as source:
            data = source.read(TEXT_LIMIT + 1)
        if len(data) > TEXT_LIMIT or b"\x00" in data:
            raise HTTPException(413, "Readcode opens UTF-8 text files up to 256 KiB.")
        try:
            return {"path": name, "content": data.decode("utf-8")}
        except UnicodeDecodeError:
            raise HTTPException(422, "This file is not UTF-8 text.") from None

    def write_file(self, name: str, content: str, expected: str | None) -> dict:
        data = content.encode("utf-8")
        if len(data) > TEXT_LIMIT or b"\x00" in data:
            raise HTTPException(413, "Readcode saves text files up to 256 KiB.")
        with self.lock():
            target = self.file_path(name, create=True)
            if (self.read_file(name)["content"] if target.exists() else None) != expected:
                raise HTTPException(409, "The file changed. Reopen it before saving.")
            with NamedTemporaryFile(dir=target.parent, prefix=".readcode-", delete=False) as temporary:
                temporary.write(data)
            staging = Path(temporary.name)
            try:
                if target.exists():
                    staging.chmod(stat.S_IMODE(target.stat().st_mode))
                staging.replace(target)
            finally:
                staging.unlink(missing_ok=True)
        return {"path": name, "content": content}

    def changes(self) -> dict:
        tree = self.worktree()
        return {
            "status": run_git(tree, "status", "--porcelain=v1", "--untracked-files=all"),
            "diff": run_git(tree, "diff", "--no-ext-diff", "--no-textconv", "--no-color", "HEAD", "--"),
        }

    def checkpoints(self) -> list[dict]:
        lines = run_git(self.worktree(), "log", "-n", "25", "--format=%H%x09%s").splitlines()
        return [{"id": commit, "title": title} for commit, title in (line.split("\t", 1) for line in lines) if OBJECT_ID.fullmatch(commit)]

    def checkpoint(self, title: str) -> list[dict]:
        with self.lock():
            tree = self.worktree()
            if not run_git(tree, "status", "--porcelain=v1"):
                raise HTTPException(409, "There are no changes to checkpoint.")
            run_git(tree, "add", "--all", "--", ".")
            run_git(tree, "-c", "user.name=Readcode", "-c", "user.email=workspace@readcode.invalid", "commit", "-m", title)
            return self.checkpoints()

    def restore(self, commit: str) -> dict:
        with self.lock():
            tree = self.worktree()
            if run_git(tree, "status", "--porcelain=v1"):
                raise HTTPException(409, "Checkpoint your current changes before restoring.")
            if not OBJECT_ID.fullmatch(commit):
                raise HTTPException(422, "Choose a checkpoint from this thread.")
            run_git(tree, "merge-base", "--is-ancestor", commit, "HEAD")
            run_git(tree, "restore", f"--source={commit}", "--staged", "--worktree", "--", ".")
            return self.changes()


def call_repository(function, *args):
    try:
        return function(*args)
    except Timeout:
        raise HTTPException(409, "Another operation is using this project. Try again in a moment.") from None
    except OSError:
        raise HTTPException(500, "The workspace storage could not complete this operation.") from None
