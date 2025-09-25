# backend/soul_log/ai_service.py

from textblob import TextBlob
import json
import re
from typing import Dict, Any

class AIInsightService:
    """
    AI service using TextBlob for reliable sentiment analysis and insight generation
    """

    def __init__(self):
        print("TextBlob AI service initialized successfully!")

    def analyze_journal_entry(self, entry_content: str, preferences: Dict[str, bool]) -> Dict[str, Any]:
        """
        Analyzes journal entry using TextBlob and returns structured insights
        """
        if not entry_content.strip():
            return {
                "error": "Empty journal entry provided.",
                "sentiment_score": 0,
                "keywords": [],
                "emotions": [],
                "insights": []
            }

        try:
            # 1. Sentiment Analysis using TextBlob
            blob = TextBlob(entry_content)
            sentiment_score = blob.sentiment.polarity  # -1 to 1

            # 2. Keyword Extraction (simple but effective)
            words = re.findall(r'\b\w+\b', entry_content.lower())
            # Filter out common words and keep meaningful ones
            stop_words = {'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'do', 'did', 'does', 'done', 'get', 'got', 'go', 'went', 'come', 'came', 'see', 'saw', 'know', 'knew', 'think', 'thought', 'say', 'said', 'tell', 'told', 'ask', 'asked', 'give', 'gave', 'take', 'took', 'make', 'made', 'use', 'used', 'find', 'found', 'work', 'worked', 'call', 'called', 'try', 'tried', 'need', 'needed', 'feel', 'felt', 'seem', 'seemed', 'look', 'looked', 'want', 'wanted'}
            keywords = [word for word in words if len(word) > 3 and word not in stop_words][:7]

            # 3. Emotion Detection (rule-based)
            content_lower = entry_content.lower()
            detected_emotions = []
            
            emotion_patterns = {
                'stress': ['stress', 'stressed', 'overwhelm', 'pressure', 'burden', 'exhausted'],
                'sadness': ['sad', 'depressed', 'down', 'grief', 'sorrow', 'lonely', 'empty'],
                'anxiety': ['anxious', 'worry', 'fear', 'nervous', 'panic', 'scared', 'uncertain'],
                'happiness': ['happy', 'joy', 'excited', 'grateful', 'blessed', 'content', 'peaceful'],
                'anger': ['angry', 'mad', 'frustrated', 'annoyed', 'rage', 'upset', 'irritated'],
                'love': ['love', 'caring', 'affection', 'warmth', 'connection', 'close'],
                'hope': ['hope', 'optimistic', 'confident', 'positive', 'faith', 'trust']
            }
            
            for emotion, patterns in emotion_patterns.items():
                if any(pattern in content_lower for pattern in patterns):
                    detected_emotions.append(emotion)

            # 4. Generate Insights
            insights = []
            
            # Psychological insight
            if preferences.get('prefer_psychological', True):
                psych_insight = self._generate_psychological_insight(content_lower, sentiment_score, detected_emotions)
                insights.append({
                    'type': 'psychological',
                    'title': psych_insight['title'],
                    'content': psych_insight['content'],
                    'scripture_reference': ''
                })

            # Biblical insight
            if preferences.get('prefer_biblical', True):
                biblical_insight = self._generate_biblical_insight(content_lower, sentiment_score, detected_emotions)
                insights.append({
                    'type': 'biblical',
                    'title': biblical_insight['title'],
                    'content': biblical_insight['content'],
                    'scripture_reference': biblical_insight['scripture']
                })

            # Islamic insight
            if preferences.get('prefer_islamic', True):
                islamic_insight = self._generate_islamic_insight(content_lower, sentiment_score, detected_emotions)
                insights.append({
                    'type': 'islamic',
                    'title': islamic_insight['title'],
                    'content': islamic_insight['content'],
                    'scripture_reference': islamic_insight['scripture']
                })

            return {
                "sentiment_score": sentiment_score,
                "keywords": keywords,
                "emotions": detected_emotions[:3],  # Top 3 emotions
                "insights": insights
            }

        except Exception as e:
            print(f"AI analysis error: {e}")
            return {
                "error": str(e),
                "sentiment_score": 0,
                "keywords": [],
                "emotions": [],
                "insights": []
            }

    def _generate_psychological_insight(self, content: str, sentiment_score: float, emotions: list) -> Dict[str, str]:
        """Generate psychological insight based on content analysis"""
        
        # Check for specific emotional states
        if 'stress' in emotions or any(word in content for word in ['stress', 'overwhelm', 'pressure']):
            return {
                'title': 'Managing Stress and Overwhelm',
                'content': 'It sounds like you\'re experiencing significant stress. Try the 5-4-3-2-1 grounding technique: notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. Breaking large tasks into smaller, manageable steps can also help reduce overwhelm.'
            }
        elif 'anxiety' in emotions or any(word in content for word in ['anxious', 'worry', 'fear']):
            return {
                'title': 'Coping with Anxiety',
                'content': 'Anxiety can feel overwhelming, but remember that these feelings are temporary. Try deep breathing exercises or mindfulness meditation. Consider writing down your worries to help externalize and process them.'
            }
        elif 'sadness' in emotions or sentiment_score < -0.4:
            return {
                'title': 'Processing Difficult Emotions',
                'content': 'You\'re going through a challenging time, and that\'s completely okay. Allow yourself to feel these emotions without judgment. Consider reaching out to someone you trust or engaging in gentle self-care activities.'
            }
        elif 'happiness' in emotions or sentiment_score > 0.4:
            return {
                'title': 'Celebrating Positive Moments',
                'content': 'It\'s wonderful to see positive emotions in your reflection! Take a moment to savor this experience and consider what contributed to it. Practicing gratitude can help extend and amplify these positive feelings.'
            }
        elif 'anger' in emotions or any(word in content for word in ['angry', 'frustrated', 'mad']):
            return {
                'title': 'Managing Anger and Frustration',
                'content': 'Anger is a valid emotion that often signals unmet needs or boundaries. Try to identify what\'s underneath the anger - perhaps hurt, fear, or frustration. Consider healthy ways to express and process these feelings.'
            }
        else:
            return {
                'title': 'Balanced Reflection',
                'content': 'Your reflection shows emotional awareness and balance. This is a great time for self-reflection and planning. Consider what goals, relationships, or aspects of your life you\'d like to nurture moving forward.'
            }

    def _generate_biblical_insight(self, content: str, sentiment_score: float, emotions: list) -> Dict[str, str]:
        """Generate biblical insight based on content analysis"""
        
        if 'stress' in emotions or any(word in content for word in ['stress', 'worry', 'anxious', 'overwhelm']):
            return {
                'title': 'Finding Peace in God',
                'content': 'God invites you to cast your anxieties on Him. Remember that you don\'t have to carry every burden alone - Jesus offers rest for the weary and peace that surpasses understanding.',
                'scripture': '"Come to me, all you who are weary and burdened, and I will give you rest." - Matthew 11:28'
            }
        elif 'sadness' in emotions or any(word in content for word in ['sad', 'grief', 'hurt', 'pain']):
            return {
                'title': 'God\'s Comfort in Sorrow',
                'content': 'God is close to the brokenhearted and understands your pain. He promises to comfort those who mourn and to heal the wounded spirit with His loving presence.',
                'scripture': '"The Lord is close to the brokenhearted and saves those who are crushed in spirit." - Psalm 34:18'
            }
        elif 'happiness' in emotions or any(word in content for word in ['grateful', 'thankful', 'blessed', 'joy']):
            return {
                'title': 'Gratitude and Praise',
                'content': 'Your heart of gratitude reflects God\'s goodness in your life. Continue to give thanks in all circumstances, recognizing His faithful provision and love.',
                'scripture': '"Give thanks in all circumstances; for this is God\'s will for you in Christ Jesus." - 1 Thessalonians 5:18'
            }
        elif 'anger' in emotions or any(word in content for word in ['angry', 'frustrated', 'mad']):
            return {
                'title': 'God\'s Grace in Difficult Emotions',
                'content': 'Even in anger, God understands your heart. Bring your frustrations to Him in prayer, and ask for His wisdom and peace to guide your responses.',
                'scripture': '"In your anger do not sin: Do not let the sun go down while you are still angry." - Ephesians 4:26'
            }
        else:
            return {
                'title': 'Walking with God',
                'content': 'Continue to seek God\'s presence in your daily life. He desires a relationship with you and promises to guide your steps and direct your path.',
                'scripture': '"Trust in the Lord with all your heart and lean not on your own understanding." - Proverbs 3:5'
            }

    def _generate_islamic_insight(self, content: str, sentiment_score: float, emotions: list) -> Dict[str, str]:
        """Generate Islamic insight based on content analysis"""
        
        if 'stress' in emotions or any(word in content for word in ['stress', 'worry', 'anxious', 'overwhelm']):
            return {
                'title': 'Trust in Allah\'s Wisdom',
                'content': 'Allah tests His servants to strengthen their faith and bring them closer to Him. Make dua regularly and trust in His perfect timing and infinite wisdom.',
                'scripture': '"And whoever fears Allah - He will make for him a way out." - Quran 65:2'
            }
        elif 'sadness' in emotions or any(word in content for word in ['sad', 'grief', 'hurt', 'pain']):
            return {
                'title': 'Patience and Perseverance',
                'content': 'In times of difficulty, remember that Allah is Ar-Rahman (The Most Merciful). Turn to Him through prayer and dhikr, finding strength in knowing that after hardship comes ease.',
                'scripture': '"And give good tidings to the patient, who, when disaster strikes them, say, \'Indeed we belong to Allah, and indeed to Him we will return.\'" - Quran 2:155-156'
            }
        elif 'happiness' in emotions or any(word in content for word in ['grateful', 'thankful', 'blessed', 'joy']):
            return {
                'title': 'Gratitude to Allah',
                'content': 'Your gratitude pleases Allah greatly. Continue to remember His countless blessings and praise Him for His goodness and mercy in your life.',
                'scripture': '"And [remember] when your Lord proclaimed, \'If you are grateful, I will certainly give you more.\'" - Quran 14:7'
            }
        elif 'anger' in emotions or any(word in content for word in ['angry', 'frustrated', 'mad']):
            return {
                'title': 'Seeking Allah\'s Guidance in Difficulty',
                'content': 'When faced with frustration, seek refuge in Allah and ask for His guidance. Remember that controlling anger is a sign of strength and righteousness.',
                'scripture': '"And those who avoid the major sins and immoralities, and when they are angry, they forgive." - Quran 42:37'
            }
        else:
            return {
                'title': 'Seeking Allah\'s Guidance',
                'content': 'Continue to remember Allah in all aspects of your life. Regular prayer, dhikr, and reflection on His teachings will strengthen your connection with the Almighty.',
                'scripture': '"And it is He who created the heavens and earth in truth. And the day He says, \'Be,\' and it is, His word is the truth." - Quran 6:73'
            }