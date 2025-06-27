import sys
import json
from _vosk import SpeechRecognizer 
from Microphone.scriptMicrophone import MicrophoneStream 
import threading
# 
# Comms 
# 
_recognizer = None
_recognizer_ready = threading.Event()

RATE = 16000
CHUNK = 1024

def send_message(name, string, direction):
    msg = {f"{name}": f"{string}"}
    if direction is not None:
        msg["direction"] = direction
    print(json.dumps(msg))
    sys.stdout.flush()

def STTCallBack(text, partial):
    direction = None
    # Try to get DoA if mic has get_doa or get_direction
    if (
        hasattr(mic, "respeaker")
        and hasattr(mic.respeaker, "is_voice_active")
        and callable(getattr(mic.respeaker, "is_voice_active", None))
        and mic.respeaker.is_voice_active()
        and hasattr(mic.respeaker, "get_doa")
        and callable(getattr(mic.respeaker, "get_doa", None))
    ):
        try:
            direction = mic.respeaker.get_doa()
        except Exception:
            direction = None
    if text:
        print(f"Final Text: {text}", file=sys.stderr)
        send_message("confirmedText", text, direction)
    if partial:
        # print(f"Partial Text: {partial}", file=sys.stderr)
        send_message("interimResult", partial, direction)

def pauseSpeechToText():
    global _recognizer
    global _recognizer_ready
    _recognizer_ready.wait()  # Block until recognizer is ready
    if _recognizer is None:
        print("Recognizer is not initialized!", file=sys.stderr)
        return
    print("Pausing Speech to Text", file=sys.stderr)
    try:
        _recognizer.pause()
    except Exception as e:
        print(f"Error pausing recognizer: {e}", file=sys.stderr)
    return   

def resumeSpeechToText(): 
    global _recognizer 
    global _recognizer_ready 
    _recognizer_ready.wait()  # Block until recognizer is ready
    if _recognizer is None:
        print("Recognizer is not initialized!", file=sys.stderr)
        return
    print("Resuming Speech to Text", file=sys.stderr)
    try:
        _recognizer.resume()
    except Exception as e:
        print(f"Error pausing recognizer: {e}", file=sys.stderr)
    return   


def main():
    try:
        setUpSpeechToText()
    except KeyboardInterrupt:
        print("\nTerminating the program.", file=sys.stderr)
        sys.exit(0)

def setUpSpeechToText():
    global _recognizer
    global _recognizer_ready
    global mic
    mic = MicrophoneStream(rate=RATE, chunk=CHUNK)

    if(mic.respeak_active):
        print("ReSpeaker is active, using it for audio input.", file=sys.stderr)
    
    _recognizer = SpeechRecognizer(audio_source=mic, size="medium", callback=STTCallBack, rate=RATE, chunk=CHUNK)
    _recognizer_ready.set()
    threading.Thread(target=_recognizer.run, daemon=True).start()

def stdin_listener():
    for line in sys.stdin:
        print("received data in python", file=sys.stderr)
        try:
            data = json.loads(line)
            if data.get("STT") == "pause":
                pauseSpeechToText()
            elif data.get("STT") == "resume":
                resumeSpeechToText()
            elif data.get("STT") == "send_message":
                send_message(data.get("name", ""), data.get("message", ""))
            else:
                sys.stdout.flush()
            print(data, file=sys.stderr)
            sys.stdout.flush()
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            sys.stdout.flush()         


if __name__ == "__main__":
    main()
    try:
        stdin_listener()
    except KeyboardInterrupt:
        print("Interrupted by user. Exiting cleanly.")
    finally:
        # Clean up your microphone/stream here
        mic.close()  # or respeaker.terminate(), etc.
        print("Resources released.")

