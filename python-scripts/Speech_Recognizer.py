import whisper
import numpy as np
import sys


class SpeechRecognizer:
    def __init__(self, model_size="medium"):
        self.model = whisper.load_model(model_size)
    
    def recognize(self, audio_data, min_avg_prob=0.4):
        # Convert the audio data to a NumPy array
        audio = np.frombuffer(audio_data.get_raw_data(), np.int16).astype(np.float32) / 32768.0

        # Use Whisper to transcribe the audio
        result = self.model.transcribe(audio, fp16=False, word_timestamps=True)
        words = []
        for segment in result.get("segments", []):
            words.extend(segment.get("words", []))
        if words:
            avg_prob = sum(w.get("probability", 1.0) for w in words) / len(words)
            if avg_prob < min_avg_prob:
                return None  # or return "" or a custom message
        return result["text"]

def find_microphone(mic_name):
    """Find a microphone by name."""
    mic_list = sr.Microphone.list_microphone_names()
    for i, name in enumerate(mic_list):
        if mic_name in name:
            return i
    return None


