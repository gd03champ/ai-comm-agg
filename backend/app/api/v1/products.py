from fastapi import APIRouter, HTTPException
from ...models.product import ProductSearch, SearchLinksResponse
from ...services.product_service import product_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/search-links", response_model=SearchLinksResponse)
async def get_search_links(
    search: ProductSearch
):
    """
    Get search URLs for products across e-commerce platforms.
    The frontend will handle the actual scraping using these URLs.
    """
    try:
        return await product_service.get_search_links(search)
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error in search-links endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while generating search links"
        )

@router.get("/supported-platforms")
async def get_supported_platforms():
    """
    Get list of supported e-commerce platforms.
    """
    return {
        "platforms": [
            {
                "id": "amazon",
                "name": "Amazon India",
                "base_url": "https://www.amazon.in"
            },
            {
                "id": "flipkart",
                "name": "Flipkart",
                "base_url": "https://www.flipkart.com"
            }
        ]
    }

@router.get("/health")
async def health_check():
    """
    Health check endpoint for the products API.
    """
    return {"status": "healthy"}
