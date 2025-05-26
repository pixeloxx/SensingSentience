import os
import sys
import json
import numpy as np
import pyaudio
import sounddevice as sd

from vosk import Model, KaldiRecognizer

# Constants
DEVICE_INDEX = 0  # Update this to match your headset's device index
RATE = 16000  # Sample rate
CHUNK = 1024  # Frame size
FORMAT = pyaudio.paInt16
THRESHOLD = 1000  # Adjust this to match your environment's noise level
MODEL_PATH_LARGE = "STTmodels/vosk-model-small-en-us-0.15"  # Path to your Vosk model



class SpeechRecognizer:
    def __init__(self, size="medium", callback=None):
        self.PAUSE = False
        self.callback = callback or self.default_callback
        self.model_path = MODEL_PATH_LARGE
        self.model = None
        self.stream = None
        self.recognizer = None
        self.running = False

        # Print available microphones
        print("Available microphones:", file=sys.stderr)
        print(sd.query_devices(), file=sys.stderr)

        if not os.path.exists(self.model_path):
            print(f"Model '{self.model_path}' was not found. Please check the path.", file=sys.stderr)
            exit(1)

        self.model = Model(self.model_path)
        self.p = pyaudio.PyAudio()
        self.stream = self.p.open(format=FORMAT, channels=1, rate=RATE, input=True, frames_per_buffer=CHUNK)
        self.recognizer = KaldiRecognizer(self.model, RATE)

    def default_callback(self, text, partial):
        if text:
            print(f"Final Text: {text}", file=sys.stderr)
        if partial:
            print(f"Partial Text: {partial}", file=sys.stderr)

    def run(self):
        self.running = True
        print("\nSpeak now...", file=sys.stderr)
        while self.running:
            try:
                data = self.stream.read(CHUNK, exception_on_overflow=False)
            except OSError as e:
                print(f"Audio input overflow: {e}", file=sys.stderr)
                data = b'\x00' * CHUNK
            if not self.PAUSE:
                if self.recognizer.AcceptWaveform(data):
                    result_json = json.loads(self.recognizer.Result())
                    text = result_json.get('text', '')
                    if text:
                        self.callback(text, None)
                else:
                    partial_json = json.loads(self.recognizer.PartialResult())
                    partial = partial_json.get('partial', '')
                    self.callback(None, partial)
            else:
                # clear the recognizer's buffers
                self.recognizer.Reset()
                # print("Recognizer is paused, clearing buffers.", file=sys.stderr)
    
    def pause(self):
        self.PAUSE = True
        # clear all audio buffers
        
        print("Recognizer paused.", file=sys.stderr)

    def resume(self):
        self.PAUSE = False
        print("Recognizer resumed.", file=sys.stderr)

    def stop(self):
        self.running = False
        print("Recognizer stopped.", file=sys.stderr)
 
    def detect_sound(audio_chunk):
         """Return True if audio chunk above volume threshold."""
         # Decode byte data to int16
         try:
             audio_chunk = np.frombuffer(audio_chunk, dtype=np.int16)
         except ValueError as e:
             print(f"Error decoding audio chunk: {e}",file=sys.stderr)
             return False
         # Inspect the range of audio data
         # print(f"Min: {audio_chunk.min()}, Max: {audio_chunk.max()}"
         # Compute the volume
         volume = np.abs(audio_chunk).max()  # Use absolute to handle both +ve and -ve peaks
          #print(f"Volume: {volume}"
         return volume > THRESHOLD

    