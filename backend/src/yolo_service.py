"""
YOLO-based Product Image Analysis Service
Uses YOLOv8 for object detection and classification
"""

import os
import io
import base64
import hashlib
from typing import Optional, Dict, Any, List
from PIL import Image
import numpy as np

# YOLO model - will be loaded lazily
_model = None
_model_loaded = False

# Product category mappings based on YOLO COCO classes
COCO_TO_PRODUCT_CATEGORY = {
    # Electronics
    'cell phone': ('Electronics', 'Mobile Phones'),
    'laptop': ('Electronics', 'Laptops'),
    'keyboard': ('Electronics', 'Computer Accessories'),
    'mouse': ('Electronics', 'Computer Accessories'),
    'remote': ('Electronics', 'Accessories'),
    'tv': ('Electronics', 'Television'),
    
    # Fashion
    'tie': ('Fashion', 'Accessories'),
    'handbag': ('Fashion', 'Bags'),
    'backpack': ('Fashion', 'Bags'),
    'suitcase': ('Fashion', 'Luggage'),
    'umbrella': ('Fashion', 'Accessories'),
    
    # Home & Kitchen
    'bottle': ('Home & Kitchen', 'Containers'),
    'cup': ('Home & Kitchen', 'Drinkware'),
    'bowl': ('Home & Kitchen', 'Dinnerware'),
    'knife': ('Home & Kitchen', 'Cutlery'),
    'spoon': ('Home & Kitchen', 'Cutlery'),
    'fork': ('Home & Kitchen', 'Cutlery'),
    'wine glass': ('Home & Kitchen', 'Drinkware'),
    'clock': ('Home & Kitchen', 'Decor'),
    'vase': ('Home & Kitchen', 'Decor'),
    'scissors': ('Home & Kitchen', 'Tools'),
    'toothbrush': ('Home & Kitchen', 'Personal Care'),
    'hair drier': ('Home & Kitchen', 'Personal Care'),
    
    # Furniture
    'chair': ('Furniture', 'Seating'),
    'couch': ('Furniture', 'Seating'),
    'bed': ('Furniture', 'Bedroom'),
    'dining table': ('Furniture', 'Tables'),
    'potted plant': ('Home & Garden', 'Plants'),
    
    # Sports & Outdoors
    'sports ball': ('Sports', 'Equipment'),
    'baseball bat': ('Sports', 'Equipment'),
    'baseball glove': ('Sports', 'Equipment'),
    'skateboard': ('Sports', 'Equipment'),
    'surfboard': ('Sports', 'Water Sports'),
    'tennis racket': ('Sports', 'Equipment'),
    'frisbee': ('Sports', 'Outdoor Games'),
    'skis': ('Sports', 'Winter Sports'),
    'snowboard': ('Sports', 'Winter Sports'),
    'kite': ('Sports', 'Outdoor'),
    
    # Books & Stationery
    'book': ('Books & Stationery', 'Books'),
    
    # Food & Beverages
    'banana': ('Food & Beverages', 'Fruits'),
    'apple': ('Food & Beverages', 'Fruits'),
    'orange': ('Food & Beverages', 'Fruits'),
    'sandwich': ('Food & Beverages', 'Prepared Food'),
    'broccoli': ('Food & Beverages', 'Vegetables'),
    'carrot': ('Food & Beverages', 'Vegetables'),
    'hot dog': ('Food & Beverages', 'Prepared Food'),
    'pizza': ('Food & Beverages', 'Prepared Food'),
    'donut': ('Food & Beverages', 'Bakery'),
    'cake': ('Food & Beverages', 'Bakery'),
    
    # Vehicles (for toy/model products)
    'bicycle': ('Sports & Outdoors', 'Cycling'),
    'motorcycle': ('Vehicles', 'Motorcycles'),
    'car': ('Vehicles', 'Cars'),
    'truck': ('Vehicles', 'Commercial'),
    'boat': ('Vehicles', 'Boats'),
    'airplane': ('Toys & Games', 'Models'),
    
    # Animals (for toys/pet products)
    'teddy bear': ('Toys & Games', 'Stuffed Animals'),
}

# Price estimation based on category
CATEGORY_PRICE_RANGES = {
    'Electronics': {'min': 500, 'max': 50000, 'suggested': 5000},
    'Fashion': {'min': 200, 'max': 10000, 'suggested': 1500},
    'Home & Kitchen': {'min': 100, 'max': 5000, 'suggested': 800},
    'Furniture': {'min': 2000, 'max': 100000, 'suggested': 15000},
    'Sports': {'min': 300, 'max': 20000, 'suggested': 2500},
    'Books & Stationery': {'min': 50, 'max': 2000, 'suggested': 350},
    'Food & Beverages': {'min': 50, 'max': 1000, 'suggested': 200},
    'Toys & Games': {'min': 100, 'max': 5000, 'suggested': 800},
    'Vehicles': {'min': 5000, 'max': 500000, 'suggested': 50000},
    'Home & Garden': {'min': 200, 'max': 10000, 'suggested': 1500},
    'Sports & Outdoors': {'min': 500, 'max': 30000, 'suggested': 5000},
    'default': {'min': 100, 'max': 5000, 'suggested': 1000},
}


def load_yolo_model():
    """Load the YOLO model (lazy loading)"""
    global _model, _model_loaded
    
    if _model_loaded:
        return _model
    
    try:
        from ultralytics import YOLO
        # Use YOLOv8 nano for fast inference, can upgrade to yolov8s or yolov8m for better accuracy
        _model = YOLO('yolov8n.pt')
        _model_loaded = True
        print("[YOLO Service] Model loaded successfully")
        return _model
    except Exception as e:
        print(f"[YOLO Service] Failed to load model: {e}")
        _model_loaded = False
        return None


def get_model_status() -> Dict[str, Any]:
    """Get the current model status"""
    global _model, _model_loaded
    
    if _model_loaded and _model is not None:
        return {
            'status': 'ready',
            'message': 'YOLO model loaded and ready',
            'model': 'YOLOv8n'
        }
    
    # Try to load the model
    model = load_yolo_model()
    if model:
        return {
            'status': 'ready',
            'message': 'YOLO model loaded and ready',
            'model': 'YOLOv8n'
        }
    
    return {
        'status': 'error',
        'message': 'Failed to load YOLO model',
        'model': None
    }


def analyze_image(image_data: bytes) -> Optional[Dict[str, Any]]:
    """
    Analyze a product image using YOLO
    
    Args:
        image_data: Raw image bytes
        
    Returns:
        Product details dictionary or None if analysis fails
    """
    model = load_yolo_model()
    if model is None:
        raise Exception("YOLO model not available")
    
    try:
        # Load image from bytes
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Run YOLO inference
        results = model(image, verbose=False)
        
        # Process results
        detections = []
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for i, box in enumerate(boxes):
                    cls_id = int(box.cls[0])
                    confidence = float(box.conf[0])
                    class_name = model.names[cls_id]
                    
                    detections.append({
                        'class': class_name,
                        'confidence': confidence,
                        'bbox': box.xyxy[0].tolist()
                    })
        
        # Sort by confidence
        detections.sort(key=lambda x: x['confidence'], reverse=True)
        
        # Generate product details based on detections
        product_details = generate_product_details(detections, image)
        
        return product_details
        
    except Exception as e:
        print(f"[YOLO Service] Analysis error: {e}")
        raise


def extract_dominant_colors(image: Image.Image, num_colors: int = 3) -> List[str]:
    """Extract dominant colors from image"""
    try:
        # Resize for faster processing
        img = image.copy()
        img.thumbnail((150, 150))
        
        # Convert to numpy array
        img_array = np.array(img)
        
        # Reshape to list of pixels
        pixels = img_array.reshape(-1, 3)
        
        # Simple color clustering using numpy
        # Get unique colors and their counts
        from collections import Counter
        
        # Quantize colors to reduce variety
        quantized = (pixels // 32) * 32
        color_counts = Counter(map(tuple, quantized))
        
        # Get most common colors
        common_colors = color_counts.most_common(num_colors)
        
        color_names = []
        for color, _ in common_colors:
            name = rgb_to_color_name(color)
            if name not in color_names:
                color_names.append(name)
        
        return color_names[:num_colors] if color_names else ['Multi-color']
        
    except Exception as e:
        print(f"[YOLO Service] Color extraction error: {e}")
        return ['Unknown']


def rgb_to_color_name(rgb: tuple) -> str:
    """Convert RGB tuple to color name"""
    r, g, b = rgb
    
    # Simple color classification
    if r > 200 and g > 200 and b > 200:
        return 'White'
    if r < 50 and g < 50 and b < 50:
        return 'Black'
    if r > 150 and g < 100 and b < 100:
        return 'Red'
    if r < 100 and g > 150 and b < 100:
        return 'Green'
    if r < 100 and g < 100 and b > 150:
        return 'Blue'
    if r > 200 and g > 200 and b < 100:
        return 'Yellow'
    if r > 200 and g > 100 and b < 100:
        return 'Orange'
    if r > 150 and g < 100 and b > 150:
        return 'Purple'
    if r > 150 and g > 100 and b > 100:
        return 'Pink'
    if r > 100 and g > 80 and b < 80:
        return 'Brown'
    if abs(r - g) < 30 and abs(g - b) < 30:
        if r > 150:
            return 'Light Gray'
        return 'Gray'
    
    return 'Multi-color'


def generate_product_details(detections: List[Dict], image: Image.Image) -> Dict[str, Any]:
    """Generate product details from YOLO detections"""
    
    # Get primary detection
    primary_class = 'product'
    confidence = 0.0
    category = 'General'
    subcategory = 'Products'
    
    if detections:
        primary = detections[0]
        primary_class = primary['class']
        confidence = primary['confidence']
        
        # Map to product category
        if primary_class in COCO_TO_PRODUCT_CATEGORY:
            category, subcategory = COCO_TO_PRODUCT_CATEGORY[primary_class]
    
    # Extract colors
    colors = extract_dominant_colors(image)
    primary_color = colors[0] if colors else 'Multi-color'
    
    # Get price range for category
    price_range = CATEGORY_PRICE_RANGES.get(category, CATEGORY_PRICE_RANGES['default'])
    
    # Generate product name
    product_name = generate_product_name(primary_class, primary_color, category)
    
    # Generate description
    description = generate_description(primary_class, primary_color, category, subcategory)
    
    # Generate tags
    tags = generate_tags(primary_class, category, subcategory, colors, detections)
    
    # Generate selling points
    selling_points = generate_selling_points(category, primary_class)
    
    # Build response
    return {
        'name': product_name,
        'category': category,
        'subcategory': subcategory,
        'description': description,
        'estimatedPrice': {
            'min': price_range['min'],
            'max': price_range['max'],
            'suggested': price_range['suggested']
        },
        'brand': 'Unbranded',
        'color': primary_color,
        'material': guess_material(category, primary_class),
        'condition': 'New',
        'tags': tags,
        'specifications': {
            'detected_object': primary_class.title(),
            'confidence': f"{confidence * 100:.1f}%",
            'colors_detected': ', '.join(colors),
            'image_size': f"{image.width}x{image.height}"
        },
        'searchKeywords': ', '.join(tags[:5]),
        'targetAudience': get_target_audience(category),
        'sellingPoints': selling_points,
        'yolo_detections': detections[:5]  # Include top 5 detections for reference
    }


def generate_product_name(detected_class: str, color: str, category: str) -> str:
    """Generate a product name based on detection"""
    class_title = detected_class.replace('_', ' ').title()
    
    templates = [
        f"Premium {color} {class_title}",
        f"{color} {class_title} - High Quality",
        f"Stylish {class_title} in {color}",
        f"{class_title} ({color})"
    ]
    
    import random
    return random.choice(templates)


def generate_description(detected_class: str, color: str, category: str, subcategory: str) -> str:
    """Generate a product description"""
    class_title = detected_class.replace('_', ' ').title()
    
    return (
        f"Discover this beautiful {color.lower()} {class_title.lower()} from our {category} collection. "
        f"This {subcategory.lower()} item features premium quality materials and excellent craftsmanship. "
        f"Perfect for everyday use, this product combines style and functionality. "
        f"A must-have addition to your collection."
    )


def generate_tags(detected_class: str, category: str, subcategory: str, colors: List[str], detections: List[Dict]) -> List[str]:
    """Generate product tags"""
    tags = set()
    
    # Add detected class
    tags.add(detected_class.replace('_', ' ').lower())
    
    # Add category and subcategory
    tags.add(category.lower())
    tags.add(subcategory.lower())
    
    # Add colors
    for color in colors:
        tags.add(color.lower())
    
    # Add other detected objects
    for det in detections[:3]:
        tags.add(det['class'].replace('_', ' ').lower())
    
    # Add common e-commerce tags
    common_tags = ['new arrival', 'best seller', 'trending', 'high quality', 'premium']
    import random
    tags.update(random.sample(common_tags, 2))
    
    return list(tags)[:10]


def generate_selling_points(category: str, detected_class: str) -> List[str]:
    """Generate selling points based on category"""
    general_points = [
        "Premium quality materials",
        "Excellent value for money",
        "Fast shipping available",
        "Easy returns within 7 days"
    ]
    
    category_points = {
        'Electronics': ["Latest technology", "1 year warranty", "Energy efficient"],
        'Fashion': ["Trendy design", "Comfortable fit", "Durable fabric"],
        'Home & Kitchen': ["Easy to clean", "Dishwasher safe", "BPA-free materials"],
        'Furniture': ["Sturdy construction", "Easy assembly", "Modern design"],
        'Sports': ["Professional grade", "Lightweight design", "Enhanced grip"],
    }
    
    points = general_points.copy()
    if category in category_points:
        points.extend(category_points[category][:2])
    
    return points[:5]


def guess_material(category: str, detected_class: str) -> str:
    """Guess material based on category and class"""
    materials = {
        'Electronics': 'Plastic & Metal',
        'Fashion': 'Cotton Blend',
        'Home & Kitchen': 'Stainless Steel',
        'Furniture': 'Wood & Metal',
        'Sports': 'Composite Materials',
        'Toys & Games': 'Safe Plastic',
        'Books & Stationery': 'Paper',
        'Food & Beverages': 'Organic',
    }
    
    return materials.get(category, 'Mixed Materials')


def get_target_audience(category: str) -> str:
    """Get target audience for category"""
    audiences = {
        'Electronics': 'Tech enthusiasts, professionals, and gadget lovers',
        'Fashion': 'Fashion-conscious individuals aged 18-45',
        'Home & Kitchen': 'Homeowners and cooking enthusiasts',
        'Furniture': 'Home decorators and interior design lovers',
        'Sports': 'Athletes and fitness enthusiasts',
        'Toys & Games': 'Children and parents',
        'Books & Stationery': 'Students and professionals',
    }
    
    return audiences.get(category, 'General consumers looking for quality products')
