from ..models.product import ProductSearch, SearchLink, SearchLinksResponse
from ..core.config import settings
import logging
from urllib.parse import quote

logger = logging.getLogger(__name__)

class ProductService:
    def __init__(self):
        self.platform_configs = {
            "amazon": {
                "base_url": settings.AMAZON_BASE_URL,
                "search_path": "/s",
                "search_param": "k"
            },
            "flipkart": {
                "base_url": "https://www.flipkart.com",
                "search_path": "/search",
                "search_param": "q"
            }
        }

    async def get_search_links(self, search: ProductSearch) -> SearchLinksResponse:
        """
        Generate search URLs for the specified platform.
        """
        try:
            platform = search.platform.lower()
            if platform not in self.platform_configs:
                raise ValueError(f"Unsupported platform: {platform}")

            config = self.platform_configs[platform]
            encoded_query = quote(search.query)
            
            # Construct search URL
            search_url = (
                f"{config['base_url']}{config['search_path']}"
                f"?{config['search_param']}={encoded_query}"
            )
            
            # Add page parameter if needed
            if search.page and search.page > 1:
                if platform == "amazon":
                    search_url += f"&page={search.page}"
                elif platform == "flipkart":
                    search_url += f"&page={search.page}"

            search_link = SearchLink(
                platform=platform,
                search_url=search_url,
                base_url=config['base_url']
            )
            
            return SearchLinksResponse(
                links=[search_link],
                page=search.page,
                platform=platform
            )
            
        except Exception as e:
            logger.error(f"Error generating search links: {e}")
            raise

# Global product service instance
product_service = ProductService()
