import sys
import json
from _vosk import SpeechRecognizer  
import sounddevice as sd
# 
# Comms 
# 

def send_message(name, string):
    msg = {f"{name}": f"{string}"}
    print(json.dumps(msg))
    sys.stdout.flush()

def STTCallBack(text, partial):
      if text:
           print(f"Final Text: {text}",file=sys.stderr)
           send_message("confirmedText", text)
      if partial:
           print(f"Partial Text: {partial}",file=sys.stderr)
           send_message("interimResult", partial)

def main():
    # Print available microphones
    print("Available microphones:", file=sys.stderr)
    print(sd.query_devices(), file=sys.stderr)
   
    # Use the default microphone (no device_index)
    try:
        _recognizer = SpeechRecognizer(size="medium", callback=STTCallBack)

        print("\nListening...", file=sys.stderr)

    except KeyboardInterrupt:
        print("\nTerminating the program.", file=sys.stderr)
        sys.exit(0)

if __name__ == "__main__":
    main()

# Still listen for stdin messages
#
#for line in sys.stdin:
#    try:
#        data = json.loads(line)
#        response = {"reply": f"Python received: {data.get('msg', '')}"}
#        print(json.dumps(response))
#        sys.stdout.flush()
#    except Exception as e:
#        print(json.dumps({"error": str(e)}))
#        sys.stdout.flush() 
#        */