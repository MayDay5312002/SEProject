# Testing API usage and capabilities
# Input spending
# Out financial analytics

import os
import json
import requests
from datetime import datetime, timedelta
import pandas as pd
from typing import Dict, List, Optional, Union

class FinancialAnalyticsAPI:
    """
    A class to interact with Anthropic's Claude API for financial analytics.
    """
    
    def __init__(self, api_key: str = None):
        """
        Initialize with your Anthropic API key.
        """
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("API key must be provided or set as ANTHROPIC_API_KEY environment variable")
        
        self.api_url = "https://api.anthropic.com/v1/messages"
        self.headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01"
        }
        
    def _format_financial_data(self, 
                              purchases: List[Dict], 
                              timeframe: str) -> str:
        """
        Format financial data for the API prompt.
        """
        purchases_str = json.dumps(purchases, indent=2)
        return f"""
        Here is financial data for {timeframe}:
        
        User purchases: {purchases_str}
        
        Please analyze this financial data and provide:
        1. Breakdown of spending by category
        2. Total spending for the timeframe
        3. Top spending categories
        4. Any unusual spending patterns or anomalies
        5. Comparison to previous periods if available
        6. Recommendations for budget optimization
        
        Format the response as structured JSON.
        """
    
    def analyze_finances(self, 
                         purchases: List[Dict], 
                         timeframe: str = "current month") -> Dict:
        """
        Send financial data to Claude API and get analytics.
        
        Args:
            purchases: List of purchase dictionaries with at least 'amount' and 'category' keys
            timeframe: String describing the time period (e.g., "current month", "previous month", "YTD")
            
        Returns:
            Dictionary containing the financial analysis
        """
        prompt = self._format_financial_data(purchases, timeframe)
        
        payload = {
            "model": "claude-3-7-sonnet-20250219",
            "max_tokens": 4000,
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }
        
        response = requests.post(self.api_url, headers=self.headers, json=payload)
        
        if response.status_code != 200:
            raise Exception(f"API request failed with status {response.status_code}: {response.text}")
            
        result = response.json()
        
        # Extract the assistant's message content
        analysis_text = result["content"][0]["text"]
        
        # Try to parse JSON from the response
        try:
            # Find JSON in the response (might be wrapped in markdown code blocks)
            json_start = analysis_text.find('{')
            json_end = analysis_text.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = analysis_text[json_start:json_end]
                analysis = json.loads(json_str)
            else:
                # If no JSON is found, return the raw text
                analysis = {"raw_analysis": analysis_text}
        except json.JSONDecodeError:
            # If JSON parsing fails, return the raw text
            analysis = {"raw_analysis": analysis_text}
            
        return analysis

    def get_current_month_data(self, purchases: List[Dict]) -> Dict:
        """Get financial analytics for the current month."""
        now = datetime.now()
        current_month = now.strftime("%B %Y")
        return self.analyze_finances(purchases, f"current month ({current_month})")
    
    def get_previous_month_data(self, purchases: List[Dict]) -> Dict:
        """Get financial analytics for the previous month."""
        now = datetime.now()
        first_day = datetime(now.year, now.month, 1)
        last_month = first_day - timedelta(days=1)
        prev_month = last_month.strftime("%B %Y")
        return self.analyze_finances(purchases, f"previous month ({prev_month})")
    
    def get_ytd_data(self, purchases: List[Dict]) -> Dict:
        """Get year-to-date financial analytics."""
        now = datetime.now()
        year = now.year
        return self.analyze_finances(purchases, f"year-to-date ({year})")

# Example usage
if __name__ == "__main__":
    # Sample purchase data
    sample_purchases = [
        {"date": "2025-04-01", "amount": 120.50, "category": "Groceries", "vendor": "Whole Foods"},
        {"date": "2025-04-02", "amount": 45.00, "category": "Dining", "vendor": "Local Restaurant"},
        {"date": "2025-04-03", "amount": 65.99, "category": "Entertainment", "vendor": "Movie Theater"},
        {"date": "2025-04-05", "amount": 200.00, "category": "Utilities", "vendor": "Electric Company"},
        {"date": "2025-04-07", "amount": 35.45, "category": "Groceries", "vendor": "Trader Joe's"},
        {"date": "2025-04-10", "amount": 89.99, "category": "Shopping", "vendor": "Target"},
        {"date": "2025-04-12", "amount": 55.00, "category": "Transportation", "vendor": "Gas Station"},
        {"date": "2025-04-15", "amount": 12.99, "category": "Subscriptions", "vendor": "Streaming Service"},
        {"date": "2025-04-18", "amount": 78.50, "category": "Dining", "vendor": "Fancy Restaurant"},
        {"date": "2025-04-20", "amount": 120.00, "category": "Shopping", "vendor": "Department Store"},
    ]
    
    # Get the API key from environment variable or pass it directly
    # Example: export ANTHROPIC_API_KEY="your-api-key-here"
    
    # Initialize the API client
    client = FinancialAnalyticsAPI()
    
    # Get current month analysis
    current_month_analysis = client.get_current_month_data(sample_purchases)
    print("Current Month Analysis:")
    print(json.dumps(current_month_analysis, indent=2))
    
    # Get YTD analysis
    ytd_analysis = client.get_ytd_data(sample_purchases)
    print("\nYear-to-Date Analysis:")
    print(json.dumps(ytd_analysis, indent=2))

# Function to read purchases from a CSV file
def load_purchases_from_csv(filepath: str) -> List[Dict]:
    """
    Load purchase data from a CSV file.
    
    Expected CSV format:
    date,amount,category,vendor
    2025-04-01,120.50,Groceries,Whole Foods
    ...
    
    Returns:
        List of purchase dictionaries
    """
    try:
        df = pd.read_csv(filepath)
        # Convert DataFrame to list of dictionaries
        purchases = df.to_dict('records')
        return purchases
    except Exception as e:
        print(f"Error loading CSV file: {e}")
        return []

# Example of using the CSV loader
# purchases = load_purchases_from_csv("financial_data.csv")
# client = FinancialAnalyticsAPI()
# analysis = client.get_current_month_data(purchases)