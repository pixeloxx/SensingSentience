import sys
import json
from _vosk import SpeechRecognizer  
import threading
# 
# Comms 
# 
_recognizer = None
_recognizer_ready = threading.Event()

def send_message(name, string):
    msg = {f"{name}": f"{string}"}
    print(json.dumps(msg))
    sys.stdout.flush()

def STTCallBack(text, partial):
      if text:
           print(f"Final Text: {text}",file=sys.stderr)
           send_message("confirmedText", text)
      if partial:
           #print(f"Partial Text: {partial}",file=sys.stderr)
           send_message("interimResult", partial)

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
    # Use the default microphone (no device_index)
    try:
        setUpSpeechToText()
    except KeyboardInterrupt:
        print("\nTerminating the program.", file=sys.stderr)
        sys.exit(0)

def setUpSpeechToText():
    global _recognizer
    global _recognizer_ready
    _recognizer = SpeechRecognizer(size="medium", callback=STTCallBack)
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
    stdin_listener()

