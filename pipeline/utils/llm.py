"""Shared Claude API helper using the Anthropic SDK."""

import asyncio
import os

from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

_client: Anthropic | None = None


def _get_client() -> Anthropic:
    """Lazy-init the Anthropic client."""
    global _client
    if _client is None:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise RuntimeError("ANTHROPIC_API_KEY not set in environment or .env file")
        _client = Anthropic(api_key=api_key)
    return _client


def classify(prompt: str, system: str = "", model: str = "claude-haiku-4-5-20251001") -> str:
    """Send a message to Claude and return the text response."""
    client = _get_client()
    messages = [{"role": "user", "content": prompt}]
    kwargs: dict = {"model": model, "max_tokens": 1024, "messages": messages}
    if system:
        kwargs["system"] = system
    response = client.messages.create(**kwargs)
    return response.content[0].text.strip()


async def _classify_single(sem: asyncio.Semaphore, client: Anthropic, prompt: str, system: str, model: str) -> str:
    """Classify a single item with semaphore-limited concurrency."""
    async with sem:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, lambda: classify(prompt, system, model))


def classify_batch(
    items: list[dict],
    prompt_template: str,
    system: str = "",
    model: str = "claude-haiku-4-5-20251001",
    max_concurrent: int = 10,
) -> list[str]:
    """Process multiple items concurrently through Claude.

    Each item dict is used to format prompt_template via str.format_map().
    Returns a list of response strings in the same order as items.
    """
    if not items:
        return []

    async def _run() -> list[str]:
        client = _get_client()
        sem = asyncio.Semaphore(max_concurrent)
        tasks = []
        for item in items:
            prompt = prompt_template.format_map(item)
            tasks.append(_classify_single(sem, client, prompt, system, model))
        return await asyncio.gather(*tasks)

    return asyncio.run(_run())
