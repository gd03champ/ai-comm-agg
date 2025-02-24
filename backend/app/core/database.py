from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from .config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None
    
    async def connect(self):
        """Create database connection."""
        try:
            self.client = AsyncIOMotorClient(settings.MONGODB_URL)
            self.db = self.client.ai_commerce_db
            
            # Verify connection
            await self.client.admin.command('ping')
            logger.info("Successfully connected to MongoDB")
            
            # Create indexes
            await self.create_indexes()
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise e
    
    async def close(self):
        """Close database connection."""
        if self.client:
            self.client.close()
            logger.info("Database connection closed")
    
    async def create_indexes(self):
        """Create necessary database indexes."""
        try:
            # Products collection indexes
            await self.db.products.create_index([("title", "text")])
            await self.db.products.create_index([("platform", 1)])
            await self.db.products.create_index([("price", 1)])
            
            # Users collection indexes
            await self.db.users.create_index([("email", 1)], unique=True)
            
            logger.info("Database indexes created successfully")
        except Exception as e:
            logger.error(f"Failed to create indexes: {e}")
            raise e

# Global database instance
db = Database()
