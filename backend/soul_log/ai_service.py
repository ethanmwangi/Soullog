import os
import json
from typing import Dict, Any
from decouple import config
from huggingface_hub import InferenceClient, HfApi

class AIInsightService:
    """
    Service to interact with Hugging Face Inference API for generating insights from journal entries.
    Replaces OpenAI with free HF models for sentiment, emotions, keywords, and structured insights.
    """

    def __init__(self):
        # Get token from .env or CLI cache
        api_key = config('HF_TOKEN', default=None)
        if not api_key:
            try:
                # Fallback to CLI login cache
                hf_api = HfApi()
                user_info = hf_api.whoami(token=None)
                api_key = user_info.get('token')  # Pulls from cache if logged in
            except Exception:
                pass
        
        if not api_key:
            raise ValueError(
                "HF_TOKEN is not set in .env or via 'huggingface-cli login'. "
                "Get a token from https://huggingface.co/settings/tokens and add to .env."
            )
        
        self.client = InferenceClient(api_key=api_key)
        print("Hugging Face AI service initialized successfully!")  # Debug log

    def analyze_journal_entry(self, entry_content: str, preferences: Dict[str, bool]) -> Dict[str, Any]:
        """
        Analyzes a journal entry using Hugging Face models and returns structured insights.
        Output matches OpenAI format: JSON dict with sentiment, keywords, emotions, and conditional insights.
        """
        if not entry_content.strip():
            return {
                "error": "Empty journal entry provided.",
                "sentiment_score": 0,
                "keywords": [],
                "detected_emotions": [],
            }

        try:
            # 1. Sentiment Analysis (using classification model for accuracy)
            sentiment_model = "cardiffnlp/twitter-roberta-base-sentiment-latest"
            sentiment_result = self.client.text_classification(
                sentiment_model,
                entry_content,
                parameters={"candidate_labels": ["POSITIVE", "NEUTRAL", "NEGATIVE"]}
            )
            label = sentiment_result[0]['label'] if sentiment_result else "NEUTRAL"
            sentiment_score = 1.0 if label == "POSITIVE" else (-1.0 if label == "NEGATIVE" else 0.0)

            # 2. Emotion Detection (classification)
            emotion_model = "bhadresh-savani/distilbert-base-uncased-emotion"
            emotion_result = self.client.text_classification(emotion_model, entry_content)
            detected_emotions = [r['label'] for r in emotion_result] if emotion_result else []

            # 3. Keyword Extraction (light generation)
            keyword_prompt = f"Extract 5-7 key words or short phrases from: {entry_content[:300]}"
            keywords_result = self.client.text_generation(
                "distilgpt2",
                keyword_prompt,
                max_new_tokens=50,
                temperature=0.1  # Low for factual
            )
            generated_keywords = keywords_result.generated_text[len(keyword_prompt):].strip()
            keywords = [w.strip('.,()[]{}"\'') for w in generated_keywords.split() if len(w) > 2][:7]

            # 4. Generate Structured Insights (single call with JSON prompt)
            insight_prompt = self._build_prompt(entry_content, preferences)
            insights_result = self.client.text_generation(
                "google/flan-t5-large",  # Good for instruction-following and structured output
                insight_prompt,
                max_new_tokens=300,
                temperature=0.7,
                do_sample=True
            )
            generated_text = insights_result.generated_text.strip()

            # Parse JSON from output (prompt ensures it's JSON)
            try:
                # Extract JSON block (handle any prefix/suffix)
                start = generated_text.find('{')
                end = generated_text.rfind('}') + 1
                if start != -1 and end > start:
                    insights_json = json.loads(generated_text[start:end])
                else:
                    raise json.JSONDecodeError("No JSON found", generated_text, 0)
            except json.JSONDecodeError:
                # Fallback: Build basic structure with rule-based insights
                insights_json = self._generate_fallback_insights(
                    entry_content, preferences, sentiment_score, keywords, detected_emotions
                )

            # Ensure all required keys are present (even if empty)
            result = {
                "sentiment_score": sentiment_score,
                "keywords": keywords,
                "detected_emotions": detected_emotions,
                **insights_json  # Merge insights (psychological, biblical, etc.)
            }
            return result

        except Exception as e:
            print(f"An error occurred with Hugging Face API: {e}")
            return {
                "error": str(e),
                "sentiment_score": 0,
                "keywords": [],
                "detected_emotions": [],
            }

    def _build_prompt(self, entry_content: str, preferences: Dict[str, bool]) -> str:
        """
        Constructs the detailed prompt for the AI model (adapted for HF text generation).
        """
        psych = "yes" if preferences.get('prefer_psychological', True) else "no"
        biblical = "yes" if preferences.get('prefer_biblical', True) else "no"
        islamic = "yes" if preferences.get('prefer_islamic', True) else "no"

        prompt = f"""
        Analyze this journal entry and output ONLY a valid JSON object with the following structure:

        Journal Entry: {entry_content[:500]}  # Truncate for token limits

        Preferences:
        - Psychological: {psych}
        - Biblical: {biblical}
        - Islamic: {islamic}

        JSON Structure:
        {{
            "psychological_insight": {{"title": "Brief title", "content": "Supportive psychological reflection"}} if {psych} else null,
            "biblical_insight": {{"title": "Title", "content": "Encouraging reflection", "scripture": "Relevant Bible verse"}} if {biblical} else null,
            "islamic_insight": {{"title": "Title", "content": "Encouraging reflection", "scripture": "Relevant Quran verse"}} if {islamic} else null
        }}

        - Insights should be brief (1-2 sentences), positive/supportive, and connected to the entry.
        - For biblical/islamic: Include a real, relevant scripture reference.
        - Output ONLY the JSON object—no extra text.
        """
        return prompt

    def _generate_fallback_insights(self, entry_content: str, preferences: Dict[str, bool], 
                                    sentiment_score: float, keywords: list, emotions: list) -> Dict[str, Any]:
        """
        Rule-based fallback if JSON parsing fails (simple, non-AI insights).
        """
        insights = {}
        
        # Psychological (always include if preferred)
        if preferences.get('prefer_psychological', True):
            if sentiment_score < -0.2:
                content = "You're navigating some challenges—it's normal to feel this way. Consider talking to a trusted friend or professional for support."
            elif sentiment_score > 0.2:
                content = "Positive reflections like this build resilience. Keep nurturing what brings you joy."
            else:
                content = "Balanced emotions suggest growth. Use this clarity for mindful planning."
            insights["psychological_insight"] = {
                "title": "Emotional Reflection",
                "content": content
            }
        
        # Biblical (if preferred)
        if preferences.get('prefer_biblical', True):
            insights["biblical_insight"] = {
                "title": "Divine Comfort",
                "content": "In times of reflection, seek God's peace that surpasses understanding.",
                "scripture": "'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.' - Philippians 4:6"
            }
        
        # Islamic (if preferred)
        if preferences.get('prefer_islamic', True):
            insights["islamic_insight"] = {
                "title": "Divine Wisdom",
                "content": "Turn to Allah in your reflections for guidance and inner peace.",
                "scripture": "'Indeed, with hardship [will be] ease.' - Quran 94:6"
            }
        
        return insights