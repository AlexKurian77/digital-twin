import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from backend.health_analyzer import HealthImpactAnalyzer
    print("Import successful")
    
    analyzer = HealthImpactAnalyzer()
    print("Initialization successful")
    
    data = {
        "aqi": 350,
        "city": "Delhi",
        "pm2_5": 210
    }
    
    print("Analyzing...")
    result = analyzer.analyze_aqi_health(data)
    print("Result keys:", result.keys())
    
except Exception as e:
    import traceback
    traceback.print_exc()
