import sys
import socket
import subprocess
import threading
import time
from whisper_live.client import TranscriptionClient
from whisper_live.server import TranscriptionServer

class SpeechRecognizer:
    def __init__(self, size="medium", multilingual=False):
        # Kill any process using port 9090
        self._stop_existing_server()
        
        # Start a new server in a background thread
        self.server_thread = threading.Thread(target=self._start_server)
        self.server_thread.daemon = True  # Thread will exit when main program exits
        self.server_thread.start()
        
        # Wait for server to start
        print("Starting whisper-live server...", file=sys.stderr)
        time.sleep(3)  # Give the server time to start
        
        # Create client to connect to our server
        self.client = TranscriptionClient(
            host="localhost", 
            port=9090, 
            is_multilingual=multilingual,
            model_size=size
        )
        
        # Initialize client
        try:
            self.client() # using default microphone
            print("Whisper-live client connected successfully!", file=sys.stderr)
        except Exception as e:
            print(f"Error connecting to whisper-live server: {e}", file=sys.stderr)
    
    def _stop_existing_server(self):
        """Kill any process using port 9090"""
        try:
            # Try to connect to check if port is in use
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            result = sock.connect_ex(('localhost', 9090))
            sock.close()
            
            if result == 0:  # Port is in use
                print("Port 9090 in use, stopping existing server...", file=sys.stderr)
                # Use appropriate command for the OS
                try:
                    subprocess.run(["fuser", "-k", "9090/tcp"], stderr=subprocess.DEVNULL)
                except FileNotFoundError:
                    # If fuser isn't available (e.g., on macOS), try lsof
                    try:
                        pid = subprocess.check_output(["lsof", "-t", "-i:9090"]).decode().strip()
                        if pid:
                            subprocess.run(["kill", pid])
                    except (subprocess.SubprocessError, FileNotFoundError):
                        print("Could not kill process on port 9090", file=sys.stderr)
        except Exception as e:
            print(f"Error checking port: {e}", file=sys.stderr)
    
    def _start_server(self):
        """Start whisper-live server in a background thread"""
        try:
            server = TranscriptionServer()
            server.run("0.0.0.0", 9090)
        except Exception as e:
            print(f"Server error: {e}", file=sys.stderr)
    
    def _callback(self, text):
        """Called by whisper-live when a result is ready"""
        print(f"Received transcription: {text}", file=sys.stderr)
        
    def recognize(self, audio_data=None, timeout=10):
        """Get transcription from server"""
        try:
            # This would need to be implemented based on how you want to use the client
            # The TranscriptionClient likely has methods to submit audio and get results
            print("Requesting transcription from whisper-live...", file=sys.stderr)
            # Example: result = self.client.transcribe(audio_data)
            return "Sample transcription"  # Replace with actual result
        except Exception as e:
            print(f"Recognition error: {e}", file=sys.stderr)
            return None