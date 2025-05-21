import os
import sys
import json
import numpy as np
import pyaudio

from vosk import Model, KaldiRecognizer

       # Constants
DEVICE_INDEX = 0  # Update this to match your headset's device index
RATE = 16000  # Sample rate
CHUNK = 1024  # Frame size
FORMAT = pyaudio.paInt16
RECORD_SECONDS = 10  # Duration to record after detecting voice
THRESHOLD = 1000  # Adjust this to match your environment's noise level
MODEL_PATH_LARGE = "models/vosk-model-small-en-us-0.15/"  # Path to your Vosk model


class SpeechRecognizer:
    def __init__(self, size="medium", callback=None):
        model_path = MODEL_PATH_LARGE
       
        if not os.path.exists(model_path):
            print(f"Model '{model_path}' was not found. Please check the path.",file=sys.stderr)
            exit(1)

        model = Model(model_path)

        # Settings for PyAudio
        sample_rate = RATE
        chunk_size = CHUNK
        format = FORMAT
        channels = 1

            # default callback function
        def default_callback(text, partial):
            if text:
                print(f"Final Text: {text}",file=sys.stderr)
            if partial:
                print(f"Partial Text: {partial}",file=sys.stderr)

        def detect_sound(audio_chunk):
                """Return True if audio chunk above volume threshold."""
                # Decode byte data to int16
                try:
                    audio_chunk = np.frombuffer(audio_chunk, dtype=np.int16)
                except ValueError as e:
                    print(f"Error decoding audio chunk: {e}",file=sys.stderr)
                    return False

                # Inspect the range of audio data
                # print(f"Min: {audio_chunk.min()}, Max: {audio_chunk.max()}")

                # Compute the volume
                volume = np.abs(audio_chunk).max()  # Use absolute to handle both +ve and -ve peaks
                #print(f"Volume: {volume}")

                return volume > THRESHOLD


        # Initialization of PyAudio and speech recognition
        p = pyaudio.PyAudio()
        stream = p.open(format=format, channels=channels, rate=sample_rate, input=True, frames_per_buffer=chunk_size)
        recognizer = KaldiRecognizer(model, sample_rate)

        os.system('clear')
        print("\nSpeak now...",file=sys.stderr)
    
        self.callback = callback or default_callback

        while True:
            try:
                
                data = stream.read(chunk_size, exception_on_overflow=False)
            except OSError as e:
                print(f"Audio input overflow: {e}",file=sys.stderr)
                data = b'\x00' * chunk_size  # Use silence to fill the gap
            if recognizer.AcceptWaveform(data):
                result_json = json.loads(recognizer.Result())
                text = result_json.get('text', '')
                if text:
                     self.callback(text, None)  # Call the callback with the final text

            else:
                partial_json = json.loads(recognizer.PartialResult())
                partial = partial_json.get('partial', '')
                self.callback(None, partial)  # Call the callback with the partial result

 
