import sys
import json
import threading
import time
import random
import speech_recognition as sr
from Speech_Recognizer import SpeechRecognizer  # <-- import here

# 
# Comms 
# 

def send_message(name, string):
    msg = {f"{name}": f"{string}"}
    print(json.dumps(msg))
    sys.stdout.flush()

def send_random_messages():
    while True:
        msg = {"random": f"Random number: {random.randint(1, 100)}"}
        print(json.dumps(msg))
        sys.stdout.flush()
        time.sleep(50)



def main():
    # Print available microphones
    print("Available microphones:", file=sys.stderr)
    mic_list = sr.Microphone.list_microphone_names()
    for i, name in enumerate(mic_list):
        print(f"{i}: {name}", file=sys.stderr)

    # Use the default microphone (no device_index)
    try:
        mic = sr.Microphone()  # Use default mic
        recognizer = sr.Recognizer()
        _recognizer = SpeechRecognizer(model_size="small")

        print("\nListening...", file=sys.stderr)

        with mic as source:
            recognizer.adjust_for_ambient_noise(source)
            while True:
                print("Listening...", file=sys.stderr)
                audio = recognizer.listen(source)
                try:
                    text = _recognizer.recognize(audio)
                    if text:
                        print(f"You said: {text}", file=sys.stderr)
                        send_message("speech", text)
                    else:
                        print("Low confidence, ignoring utterance.", file=sys.stderr)
                except Exception as e:
                    print(f"Could not recognize speech; {e}", file=sys.stderr)

    except KeyboardInterrupt:
        print("\nTerminating the program.", file=sys.stderr)
        sys.exit(0)

if __name__ == "__main__":
    main()


# Start the random message thread
threading.Thread(target=send_random_messages, daemon=True).start()

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