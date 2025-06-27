import sys
import json
import numpy as np
import sounddevice as sd
from piper.voice import PiperVoice
import threading
import os

# List of available models
MODEL_PATHS = [
    "./TTSmodels/en_GB-cori-high.onnx",
    "./TTSmodels/en_GB-alan-medium.onnx",
    "./TTSmodels/en_US-lessac-medium.onnx"
    "./TTSmodels/de_DE-thorsten-medium.onnx",
]

playback_thread = None
stop_event = threading.Event()
pause_event = threading.Event()
voice_cache = {}

def get_voice(model_path):
    if model_path not in voice_cache:
        voice_cache[model_path] = PiperVoice.load(model_path)
    return voice_cache[model_path]

def send_message(name, string):
    msg = {f"{name}": f"{string}"}
    print(json.dumps(msg))
    sys.stdout.flush()

def play_stream(voice, text, stop_event, pause_event):
    try:
        send_message("tts", "started")
        stream = sd.OutputStream(samplerate=voice.config.sample_rate, channels=1, dtype='int16')
        stream.start()
        for audio_bytes in voice.synthesize_stream_raw(text):
            if stop_event.is_set():
                break
            while pause_event.is_set():
                sd.sleep(100)
                if stop_event.is_set():
                    break
            int_data = np.frombuffer(audio_bytes, dtype=np.int16)
            stream.write(int_data)
        stream.stop()
        stream.close()
        send_message("tts", "stopped")
    except Exception as e:
        print(f"Audio playback error: {e}", file=sys.stderr)
        send_message("tts", f"error: {e}")

def handle_command(cmd):
    global pause_event
    if cmd == "pause":
        pause_event.set()
        print(f"pausing", file=sys.stderr)
    elif cmd == "resume":
        pause_event.clear()
        send_message("tts", "resumed")

def main():
    global playback_thread, stop_event, pause_event

    print("Ready for text input...", file=sys.stderr)
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            # Try to parse as JSON
            try:
                msg = json.loads(line)
            except Exception:
                msg = {}

            # Handle pause/resume commands
            if isinstance(msg, dict) and "tts" in msg:
                handle_command(msg["tts"])
                continue

            # Otherwise, treat as TTS request
            text = msg.get("text", "") if isinstance(msg, dict) else line
            model_no = int(msg.get("model", 0)) if isinstance(msg, dict) else 0

            if not text:
                continue
            if not (0 <= model_no < len(MODEL_PATHS)):
                print(f"Invalid model number: {model_no}", file=sys.stderr)
                continue
            model_path = MODEL_PATHS[model_no]
            if not os.path.isfile(model_path):
                print(f"Model file not found: {model_path}", file=sys.stderr)
                continue

            voice = get_voice(model_path)
            print(f"Synthesizing: {text} (model: {model_path})", file=sys.stderr)

            # Interrupt current playback if running
            if playback_thread and playback_thread.is_alive():
                stop_event.set()
                playback_thread.join()
            stop_event = threading.Event()
            pause_event.clear()
            playback_thread = threading.Thread(target=play_stream, args=(voice, text, stop_event, pause_event))
            playback_thread.start()
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            send_message("tts", f"error: {e}")

if __name__ == "__main__":
    main()