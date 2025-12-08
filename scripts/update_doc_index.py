import os
import re
import subprocess
import datetime

REPO_ROOT = os.path.dirname(os.path.abspath(__file__))
INDEX_MD = os.path.join(REPO_ROOT, "docs", "INDEX.md")

# Automatically index Markdown and documentation files
def find_doc_files(root="."):
    doc_files = []
    for folder, dirs, files in os.walk(root):
        # skip .git, node_modules, and other irrelevant dirs
        for d in [".git", "node_modules", "__pycache__"]:
            if d in dirs:
                dirs.remove(d)
        for fname in files:
            if fname.endswith((".md", ".markdown", ".txt", ".html")):
                # skip index!
                relpath = os.path.relpath(os.path.join(folder, fname), root)
                if not relpath.endswith("INDEX.md"):
                    doc_files.append(relpath)
    return doc_files

def get_git_metadata(fpath):
    try:
        # Format: hash|author|timestamp
        result = subprocess.run([
            "git", "log", "-1", "--pretty=format:%H|%an|%ad", "--", fpath
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        parts = result.stdout.strip().split("|")
        if len(parts) == 3:
            commit_hash, author, last_updated = parts
            return author, last_updated
    except Exception:
        pass
    return "unknown", "unknown"

def categorize(fpath):
    folder = os.path.dirname(fpath)
    topic = "General"
    concern = "Documentation"
    if "contracts" in folder:
        topic = "Smart Contracts"
    elif "src" in folder or "frontend" in folder:
        topic = "Frontend"
    elif "api" in folder or "backend" in folder:
        topic = "API/Backend"
    elif "docs" in folder:
        topic = "Internal Docs"
    elif "test" in folder or "tests" in folder:
        topic = "Testing"
    # Add more rules as needed

    fname = os.path.basename(fpath).lower()
    if "readme" in fname:
        concern = "Overview"
    elif "guide" in fname or "quickstart" in fname:
        concern = "Guide"
    elif "summary" in fname or "report" in fname:
        concern = "Report"
    elif "implementation" in fname:
        concern = "Implementation"
    return topic, concern

def write_index(entries):
    md = []
    md.append("# 📚 Documentation Index — DashZeroAlionSystems/LightDom\n")
    md.append(f"_Auto-generated: {datetime.date.today().isoformat()}_\n")

    sections = {}
    for entry in entries:
        topic = entry["topic"]
        sections.setdefault(topic, []).append(entry)

    for topic, ents in sections.items():
        md.append(f"\n## {topic}\n")
        for e in ents:
            md.append(f"- [{e['title']}]({e['relpath']})\n"
                      f"  _Topic_: {e['topic']}\n"
                      f"  _Concern_: {e['concern']}\n"
                      f"  **Last Updated By:** {e['author']}\n"
                      f"  **Last Updated At:** {e['last_updated']}\n"
                      f"  **[Content Link]({e['url']})**\n")
    with open(INDEX_MD, "w", encoding="utf-8") as f:
        f.write("\n".join(md))
    print(f"Wrote index to {INDEX_MD} ({len(entries)} documents indexed)")

def main():
    files = find_doc_files(REPO_ROOT)
    entries = []
    for f in files:
        author, last_updated = get_git_metadata(f)
        topic, concern = categorize(f)
        url = f"https://github.com/DashZeroAlionSystems/LightDom/blob/main/{f}"
        title = os.path.basename(f)
        entries.append({
            "title": title,
            "relpath": f,
            "topic": topic,
            "concern": concern,
            "author": author,
            "last_updated": last_updated,
            "url": url,
        })
    write_index(entries)

if __name__ == "__main__":
    main()