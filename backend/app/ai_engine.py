import re
from typing import Dict
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# Sentiment analyzer
analyzer = SentimentIntensityAnalyzer()

# ----------------------------
# KEYWORD LISTS
# ----------------------------

INSULT_WORDS = {
    "stupid","idiot","dumb","loser","moron","trash","ugly",
    "worthless","pathetic","useless","jerk","bastard"
}

PROFANITY_WORDS = {
    "fuck","shit","bitch","asshole","fucking","motherfucker",
    "damn","bullshit"
}

THREAT_WORDS = {
    "kill","die","attack","hurt","destroy","beat","shoot"
}

SEXUAL_WORDS = {
    "sex","nude","porn","sexy","boobs","ass","naked",
    "dick","pussy"
}

# ----------------------------
# TEXT CLEANING
# ----------------------------

def clean_text(text: str):
    text = (text or "").strip()
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"[^\w\s]", "", text)
    return text.lower()


def tokenize(text: str):
    text = clean_text(text)
    tokens = text.split()
    return tokens


# ----------------------------
# BULLYING DETECTION
# ----------------------------

def detect_words(tokens, word_list):
    for t in tokens:
        if t in word_list:
            return True
    return False


# ----------------------------
# SENTIMENT CHECK
# ----------------------------

def sentiment_negative(text):
    sentiment = analyzer.polarity_scores(text)
    if sentiment["compound"] < -0.3:
        return True
    return False


# ----------------------------
# BULLYING SCORE
# ----------------------------

def bullying_score(text):
    tokens = tokenize(text)
    score = 0

    if detect_words(tokens, INSULT_WORDS):
        score += 0.3

    if detect_words(tokens, PROFANITY_WORDS):
        score += 0.3

    if detect_words(tokens, SEXUAL_WORDS):
        score += 0.2

    if detect_words(tokens, THREAT_WORDS):
        score += 0.5

    if sentiment_negative(text):
        score += 0.2

    if score > 1:
        score = 1

    return score


# ----------------------------
# SUPPORT RESPONSES
# ----------------------------

def supportive_response():
    return (
        "I'm really sorry that you're experiencing this. "
        "Cyberbullying can be very hurtful. Remember that it is not your fault. "
        "You may consider blocking the user, reporting the behavior, "
        "or talking to someone you trust."
    )


def kindness_suggestion():
    return (
        "It may help to stay calm and avoid responding aggressively. "
        "Sometimes ignoring or blocking the person is the best option."
    )


def positive_message():
    return (
        "I'm here to listen and support you. "
        "You can tell me what happened."
    )


# ----------------------------
# CHAT RESPONSE
# ----------------------------

def chat_response(messages: list):
    try:
        user_message = messages[-1]["content"]
        score = bullying_score(user_message)
        tokens = tokenize(user_message)

        if "hi" in tokens or "hello" in tokens:
            reply = "Hello! I'm here to support you. How can I help today?"

        elif score > 0.6:
            reply = supportive_response()

        elif score > 0.3:
            reply = kindness_suggestion()

        elif sentiment_negative(user_message):
            reply = (
                "I'm sorry you're feeling this way. "
                "If you'd like to talk about what's happening, I'm here."
            )

        else:
            reply = positive_message()

        return {
            "reply": reply,
            "bullying_score": score,
            "source": "assistant"
        }

    except Exception as e:
        print("Chat error:", e)
        return {
            "reply": "Something went wrong. Please try again.",
            "source": "error"
        }


# ----------------------------
# ROLEPLAY TRAINING
# ----------------------------

def simulate_roleplay(scenario: str, user_response: str):
    score = bullying_score(user_response)

    if score < 0.3:
        feedback = "That response was calm and constructive."
    elif score < 0.6:
        feedback = "Your response might escalate the situation. Try to stay calm."
    else:
        feedback = "This response is aggressive and may worsen the conflict."

    return {
        "scenario": scenario,
        "feedback": feedback,
        "bullying_score": score
    }


# ----------------------------
# MAIN ANALYSIS FUNCTION
# ----------------------------

def analyze_text(text: str) -> Dict:
    bully = bullying_score(text)
    return {
        "bullying_score": bully,
        "is_bullying": bully > 0.5,
        "support_message": supportive_response(),
        "kindness_suggestion": kindness_suggestion()
    }