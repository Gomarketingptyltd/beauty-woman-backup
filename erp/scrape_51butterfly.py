"""
Scrape text + images from https://51butterfly.com/ with concurrency.

Outputs:
1) Downloaded images -> assets/gallery
2) CSV data         -> test_data.csv
3) Full plain text  -> assets/gallery/all_text.txt

Usage:
    python scrape_51butterfly.py
"""

from __future__ import annotations

import csv
import hashlib
import os
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from collections import deque
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup


BASE_URL = "https://51butterfly.com/"
ALLOWED_HOST = "51butterfly.com"
OUTPUT_DIR = Path("assets/gallery")
CSV_PATH = Path("test_data.csv")
TEXT_DUMP_PATH = OUTPUT_DIR / "all_text.txt"

REQUEST_TIMEOUT = 20
MAX_PAGES = 180
PAGE_WORKERS = 8
IMAGE_WORKERS = 16

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
}

PRICE_RE = re.compile(r"([$]?\s?\d[\d,]*(?:\.\d+)?)")
ROOM_HINT_RE = re.compile(
    r"\b(Melbourne CBD|City|Box Hill|Glen Waverley|Wantirna|Wantirna South|Oakleigh)\b",
    re.IGNORECASE,
)
ZH_CHAR_RE = re.compile(r"[\u4e00-\u9fff]+")
SLUG_RE = re.compile(r"/(?:zh/)?babe/([^/?#]+)")


def normalize_url(url: str) -> str:
    parsed = urlparse(url)
    # Remove fragments/query to avoid duplicate pages.
    path = parsed.path or "/"
    if path != "/" and path.endswith("/"):
        path = path[:-1]
    return f"{parsed.scheme}://{parsed.netloc}{path}"


def same_site(url: str) -> bool:
    host = (urlparse(url).netloc or "").lower()
    return ALLOWED_HOST in host


def get_soup(url: str) -> BeautifulSoup | None:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        return BeautifulSoup(resp.text, "html.parser")
    except Exception as exc:
        print(f"[WARN] Skip {url}: {exc}")
        return None


def guess_extension(img_url: str, content_type: str | None = None) -> str:
    path = urlparse(img_url).path.lower()
    for ext in (".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".bmp"):
        if path.endswith(ext):
            return ext
    if content_type:
        c = content_type.lower()
        if "jpeg" in c:
            return ".jpg"
        if "png" in c:
            return ".png"
        if "webp" in c:
            return ".webp"
        if "gif" in c:
            return ".gif"
        if "svg" in c:
            return ".svg"
    return ".jpg"


def download_image(img_url: str, out_dir: Path) -> str | None:
    try:
        # 图片本地化：用 requests.get(...).content 实际落盘，避免外链失效/防盗链。
        r = requests.get(img_url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        r.raise_for_status()
        ext = guess_extension(img_url, r.headers.get("Content-Type"))
        digest = hashlib.sha1(img_url.encode("utf-8")).hexdigest()[:16]
        filename = f"img_{digest}{ext}"
        filepath = out_dir / filename
        if not filepath.exists():
            filepath.write_bytes(r.content)
        return str(filepath.as_posix())
    except Exception as exc:
        print(f"[WARN] Failed image {img_url}: {exc}")
        return None


def extract_visible_text(soup: BeautifulSoup) -> list[str]:
    texts: list[str] = []
    for tag in soup.select("h1,h2,h3,h4,h5,h6,p,li,span,a,strong,b"):
        t = tag.get_text(" ", strip=True)
        if not t:
            continue
        # Skip nav noise duplicates a little.
        if len(t) == 1:
            continue
        texts.append(t)
    # Deduplicate while preserving order.
    seen: set[str] = set()
    deduped: list[str] = []
    for t in texts:
        if t not in seen:
            seen.add(t)
            deduped.append(t)
    return deduped


def extract_room_and_price(text_lines: list[str]) -> tuple[str, str]:
    room_name = ""
    price = ""
    for line in text_lines:
        if not room_name:
            rm = ROOM_HINT_RE.search(line)
            if rm:
                room_name = rm.group(1)
        if not price:
            pm = PRICE_RE.search(line)
            if pm:
                price = pm.group(1).replace(" ", "")
        if room_name and price:
            break
    return room_name, price


def clean_name_from_url_and_text(page_url: str, text_lines: list[str]) -> str:
    """
    名称清洗：
    1) 先从文本中抽取中文字符（更干净）
    2) 再尝试从 /zh/babe/<slug> 提取并清洗
    3) 最后回退到可读 slug
    """
    # 优先：从文字中提取中文短名称
    zh_candidates: list[str] = []
    for t in text_lines:
        matches = ZH_CHAR_RE.findall(t)
        if matches:
            zh = "".join(matches)
            if 1 <= len(zh) <= 16:
                zh_candidates.append(zh)
    if zh_candidates:
        # 去重后取第一个稳定值
        seen: set[str] = set()
        for z in zh_candidates:
            if z not in seen:
                seen.add(z)
                return z

    # 其次：从 URL slug 取名字
    m = SLUG_RE.search(page_url)
    if m:
        slug = m.group(1)
        slug = re.sub(r"[%_+-]+", " ", slug)
        slug = re.sub(r"[^A-Za-z0-9\u4e00-\u9fff ]+", "", slug).strip()
        zh_only = "".join(ZH_CHAR_RE.findall(slug))
        if zh_only:
            return zh_only
        return slug

    return ""


def collect_links(soup: BeautifulSoup, current_url: str) -> list[str]:
    found: list[str] = []
    for a in soup.select("a[href]"):
        href = a.get("href", "").strip()
        if not href:
            continue
        full = normalize_url(urljoin(current_url, href))
        if same_site(full):
            found.append(full)
    return found


def collect_image_urls(soup: BeautifulSoup, current_url: str) -> list[str]:
    urls: list[str] = []
    for img in soup.select("img"):
        src = (
            img.get("src")
            or img.get("data-src")
            or img.get("data-lazy-src")
            or ""
        ).strip()
        if not src:
            continue
        full = urljoin(current_url, src)
        if same_site(full):
            urls.append(full)
    # Deduplicate preserve order.
    seen: set[str] = set()
    out: list[str] = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            out.append(u)
    return out


def process_page(url: str) -> dict | None:
    soup = get_soup(url)
    if soup is None:
        return None
    text_lines = extract_visible_text(soup)
    room_name, price = extract_room_and_price(text_lines)
    clean_name = clean_name_from_url_and_text(url, text_lines)
    image_urls = collect_image_urls(soup, url)
    links = collect_links(soup, url)
    return {
        "url": url,
        "text_lines": text_lines,
        "room_name": room_name,
        "clean_name": clean_name,
        "price": price,
        "image_urls": image_urls,
        "links": links,
    }


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    visited: set[str] = set()
    to_visit: deque[str] = deque([normalize_url(BASE_URL)])
    rows: list[dict[str, str]] = []
    all_image_urls: set[str] = set()
    all_text_lines: list[str] = []

    pages = 0
    with ThreadPoolExecutor(max_workers=PAGE_WORKERS) as page_pool:
        while to_visit and pages < MAX_PAGES:
            batch: list[str] = []
            while to_visit and len(batch) < PAGE_WORKERS and pages + len(batch) < MAX_PAGES:
                u = to_visit.popleft()
                if u in visited:
                    continue
                visited.add(u)
                batch.append(u)

            if not batch:
                continue

            futures = {page_pool.submit(process_page, u): u for u in batch}
            for fut in as_completed(futures):
                raw_url = futures[fut]
                try:
                    result = fut.result()
                except Exception as exc:
                    print(f"[WARN] Page failed {raw_url}: {exc}")
                    continue
                if not result:
                    continue

                pages += 1
                page_url = result["url"]
                print(f"[INFO] {pages}: {page_url}")
                text_lines = result["text_lines"]
                all_text_lines.extend([f"{page_url}\t{t}" for t in text_lines])

                # 先收集图片 URL，后面统一多线程下载
                for iu in result["image_urls"]:
                    all_image_urls.add(iu)

                rows.append(
                    {
                        "page_url": page_url,
                        "name_cleaned": result["clean_name"],
                        "room_name": result["room_name"],
                        "price": result["price"],
                        "text": " | ".join(text_lines),
                        "image_count": "0",
                        "image_files": "",
                    }
                )

                for nxt in result["links"]:
                    if nxt not in visited:
                        to_visit.append(nxt)

    # 多线程下载图片（加速）
    image_map: dict[str, str] = {}
    if all_image_urls:
        with ThreadPoolExecutor(max_workers=IMAGE_WORKERS) as img_pool:
            img_futures = {
                img_pool.submit(download_image, iu, OUTPUT_DIR): iu for iu in all_image_urls
            }
            for fut in as_completed(img_futures):
                iu = img_futures[fut]
                try:
                    saved = fut.result()
                except Exception as exc:
                    print(f"[WARN] Image future failed {iu}: {exc}")
                    continue
                if saved:
                    image_map[iu] = saved

    # 回填每个页面的图片路径
    for row in rows:
        page_url = row["page_url"]
        # 用简单规则：把属于这个页面域内出现过的图片关联回去（文本里无 direct link 时可能为空）
        # 这里重新抓一次页面内 image urls（轻量，确保映射准确）
        s = get_soup(page_url)
        page_imgs = collect_image_urls(s, page_url) if s else []
        saved_files = [image_map[u] for u in page_imgs if u in image_map]
        row["image_count"] = str(len(saved_files))
        row["image_files"] = " | ".join(saved_files)

    # Write CSV
    with CSV_PATH.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "page_url",
                "name_cleaned",
                "room_name",
                "price",
                "text",
                "image_count",
                "image_files",
            ],
        )
        writer.writeheader()
        writer.writerows(rows)

    # Dump all text
    with TEXT_DUMP_PATH.open("w", encoding="utf-8") as f:
        for line in all_text_lines:
            f.write(line + os.linesep)

    print(f"[DONE] Pages: {len(rows)}")
    print(f"[DONE] Images downloaded: {len(image_map)}")
    print(f"[DONE] CSV: {CSV_PATH.resolve()}")
    print(f"[DONE] Gallery folder: {OUTPUT_DIR.resolve()}")
    print(f"[DONE] Text dump: {TEXT_DUMP_PATH.resolve()}")


if __name__ == "__main__":
    main()
