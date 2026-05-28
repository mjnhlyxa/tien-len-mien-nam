from pymongo import MongoClient
from functools import wraps
import os

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://10.60.184.61:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "tien_len_mien_nam")

_client = None
_db = None

def get_db():
    global _client, _db
    if _db is None:
        _client = MongoClient(MONGODB_URI)
        _db = _client[MONGODB_DB_NAME]
    return _db

def close_db():
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
