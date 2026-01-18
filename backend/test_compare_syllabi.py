"""
Test script for the new /api/compare-syllabi-detailed endpoint
using comp2003.pdf and comp2007.pdf
"""
import requests
from pathlib import Path

# API endpoint
API_URL = "http://localhost:8000/api/compare-syllabi-detailed"

# PDF file paths (adjust if needed)
OLD_SYLLABUS = Path("services/cs2106.pdf")
NEW_SYLLABUS = Path("services/comp2003.pdf")

def test_compare_syllabi():
    print("=" * 80)
    print("🧪 Testing /api/compare-syllabi-detailed endpoint")
    print("=" * 80)
    
    # Check files exist
    if not OLD_SYLLABUS.exists():
        print(f"❌ Old syllabus not found: {OLD_SYLLABUS}")
        return
    if not NEW_SYLLABUS.exists():
        print(f"❌ New syllabus not found: {NEW_SYLLABUS}")
        return
    
    print(f"✅ Old syllabus: {OLD_SYLLABUS}")
    print(f"✅ New syllabus: {NEW_SYLLABUS}")
    
    # Prepare files for upload
    with open(OLD_SYLLABUS, 'rb') as old_file, open(NEW_SYLLABUS, 'rb') as new_file:
        files = {
            'old_syllabus': (OLD_SYLLABUS.name, old_file, 'application/pdf'),
            'new_syllabus': (NEW_SYLLABUS.name, new_file, 'application/pdf')
        }
        
        print("\n📤 Sending request to API...")
        try:
            response = requests.post(API_URL, files=files, timeout=180)
            
            print(f"\n📥 Response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("\n✅ SUCCESS!")
                print("\n📊 Response structure:")
                print(f"   - success: {data.get('success')}")
                print(f"   - old_file: {data.get('old_file')}")
                print(f"   - new_file: {data.get('new_file')}")
                print(f"   - similarity_score: {data.get('similarity_score')}%")
                print(f"   - similarity_label: {data.get('similarity_label')}")
                
                if 'ai_justification' in data:
                    ai_just = data['ai_justification']
                    print("\n🤖 AI Justification:")
                    print(f"   - overview: {ai_just.get('overview', 'N/A')[:100]}...")
                    print(f"   - key_similarities: {len(ai_just.get('key_similarities', []))} items")
                    print(f"   - key_differences: {len(ai_just.get('key_differences', []))} items")
                    print(f"   - recommendation: {ai_just.get('recommendation', 'N/A')[:100]}...")
                
                if 'syllabi_diff' in data:
                    diff = data['syllabi_diff']
                    print(f"\n📝 Syllabi Diff: {len(diff)} topics")
                    for i, item in enumerate(diff[:3]):  # Show first 3
                        print(f"   {i+1}. {item.get('topic')} ({item.get('status')})")
                
                # Save full response
                import json
                output_file = Path("test_comparison_output.json")
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                print(f"\n💾 Full response saved to: {output_file}")
                
            else:
                print(f"\n❌ ERROR: {response.status_code}")
                print(response.text)
        
        except requests.exceptions.Timeout:
            print("\n⏱️ Request timed out (exceeded 180 seconds)")
        except Exception as e:
            print(f"\n❌ Exception occurred: {e}")
    
    print("\n" + "=" * 80)
    print("🏁 Test complete")
    print("=" * 80)


if __name__ == "__main__":
    test_compare_syllabi()
