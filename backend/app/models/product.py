from pydantic import BaseModel
from typing import Optional, List

class ProductSearch(BaseModel):
    query: str
    platform: str = "amazon"  # Default to amazon
    page: Optional[int] = 1

class SearchLink(BaseModel):
    platform: str
    search_url: str
    base_url: str

class SearchLinksResponse(BaseModel):
    links: List[SearchLink]
    page: int
    platform: str
