"""
Data fetcher for GeckoTerminal API
"""

import requests
import time
import json
import os
from typing import Dict, List
from datetime import datetime
import config


def fetch_pool_data(pool_address: str, retries: int = 3) -> Dict:
    """
    Fetch OHLCV data for a specific pool from GeckoTerminal API

    Args:
        pool_address: The Solana pool address
        retries: Number of retry attempts if request fails

    Returns:
        Dictionary containing pool data and OHLCV list
    """
    url = f"{config.BASE_URL}/networks/{config.NETWORK}/pools/{pool_address}/ohlcv/{config.TIMEFRAME}"
    headers = {"Accept": "application/json"}

    for attempt in range(retries):
        try:
            print(f"Fetching data for pool: {pool_address[:8]}...")
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()

            data = response.json()
            return data

        except requests.exceptions.RequestException as e:
            print(f"Attempt {attempt + 1}/{retries} failed: {e}")
            if attempt < retries - 1:
                time.sleep(2)  # Wait before retry
            else:
                raise Exception(f"Failed to fetch data for {pool_address} after {retries} attempts")

    return None


def save_cache(data: Dict, cache_path: str):
    """
    Save fetched data to cache file

    Args:
        data: Dictionary to cache
        cache_path: Path to save cache file
    """
    os.makedirs(os.path.dirname(cache_path), exist_ok=True)
    with open(cache_path, 'w') as f:
        json.dump({
            'cached_at': datetime.now().isoformat(),
            'data': data
        }, f, indent=2)
    print(f"✓ Data cached to: {cache_path}")


def load_cache(cache_path: str) -> Dict:
    """
    Load data from cache file

    Args:
        cache_path: Path to cache file

    Returns:
        Cached data dictionary or None if not found
    """
    if not os.path.exists(cache_path):
        return None

    try:
        with open(cache_path, 'r') as f:
            cache = json.load(f)
            cached_time = datetime.fromisoformat(cache['cached_at'])
            print(f"✓ Loading cached data from {cached_time.strftime('%Y-%m-%d %H:%M:%S')}")
            return cache['data']
    except Exception as e:
        print(f"✗ Error loading cache: {e}")
        return None


def fetch_all_pools(use_cache: bool = False, cache_path: str = None) -> Dict[str, Dict]:
    """
    Fetch data for all pools defined in config

    Args:
        use_cache: If True, load from cache instead of API
        cache_path: Path to cache file

    Returns:
        Dictionary mapping pool names to their data
    """
    if cache_path is None:
        cache_path = f"{config.OUTPUT_DIR}/api_cache.json"

    # Try to load from cache if requested
    if use_cache:
        cached_data = load_cache(cache_path)
        if cached_data:
            return cached_data
        else:
            print("Cache not found, fetching from API...")

    # Fetch from API
    all_pool_data = {}

    for pool_name, pool_info in config.POOLS.items():
        print(f"\nFetching {pool_info['name']}...")
        try:
            data = fetch_pool_data(pool_info['address'])
            all_pool_data[pool_name] = {
                'info': pool_info,
                'data': data
            }
            print(f"✓ Successfully fetched {len(data['data']['attributes']['ohlcv_list'])} data points")
        except Exception as e:
            print(f"✗ Error fetching {pool_name}: {e}")
            all_pool_data[pool_name] = {
                'info': pool_info,
                'data': None,
                'error': str(e)
            }

        # Be nice to the API
        time.sleep(1)

    # Save to cache
    save_cache(all_pool_data, cache_path)

    return all_pool_data


def parse_ohlcv_data(pool_data: Dict) -> List[Dict]:
    """
    Parse raw OHLCV data into a list of dictionaries

    Args:
        pool_data: Raw pool data from API

    Returns:
        List of dictionaries with parsed OHLCV data
    """
    if not pool_data or 'data' not in pool_data:
        return []

    ohlcv_list = pool_data['data']['attributes']['ohlcv_list']
    parsed_data = []

    for entry in ohlcv_list:
        timestamp, open_price, high, low, close, volume = entry
        parsed_data.append({
            'timestamp': timestamp,
            'open': open_price,
            'high': high,
            'low': low,
            'close': close,
            'volume': volume
        })

    return parsed_data


if __name__ == "__main__":
    # Test the fetcher
    print("Testing GeckoTerminal API fetcher...")
    all_data = fetch_all_pools()

    for pool_name, pool_data in all_data.items():
        if pool_data.get('data'):
            ohlcv = parse_ohlcv_data(pool_data.get('data'))
            print(f"\n{pool_name}: {len(ohlcv)} data points")
            if ohlcv:
                print(f"  First: {ohlcv[0]}")
                print(f"  Last: {ohlcv[-1]}")
