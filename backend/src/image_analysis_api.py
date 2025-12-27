"""
FastAPI Image Analysis Server
Uses YOLO for product image analysis
"""

import sys
import os

# Add the src directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import uvicorn

from yolo_service import analyze_image, get_model_status, load_yolo_model

# Initialize FastAPI app
app = FastAPI(
    title="Product Image Analysis API",
    description="AI-powered product image analysis using YOLO",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Response models
class PriceEstimate(BaseModel):
    min: int
    max: int
    suggested: int


class ProductDetails(BaseModel):
    name: str
    category: str
    subcategory: Optional[str] = None
    description: str
    estimatedPrice: PriceEstimate
    brand: str
    color: str
    material: str
    condition: str
    tags: List[str]
    specifications: Optional[Dict[str, str]] = None
    searchKeywords: Optional[str] = None
    targetAudience: Optional[str] = None
    sellingPoints: Optional[List[str]] = None


class ModelStatus(BaseModel):
    status: str
    message: str
    model: Optional[str] = None


class AnalysisResponse(BaseModel):
    success: bool
    data: Optional[ProductDetails] = None
    error: Optional[str] = None


# Startup event - preload model
@app.on_event("startup")
async def startup_event():
    """Load YOLO model on startup"""
    print("[API] Starting up, loading YOLO model...")
    load_yolo_model()
    print("[API] Startup complete")


# API Endpoints
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Product Image Analysis API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/api/model-status", response_model=ModelStatus)
async def model_status():
    """Get the current YOLO model status"""
    status = get_model_status()
    return ModelStatus(**status)


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    status = get_model_status()
    return {
        "healthy": status['status'] == 'ready',
        "model_status": status['status'],
        "message": status['message']
    }


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_product_image(file: UploadFile = File(...)):
    """
    Analyze a product image using YOLO
    
    - **file**: Image file (JPG, PNG, WebP)
    
    Returns product details including name, category, description, price estimate, etc.
    """
    # Validate file type
    allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}"
        )
    
    # Check file size (max 10MB)
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 10MB"
        )
    
    try:
        # Analyze the image
        result = analyze_image(contents)
        
        if result is None:
            return AnalysisResponse(
                success=False,
                error="Could not analyze the image. Please try a clearer product image."
            )
        
        # Remove internal fields
        if 'yolo_detections' in result:
            del result['yolo_detections']
        
        return AnalysisResponse(
            success=True,
            data=ProductDetails(**result)
        )
        
    except Exception as e:
        print(f"[API] Analysis error: {e}")
        return AnalysisResponse(
            success=False,
            error=str(e)
        )


@app.post("/api/analyze-base64")
async def analyze_base64_image(data: Dict[str, str]):
    """
    Analyze a base64-encoded product image
    
    - **image**: Base64-encoded image string (with or without data URI prefix)
    
    Returns product details
    """
    import base64
    
    image_data = data.get('image', '')
    
    if not image_data:
        raise HTTPException(status_code=400, detail="No image data provided")
    
    try:
        # Remove data URI prefix if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        # Decode base64
        image_bytes = base64.b64decode(image_data)
        
        # Analyze
        result = analyze_image(image_bytes)
        
        if result is None:
            return {
                "success": False,
                "error": "Could not analyze the image"
            }
        
        # Remove internal fields
        if 'yolo_detections' in result:
            del result['yolo_detections']
        
        return {
            "success": True,
            "data": result
        }
        
    except Exception as e:
        print(f"[API] Base64 analysis error: {e}")
        return {
            "success": False,
            "error": str(e)
        }


if __name__ == "__main__":
    uvicorn.run(
        "image_analysis_api:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )
