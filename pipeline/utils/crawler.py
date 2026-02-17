"""Shared AsyncWebCrawler wrapper for Crawl4AI."""

import asyncio
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig


async def _crawl_single(crawler: AsyncWebCrawler, url: str, timeout: int) -> tuple[str, str | None]:
    """Crawl a single URL, return (url, markdown_text | None)."""
    try:
        config = CrawlerRunConfig(
            wait_until="domcontentloaded",
            page_timeout=timeout * 1000,
        )
        result = await crawler.arun(url=url, config=config)
        if result.success and result.markdown:
            return url, result.markdown.raw_markdown
        return url, None
    except Exception as e:
        print(f"  [crawl] Error crawling {url}: {e}")
        return url, None


async def _crawl_url(url: str, timeout: int) -> str | None:
    """Crawl a single URL and return markdown text or None on failure."""
    browser_config = BrowserConfig(headless=True, verbose=False)
    async with AsyncWebCrawler(config=browser_config) as crawler:
        _, text = await _crawl_single(crawler, url, timeout)
        return text


async def _crawl_urls(urls: list[str], batch_size: int, timeout: int) -> dict[str, str | None]:
    """Crawl multiple URLs concurrently in batches, return {url: text}."""
    results: dict[str, str | None] = {}
    browser_config = BrowserConfig(headless=True, verbose=False)

    async with AsyncWebCrawler(config=browser_config) as crawler:
        for i in range(0, len(urls), batch_size):
            batch = urls[i : i + batch_size]
            batch_num = i // batch_size + 1
            total_batches = (len(urls) + batch_size - 1) // batch_size
            print(f"  [crawl] Batch {batch_num}/{total_batches} ({len(batch)} URLs)")

            tasks = [_crawl_single(crawler, url, timeout) for url in batch]
            batch_results = await asyncio.gather(*tasks)

            for url, text in batch_results:
                results[url] = text

            success_count = sum(1 for _, t in batch_results if t is not None)
            print(f"  [crawl] Batch {batch_num} complete: {success_count}/{len(batch)} succeeded")

    return results


def crawl_url(url: str, timeout: int = 10) -> str | None:
    """Crawl a single URL, return markdown text or None on failure."""
    return asyncio.run(_crawl_url(url, timeout))


def crawl_urls(urls: list[str], batch_size: int = 10, timeout: int = 10) -> dict[str, str | None]:
    """Crawl multiple URLs concurrently in batches, return {url: text}."""
    if not urls:
        return {}
    return asyncio.run(_crawl_urls(urls, batch_size, timeout))
