
import os
import openai
import json
from decouple import config

# Get the API key from environment variables
# Make sure you have OPENAI_API_KEY in your .env file
openai.api_key = config('OPENAI_API_KEY', default=None)

class AIInsightService:
    """
    Service to interact with OpenAI for generating insights from journal entries.
    """

    def analyze_journal_entry(self, entry_content, preferences):
        """
        Analyzes a journal entry using OpenAI's GPT model and returns structured insights.
        """
        if not openai.api_key:
            print("ERROR: OPENAI_API_KEY is not set in the environment.")
            # Return a default or error structure if the key is missing
            return {
                "error": "OpenAI API key is not configured.",
                "sentiment_score": 0,
                "keywords": [],
                "emotions": [],
            }

        prompt = self._build_prompt(entry_content, preferences)
        
        try:
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo-1106",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that analyzes journal entries and provides spiritual and psychological insights. Your response must be in JSON format."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            insights_json = response.choices[0].message.content
            return json.loads(insights_json)

        except Exception as e:
            print(f"An error occurred with OpenAI API: {e}")
            return {
                "error": str(e),
                "sentiment_score": 0,
                "keywords": [],
                "emotions": [],
            }

    def _build_prompt(self, entry_content, preferences):
        """
        Constructs the detailed prompt for the AI model.
        """
        
        prompt = f"""
        Please analyze the following journal entry and provide a structured JSON response.
        
        Journal Entry:
        ---
        {entry_content}
        ---
        
        User Preferences:
        - Psychological insights: {preferences.get('prefer_psychological', True)}
        - Biblical insights: {preferences.get('prefer_biblical', True)}
        - Islamic insights: {preferences.get('prefer_islamic', True)}
        
        Based on the entry, provide the following in a single JSON object:
        
        1.  "sentiment_score": A float between -1.0 (very negative) and 1.0 (very positive).
        2.  "keywords": An array of 5-7 key words or short phrases from the entry.
        3.  "detected_emotions": An array of primary emotions detected (e.g., "Anxiety", "Relief", "Sadness", "Hope").
        
        4.  "psychological_insight": A JSON object with "title" and "content". This should be a brief, supportive psychological reflection on the user's expressed feelings.
        
        5.  "biblical_insight": If the user wants Biblical insights, provide a JSON object with "title", "content", and "scripture". The content should be an encouraging reflection connecting to a relevant Bible verse.
        
        6.  "islamic_insight": If the user wants Islamic insights, provide a JSON object with "title", "content", and "scripture". The content should be an encouraging reflection connecting to a relevant Quranic verse.
        
        Ensure the entire output is a single, valid JSON object.
        """
        return prompt

